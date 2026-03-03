/* ── Locks API ── */
import type { Lock, Project } from './types';
import { ENV } from '../env';
import { nowISO } from '../time';
import { useAuthStore } from '../auth';
import * as mock from './mockDb';

const LEASE_MS = 120_000; // 2 min
const RENEW_MS = 30_000;  // 30s

async function fbImports() {
  const { db } = await import('../firebase');
  const fs = await import('firebase/firestore');
  return { db: db!, ...fs };
}

function leaseUntil(): string {
  return new Date(Date.now() + LEASE_MS).toISOString();
}

function isLockActive(lock: Lock | null): boolean {
  if (!lock) return false;
  return new Date(lock.until).getTime() > Date.now();
}

export { RENEW_MS, isLockActive };

export async function acquireLock(projectId: string): Promise<{ ok: boolean; lock: Lock | null }> {
  const user = useAuthStore.getState().user!;

  if (!ENV.useFirebase) {
    const proj = mock.getProject(projectId);
    if (!proj) return { ok: false, lock: null };

    // Check existing lock
    if (proj.lock && isLockActive(proj.lock) && proj.lock.byUid !== user.uid) {
      return { ok: false, lock: proj.lock };
    }

    const lock: Lock = { byUid: user.uid, byName: user.name, until: leaseUntil() };
    mock.saveProject({ ...proj, lock });
    return { ok: true, lock };
  }

  const { db, doc, runTransaction } = await fbImports();
  const ref = doc(db, 'projects', projectId);

  try {
    const lock = await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error('Projeto não encontrado');
      const data = snap.data() as Omit<Project, 'id'>;

      if (data.lock && isLockActive(data.lock) && data.lock.byUid !== user.uid) {
        throw new Error(`LOCKED:${JSON.stringify(data.lock)}`);
      }

      const newLock: Lock = { byUid: user.uid, byName: user.name, until: leaseUntil() };
      tx.update(ref, { lock: newLock });
      return newLock;
    });
    return { ok: true, lock };
  } catch (err: any) {
    if (err.message?.startsWith('LOCKED:')) {
      const lock = JSON.parse(err.message.replace('LOCKED:', ''));
      return { ok: false, lock };
    }
    throw err;
  }
}

export async function renewLock(projectId: string): Promise<void> {
  const user = useAuthStore.getState().user!;

  if (!ENV.useFirebase) {
    const proj = mock.getProject(projectId);
    if (!proj || !proj.lock || proj.lock.byUid !== user.uid) return;
    mock.saveProject({ ...proj, lock: { ...proj.lock, until: leaseUntil() } });
    return;
  }

  const { db, doc, updateDoc } = await fbImports();
  await updateDoc(doc(db, 'projects', projectId), {
    'lock.until': leaseUntil(),
  });
}

export async function releaseLock(projectId: string): Promise<void> {
  const user = useAuthStore.getState().user!;

  if (!ENV.useFirebase) {
    const proj = mock.getProject(projectId);
    if (!proj) return;
    if (proj.lock?.byUid === user.uid) {
      mock.saveProject({ ...proj, lock: null });
    }
    return;
  }

  const { db, doc, updateDoc } = await fbImports();
  await updateDoc(doc(db, 'projects', projectId), { lock: null });
}
