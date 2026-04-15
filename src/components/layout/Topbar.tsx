import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, LayoutDashboard, FolderKanban, Settings, Menu } from 'lucide-react';
import AmbLogo from './AmbLogo';
import { useState } from 'react';
import { useNotificationsStore } from '@/lib/notificationsStore';
import SearchOverlay from './SearchOverlay';

const tabs = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projetos', icon: FolderKanban, end: false },
  { to: '/settings', label: 'Configurações', icon: Settings, end: false },
];

interface TopbarProps {
  onNewProject?: () => void;
  /** Abre/fecha a sidebar no mobile */
  onToggleSidebar?: () => void;
  /** Controla a busca global (gerenciado pelo AppShell) */
  searchOpen?: boolean;
  onOpenSearch?: () => void;
  onCloseSearch?: () => void;
}

export default function Topbar({ onNewProject, onToggleSidebar, searchOpen = false, onOpenSearch, onCloseSearch }: TopbarProps) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  const { notifications, markAllRead } = useNotificationsStore();
  const latestFive = notifications.slice(0, 5);
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <header className="sticky top-0 z-50 h-18 flex items-center px-5 gap-4
                        bg-bg-2/70 backdrop-blur-xl border-b border-border/20">
      {/* Hamburguer — visível apenas no mobile */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden rounded-full p-2 hover:bg-white/5 transition-colors text-text-2 hover:text-text"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search icon */}
      <button
        onClick={onOpenSearch}
        title="Buscar (Ctrl+K)"
        className="rounded-full p-2 hover:bg-white/5 transition-colors text-text-2 hover:text-text"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Logo */}
      <div className="cursor-pointer" onClick={() => navigate('/')}>
        <AmbLogo size={56} />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Tab Navigation */}
      <nav className="hidden md:flex items-center gap-1 bg-bg-2/60 rounded-full p-1 border border-border/30">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
               ${isActive
                 ? 'bg-surface/80 text-text border border-border/50 shadow-sm'
                 : 'text-text-2 hover:text-text'}`
            }
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell com dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-full p-2.5 border border-border/40 bg-surface/40
                       hover:bg-white/5 transition-colors text-text-2 hover:text-text"
            aria-label="Notificações"
          >
            <Bell className="h-4.5 w-4.5" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
            )}
          </button>

          {/* Overlay para fechar ao clicar fora */}
          {notifOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setNotifOpen(false)}
            />
          )}

          {/* Dropdown de notificações */}
          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border/40
                         bg-surface/95 backdrop-blur-xl shadow-card z-50 overflow-hidden"
              style={{ animation: 'fadeInUp 150ms ease-out' }}
            >
              {/* Cabeçalho */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                <p className="text-sm font-semibold text-text">Notificações</p>
                {hasUnread && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-accent hover:underline transition-colors"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              {/* Lista */}
              {latestFive.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-text-2">Nenhuma notificação</p>
                </div>
              ) : (
                <ul>
                  {latestFive.map((n) => (
                    <li
                      key={n.id}
                      className={`px-4 py-3 border-b border-border/10 last:border-0 transition-colors
                        ${!n.read ? 'bg-accent/5' : 'hover:bg-white/3'}`}
                    >
                      <p className={`text-sm leading-snug ${!n.read ? 'text-text font-medium' : 'text-text-2'}`}>
                        {n.message}
                      </p>
                      <p className="text-[11px] text-text-2 mt-0.5">{n.at}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Novo Projeto button */}
        <button
          onClick={onNewProject}
          className="flex items-center gap-2 rounded-full px-5 h-10 text-sm font-semibold text-white
                     transition-all duration-200 active:scale-[0.97]
                     hover:opacity-90 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #D07D5F 0%, #DF8C69 100%)',
            boxShadow: '0 4px 20px rgba(208, 125, 95, 0.3)',
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Projeto</span>
        </button>
      </div>

      {/* Search overlay */}
      <SearchOverlay open={searchOpen} onClose={onCloseSearch ?? (() => {})} />
    </header>
  );
}
