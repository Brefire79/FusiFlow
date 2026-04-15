/* ── Projects API ── */
import type { Project, ProjectMembersMap, ProjectStatus, Phase } from './types';
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

function normalizeMembers(rawMembers: unknown, createdBy?: string): ProjectMembersMap {
  if (Array.isArray(rawMembers)) {
    const fromArray: ProjectMembersMap = {};
    for (const memberUid of rawMembers) {
      if (typeof memberUid === 'string' && memberUid) fromArray[memberUid] = 'member';
    }
    if (createdBy && !fromArray[createdBy]) fromArray[createdBy] = 'admin';
    return fromArray;
  }

  if (rawMembers && typeof rawMembers === 'object') {
    const fromMap: ProjectMembersMap = {};
    for (const [memberUid, role] of Object.entries(rawMembers as Record<string, unknown>)) {
      if (!memberUid) continue;
      fromMap[memberUid] = role === 'admin' || role === 'manager' || role === 'member'
        ? role
        : 'member';
    }
    if (createdBy && !fromMap[createdBy]) fromMap[createdBy] = 'admin';
    return fromMap;
  }

  return createdBy ? { [createdBy]: 'admin' } : {};
}

function normalizeProject(id: string, raw: Omit<Project, 'id'>): Project {
  return {
    ...raw,
    id,
    members: normalizeMembers(raw.members, raw.createdBy),
  };
}

export async function listProjects(): Promise<Project[]> {
  if (!ENV.useFirebase) {
    return mock.getProjects().map((project) => normalizeProject(project.id, project));
  }

  const { db, collection, getDocs, query, orderBy } = await fbImports();
  const snap = await getDocs(query(collection(db, 'projects'), orderBy('updatedAt', 'desc')));
  return snap.docs.map((d) => normalizeProject(d.id, d.data() as Omit<Project, 'id'>));
}

export async function getProject(id: string): Promise<Project | undefined> {
  if (!ENV.useFirebase) {
    const project = mock.getProject(id);
    return project ? normalizeProject(project.id, project) : undefined;
  }

  const { db, doc, getDoc } = await fbImports();
  const snap = await getDoc(doc(db, 'projects', id));
  if (!snap.exists()) return undefined;
  return normalizeProject(snap.id, snap.data() as Omit<Project, 'id'>);
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  status: ProjectStatus;
  phase: Phase;
  tags: string[];
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const user = useAuthStore.getState().user!;
  const now = nowISO();
  const project: Project = {
    id: uid(),
    ...input,
    members: { [user.uid]: 'admin' },
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
      members: normalizeMembers(changes.members ?? existing.members, existing.createdBy),
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
      members: normalizeMembers(changes.members ?? data.members, data.createdBy),
      updatedBy: user.uid,
      updatedAt: now,
      version: data.version + 1,
    };
    tx.update(ref, newData);
    return normalizeProject(id, newData as Omit<Project, 'id'>);
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
  // Firestore NÃO deleta subcoleções automaticamente — deletar manualmente
  const { db, doc, deleteDoc, collection, getDocs } = await fbImports();
  const subcollections = ['docs', 'history', 'exports'];
  await Promise.all(
    subcollections.map(async (sub) => {
      const snap = await getDocs(collection(db, 'projects', id, sub));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    }),
  );
  await deleteDoc(doc(db, 'projects', id));
}

export interface ProjectStats {
  docsCount: number;
  historyCount: number;
  lastActivity: string;
}

export async function getProjectStats(projectId: string): Promise<ProjectStats> {
  if (!ENV.useFirebase) {
    const docs = mock.getDocs(projectId);
    const history = mock.getHistory(projectId);
    return {
      docsCount: docs.length,
      historyCount: history.length,
      lastActivity: history[0]?.at ?? '',
    };
  }

  const { db, collection, getDocs: fbGetDocs, query, orderBy, limit } = await fbImports();
  const [docsSnap, histSnap] = await Promise.all([
    fbGetDocs(collection(db, 'projects', projectId, 'docs')),
    fbGetDocs(query(collection(db, 'projects', projectId, 'history'), orderBy('at', 'desc'), limit(1))),
  ]);

  return {
    docsCount: docsSnap.size,
    historyCount: histSnap.size,
    lastActivity: histSnap.docs[0]?.data().at ?? '',
  };
}
