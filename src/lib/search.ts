/* ── Busca global ── */
import type { Project, Doc } from './data/types';
import * as mock from './data/mockDb';
import { ENV } from './env';

export interface SearchResults {
  projects: Project[];
  docs: (Doc & { projectTitle: string })[];
}

const MAX_RESULTS = 5;

export function globalSearch(query: string): SearchResults {
  const q = query.trim().toLowerCase();

  if (!q) return { projects: [], docs: [] };

  if (!ENV.useFirebase) {
    // Busca em mock (síncrona)
    const allProjects = mock.getProjects();
    const allDocs = mock.getDocs();

    const projects = allProjects
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      )
      .slice(0, MAX_RESULTS);

    const projectMap = new Map(allProjects.map((p) => [p.id, p.title]));

    const docs = allDocs
      .filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.content.slice(0, 200).toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS)
      .map((d) => ({ ...d, projectTitle: projectMap.get(d.projectId) ?? '' }));

    return { projects, docs };
  }

  // Firebase: não implementado no MVP client-side (requereria full-text search)
  return { projects: [], docs: [] };
}

/** Retorna os últimos N projetos ordenados por updatedAt (para sugestões vazias) */
export function getRecentProjects(limit = 3): Project[] {
  if (!ENV.useFirebase) {
    return mock
      .getProjects()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }
  return [];
}
