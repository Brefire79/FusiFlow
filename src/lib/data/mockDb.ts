import type {
  Project, Doc, HistoryEvent, ExportRecord,
} from './types';
import { lsGet, lsSet } from '../storage/localStore';
import { nowISO, uid } from '../time';

const KEYS = {
  projects: 'ff_projects',
  docs: 'ff_docs',
  history: 'ff_history',
  exports: 'ff_exports',
  seeded: 'ff_seeded_v2',
} as const;

function seedIfNeeded() {
  if (lsGet(KEYS.seeded, false)) return;

  const now = new Date().toISOString();
  const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

  const projects: Project[] = [
    {
      id: 'proj-1', title: 'App de CRM', status: 'andamento', phase: 'execução',
      tags: ['CRM', 'SaaS'], members: ['admin', 'joao'],
      createdBy: 'joao', createdAt: ago(4320),
      updatedBy: 'joao', updatedAt: ago(20),
      version: 2, lock: null,
    },
    {
      id: 'proj-2', title: 'Marketplace de Serviços', status: 'concluido', phase: 'entrega',
      tags: ['E-commerce', 'Marketplace'], members: ['admin', 'lucas'],
      createdBy: 'lucas', createdAt: ago(10080),
      updatedBy: 'lucas', updatedAt: ago(2880),
      version: 1, lock: null,
    },
    {
      id: 'proj-3', title: 'Plataforma E-Learning', status: 'revisao', phase: 'entrega',
      tags: ['EAD', 'Cursos'], members: ['admin', 'breno-m'],
      createdBy: 'breno-m', createdAt: ago(7200),
      updatedBy: 'breno-m', updatedAt: ago(60),
      version: 1, lock: null,
    },
    {
      id: 'proj-4', title: 'Sistema Financeiro', status: 'backlog', phase: 'planejamento',
      tags: ['Fintech', 'API'], members: ['admin'],
      createdBy: 'admin', createdAt: ago(1440),
      updatedBy: 'admin', updatedAt: ago(720),
      version: 1, lock: null,
    },
    {
      id: 'proj-5', title: 'Dashboard Analytics', status: 'andamento', phase: 'execução',
      tags: ['BI', 'Data'], members: ['admin', 'ana'],
      createdBy: 'ana', createdAt: ago(5760),
      updatedBy: 'ana', updatedAt: ago(120),
      version: 3, lock: null,
    },
    {
      id: 'proj-6', title: 'Portal do Cliente', status: 'concluido', phase: 'entrega',
      tags: ['Portal', 'Frontend'], members: ['admin', 'rafael'],
      createdBy: 'rafael', createdAt: ago(20160),
      updatedBy: 'rafael', updatedAt: ago(4320),
      version: 2, lock: null,
    },
    {
      id: 'proj-7', title: 'API Gateway v2', status: 'andamento', phase: 'execução',
      tags: ['Backend', 'API'], members: ['admin', 'joao'],
      createdBy: 'joao', createdAt: ago(8640),
      updatedBy: 'joao', updatedAt: ago(180),
      version: 4, lock: null,
    },
    {
      id: 'proj-8', title: 'Chat Interno', status: 'backlog', phase: 'planejamento',
      tags: ['Real-time', 'WebSocket'], members: ['admin', 'lucas'],
      createdBy: 'lucas', createdAt: ago(2880),
      updatedBy: 'lucas', updatedAt: ago(1440),
      version: 1, lock: null,
    },
    {
      id: 'proj-9', title: 'App Mobile v2', status: 'andamento', phase: 'execução',
      tags: ['Mobile', 'React Native'], members: ['admin', 'breno-m'],
      createdBy: 'breno-m', createdAt: ago(14400),
      updatedBy: 'breno-m', updatedAt: ago(45),
      version: 2, lock: null,
    },
    {
      id: 'proj-10', title: 'Migração Cloud', status: 'backlog', phase: 'planejamento',
      tags: ['DevOps', 'AWS'], members: ['admin', 'rafael'],
      createdBy: 'rafael', createdAt: ago(4320),
      updatedBy: 'rafael', updatedAt: ago(2160),
      version: 1, lock: null,
    },
    {
      id: 'proj-11', title: 'Design System', status: 'andamento', phase: 'execução',
      tags: ['UI', 'Components'], members: ['admin', 'ana'],
      createdBy: 'ana', createdAt: ago(10080),
      updatedBy: 'ana', updatedAt: ago(90),
      version: 5, lock: null,
    },
    {
      id: 'proj-12', title: 'Landing Page', status: 'concluido', phase: 'entrega',
      tags: ['Marketing', 'SEO'], members: ['admin'],
      createdBy: 'admin', createdAt: ago(30240),
      updatedBy: 'admin', updatedAt: ago(7200),
      version: 1, lock: null,
    },
  ];

  const docs: Doc[] = [
    {
      id: 'doc-1', projectId: 'proj-1', type: 'markdown', title: 'Requisitos do CRM',
      content: '# Requisitos do CRM\n\n## Objetivo\nSistema de gestão de clientes completo.\n\n## Funcionalidades\n- Cadastro de leads\n- Pipeline de vendas\n- Relatórios',
      updatedBy: 'joao', updatedAt: ago(20), version: 2,
    },
    {
      id: 'doc-2', projectId: 'proj-1', type: 'markdown', title: 'Arquitetura Técnica',
      content: '# Arquitetura\n\n## Stack\n- React + TypeScript\n- Node.js + Express\n- PostgreSQL\n\n## Diagramas\n(a definir)',
      updatedBy: 'admin', updatedAt: ago(120), version: 1,
    },
    {
      id: 'doc-3', projectId: 'proj-3', type: 'markdown', title: 'Currículo Pedagógico',
      content: '# Currículo E-Learning\n\n## Módulos\n1. Introdução\n2. Conteúdo Avançado\n3. Avaliação\n\n## Plataforma\nMoodle customizado com React frontend.',
      updatedBy: 'breno-m', updatedAt: ago(60), version: 1,
    },
    {
      id: 'doc-4', projectId: 'proj-5', type: 'markdown', title: 'KPIs Dashboard',
      content: '# KPIs\n\n- **Receita Mensal** — R$ (gráfico de linha)\n- **Churn Rate** — % mensal\n- **NPS** — Score trimestral\n- **CAC** — Custo aquisição',
      updatedBy: 'ana', updatedAt: ago(120), version: 3,
    },
  ];

  const history: HistoryEvent[] = projects.map((p) => ({
    id: uid(), projectId: p.id, type: 'project_created' as const,
    actorUid: p.createdBy, actorName: p.createdBy, at: p.createdAt,
    target: 'project', targetId: p.id, changesSummary: `Projeto "${p.title}" criado`,
  }));

  lsSet(KEYS.projects, projects);
  lsSet(KEYS.docs, docs);
  lsSet(KEYS.history, history);
  lsSet(KEYS.exports, [] as ExportRecord[]);
  lsSet(KEYS.seeded, true);
}

