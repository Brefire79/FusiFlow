import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { assertProjectAccess } from './auth/assertAccess';
import { buildProjectBundle } from './export/buildProjectBundle';
import { renderPdf } from './export/renderPdf';
import { renderDocx } from './export/renderDocx';

admin.initializeApp();

type ExportFormat = 'json' | 'pdf' | 'docx';

interface ExportRequest {
  projectId: string;
  format: ExportFormat;
}

/**
 * Callable: exportProject
 * Gera exportação do projeto em JSON, PDF ou DOCX.
 * Salva no Storage e registra em Firestore.
 */
export const exportProject = onCall<ExportRequest>(
  { maxInstances: 10 },
  async (request) => {
    // Auth check
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Login necessário');
    }

    const { projectId, format } = request.data;
    if (!projectId || !format) {
      throw new HttpsError('invalid-argument', 'projectId e format são obrigatórios');
    }

    const uid = request.auth.uid;

    // Access check
    try {
      await assertProjectAccess(uid, projectId);
    } catch (err: any) {
      throw new HttpsError('permission-denied', err.message);
    }

    // Build bundle
    const bundle = await buildProjectBundle(projectId);

    // Generate file
    let buffer: Buffer;
    let contentType: string;
    let ext: string;

    switch (format) {
      case 'json': {
        const json = JSON.stringify(bundle, null, 2);
        buffer = Buffer.from(json, 'utf-8');
        contentType = 'application/json';
        ext = 'json';
        break;
      }
      case 'pdf': {
        buffer = await renderPdf(bundle);
        contentType = 'application/pdf';
        ext = 'pdf';
        break;
      }
      case 'docx': {
        buffer = await renderDocx(bundle);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        ext = 'docx';
        break;
      }
      default:
        throw new HttpsError('invalid-argument', `Formato inválido: ${format}`);
    }

    // Upload to Storage
    const timestamp = Date.now();
    const filePath = `projects/${projectId}/exports/${timestamp}.${ext}`;
    const bucket = admin.storage().bucket();
    const file = bucket.file(filePath);

    await file.save(buffer, {
      metadata: { contentType },
    });

    // Get download URL
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    // Save export record in Firestore
    const db = admin.firestore();
    const exportId = `${timestamp}-${ext}`;

    // Get user name
    const userSnap = await db.doc(`users/${uid}`).get();
    const userName = userSnap.exists ? userSnap.data()?.name || 'Usuário' : 'Usuário';

    const exportRecord = {
      format,
      authorUid: uid,
      authorName: userName,
      createdAt: new Date().toISOString(),
      downloadUrl: signedUrl,
      filePath,
    };

    await db.doc(`projects/${projectId}/exports/${exportId}`).set(exportRecord);

    // History event
    const historyId = `${timestamp}-export`;
    await db.doc(`projects/${projectId}/history/${historyId}`).set({
      type: 'export',
      actorUid: uid,
      actorName: userName,
      at: new Date().toISOString(),
      target: 'export',
      targetId: exportId,
      changesSummary: `Exportação ${format.toUpperCase()} gerada`,
    });

    return {
      downloadUrl: signedUrl,
      filePath,
      exportId,
    };
  },
);
