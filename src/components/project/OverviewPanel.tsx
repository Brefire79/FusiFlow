import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { Project } from '@/lib/data/types';
import { historyApi, projectsApi } from '@/lib/data/api';
import { resolveUserName } from '@/lib/users';
import { formatDate, timeAgo } from '@/lib/time';
import {
  FileText,
  Activity,
  Users,
  Clock,
  LayoutDashboard,
  PlusCircle,
  Edit3,
  Download,
  History,
  Lock,
  Unlock,
  Tag,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface OverviewPanelProps {
  project: Project;
  /** Callback para mudar a aba ativa no ProjectDetail */
  onTabChange?: (tab: string) => void;
}

const STATUS_LABEL: Record<string, string> = {
  backlog: 'Backlog',
  andamento: 'Em Andamento',
  revisao: 'Em Revisão',
  concluido: 'Concluído',
};

const PHASE_COLOR: Record<string, string> = {
  planejamento: 'text-text-2',
  'execução': 'text-accent',
  entrega: 'text-emerald-400',
};

const EVENT_ICON: Record<string, typeof History> = {
  project_created: PlusCircle,
  project_updated: Edit3,
  doc_created: FileText,
  doc_updated: FileText,
  export: Download,
  lock_acquired: Lock,
  lock_released: Unlock,
};

const EVENT_COLOR: Record<string, string> = {
  project_created: 'text-primary bg-primary/10',
  project_updated: 'text-accent bg-accent/10',
  doc_created: 'text-accent bg-accent/10',
  doc_updated: 'text-accent bg-accent/10',
  export: 'text-emerald-400 bg-emerald-400/10',
  lock_acquired: 'text-yellow-400 bg-yellow-400/10',
  lock_released: 'text-text-2 bg-text-2/10',
};

export default function OverviewPanel({ project, onTabChange }: OverviewPanelProps) {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['project-stats', project.id],
    queryFn: () => projectsApi.getProjectStats(project.id),
    staleTime: 60_000,
  });

  const { data: recentHistory = [] } = useQuery({
    queryKey: ['history', project.id],
    queryFn: () => historyApi.listHistory(project.id),
    staleTime: 30_000,
  });

  const memberCount = Object.keys(project.members).length;
  const last5 = recentHistory.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ── Coluna 1: Info ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wider flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          Informações
        </h3>

        {/* Descrição */}
        {project.description && (
          <div className="rounded-2xl border border-border/30 bg-bg-2/50 p-4">
            <p className="text-sm text-text leading-relaxed">{project.description}</p>
          </div>
        )}

        {/* Tags */}
        {project.tags.length > 0 && (
          <div>
            <p className="text-xs text-text-2 mb-2 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/projects?tag=${encodeURIComponent(tag)}`)}
                  className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent
                             hover:bg-accent/20 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Detalhes */}
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-text-2">Status</dt>
            <dd><Badge status={project.status} /></dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-2">Fase</dt>
            <dd className={`font-medium capitalize ${PHASE_COLOR[project.phase] ?? 'text-text'}`}>
              {project.phase}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-2">Versão</dt>
            <dd className="text-text font-medium">{project.version}.0</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-2">Criado em</dt>
            <dd className="text-text">{formatDate(project.createdAt).slice(0, 10).split('-').reverse().join('/')}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-2">Criado por</dt>
            <dd className="text-text font-medium">{resolveUserName(project.createdBy)}</dd>
          </div>
        </dl>
      </div>

      {/* ── Coluna 2: Estatísticas ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Estatísticas
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Docs */}
          <div className="rounded-2xl border border-border/30 bg-bg-2/50 p-4 flex flex-col gap-1">
            <FileText className="h-5 w-5 text-accent mb-1" />
            <span className="text-2xl font-bold text-text">
              {stats ? stats.docsCount : <span className="animate-pulse">—</span>}
            </span>
            <span className="text-xs text-text-2">Documentos</span>
          </div>

          {/* Histórico */}
          <div className="rounded-2xl border border-border/30 bg-bg-2/50 p-4 flex flex-col gap-1">
            <Activity className="h-5 w-5 text-primary mb-1" />
            <span className="text-2xl font-bold text-text">
              {stats ? stats.historyCount : <span className="animate-pulse">—</span>}
            </span>
            <span className="text-xs text-text-2">Eventos</span>
          </div>

          {/* Membros */}
          <div className="rounded-2xl border border-border/30 bg-bg-2/50 p-4 flex flex-col gap-1">
            <Users className="h-5 w-5 text-emerald-400 mb-1" />
            <span className="text-2xl font-bold text-text">{memberCount}</span>
            <span className="text-xs text-text-2">Membros</span>
          </div>

          {/* Última atualização */}
          <div className="rounded-2xl border border-border/30 bg-bg-2/50 p-4 flex flex-col gap-1">
            <Clock className="h-5 w-5 text-yellow-400 mb-1" />
            <span className="text-sm font-semibold text-text leading-tight">
              {timeAgo(project.updatedAt)}
            </span>
            <span className="text-xs text-text-2">Última atualização</span>
          </div>
        </div>
      </div>

      {/* ── Coluna 3: Atividade recente ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wider flex items-center gap-2">
          <History className="h-4 w-4" />
          Atividade Recente
        </h3>

        {last5.length === 0 ? (
          <p className="text-sm text-text-2">Nenhuma atividade registrada.</p>
        ) : (
          <div className="relative pl-5">
            {/* Linha vertical */}
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border/40" />

            <div className="space-y-4">
              {last5.map((ev) => {
                const Icon = EVENT_ICON[ev.type] ?? History;
                const colorClass = EVENT_COLOR[ev.type] ?? 'text-text-2 bg-text-2/10';
                return (
                  <div key={ev.id} className="relative flex items-start gap-3">
                    {/* Dot */}
                    <div className={`absolute -left-5 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center ${colorClass}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-text leading-snug">{ev.changesSummary}</p>
                      <p className="text-xs text-text-2 mt-0.5">
                        {ev.actorName} · {timeAgo(ev.at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {recentHistory.length > 5 && (
          <button
            onClick={() => onTabChange?.('history')}
            className="text-xs text-accent hover:underline transition-colors"
          >
            Ver histórico completo →
          </button>
        )}
      </div>
    </div>
  );
}
