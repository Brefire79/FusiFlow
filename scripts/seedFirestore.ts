/**
 * Script de seed para Firestore.
 *
 * Uso:  npm run seed
 * Pré-requisito: colocar o arquivo de credenciais em scripts/serviceAccountKey.json
 *
 * O script verifica se já existem dados antes de inserir (idempotente).
 */

import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Inicializar Firebase Admin ───────────────────────────────────────────────
const serviceAccountPath = resolve(__dirname, 'serviceAccountKey.json');
let serviceAccount: admin.ServiceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
} catch {
  console.error('❌  Arquivo scripts/serviceAccountKey.json não encontrado.');
  console.error('    Baixe em: Firebase Console → Configurações → Contas de serviço');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// ── Helpers de log colorido ──────────────────────────────────────────────────
const green  = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const bold   = (s: string) => `\x1b[1m${s}\x1b[0m`;

// ── Dados do seed ─────────────────────────────────────────────────────────────
const now = new Date();
const ago = (minutes: number) =>
  new Date(now.getTime() - minutes * 60_000).toISOString();

type ProjectMemberRole = 'admin' | 'manager' | 'member';
type ProjectMembersMap = Record<string, ProjectMemberRole>;

function toMembersMap(uids: string[]): ProjectMembersMap {
  return uids.reduce<ProjectMembersMap>((acc, uid) => {
    acc[uid] = uid === 'admin' ? 'admin' : 'member';
    return acc;
  }, {});
}

const PROJECTS = [
  { id: 'proj-1',  title: 'App de CRM',              status: 'andamento', phase: 'execução',
    description: 'Sistema de gestão de relacionamento com clientes para equipes de vendas.',
    tags: ['CRM', 'SaaS'], members: toMembersMap(['admin', 'joao']),
    createdBy: 'joao', createdAt: ago(4320), updatedBy: 'joao', updatedAt: ago(20), version: 2 },
  { id: 'proj-2',  title: 'Marketplace de Serviços', status: 'concluido', phase: 'entrega',
    description: 'Plataforma de contratação de serviços freelancer com avaliações e pagamento.',
    tags: ['E-commerce', 'Marketplace'], members: toMembersMap(['admin', 'lucas']),
    createdBy: 'lucas', createdAt: ago(10080), updatedBy: 'lucas', updatedAt: ago(2880), version: 1 },
  { id: 'proj-3',  title: 'Plataforma E-Learning',   status: 'revisao',   phase: 'entrega',
    description: 'Ambiente virtual de aprendizagem com módulos interativos e certificação.',
    tags: ['EAD', 'Cursos'], members: toMembersMap(['admin', 'breno-m']),
    createdBy: 'breno-m', createdAt: ago(7200), updatedBy: 'breno-m', updatedAt: ago(60), version: 1 },
  { id: 'proj-4',  title: 'Sistema Financeiro',      status: 'backlog',   phase: 'planejamento',
    description: 'API de gestão financeira com controle de fluxo de caixa e relatórios fiscais.',
    tags: ['Fintech', 'API'], members: toMembersMap(['admin']),
    createdBy: 'admin', createdAt: ago(1440), updatedBy: 'admin', updatedAt: ago(720), version: 1 },
  { id: 'proj-5',  title: 'Dashboard Analytics',     status: 'andamento', phase: 'execução',
    description: 'Painel de inteligência de negócios com KPIs, churn, NPS e receita recorrente.',
    tags: ['BI', 'Data'], members: toMembersMap(['admin', 'ana']),
    createdBy: 'ana', createdAt: ago(5760), updatedBy: 'ana', updatedAt: ago(120), version: 3 },
  { id: 'proj-6',  title: 'Portal do Cliente',       status: 'concluido', phase: 'entrega',
    description: 'Portal self-service para consulta de contratos, chamados e pedidos.',
    tags: ['Portal', 'Frontend'], members: toMembersMap(['admin', 'rafael']),
    createdBy: 'rafael', createdAt: ago(8640), updatedBy: 'rafael', updatedAt: ago(4320), version: 2 },
  { id: 'proj-7',  title: 'API Gateway v2',           status: 'andamento', phase: 'execução',
    description: 'Refatoração do gateway com OAuth 2.0, rate limiting e observabilidade.',
    tags: ['Backend', 'API'], members: toMembersMap(['admin', 'joao']),
    createdBy: 'joao', createdAt: ago(8640), updatedBy: 'joao', updatedAt: ago(180), version: 4 },
  { id: 'proj-8',  title: 'Chat Interno',             status: 'backlog',   phase: 'planejamento',
    description: 'Ferramenta de comunicação interna com canais e mensagens diretas.',
    tags: ['Real-time', 'WebSocket'], members: toMembersMap(['admin', 'lucas']),
    createdBy: 'lucas', createdAt: ago(2880), updatedBy: 'lucas', updatedAt: ago(1440), version: 1 },
  { id: 'proj-9',  title: 'App Mobile v2',            status: 'andamento', phase: 'execução',
    description: 'Nova versão do app com redesign, modo offline e notificações personalizadas.',
    tags: ['Mobile', 'React Native'], members: toMembersMap(['admin', 'breno-m']),
    createdBy: 'breno-m', createdAt: ago(9360), updatedBy: 'breno-m', updatedAt: ago(45), version: 2 },
  { id: 'proj-10', title: 'Migração Cloud',           status: 'backlog',   phase: 'planejamento',
    description: 'Migração da infra on-premise para AWS com estratégia lift-and-shift.',
    tags: ['DevOps', 'AWS'], members: toMembersMap(['admin', 'rafael']),
    createdBy: 'rafael', createdAt: ago(4320), updatedBy: 'rafael', updatedAt: ago(2160), version: 1 },
  { id: 'proj-11', title: 'Design System',            status: 'andamento', phase: 'execução',
    description: 'Biblioteca de componentes React com tokens de design e docs Storybook.',
    tags: ['UI', 'Components'], members: toMembersMap(['admin', 'ana']),
    createdBy: 'ana', createdAt: ago(10080), updatedBy: 'ana', updatedAt: ago(90), version: 5 },
  { id: 'proj-12', title: 'Landing Page',             status: 'concluido', phase: 'entrega',
    description: 'Página de conversão otimizada para SEO com A/B testing e formulário de captura.',
    tags: ['Marketing', 'SEO'], members: toMembersMap(['admin']),
    createdBy: 'admin', createdAt: ago(10080), updatedBy: 'admin', updatedAt: ago(5040), version: 1 },
];

interface DocSeed {
  id: string;
  projectId: string;
  title: string;
  content: string;
  updatedBy: string;
  updatedAt: string;
}

const DOCS: DocSeed[] = [
  { id: 'doc-1',  projectId: 'proj-1',  title: 'Requisitos do CRM',
    content: '# Requisitos do CRM\n\n## Objetivo\nSistema de gestão de clientes completo.\n\n## Funcionalidades\n- Cadastro de leads\n- Pipeline de vendas\n- Relatórios em tempo real',
    updatedBy: 'joao', updatedAt: ago(20) },
  { id: 'doc-2',  projectId: 'proj-2',  title: 'Especificação de API REST',
    content: '# API REST — Marketplace\n\n## Endpoints principais\n- `POST /services` — Criar serviço\n- `GET /services` — Listar com filtros\n- `POST /orders` — Contratar serviço\n\n## Autenticação\nJWT Bearer Token com refresh automático.',
    updatedBy: 'lucas', updatedAt: ago(2880) },
  { id: 'doc-3',  projectId: 'proj-3',  title: 'Currículo Pedagógico',
    content: '# Currículo E-Learning\n\n## Módulos\n1. Introdução à plataforma\n2. Conteúdo principal\n3. Exercícios práticos\n4. Avaliação final\n\n## Certificação\nEmitida automaticamente ao atingir 70% de aproveitamento.',
    updatedBy: 'breno-m', updatedAt: ago(60) },
  { id: 'doc-4',  projectId: 'proj-4',  title: 'Requisitos de Segurança',
    content: '# Segurança — Sistema Financeiro\n\n## Requisitos obrigatórios\n- Criptografia AES-256 para dados em repouso\n- TLS 1.3 para dados em trânsito\n- Autenticação 2FA obrigatória\n- Logs de auditoria imutáveis\n- LGPD: pseudonimização de CPF/CNPJ',
    updatedBy: 'admin', updatedAt: ago(720) },
  { id: 'doc-5',  projectId: 'proj-5',  title: 'KPIs Dashboard',
    content: '# KPIs\n\n- **Receita Mensal (MRR)** — Gráfico de linha\n- **Churn Rate** — % mensal\n- **NPS** — Score trimestral\n- **CAC** — Custo de aquisição\n- **LTV** — Lifetime value médio',
    updatedBy: 'ana', updatedAt: ago(120) },
  { id: 'doc-6',  projectId: 'proj-6',  title: 'Manual do Usuário',
    content: '# Manual do Portal do Cliente\n\n## Acesso\n1. Acesse portal.empresa.com.br\n2. Insira email e senha cadastrados\n3. Em caso de dúvida, use "Esqueci minha senha"\n\n## Funcionalidades principais\n- Consulta de contratos\n- Abertura de chamados\n- Acompanhamento de pedidos\n- Emissão de boletos',
    updatedBy: 'rafael', updatedAt: ago(4320) },
  { id: 'doc-7',  projectId: 'proj-7',  title: 'Documentação de Endpoints',
    content: '# API Gateway v2 — Endpoints\n\n## Autenticação\n`POST /auth/token` — Retorna JWT\n`POST /auth/refresh` — Renova token\n\n## Rate Limiting\n- 100 req/min por IP em produção\n- 1000 req/min para service accounts\n\n## Observabilidade\nTracing via OpenTelemetry exportado para Grafana.',
    updatedBy: 'joao', updatedAt: ago(180) },
  { id: 'doc-8',  projectId: 'proj-8',  title: 'Arquitetura WebSocket',
    content: '# Arquitetura — Chat Interno\n\n## Stack\n- WebSocket server: Socket.io sobre Node.js\n- Persistência: Redis (mensagens recentes) + PostgreSQL (histórico)\n- Escalabilidade: Redis Pub/Sub para múltiplas instâncias\n\n## Salas\nCada canal é uma sala Socket.io. Presença gerenciada via Redis Sets.',
    updatedBy: 'lucas', updatedAt: ago(1440) },
  { id: 'doc-9',  projectId: 'proj-9',  title: 'Guia de Design Mobile',
    content: '# Design System — App Mobile v2\n\n## Tipografia\n- Título: Inter 24sp Bold\n- Corpo: Inter 16sp Regular\n- Caption: Inter 12sp Medium\n\n## Cores\n- Primária: #032D4E\n- Accent: #D07D5F\n- Superfície: #0A1828\n\n## Componentes base\nCards, Buttons, Inputs e Bottom Navigation seguem Material You.',
    updatedBy: 'breno-m', updatedAt: ago(45) },
  { id: 'doc-10', projectId: 'proj-10', title: 'Plano de Migração AWS',
    content: '# Migração Cloud — Plano\n\n## Fases\n1. **Avaliação** (2 semanas) — Inventário de serviços on-premise\n2. **Lift & Shift** (4 semanas) — Migrar VMs para EC2\n3. **Otimização** (ongoing) — Containerizar com ECS/Fargate\n\n## Serviços AWS alvo\n- EC2, RDS (PostgreSQL), S3, CloudFront, Route 53',
    updatedBy: 'rafael', updatedAt: ago(2160) },
  { id: 'doc-11', projectId: 'proj-11', title: 'Tokens de Design',
    content: '# Design Tokens\n\n## Cores (CSS custom properties)\n```css\n--color-bg:      #032D4E;\n--color-accent:  #D07D5F;\n--color-primary: #1455AD;\n--color-text:    #D4CCC0;\n--color-text-2:  #938586;\n```\n\n## Espaçamento\nEscala base 4px. Tokens: xs=4, sm=8, md=16, lg=24, xl=32.',
    updatedBy: 'ana', updatedAt: ago(90) },
  { id: 'doc-12', projectId: 'proj-12', title: 'Copy e SEO',
    content: '# Landing Page — Copy & SEO\n\n## Headline\n"Transforme ideias em projetos que entregam resultados"\n\n## Meta tags\n- Title: FusiFlow | Gestão de Projetos para Equipes Criativas\n- Description: Organize projetos, colabore com sua equipe e entregue mais rápido.\n\n## Palavras-chave\ngestão de projetos, gerenciamento ágil, equipe remota, produtividade',
    updatedBy: 'admin', updatedAt: ago(5040) },
];

const ADMIN_USER = {
  uid: 'admin',
  email: 'admin@fusiflow.app',
  displayName: 'Breno (Admin)',
  role: 'admin',
  active: true,
  createdAt: ago(43200),
};

// ── Função principal ──────────────────────────────────────────────────────────
async function seed() {
  console.log(bold('\n🌱  FusiFlow — Seed do Firestore\n'));

  // Verificar se já existem dados
  const existingSnap = await db.collection('projects').limit(1).get();
  if (!existingSnap.empty) {
    console.log(yellow('⚠️   Dados já existem no Firestore. Seed ignorado.'));
    console.log(yellow('    Use `npm run clear-seed` para limpar antes de re-semear.\n'));
    process.exit(0);
  }

  const batch = db.batch();

  // Usuário admin
  const adminRef = db.collection('users').doc(ADMIN_USER.uid);
  batch.set(adminRef, ADMIN_USER);
  console.log('  👤  Usuário admin preparado');

  // Projetos
  for (const project of PROJECTS) {
    const ref = db.collection('projects').doc(project.id);
    batch.set(ref, { ...project, lock: null });
  }
  console.log(`  📁  ${PROJECTS.length} projetos preparados`);

  // Docs (como subcoleção de cada projeto)
  for (const doc of DOCS) {
    const ref = db
      .collection('projects')
      .doc(doc.projectId)
      .collection('docs')
      .doc(doc.id);
    batch.set(ref, { ...doc, type: 'markdown', version: 1 });
  }
  console.log(`  📄  ${DOCS.length} documentos preparados`);

  // Histórico inicial (1 evento de criação por projeto)
  for (const project of PROJECTS) {
    const ref = db
      .collection('projects')
      .doc(project.id)
      .collection('history')
      .doc();
    batch.set(ref, {
      projectId: project.id,
      type: 'project_created',
      actorUid: project.createdBy,
      actorName: project.createdBy,
      at: project.createdAt,
      target: 'project',
      targetId: project.id,
      changesSummary: `Projeto "${project.title}" criado`,
    });
  }
  console.log(`  📋  ${PROJECTS.length} eventos de histórico preparados`);

  // Commit
  await batch.commit();

  console.log(green('\n✅  Seed concluído com sucesso!'));
  console.log(green(`    1 usuário · ${PROJECTS.length} projetos · ${DOCS.length} documentos\n`));
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Erro durante o seed:', err);
  process.exit(1);
});
