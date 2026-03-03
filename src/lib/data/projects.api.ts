/* ── Projects API ── */
import type { Project, ProjectStatus, Phase } from './types';
import { ENV } from '../env';
import { nowISO, uid } from '../time';
import { useAuthStore } from '../auth';
import * as mock from './mockDb';
import * as historyApi from './history.api';

// Firebase imports (lazy)
async function fbImports() {
  const { db } = await import('../firebase');
  const fs = await import('firebase/firestore');
  return { db: db!, ...fs };
}

export async function listProjects(): Promise<Project[]> {
  if (!ENV.useFirebase) return mock.getProjects();

  const { db, collection, getDocs, query, orderBy } = await fbImports();
  const snap = await getDocs(query(collection(db, 'projects'), orderBy('updatedAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
}

export async function getProject(id: string): Promise<Project | undefined> {
  if (!ENV.useFirebase) return mock.getProject(id);

  const { db, doc, getDoc } = await fbImports();
  const snap = await getDoc(doc(db, 'projects', id));
  if (!snap.exists()) return undefined;
  return { id: snap.id, ...snap.data() } as Project;
}

export interface CreateProjectInput {
  title: string;
  status: ProjectStatus;
  phase: Phase;
  tags: string[];
  members: string[];
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const user = useAuthStore.getState().user!;
  const now = nowISO();
  const project: Project = {
    id: uid(),
    ...input,
    createdBy: user.uid,
    createdAt: now,
    updatedBy: user.uid,
    updatedAt: now,
    version: 1,
    lock: null,
  };

  if (!ENV.useFirebase) {
    mock.saveProject(project);
  } else {
    const { db, doc, setDoc } = await fbImports();
    const { id, ...data } = project;
    await setDoc(doc(db, 'projects', id), data);
  }

  await historyApi.addEvent({
    projectId: project.id,
    type: 'project_created',
    target: 'project',
    targetId: project.id,
    changesSummary: `Projeto "${project.title}" criado`,
  });

  return project;
}

export async function updateProject(
  id: string,
  changes: Partial<Project>,
  expectedVersion: number,
): Promise<Project> {
  const user = useAuthStore.getState().user!;
  const now = nowISO();

  if (!ENV.useFirebase) {
    const existing = mock.getProject(id);
    if (!existing) throw new Error('Projeto não encontrado');
    if (existing.version !== expectedVersion) {
      throw new Error('Conflito de versão: alguém salvou antes. Recarregue.');
    }
    const updated: Project = {
      ...existing,
      ...changes,
      updatedBy: user.uid,
      updatedAt: now,
      version: existing.version + 1,
    };
    mock.saveProject(updated);

    await historyApi.addEvent({
      projectId: id,
      type: 'project_updated',
      target: 'project',
      targetId: id,
      changesSummary: `Projeto atualizado: ${Object.keys(changes).join(', ')}`,
    });

    return updated;
  }

  // Firebase: transaction for optimistic versioning
  const { db, doc, runTransaction } = await fbImports();
  const ref = doc(db, 'projects', id);

  const updated = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Projeto não encontrado');
    const data = snap.data() as Omit<Project, 'id'>;
    if (data.version !== expectedVersion) {
      throw new Error('Conflito de versão: alguém salvou antes. Recarregue.');
    }
    const newData = {
      ...data,
      ...changes,
      updatedBy: user.uid,
      updatedAt: now,
      version: data.version + 1,
    };
    tx.update(ref, newData);
    return { id, ...newData } as Project;
  });

  await historyApi.addEvent({
    projectId: id,
    type: 'project_updated',
    target: 'project',
    targetId: id,
    changesSummary: `Projeto atualizado: ${Object.keys(changes).join(', ')}`,
  });

  return updated;
}

export async function removeProject(id: string): Promise<void> {
  if (!ENV.useFirebase) {
    mock.deleteProject(id);
    return;
  }
  const { db, doc, deleteDoc } = await fbImports();
  await deleteDoc(doc(db, 'projects', id));
}
