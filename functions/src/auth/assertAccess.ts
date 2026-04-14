import * as admin from 'firebase-admin';

/**
 * Verifica se o uid é membro do projeto ou admin.
 */
export async function assertProjectAccess(uid: string, projectId: string): Promise<void> {
  const db = admin.firestore();
  const snap = await db.doc(`projects/${projectId}`).get();
  if (!snap.exists) throw new Error('Projeto não encontrado');
  const data = snap.data()!;
  const members = data.members ?? {};
  const isMember = Array.isArray(members)
    ? members.includes(uid)
    : typeof members === 'object' && members[uid] != null;

  if (!isMember) {
    // Verificar se é admin na collection users
    const userSnap = await db.doc(`users/${uid}`).get();
    const role = userSnap.exists ? userSnap.data()?.role : null;
    if (role !== 'admin') {
      throw new Error('Acesso negado');
    }
  }
}
