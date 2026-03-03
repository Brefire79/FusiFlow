import { useNavigate } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import type { Project } from '@/lib/data/types';
import { timeAgo } from '@/lib/time';
import { resolveUserName } from '@/lib/users';
import { Clock } from 'lucide-react';

const borderAccents: Record<string, string> = {
  andamento: '#D07D5F',
  backlog: '#938586',
  revisao: '#facc15',
  concluido: '#34d399',
};

export default function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  const borderColor = borderAccents[project.status] ?? '#443E44';

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
      <p className="text-xs text-text-2 ml-5.5">
        Atualizado por{' '}
        <span className="text-text font-medium">{resolveUserName(project.updatedBy)}</span>{' '}
        {timeAgo(project.updatedAt)}
      </p>

      {/* Subtle gradient overlay */}
      <div
        className="absolute top-0 right-0 w-24 h-full pointer-events-none opacity-0
                   group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${borderColor}08)`,
        }}
      />
    </div>
  );
}
