/**
 * Script de limpeza de dados de desenvolvimento.
 *
 * Modo mock (padrão): limpa todas as chaves 'ff_*' do localStorage.
 * Modo Firebase:      deleta todos os projetos e subcoleções do Firestore.
 *                     NÃO deleta /users.
 *
 * Uso:  npm run clear-seed
 */

import * as readline from 'readline';
import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Helpers de log colorido ──────────────────────────────────────────────────
const red    = (s: string) => `\x1b[31m${s}\x1b[0m`;
const green  = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const bold   = (s: string) => `\x1b[1m${s}\x1b[0m`;

// ── Confirmação interativa ────────────────────────────────────────────────────
function askConfirmation(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ── Modo Firebase: deletar projetos + subcoleções ────────────────────────────
async function clearFirestore() {
  const serviceAccountPath = resolve(__dirname, 'serviceAccountKey.json');
  if (!existsSync(serviceAccountPath)) {
    console.error(red('❌  scripts/serviceAccountKey.json não encontrado.'));
    console.error(red('    Sem o arquivo de credenciais, só é possível limpar o localStorage (modo mock).'));
    process.exit(1);
  }

  // Importação dinâmica para não falhar em modo mock
  const admin = await import('firebase-admin');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
  admin.default.initializeApp({ credential: admin.default.credential.cert(serviceAccount) });
  const db = admin.default.firestore();

  console.log(bold('\n🗑️   FusiFlow — Limpeza do Firestore\n'));
  console.log(yellow('⚠️   Esta operação apagará TODOS os projetos, documentos, histórico'));
  console.log(yellow('     e exportações do Firestore. Os usuários (/users) serão preservados.\n'));

  // Confirmação obrigatória
  const answer = await askConfirmation(
    red("⚠️   Isso apagará TODOS os projetos do Firestore. Digite 'CONFIRMAR': "),
  );
  if (answer !== 'CONFIRMAR') {
    console.log(yellow('\n⛔  Operação cancelada. Nenhum dado foi removido.\n'));
    process.exit(0);
  }

  console.log('\n  Buscando projetos...');
  const projectsSnap = await db.collection('projects').get();

  if (projectsSnap.empty) {
    console.log(yellow('  Nenhum projeto encontrado. Firestore já está vazio.\n'));
    process.exit(0);
  }

  let deleted = 0;

  for (const projectDoc of projectsSnap.docs) {
    const projectRef = projectDoc.ref;

    // Deletar subcoleções
    const subColNames = ['docs', 'history', 'exports'];
    for (const colName of subColNames) {
      const subSnap = await projectRef.collection(colName).get();
      const subBatch = db.batch();
      subSnap.docs.forEach((d) => subBatch.delete(d.ref));
      if (!subSnap.empty) await subBatch.commit();
    }

    // Deletar o projeto
    await projectRef.delete();
    deleted++;
    process.stdout.write(`\r  Removidos: ${deleted}/${projectsSnap.size} projetos`);
  }

  console.log(green(`\n\n🗑️   ${deleted} projetos removidos. Pronto para cadastrar projetos reais.\n`));
  process.exit(0);
}

// ── Modo mock: limpar chaves ff_* do localStorage ────────────────────────────
// (executado via script de navegador — este trecho documenta o que o
//  ClearDataButton.tsx faz no frontend; o script Node não acessa o browser)
function clearLocalStorageInstructions() {
  console.log(bold('\n🧹  FusiFlow — Limpeza do localStorage (modo mock)\n'));
  console.log('  No modo mock, a limpeza é feita diretamente pelo app:');
  console.log('  → Abra o FusiFlow → Configurações → Zona de Perigo → "Limpar dados de teste"\n');
  console.log('  Ou via console do navegador:');
  console.log(yellow("  Object.keys(localStorage).filter(k => k.startsWith('ff_')).forEach(k => localStorage.removeItem(k))"));
  console.log('');
}

// ── Entry point ───────────────────────────────────────────────────────────────
async function main() {
  const serviceAccountPath = resolve(__dirname, 'serviceAccountKey.json');
  const hasFirebase = existsSync(serviceAccountPath);

  if (hasFirebase) {
    await clearFirestore();
  } else {
    clearLocalStorageInstructions();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(red('❌  Erro durante a limpeza:'), err);
  process.exit(1);
});
