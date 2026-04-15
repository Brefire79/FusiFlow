"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportProject = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const assertAccess_1 = require("./auth/assertAccess");
const buildProjectBundle_1 = require("./export/buildProjectBundle");
const renderPdf_1 = require("./export/renderPdf");
const renderDocx_1 = require("./export/renderDocx");
admin.initializeApp();
/**
 * Callable: exportProject
 * Gera exportação do projeto em JSON, PDF ou DOCX.
 * Salva no Storage e registra em Firestore.
 *
 * Região: southamerica-east1 (São Paulo) — menor latência para usuários no Brasil.
 */
exports.exportProject = (0, https_1.onCall)({ maxInstances: 10, region: 'southamerica-east1' }, async (request) => {
    // Auth check
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Login necessário');
    }
    const { projectId, format } = request.data;
    if (!projectId || !format) {
        throw new https_1.HttpsError('invalid-argument', 'projectId e format são obrigatórios');
    }
    const uid = request.auth.uid;
    // Access check
    try {
        await (0, assertAccess_1.assertProjectAccess)(uid, projectId);
    }
    catch (err) {
        throw new https_1.HttpsError('permission-denied', err.message);
    }
    // Build bundle
    const bundle = await (0, buildProjectBundle_1.buildProjectBundle)(projectId);
    // Generate file
    let buffer;
    let contentType;
    let ext;
    switch (format) {
        case 'json': {
            const json = JSON.stringify(bundle, null, 2);
            buffer = Buffer.from(json, 'utf-8');
            contentType = 'application/json';
            ext = 'json';
            break;
        }
        case 'pdf': {
            buffer = await (0, renderPdf_1.renderPdf)(bundle);
            contentType = 'application/pdf';
            ext = 'pdf';
            break;
        }
        case 'docx': {
            buffer = await (0, renderDocx_1.renderDocx)(bundle);
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            ext = 'docx';
            break;
        }
        default:
            throw new https_1.HttpsError('invalid-argument', `Formato inválido: ${format}`);
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
    const userName = userSnap.exists ? userSnap.data()?.displayName || 'Usuário' : 'Usuário';
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
});
//# sourceMappingURL=index.js.map