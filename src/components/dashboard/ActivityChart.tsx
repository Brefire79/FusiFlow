import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getWeekActivity } from '@/lib/data/activity.api';

const BAR_MAX_H = 80;
const BAR_MIN_H = 4;

const COLORS = {
  project: '#D07D5F', // primary
  doc: '#2ABEDD',     // accent
  export: '#34d399',  // emerald
};

interface TooltipState {
  x: number;
  y: number;
  label: string;
}

export default function ActivityChart() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const { data: days = [], isLoading } = useQuery({
    queryKey: ['activity-week'],
    queryFn: getWeekActivity,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-end gap-3 h-24 px-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 rounded-lg bg-bg-2/60 animate-pulse" style={{ height: `${20 + Math.random() * 50}px` }} />
        ))}
      </div>
    );
  }

  const maxTotal = Math.max(...days.map((d) => d.total), 1);

  const isEmpty = maxTotal === 0 || days.every((d) => d.total === 0);

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-24">
        <p className="text-sm text-text-2">Nenhuma atividade esta semana</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Legenda */}
      <div className="flex items-center gap-4 mb-3 text-xs text-text-2">
        {Object.entries({ project: 'Projetos', doc: 'Documentos', export: 'Exportações' }).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: COLORS[key as keyof typeof COLORS] }} />
            {label}
          </span>
        ))}
      </div>

      {/* Barras SVG */}
      <div className="flex items-end gap-2 w-full">
        {days.map((d, i) => {
          const totalH = Math.max(BAR_MIN_H, Math.round((d.total / maxTotal) * BAR_MAX_H));
          const projectH = d.total > 0 ? Math.round((d.project / d.total) * totalH) : 0;
          const docH = d.total > 0 ? Math.round((d.doc / d.total) * totalH) : 0;
          const exportH = totalH - projectH - docH;

          const handleMouseEnter = (e: React.MouseEvent) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const parts: string[] = [];
            if (d.project) parts.push(`${d.project} projeto${d.project > 1 ? 's' : ''}`);
            if (d.doc) parts.push(`${d.doc} doc${d.doc > 1 ? 's' : ''}`);
            if (d.export) parts.push(`${d.export} export${d.export > 1 ? 'ações' : 'ação'}`);
            setTooltip({
              x: rect.left + rect.width / 2,
              y: rect.top - 8,
              label: `${d.day} · ${d.total} evento${d.total !== 1 ? 's' : ''}${parts.length ? ' (' + parts.join(', ') + ')' : ''}`,
            });
          };

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 cursor-default group"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Barra empilhada */}
              <div
              className="w-full max-w-8 rounded-lg overflow-hidden transition-all duration-200 group-hover:opacity-90"
                style={{ height: `${totalH}px` }}
              >
                {/* Export (topo) */}
                {exportH > 0 && (
                  <div style={{ height: `${exportH}px`, backgroundColor: COLORS.export }} />
                )}
                {/* Docs (meio) */}
                {docH > 0 && (
                  <div style={{ height: `${docH}px`, backgroundColor: COLORS.doc }} />
                )}
                {/* Projetos (base) */}
                {projectH > 0 && (
                  <div style={{ height: `${projectH}px`, backgroundColor: COLORS.project }} />
                )}
              </div>
              {/* Rótulo do dia */}
              <span className="text-[10px] text-text-2 select-none">{d.day}</span>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded-xl border border-border/40
                     bg-bg-2/95 backdrop-blur-md px-3 py-1.5 text-xs text-text shadow-card
                     -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
}
