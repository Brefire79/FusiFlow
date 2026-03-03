/* ── Docs API ── */
import type { Doc } from './types';
import { ENV } from '../env';
import { nowISO, uid } from '../time';
import { useAuthStore } from '../auth';
import * as mock from './mockDb';
import * as historyApi from './history.api';

async function fbImports() {
  const { db } = await import('../firebase');
  const fs = await import('firebase/firestore');
  return { db: db!, ...fs };
}

export async function listDocs(projectId: string): Promise<Doc[]> {
  if (!ENV.useFirebase) return mock.getDocs(projectId);

  const { db, collection, getDocs, query, orderBy } = await fbImports();
  const snap = await getDocs(
    query(collection(db, 'projects', projectId, 'docs'), orderBy('updatedAt', 'desc')),
  );
  return snap.docs.map((d) => ({ id: d.id, projectId, ...d.data() } as Doc));
}

export async function getDoc(projectId: string, docId: string): Promise<Doc | undefined> {
  if (!ENV.useFirebase) return mock.getDoc(docId);

  const { db, doc, getDoc: fbGet } = await fbImports();
  const snap = await fbGet(doc(db, 'projects', projectId, 'docs', docId));
  if (!snap.exists()) return undefined;
  return { id: snap.id, projectId, ...snap.data() } as Doc;
}

export interface CreateDocInput {
  projectId: string;
  title: string;
  content?: string;
}

export async function createDoc(input: CreateDocInput): Promise<Doc> {
  const user = useAuthStore.getState().user!;
  const now = nowISO();
  const newDoc: Doc = {
    id: uid(),
    projectId: input.projectId,
    type: 'markdown',
    title: input.title,
    content: input.content ?? `# ${input.title}\n\nComece a escrever aqui...`,
    updatedBy: user.uid,
    updatedAt: now,
    version: 1,
  };

  if (!ENV.useFirebase) {
    mock.saveDoc(newDoc);
  } else {
    const { db, doc, setDoc } = await fbImports();
    const { id, projectId, ...data } = newDoc;
    await setDoc(doc(db, 'projects', projectId, 'docs', id), data);
  }

  await historyApi.addEvent({
    projectId: input.projectId,
    type: 'doc_created',
    target: 'doc',
    targetId: newDoc.id,
    changesSummary: `Documento "${newDoc.title}" criado`,
  });

  return newDoc;
}

export async function updateDoc(
  projectId: string,
  docId: string,
  changes: Partial<Doc>,
  expectedVersion: number,
): Promise<Doc> {
  const user = useAuthStore.getState().user!;
  const now = nowISO();

  if (!ENV.useFirebase) {
    const existing = mock.getDoc(docId);
    if (!existing) throw new Error('Documento não encontrado');
    if (existing.version !== expectedVersion) {
      throw new Error('Conflito de versão: alguém salvou antes. Recarregue.');
    }
    const updated: Doc = {
      ...existing,
      ...changes,
      updatedBy: user.uid,
      updatedAt: now,
      version: existing.version + 1,
    };
    mock.saveDoc(updated);

    await historyApi.addEvent({
      projectId,
      type: 'doc_updated',
      target: 'doc',
      targetId: docId,
      changesSummary: `Documento "${updated.title}" atualizado`,
    });

    return updated;
  }

  const { db, doc, runTransaction } = await fbImports();
  const ref = doc(db, 'projects', projectId, 'docs', docId);

  const updated = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Documento não encontrado');
    const data = snap.data() as Omit<Doc, 'id' | 'projectId'>;
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
    return { id: docId, projectId, ...newData } as Doc;
  });

  await historyApi.addEvent({
    projectId,
    type: 'doc_updated',
    target: 'doc',
    targetId: docId,
    changesSummary: `Documento "${updated.title}" atualizado`,
  });

  return updated;
}

export async function removeDoc(projectId: string, docId: string): Promise<void> {
  if (!ENV.useFirebase) {
    mock.deleteDoc(docId);
    return;
  }
  const { db, doc, deleteDoc } = await fbImports();
  await deleteDoc(doc(db, 'projects', projectId, 'docs', docId));
}
