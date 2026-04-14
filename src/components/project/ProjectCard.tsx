import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Badge from '@/components/ui/Badge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { Project } from '@/lib/data/types';
import { projectsApi } from '@/lib/data/api';
import { timeAgo } from '@/lib/time';
import { resolveUserName } from '@/lib/users';
import { Clock, MoreVertical, Pencil, Trash2, FileText, History } from 'lucide-react';

const borderAccents: Record<string, string> = {
  andamento: '#D07D5F',
  backlog: '#938586',
  revisao: '#facc15',
  concluido: '#34d399',
};

interface ProjectCardProps {
  project: Project;
  /** Chamado ao clicar em "Editar" no menu */
  onEdit?: () => void;
  /** Chamado após confirmação de exclusão */
  onDelete?: () => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();
  const borderColor = borderAccents[project.status] ?? '#443E44';
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['project-stats', project.id],
    queryFn: () => projectsApi.getProjectStats(project.id),
    staleTime: 60_000,
  });

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group relative rounded-2xl border border-border/40 p-5 cursor-pointer
                 transition-all duration-200 hover:border-accent/30 hover:shadow-glow overflow-hidden"
      style={{
        backgroundColor: 'rgba(3, 45, 78, 0.4)',
        backdropFilter: 'blur(8px)',
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      {/* Menu 3 pontos — canto superior direito, visível no hover */}
      <div
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full p-1.5 bg-surface/60 border border-border/40
                       hover:bg-white/10 transition-colors"
            aria-label="Opções do projeto"
          >
            <MoreVertical className="h-4 w-4 text-text-2" />
          </button>

          {/* Overlay para fechar ao clicar fora */}
          {menuOpen && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
          )}

          {/* Dropdown do menu */}
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-40 rounded-2xl border border-border/40
                         bg-surface/95 backdrop-blur-xl shadow-card z-20 overflow-hidden"
              style={{ animation: 'fadeInUp 120ms ease-out' }}
            >
              <button
                onClick={() => { setMenuOpen(false); onEdit?.(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-text
                           hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <Pencil className="h-3.5 w-3.5 text-text-2" />
                Editar
              </button>
              <button
                onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400
                           hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Top row: bullet + title + badge + time */}
      <div className="flex items-start gap-3 mb-3">
        <span
          className="mt-1.5 h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: borderColor }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-text group-hover:text-accent transition-colors">
              {project.title}
            </h3>
            <Badge status={project.status} />
            {project.status === 'andamento' && (
              <span className="flex items-center gap-1 text-xs text-text-2">
                <Clock className="h-3 w-3" />
                {timeAgo(project.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-text-2 ml-5.5 mb-3 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5 ml-5.5 mb-3">
        {/* Version tag */}
        <span
          className="text-[11px] px-2.5 py-0.5 rounded-full border font-medium"
          style={{
            borderColor: 'rgba(68, 62, 68, 0.6)',
            color: '#D4CCC0',
            backgroundColor: 'rgba(8, 18, 40, 0.6)',
          }}
        >
          Versão {project.version}.0
        </span>
        {project.tags.map((t) => (
          <span
            key={t}
            className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: 'rgba(42, 190, 221, 0.1)',
              color: '#2ABEDD',
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="ml-5.5 flex items-center justify-between gap-2">
        <p className="text-xs text-text-2">
          Atualizado por{' '}
          <span className="text-text font-medium">{resolveUserName(project.updatedBy)}</span>{' '}
          {timeAgo(project.updatedAt)}
        </p>
        {/* Stats */}
        <div className="flex items-center gap-2 text-xs text-text-2 shrink-0">
          {stats ? (
            <>
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {stats.docsCount}
              </span>
              <span className="opacity-30">&middot;</span>
              <span className="flex items-center gap-1">
                <History className="h-3 w-3" />
                {stats.historyCount}
              </span>
            </>
          ) : (
            <div className="animate-pulse w-20 h-3 rounded bg-border/40" />
          )}
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div
        className="absolute top-0 right-0 w-24 h-full pointer-events-none opacity-0
                   group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${borderColor}08)`,
        }}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => onDelete?.()}
        title="Excluir projeto"
        description={`Tem certeza que deseja excluir "${project.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        confirmVariant="danger"
      />
    </div>
  );
}
