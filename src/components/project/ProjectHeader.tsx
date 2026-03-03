import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Project } from '@/lib/data/types';
import { timeAgo } from '@/lib/time';
import { ArrowLeft, Edit3, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectHeaderProps {
  project: Project;
  onEdit: () => void;
}

const phaseLabels = {
  planejamento: 'Planejamento',
  execução: 'Execução',
  entrega: 'Entrega',
};

export default function ProjectHeader({ project, onEdit }: ProjectHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-sm text-text-2 hover:text-accent mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-text">{project.title}</h1>
            <Badge status={project.status} />
          </div>

          <div className="flex items-center gap-4 text-sm text-text-2">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Atualizado {timeAgo(project.updatedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {project.members.length} membro(s)
            </span>
            <span className="bg-accent-2/20 text-accent text-xs px-2.5 py-0.5 rounded-full">
              {phaseLabels[project.phase]}
            </span>
            <span className="text-xs text-text-2">v{project.version}</span>
          </div>
        </div>

        <Button variant="ghost" onClick={onEdit} icon={<Edit3 className="h-4 w-4" />}>
          Editar
        </Button>
      </div>
    </div>
  );
}
