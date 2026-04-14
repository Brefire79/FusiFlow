import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/data/api';
import { useAuthStore } from '@/lib/auth';
import type { Project, ProjectMemberRole, ProjectMembersMap } from '@/lib/data/types';
import { resolveUserName } from '@/lib/users';
import Button from '@/components/ui/Button';
import { UserPlus, Trash2, Crown, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface MembersPanelProps {
  project: Project;
}

const roleLabels: Record<ProjectMemberRole, string> = {
  admin: 'Admin',
  manager: 'Gerente',
  member: 'Membro',
};

const roleColors: Record<ProjectMemberRole, string> = {
  admin: 'rgba(208,125,95,0.15)',
  manager: 'rgba(42,190,221,0.15)',
  member: 'rgba(147,133,134,0.15)',
};

const roleTextColors: Record<ProjectMemberRole, string> = {
  admin: '#D07D5F',
  manager: '#2ABEDD',
  member: '#938586',
};

/* Known users available to add (mock) */
const KNOWN_USERS = [
  { uid: 'joao', name: 'João Albuquerque' },
  { uid: 'lucas', name: 'Lucas Silva' },
  { uid: 'breno-m', name: 'Breno Marques' },
  { uid: 'ana', name: 'Ana Costa' },
  { uid: 'rafael', name: 'Rafael Mendes' },
  { uid: 'admin', name: 'Breno (Admin)' },
];

export default function MembersPanel({ project }: MembersPanelProps) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [showAdd, setShowAdd] = useState(false);
  const [newUid, setNewUid] = useState('');
  const [newRole, setNewRole] = useState<ProjectMemberRole>('member');

  const currentUids = Object.keys(project.members ?? {});
  const available = KNOWN_USERS.filter((u) => !currentUids.includes(u.uid));

  const canManage =
    user?.role === 'admin' ||
    project.members?.[user?.uid ?? ''] === 'admin' ||
    project.members?.[user?.uid ?? ''] === 'manager';

  const updateMut = useMutation({
    mutationFn: (members: ProjectMembersMap) =>
      projectsApi.updateProject(project.id, { members }, project.version),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', project.id] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleAdd = async () => {
    if (!newUid) return;
    const updated: ProjectMembersMap = { ...project.members, [newUid]: newRole };
    await updateMut.mutateAsync(updated);
    toast.success(`${resolveUserName(newUid)} adicionado!`);
    setNewUid('');
    setNewRole('member');
    setShowAdd(false);
  };

  const handleRemove = async (uid: string) => {
    if (uid === project.createdBy) {
      toast.error('Não é possível remover o criador do projeto.');
      return;
    }
    const updated = { ...project.members };
    delete updated[uid];
    await updateMut.mutateAsync(updated);
    toast.success('Membro removido.');
  };

  const handleRoleChange = async (uid: string, role: ProjectMemberRole) => {
    const updated: ProjectMembersMap = { ...project.members, [uid]: role };
    await updateMut.mutateAsync(updated);
    toast.success('Função atualizada.');
  };

  const entries = Object.entries(project.members ?? {}) as [string, ProjectMemberRole][];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text">
          Membros
          <span className="ml-2 text-sm font-normal text-text-2">({entries.length})</span>
        </h3>
        {canManage && available.length > 0 && (
          <Button
            variant="accent"
            onClick={() => setShowAdd((v) => !v)}
            icon={<UserPlus className="h-4 w-4" />}
          >
            Adicionar
          </Button>
        )}
      </div>

      {/* Add member form */}
      {showAdd && (
        <div
          className="rounded-2xl border border-accent/30 bg-accent/5 p-4 mb-4 space-y-3"
        >
          <p className="text-sm font-medium text-text">Novo membro</p>
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <select
                value={newUid}
                onChange={(e) => setNewUid(e.target.value)}
                className="w-full rounded-2xl border border-border/60 bg-bg-2/80 px-4 h-11
                           text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/40
                           appearance-none pr-8 transition-all"
              >
                <option value="">Selecione um usuário</option>
                {available.map((u) => (
                  <option key={u.uid} value={u.uid}>{u.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-text-2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as ProjectMemberRole)}
                className="rounded-2xl border border-border/60 bg-bg-2/80 px-4 h-11
                           text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/40
                           appearance-none pr-8 transition-all"
              >
                <option value="member">Membro</option>
                <option value="manager">Gerente</option>
                <option value="admin">Admin</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-text-2 pointer-events-none" />
            </div>

            <Button
              variant="accent"
              onClick={handleAdd}
              loading={updateMut.isPending}
              disabled={!newUid}
            >
              Confirmar
            </Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Member list */}
      <div className="space-y-2">
        {entries.map(([uid, role]) => {
          const isCreator = uid === project.createdBy;
          return (
            <div
              key={uid}
              className="flex items-center gap-3 rounded-2xl border border-border/20 p-4
                         bg-bg-2/30 hover:border-border/40 transition-all"
            >
              {/* Avatar */}
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center
                           text-sm font-bold shrink-0"
                style={{ backgroundColor: 'rgba(42,190,221,0.15)', color: '#2ABEDD' }}
              >
                {resolveUserName(uid).charAt(0).toUpperCase()}
              </div>

              {/* Name + creator badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text truncate">
                    {resolveUserName(uid)}
                  </p>
                  {isCreator && (
                    <Crown className="h-3.5 w-3.5 text-accent shrink-0" title="Criador" />
                  )}
                  {uid === user?.uid && (
                    <span className="text-[10px] text-text-2">(você)</span>
                  )}
                </div>
                <p className="text-xs text-text-2">{uid}</p>
              </div>

              {/* Role selector / badge */}
              {canManage && !isCreator ? (
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(uid, e.target.value as ProjectMemberRole)}
                    disabled={updateMut.isPending}
                    className="rounded-full border border-border/40 bg-surface/40 pl-3 pr-7 py-1
                               text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent/40
                               appearance-none cursor-pointer transition-all"
                    style={{ color: roleTextColors[role] }}
                  >
                    <option value="member">Membro</option>
                    <option value="manager">Gerente</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1.5 h-3 w-3 text-text-2 pointer-events-none" />
                </div>
              ) : (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: roleColors[role],
                    color: roleTextColors[role],
                  }}
                >
                  {roleLabels[role]}
                </span>
              )}

              {/* Remove button */}
              {canManage && !isCreator && uid !== user?.uid && (
                <button
                  onClick={() => handleRemove(uid)}
                  disabled={updateMut.isPending}
                  className="rounded-full p-1.5 hover:bg-red-500/10 text-text-2 hover:text-red-400
                             transition-colors"
                  title="Remover membro"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-text-2 text-center py-8">Nenhum membro no projeto.</p>
      )}
    </div>
  );
}
