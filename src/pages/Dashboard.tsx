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
import { useState } from 'react';

const statusCards: {
  status: ProjectStatus;
  label: string;
  subLabel: string;
  icon: typeof ClipboardList;
  accent: string;
  iconBg: string;
}[] = [
  {
    status: 'backlog',
    label: 'Backlog',
    subLabel: 'Backlog',
    icon: ClipboardList,
    accent: '#938586',
    iconBg: 'rgba(147,133,134,0.15)',
  },
  {
    status: 'andamento',
    label: 'Em Andamento',
    subLabel: 'Em Andamento',
    icon: GearIcon,
    accent: '#2ABEDD',
    iconBg: 'rgba(42,190,221,0.15)',
  },
  {
    status: 'revisao',
    label: 'Em Revisão',
    subLabel: 'Em Revisão',
    icon: CheckCircle2,
    accent: '#facc15',
    iconBg: 'rgba(250,204,21,0.15)',
  },
  {
    status: 'concluido',
    label: 'Concluídos',
    subLabel: 'Concluídos',
    icon: CheckCheck,
    accent: '#34d399',
    iconBg: 'rgba(52,211,153,0.15)',
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

  const recent = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const filtered = search
    ? recent.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
      )
    : recent;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                borderColor: isHighlight
                  ? 'rgba(42, 190, 221, 0.4)'
                  : 'rgba(68, 62, 68, 0.4)',
                boxShadow: isHighlight
                  ? '0 0 30px rgba(42, 190, 221, 0.1), inset 0 1px 0 rgba(42,190,221,0.1)'
                  : '0 10px 30px rgba(0,0,0,0.25)',
              }}
              onClick={() => navigate('/projects')}
            >
              {/* Icon + label */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: c.iconBg }}
                >
                  <c.icon className="h-4 w-4" style={{ color: c.accent }} />
                </div>
                <span className="text-sm font-medium" style={{ color: c.accent }}>
                  {c.label}
                </span>
              </div>

              {/* Big number */}
              <p className="text-4xl font-bold text-text mb-1">{c.count}</p>
              <p className="text-xs text-text-2">{c.subLabel}</p>

              {/* Subtle glow for active card */}
              {isHighlight && (
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20"
                  style={{
                    background: 'radial-gradient(circle, rgba(42,190,221,0.6), transparent 70%)',
                  }}
                />
              )}
            </div>
          );
        })}
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
    </div>
  );
}
