/* ── Exports API ── */
import type { ExportFormat, ExportRecord } from './types';
import { ENV } from '../env';
import { nowISO, uid } from '../time';
import { useAuthStore } from '../auth';
import * as mock from './mockDb';
import * as historyApi from './history.api';
import * as projectsApi from './projects.api';
import * as docsApi from './docs.api';

async function fbImports() {
  const { db, functions } = await import('../firebase');
  const fs = await import('firebase/firestore');
  const fn = await import('firebase/functions');
  return { db: db!, functions: functions!, ...fs, ...fn };
}

export async function listExports(projectId: string): Promise<ExportRecord[]> {
  if (!ENV.useFirebase) return mock.getExports(projectId);

  const { db, collection, getDocs, query, orderBy } = await fbImports();
  const snap = await getDocs(
    query(collection(db, 'projects', projectId, 'exports'), orderBy('createdAt', 'desc')),
  );
  return snap.docs.map((d) => ({ id: d.id, projectId, ...d.data() } as ExportRecord));
}

export async function exportProject(
  projectId: string,
  format: ExportFormat,
): Promise<ExportRecord> {
  const user = useAuthStore.getState().user!;
  const now = nowISO();

  if (format === 'json') {
    // Client-side JSON export (works in mock and firebase)
    const project = await projectsApi.getProject(projectId);
    const docs = await docsApi.listDocs(projectId);
    const bundle = { project, docs, exportedAt: now, exportedBy: user.name };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.title || 'project'}-export.json`;
    a.click();
    URL.revokeObjectURL(url);

    const record: ExportRecord = {
      id: uid(),
      projectId,
      format: 'json',
      authorUid: user.uid,
      authorName: user.name,
      createdAt: now,
      downloadUrl: null,
      filePath: null,
    };

    if (!ENV.useFirebase) {
      mock.addExport(record);
    } else {
      const { db, doc, setDoc } = await fbImports();
      const { id, projectId: pid, ...data } = record;
      await setDoc(doc(db, 'projects', pid, 'exports', id), data);
    }

    await historyApi.addEvent({
      projectId,
      type: 'export',
      target: 'export',
      targetId: record.id,
      changesSummary: `Exportação JSON gerada`,
    });

    return record;
  }

  // PDF / DOCX: call Cloud Function (only when Firebase is active)
  if (!ENV.useFirebase) {
    throw new Error(`Exportação ${format.toUpperCase()} requer Firebase Functions ativo. Ative VITE_USE_FIREBASE=true e faça deploy das functions.`);
  }

  const { functions, httpsCallable } = await fbImports();
  const callable = httpsCallable(functions, 'exportProject');
  const result = await callable({ projectId, format });
  const data = result.data as { downloadUrl: string; filePath: string; exportId: string };

  const record: ExportRecord = {
    id: data.exportId,
    projectId,
    format,
    authorUid: user.uid,
    authorName: user.name,
    createdAt: now,
    downloadUrl: data.downloadUrl,
    filePath: data.filePath,
  };

  return record;
}
