import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/data/api';
import type { Project, ProjectStatus } from '@/lib/data/types';
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
  const location = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'' | ProjectStatus>(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get('status');
    const valid: ProjectStatus[] = ['backlog', 'andamento', 'revisao', 'concluido'];
    return valid.includes(s as ProjectStatus) ? (s as ProjectStatus) : '';
  });
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => { setPage(1); }, [search, filterStatus]);

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

  const updateMut = useMutation({
    mutationFn: ({
      id,
      data,
      version,
    }: {
      id: string;
      data: Parameters<typeof projectsApi.updateProject>[1];
      version: number;
    }) => projectsApi.updateProject(id, data, version),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto atualizado!');
      setEditProject(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => projectsApi.removeProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto excluído.');
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

  const paginated = filtered.slice(0, page * ITEMS_PER_PAGE);

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">
        {filterStatus
          ? ({ backlog: 'Backlog', andamento: 'Em Andamento', revisao: 'Em Revisão', concluido: 'Concluídos' } as Record<string, string>)[filterStatus]
          : 'Todos os Projetos'}
      </h1>
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onEdit={() => setEditProject(p)}
                onDelete={() => deleteMut.mutate(p.id)}
              />
            ))}
          </div>
          {paginated.length < filtered.length && (
            <div className="flex flex-col items-center gap-2 pt-4">
              <Button variant="ghost" onClick={() => setPage(p => p + 1)}>
                Carregar mais ({filtered.length - paginated.length} restantes)
              </Button>
              <p className="text-xs text-text-2">Exibindo {paginated.length} de {filtered.length} projetos</p>
            </div>
          )}
        </>
      )}

      {/* Modal criar */}
      <ProjectFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        mode="create"
        onSubmit={async (data) => {
          await createMut.mutateAsync(data);
        }}
      />

      {/* Modal editar */}
      <ProjectFormModal
        open={editProject !== null}
        onClose={() => setEditProject(null)}
        mode="edit"
        initial={editProject ?? undefined}
        onSubmit={async (data) => {
          if (!editProject) return;
          await updateMut.mutateAsync({ id: editProject.id, data, version: editProject.version });
        }}
      />
    </div>
  );
}
