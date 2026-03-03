import * as admin from 'firebase-admin';

export interface ProjectBundle {
  project: FirebaseFirestore.DocumentData;
  docs: FirebaseFirestore.DocumentData[];
  history: FirebaseFirestore.DocumentData[];
}

/**
 * Lê project + docs + history do Firestore.
 */
export async function buildProjectBundle(projectId: string): Promise<ProjectBundle> {
  const db = admin.firestore();

  const projectSnap = await db.doc(`projects/${projectId}`).get();
  if (!projectSnap.exists) throw new Error('Projeto não encontrado');
  const project = { id: projectSnap.id, ...projectSnap.data()! };

  const docsSnap = await db.collection(`projects/${projectId}/docs`).get();
  const docs = docsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const historySnap = await db
    .collection(`projects/${projectId}/history`)
    .orderBy('at', 'desc')
    .limit(100)
    .get();
  const history = historySnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return { project, docs, history };
}
