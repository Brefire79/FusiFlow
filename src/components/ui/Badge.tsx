import type { ProjectStatus } from '@/lib/data/types';

const statusConfig: Record<ProjectStatus, { label: string; bg: string; text: string }> = {
  backlog:   { label: 'Backlog',       bg: 'rgba(147,133,134,0.2)', text: '#938586' },
  andamento: { label: 'Em Andamento',  bg: 'rgba(42,190,221,0.2)',  text: '#2ABEDD' },
  revisao:   { label: 'Em Revisão',    bg: 'rgba(234,179,8,0.2)',   text: '#facc15' },
  concluido: { label: 'Concluído',     bg: 'rgba(16,185,129,0.2)',  text: '#34d399' },
};

export default function Badge({ status }: { status: ProjectStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}
