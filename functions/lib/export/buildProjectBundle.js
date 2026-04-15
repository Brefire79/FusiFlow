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
exports.buildProjectBundle = buildProjectBundle;
const admin = __importStar(require("firebase-admin"));
/**
 * Lê project + docs + history do Firestore.
 */
async function buildProjectBundle(projectId) {
    const db = admin.firestore();
    const projectSnap = await db.doc(`projects/${projectId}`).get();
    if (!projectSnap.exists)
        throw new Error('Projeto não encontrado');
    const project = { id: projectSnap.id, ...projectSnap.data() };
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
//# sourceMappingURL=buildProjectBundle.js.map