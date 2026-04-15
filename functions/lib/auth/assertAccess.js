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
exports.assertProjectAccess = assertProjectAccess;
const admin = __importStar(require("firebase-admin"));
/**
 * Verifica se o uid é membro do projeto ou admin.
 */
async function assertProjectAccess(uid, projectId) {
    const db = admin.firestore();
    const snap = await db.doc(`projects/${projectId}`).get();
    if (!snap.exists)
        throw new Error('Projeto não encontrado');
    const data = snap.data();
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
//# sourceMappingURL=assertAccess.js.map