seedIfNeeded();

/* ────── CRUD helpers ────── */

function getAll<T>(key: string): T[] {
  return lsGet<T[]>(key, []);
}

function setAll<T>(key: string, data: T[]) {
  lsSet(key, data);
}

// Projects
export function getProjects(): Project[] {
  return getAll<Project>(KEYS.projects);
}

export function getProject(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}

export function saveProject(p: Project): void {
  const all = getProjects();
  const idx = all.findIndex((x) => x.id === p.id);
  if (idx >= 0) all[idx] = p;
  else all.push(p);
  setAll(KEYS.projects, all);
}

export function deleteProject(id: string): void {
  setAll(KEYS.projects, getProjects().filter((p) => p.id !== id));
}

// Docs
export function getDocs(projectId?: string): Doc[] {
  const all = getAll<Doc>(KEYS.docs);
  return projectId ? all.filter((d) => d.projectId === projectId) : all;
}

export function getDoc(id: string): Doc | undefined {
  return getAll<Doc>(KEYS.docs).find((d) => d.id === id);
}

export function saveDoc(d: Doc): void {
  const all = getAll<Doc>(KEYS.docs);
  const idx = all.findIndex((x) => x.id === d.id);
  if (idx >= 0) all[idx] = d;
  else all.push(d);
  setAll(KEYS.docs, all);
}

export function deleteDoc(id: string): void {
  setAll(KEYS.docs, getAll<Doc>(KEYS.docs).filter((d) => d.id !== id));
}

// History
export function getHistory(projectId: string): HistoryEvent[] {
  return getAll<HistoryEvent>(KEYS.history)
    .filter((h) => h.projectId === projectId)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function addHistory(ev: HistoryEvent): void {
  const all = getAll<HistoryEvent>(KEYS.history);
  all.unshift(ev);
  setAll(KEYS.history, all);
}

// Exports
export function getExports(projectId: string): ExportRecord[] {
  return getAll<ExportRecord>(KEYS.exports)
    .filter((e) => e.projectId === projectId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addExport(rec: ExportRecord): void {
  const all = getAll<ExportRecord>(KEYS.exports);
  all.unshift(rec);
  setAll(KEYS.exports, all);
}
