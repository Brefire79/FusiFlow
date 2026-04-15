import { NavLink } from 'react-router-dom';
import {
  FolderKanban,
  Settings,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { logout, useAuthStore } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

const links = [
  { to: '/', icon: CheckCircle2, label: 'Dashboard', end: true },
  { to: '/projects', icon: FolderKanban, label: 'Projetos', end: false },
  { to: '/settings', icon: Settings, label: 'Configurações', end: false },
];

interface SidebarProps {
  /** Controla visibilidade no mobile */
  isOpen: boolean;
  /** Fecha a sidebar (usado pelo overlay e pelos NavLinks no mobile) */
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay escuro visível apenas no mobile quando a sidebar está aberta */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-18 bottom-0 w-56 bg-bg-2/50 backdrop-blur-md
                    border-r border-border/20 flex flex-col z-40
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium
                 transition-all duration-150
                 ${isActive
                   ? 'bg-accent/10 text-accent'
                   : 'text-text-2 hover:text-text hover:bg-white/5'}`
              }
            >
              <l.icon className="h-5 w-5" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="px-3 pb-4">
          <div className="rounded-2xl bg-surface/30 border border-border/20 p-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center
                              text-sm font-bold text-primary shrink-0">
                {user?.name?.charAt(0) ?? 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{user?.name ?? 'Usuário'}</p>
                <p className="text-[11px] text-text-2 truncate">{user?.role ?? 'member'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
                aria-label="Sair da conta"
                title="Sair"
              >
                <LogOut className="h-4 w-4 text-text-2" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
