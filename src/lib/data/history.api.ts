/* ── History API ── */
import type { HistoryEvent, HistoryEventType } from './types';
import { ENV } from '../env';
import { nowISO, uid } from '../time';
import { useAuthStore } from '../auth';
import * as mock from './mockDb';

async function fbImports() {
  const { db } = await import('../firebase');
  const fs = await import('firebase/firestore');
  return { db: db!, ...fs };
}

export async function listHistory(projectId: string): Promise<HistoryEvent[]> {
  if (!ENV.useFirebase) return mock.getHistory(projectId);

  const { db, collection, getDocs, query, orderBy } = await fbImports();
  const snap = await getDocs(
    query(collection(db, 'projects', projectId, 'history'), orderBy('at', 'desc')),
  );
  return snap.docs.map((d) => ({ id: d.id, projectId, ...d.data() } as HistoryEvent));
}

export interface AddEventInput {
  projectId: string;
  type: HistoryEventType;
  target: string;
  targetId: string;
  changesSummary: string;
}

export async function addEvent(input: AddEventInput): Promise<HistoryEvent> {
  const user = useAuthStore.getState().user;
  const event: HistoryEvent = {
    id: uid(),
    projectId: input.projectId,
    type: input.type,
    actorUid: user?.uid ?? 'system',
    actorName: user?.name ?? 'Sistema',
    at: nowISO(),
    target: input.target,
    targetId: input.targetId,
    changesSummary: input.changesSummary,
  };

  if (!ENV.useFirebase) {
    mock.addHistory(event);
  } else {
    // MVP: escrita via client. Preparado para migrar para Cloud Functions.
    // Quando migrar, substituir esta chamada por httpsCallable('addHistoryEvent')(input)
    const { db, doc, setDoc } = await fbImports();
    const { id, projectId, ...data } = event;
    await setDoc(doc(db, 'projects', projectId, 'history', id), data);
  }

  return event;
}
