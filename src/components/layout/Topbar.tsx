import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, LayoutDashboard, FolderKanban, Settings } from 'lucide-react';
import AmbLogo from './AmbLogo';
import { useState } from 'react';

const tabs = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projetos', icon: FolderKanban, end: false },
  { to: '/settings', label: 'Configurações', icon: Settings, end: false },
];

export default function Topbar({ onNewProject }: { onNewProject?: () => void }) {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-[72px] flex items-center px-5 gap-4
                        bg-bg-2/70 backdrop-blur-xl border-b border-border/20">
      {/* Search icon */}
      <button
        onClick={() => setSearchOpen(!searchOpen)}
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
        {/* Notification bell */}
        <button className="relative rounded-full p-2.5 border border-border/40 bg-surface/40
                           hover:bg-white/5 transition-colors text-text-2 hover:text-text">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>

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
          Novo Projeto
        </button>
      </div>

      {/* Search overlay (expandable) */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 p-4 bg-bg-2/95 backdrop-blur-xl border-b border-border/20">
          <input
            autoFocus
            type="text"
            placeholder="Buscar projetos, documentos..."
            className="w-full max-w-xl mx-auto block rounded-2xl border border-border/60 bg-bg/80
                       px-4 h-11 text-sm text-text placeholder:text-text-2
                       focus:outline-none focus:ring-2 focus:ring-accent/40"
            onBlur={() => setSearchOpen(false)}
          />
        </div>
      )}
    </header>
  );
}
