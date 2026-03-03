import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore } from '@/lib/auth';
import Spinner from '@/components/ui/Spinner';
import ProjectFormModal from '@/components/project/ProjectFormModal';
import { projectsApi } from '@/lib/data/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function AppShell() {
  const { user, loading } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const qc = useQueryClient();

  const createMut = useMutation({
    mutationFn: (input: Parameters<typeof projectsApi.createProject>[0]) =>
      projectsApi.createProject(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto criado!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <Spinner size="h-10 w-10" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: `
          radial-gradient(ellipse at 80% 15%, rgba(20, 85, 150, 0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 20% 80%, rgba(208, 125, 95, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(3, 45, 78, 0.4) 0%, transparent 70%),
          #011938
        `,
      }}
    >
      {/* Stars overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 25% 50%, rgba(255,255,255,0.25), transparent),
            radial-gradient(1px 1px at 40% 15%, rgba(255,255,255,0.15), transparent),
            radial-gradient(1.5px 1.5px at 55% 70%, rgba(255,255,255,0.35), transparent),
            radial-gradient(1px 1px at 70% 35%, rgba(255,255,255,0.2), transparent),
            radial-gradient(1.5px 1.5px at 85% 60%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 15% 85%, rgba(255,255,255,0.2), transparent),
            radial-gradient(1px 1px at 60% 90%, rgba(255,255,255,0.15), transparent),
            radial-gradient(2px 2px at 90% 10%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 35% 40%, rgba(255,255,255,0.25), transparent),
            radial-gradient(1px 1px at 80% 85%, rgba(255,255,255,0.2), transparent),
            radial-gradient(1.5px 1.5px at 5% 55%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 48% 5%, rgba(255,255,255,0.35), transparent),
            radial-gradient(1px 1px at 92% 45%, rgba(255,255,255,0.2), transparent),
            radial-gradient(2px 2px at 30% 95%, rgba(255,255,255,0.4), transparent)
          `,
        }}
      />

      {/* Topbar */}
      <Topbar onNewProject={() => setShowCreate(true)} />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="pl-56 pt-0 min-h-[calc(100vh-72px)] relative z-10">
        <main className="p-8">
          <Outlet />
        </main>
      </div>

      {/* Floating "Novo Projeto" - mobile */}
      <button
        onClick={() => setShowCreate(true)}
        className="md:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full
                   flex items-center justify-center text-white shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #D07D5F 0%, #DF8C69 100%)',
          boxShadow: '0 4px 24px rgba(208,125,95,0.4)',
        }}
      >
        <span className="text-2xl font-light">+</span>
      </button>

      {/* Create project modal */}
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
