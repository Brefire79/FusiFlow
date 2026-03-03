import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { ProjectStatus, Phase } from '@/lib/data/types';

interface FormData {
  title: string;
  status: ProjectStatus;
  phase: Phase;
  tags: string;
}

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; status: ProjectStatus; phase: Phase; tags: string[] }) => Promise<void>;
  initial?: { title: string; status: ProjectStatus; phase: Phase; tags: string[] };
  mode: 'create' | 'edit';
}

const statuses: { value: ProjectStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'andamento', label: 'Em Andamento' },
  { value: 'revisao', label: 'Revisão' },
  { value: 'concluido', label: 'Concluído' },
];

const phases: { value: Phase; label: string }[] = [
  { value: 'planejamento', label: 'Planejamento' },
  { value: 'execução', label: 'Execução' },
  { value: 'entrega', label: 'Entrega' },
];

export default function ProjectFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  mode,
}: ProjectFormModalProps) {
  const [form, setForm] = useState<FormData>({
    title: initial?.title ?? '',
    status: initial?.status ?? 'backlog',
    phase: initial?.phase ?? 'planejamento',
    tags: initial?.tags?.join(', ') ?? '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        status: form.status,
        phase: form.phase,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={mode === 'create' ? 'Novo Projeto' : 'Editar Projeto'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Título"
          placeholder="Nome do projeto"
          value={form.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, title: e.target.value }))}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-2 uppercase tracking-wider">
              Status
            </label>
            <select
              className="w-full rounded-2xl border border-border/60 bg-bg-2/80 px-4 h-11 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-2 uppercase tracking-wider">
              Fase
            </label>
            <select
              className="w-full rounded-2xl border border-border/60 bg-bg-2/80 px-4 h-11 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              value={form.phase}
              onChange={(e) => setForm((f) => ({ ...f, phase: e.target.value as Phase }))}
            >
              {phases.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Tags (separar por vírgula)"
          placeholder="frontend, design, api"
          value={form.tags}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, tags: e.target.value }))}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="accent" type="submit" loading={loading}>
            {mode === 'create' ? 'Criar Projeto' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
