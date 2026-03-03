import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/data/api';
import type { ProjectStatus } from '@/lib/data/types';
import { useAuthStore } from '@/lib/auth';
import ProjectCard from '@/components/project/ProjectCard';
import ProjectFormModal from '@/components/project/ProjectFormModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { Plus, FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';

const statusFilters: { value: '' | ProjectStatus; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'backlog', label: 'Backlog' },
  { value: 'andamento', label: 'Andamento' },
  { value: 'revisao', label: 'Revisão' },
  { value: 'concluido', label: 'Concluído' },
];

export default function Projects() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'' | ProjectStatus>('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.listProjects,
  });

  const createMut = useMutation({
    mutationFn: (input: Parameters<typeof projectsApi.createProject>[0]) =>
      projectsApi.createProject(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto criado!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = projects.filter((p) => {
    if (filterStatus && p.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Buscar por título ou tag…"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="w-72"
        />
        <div className="flex gap-1 rounded-full bg-bg-2/60 p-1 border border-border/30">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all
                ${filterStatus === f.value
                  ? 'bg-surface text-accent shadow-sm'
                  : 'text-text-2 hover:text-text'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <Button variant="accent" onClick={() => setShowCreate(true)} icon={<Plus className="h-4 w-4" />}>
          Novo Projeto
        </Button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum projeto encontrado"
          description={search || filterStatus ? 'Ajuste os filtros' : 'Crie seu primeiro projeto'}
          icon={<FolderKanban className="h-8 w-8 text-text-2" />}
          action={
            !search && !filterStatus ? (
              <Button variant="accent" onClick={() => setShowCreate(true)} icon={<Plus className="h-4 w-4" />}>
                Novo Projeto
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {/* Modal */}
      <ProjectFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        mode="create"
        onSubmit={async (data) => {
          await createMut.mutateAsync({ ...data, members: [user!.uid] });
        }}
      />
    </div>
  );
}
