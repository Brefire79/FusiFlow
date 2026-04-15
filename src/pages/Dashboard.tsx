import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '@/lib/data/api';
import { useAuthStore } from '@/lib/auth';
import type { ProjectStatus } from '@/lib/data/types';
import ProjectCard from '@/components/project/ProjectCard';
import Spinner from '@/components/ui/Spinner';
import {
  ClipboardList,
  Settings as GearIcon,
  CheckCircle2,
  CheckCheck,
  RefreshCw,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ActivityChart from '@/components/dashboard/ActivityChart';

const statusCards: {
  status: ProjectStatus;
  label: string;
  icon: typeof ClipboardList;
  accent: string;
  iconBg: string;
  borderRgba: string;
  glowRgba: string;
}[] = [
  {
    status: 'backlog',
    label: 'Backlog',
    icon: ClipboardList,
    accent: '#C4AEB0',
    iconBg: 'rgba(196,174,176,0.15)',
    borderRgba: 'rgba(196,174,176,0.3)',
    glowRgba: 'rgba(196,174,176,0.06)',
  },
  {
    status: 'andamento',
    label: 'Em Andamento',
    icon: GearIcon,
    accent: '#2ABEDD',
    iconBg: 'rgba(42,190,221,0.15)',
    borderRgba: 'rgba(42,190,221,0.4)',
    glowRgba: 'rgba(42,190,221,0.09)',
  },
  {
    status: 'revisao',
    label: 'Em Revisão',
    icon: CheckCircle2,
    accent: '#F4C430',
    iconBg: 'rgba(244,196,48,0.15)',
    borderRgba: 'rgba(244,196,48,0.35)',
    glowRgba: 'rgba(244,196,48,0.07)',
  },
  {
    status: 'concluido',
    label: 'Concluídos',
    icon: CheckCheck,
    accent: '#34d399',
    iconBg: 'rgba(52,211,153,0.15)',
    borderRgba: 'rgba(52,211,153,0.35)',
    glowRgba: 'rgba(52,211,153,0.07)',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.listProjects,
  });

  const counts = statusCards.map((sc) => ({
    ...sc,
    count: projects.filter((p) => p.status === sc.status).length,
  }));

  const RECENT_PAGE_SIZE = 6;
  const [recentPage, setRecentPage] = useState(1);

  useEffect(() => { setRecentPage(1); }, [search]);

  const sortedRecent = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const allFiltered = search
    ? sortedRecent.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
      )
    : sortedRecent;

  const filtered = allFiltered.slice(0, recentPage * RECENT_PAGE_SIZE);
  const hasMoreRecent = filtered.length < allFiltered.length;

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text">
          Bem-vindo de volta, {user?.name?.split(' ')[0] ?? 'Usuário'}!
        </h1>
        <p className="text-text-2 mt-1">Aqui estão seus projetos atuais.</p>
      </div>

      {/* Status metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {counts.map((c) => {
          const isHighlight = c.status === 'andamento';
          return (
            <div
              key={c.status}
              className="relative rounded-2xl border p-5 transition-all duration-300 cursor-pointer
                         hover:scale-[1.02] group overflow-hidden"
              style={{
                backgroundColor: 'rgba(3, 45, 78, 0.5)',
                backdropFilter: 'blur(12px)',
                borderColor: c.borderRgba,
                boxShadow: `0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 ${c.glowRgba}`,
              }}
              onClick={() => navigate(`/projects?status=${c.status}`)}
            >
              {/* Accent top stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ backgroundColor: c.accent, opacity: 0.7 }}
              />

              {/* Icon + label */}
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: c.iconBg }}
                >
                  <c.icon className="h-4 w-4" style={{ color: c.accent }} />
                </div>
                <span className="text-sm font-semibold text-text leading-tight">
                  {c.label}
                </span>
              </div>

              {/* Big number — usa accent para dar identidade visual */}
              <p
                className="text-4xl font-bold mb-1 tabular-nums"
                style={{ color: c.accent }}
              >
                {c.count}
              </p>
              <p className="text-xs text-text-2">
                {c.count === 1 ? 'projeto' : 'projetos'}
              </p>

              {/* Glow radial no canto — para todos os cards */}
              <div
                className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${c.accent}33, transparent 70%)`,
                  opacity: isHighlight ? 0.5 : 0.25,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Atividade semanal */}
      <div className="rounded-2xl border border-border/40 bg-surface/40 backdrop-blur-sm p-5">
        <h2 className="text-base font-semibold text-text mb-4">Atividade dos últimos 7 dias</h2>
        <ActivityChart />
      </div>

      {/* Projetos Recentes header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-text">Projetos Recentes</h2>
          <button className="rounded-full p-1 hover:bg-white/5 transition-colors text-text-2">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
        >
          Ver todos
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-2" />
        <input
          type="text"
          placeholder="Buscar projetos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-border/40 bg-bg-2/60 backdrop-blur-sm
                     pl-11 pr-4 h-11 text-sm text-text placeholder:text-text-2
                     focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
        />
      </div>

      {/* Project cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
      {hasMoreRecent && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setRecentPage(p => p + 1)}
            className="rounded-full px-5 h-10 text-sm font-medium text-accent border border-accent/30
                       hover:bg-accent/5 transition-all duration-200"
          >
            Carregar mais ({allFiltered.length - filtered.length} restantes)
          </button>
        </div>
      )}
    </div>
  );
}
