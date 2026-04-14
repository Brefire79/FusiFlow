import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/data/api';
import ProjectHeader from '@/components/project/ProjectHeader';
import ProjectFormModal from '@/components/project/ProjectFormModal';
import DocsPanel from '@/components/project/DocsPanel';
import HistoryPanel from '@/components/project/HistoryPanel';
import ExportsPanel from '@/components/project/ExportsPanel';
import MembersPanel from '@/components/project/MembersPanel';
import OverviewPanel from '@/components/project/OverviewPanel';
import Tabs from '@/components/ui/Tabs';
import Spinner from '@/components/ui/Spinner';
import { LayoutDashboard, FileText, History, Download, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const tabs = [
  { key: 'overview', label: 'Visão Geral', icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: 'docs', label: 'Docs', icon: <FileText className="h-4 w-4" /> },
  { key: 'members', label: 'Membros', icon: <Users className="h-4 w-4" /> },
  { key: 'history', label: 'Histórico', icon: <History className="h-4 w-4" /> },
  { key: 'exports', label: 'Exportações', icon: <Download className="h-4 w-4" /> },
];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEdit, setShowEdit] = useState(false);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getProject(id!),
    enabled: !!id,
  });

  if (isLoading) return <Spinner />;
  if (!project || isError) return <Navigate to="/projects" replace />;

  return (
    <div>
      <ProjectHeader project={project} onEdit={() => setShowEdit(true)} />

      <div className="mb-6">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="rounded-3xl border border-border/50 bg-surface/60 backdrop-blur-md shadow-card p-6">
        {activeTab === 'overview' && <OverviewPanel project={project} onTabChange={setActiveTab} />}
        {activeTab === 'docs' && <DocsPanel projectId={project.id} />}
        {activeTab === 'members' && <MembersPanel project={project} />}
        {activeTab === 'history' && <HistoryPanel projectId={project.id} />}
        {activeTab === 'exports' && <ExportsPanel projectId={project.id} />}
      </div>

      <ProjectFormModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        mode="edit"
        initial={{
          title: project.title,
          description: project.description,
          status: project.status,
          phase: project.phase,
          tags: project.tags,
        }}
        onSubmit={async (data) => {
          try {
            await projectsApi.updateProject(project.id, data, project.version);
            qc.invalidateQueries({ queryKey: ['project', id] });
            qc.invalidateQueries({ queryKey: ['projects'] });
            qc.invalidateQueries({ queryKey: ['history', project.id] });
            toast.success('Projeto atualizado!');
          } catch (err: any) {
            toast.error(err.message);
            throw err;
          }
        }}
      />
    </div>
  );
}
