import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, FileText, SearchIcon, X, Clock } from 'lucide-react';
import { globalSearch, getRecentProjects } from '@/lib/search';
import type { SearchResults } from '@/lib/search';
import type { Project } from '@/lib/data/types';
import Badge from '@/components/ui/Badge';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  backlog: 'Backlog',
  andamento: 'Andamento',
  revisao: 'Revisão',
  concluido: 'Concluído',
};

const STATUS_COLOR: Record<string, string> = {
  backlog: 'bg-text-2/20 text-text-2',
  andamento: 'bg-accent/20 text-accent',
  revisao: 'bg-yellow-400/20 text-yellow-400',
  concluido: 'bg-emerald-400/20 text-emerald-400',
};

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ projects: [], docs: [] });
  const [recent, setRecent] = useState<Project[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Focar input ao abrir
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults({ projects: [], docs: [] });
      setRecent(getRecentProjects(3));
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  // Fechar com Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Debounce de busca
  const handleChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setResults(globalSearch(value));
    }, 300);
  }, []);

  // Cleanup debounce
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  if (!open) return null;

  const hasQuery = query.trim().length > 0;
  const hasResults = results.projects.length > 0 || results.docs.length > 0;

  function goProject(id: string) {
    navigate(`/projects/${id}`);
    onClose();
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-100 flex items-start justify-center pt-20 px-4
                 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Painel */}
      <div
        className="w-full max-w-xl rounded-3xl border border-border/50 bg-bg-2/95
                   backdrop-blur-xl shadow-card overflow-hidden"
        style={{ animation: 'fadeInUp 150ms ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/20">
          <SearchIcon className="h-5 w-5 shrink-0 text-text-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Buscar projetos, documentos..."
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-2
                       focus:outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults({ projects: [], docs: [] }); }}
              className="text-text-2 hover:text-text transition-colors"
              aria-label="Limpar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border/40
                         bg-surface/60 px-1.5 py-0.5 text-[10px] text-text-2">Esc</kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-105 overflow-y-auto py-2">

          {/* Query vazia → recentes */}
          {!hasQuery && (
            <>
              {recent.length > 0 && (
                <div>
                  <p className="px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-2">
                    Recentes
                  </p>
                  {recent.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => goProject(p.id)}
                      className="w-full flex items-center gap-3 px-5 py-2.5
                                 hover:bg-white/5 transition-colors text-left"
                    >
                      <Clock className="h-4 w-4 shrink-0 text-text-2" />
                      <span className="flex-1 text-sm text-text truncate">{p.title}</span>
                      <span className={`text-[10px] rounded-full px-2 py-0.5 ${STATUS_COLOR[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <p className="px-5 py-3 text-xs text-text-2 text-center">
                Digite para buscar projetos e documentos
              </p>
            </>
          )}

          {/* Sem resultados */}
          {hasQuery && !hasResults && (
            <p className="px-5 py-8 text-sm text-text-2 text-center">
              Nenhum resultado para &ldquo;<span className="text-text">{query}</span>&rdquo;
            </p>
          )}

          {/* Projetos */}
          {results.projects.length > 0 && (
            <div>
              <p className="px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-2">
                Projetos
              </p>
              {results.projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => goProject(p.id)}
                  className="w-full flex items-center gap-3 px-5 py-2.5
                             hover:bg-white/5 transition-colors text-left"
                >
                  <FolderKanban className="h-4 w-4 shrink-0 text-accent" />
                  <span className="flex-1 text-sm text-text truncate">{p.title}</span>
                  <span className={`text-[10px] rounded-full px-2 py-0.5 ${STATUS_COLOR[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Documentos */}
          {results.docs.length > 0 && (
            <div>
              <p className="px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-2">
                Documentos
              </p>
              {results.docs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => goProject(d.projectId)}
                  className="w-full flex items-center gap-3 px-5 py-2.5
                             hover:bg-white/5 transition-colors text-left"
                >
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text truncate">{d.title}</p>
                    <p className="text-[11px] text-text-2 truncate">{d.projectTitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-2.5 border-t border-border/20 flex items-center gap-4">
          <span className="text-[11px] text-text-2">
            <kbd className="rounded border border-border/40 bg-surface/60 px-1 text-[10px]">↵</kbd>
            {' '}abrir
          </span>
          <span className="text-[11px] text-text-2">
            <kbd className="rounded border border-border/40 bg-surface/60 px-1 text-[10px]">Esc</kbd>
            {' '}fechar
          </span>
        </div>
      </div>
    </div>
  );
}
