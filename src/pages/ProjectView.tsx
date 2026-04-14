import { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Project, Doc } from '@/lib/data/types';
import Badge from '@/components/ui/Badge';
import { ExternalLink, FileText } from 'lucide-react';

interface Bundle {
  project: Project;
  docs: Doc[];
  exportedAt: string;
}

export default function ProjectView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const bundle = useMemo<Bundle | null>(() => {
    const raw = params.get('data');
    if (!raw) return null;
    try {
      const json = decodeURIComponent(escape(atob(raw)));
      return JSON.parse(json) as Bundle;
    } catch {
      return null;
    }
  }, [params]);

  if (!bundle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4
                      bg-bg text-text px-4">
        <p className="text-lg font-semibold text-red-400">Link inválido ou expirado.</p>
        <p className="text-sm text-text-2">O link de visualização não pôde ser lido.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-2 rounded-full px-5 py-2 text-sm font-medium
                     bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
        >
          Abrir FusiFlow
        </button>
      </div>
    );
  }

  const { project, docs } = bundle;

  const STATUS_LABEL: Record<string, string> = {
    backlog: 'Backlog',
    andamento: 'Em Andamento',
    revisao: 'Em Revisão',
    concluido: 'Concluído',
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/20 bg-bg-2/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-bold truncate">{project.title}</h1>
            <Badge status={project.status} />
          </div>
          <button
            onClick={() => navigate('/login')}
            className="shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium
                       bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir no FusiFlow
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Info do projeto */}
        <div className="rounded-2xl border border-border/30 bg-surface/40 p-6 space-y-4">
          {project.description && (
            <p className="text-sm text-text-2 leading-relaxed">{project.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-2">
            <span>Fase: <strong className="text-text capitalize">{project.phase}</strong></span>
            <span>Versão: <strong className="text-text">{project.version}.0</strong></span>
            <span>Status: <strong className="text-text">{STATUS_LABEL[project.status]}</strong></span>
          </div>
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Documentos */}
        <div>
          <h2 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Documentos ({docs.length})
          </h2>

          {docs.length === 0 ? (
            <p className="text-sm text-text-2">Nenhum documento neste projeto.</p>
          ) : (
            <div className="space-y-6">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-border/30 bg-surface/30 p-6"
                >
                  <h3 className="text-base font-semibold text-text mb-4">{doc.title}</h3>
                  <div className="prose-fusi text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/20 pt-6 flex items-center justify-between text-xs text-text-2">
          <span>Gerado via FusiFlow</span>
          <button
            onClick={() => navigate('/login')}
            className="text-accent hover:underline transition-colors"
          >
            Abrir no FusiFlow →
          </button>
        </div>
      </div>
    </div>
  );
}
