import { useAuthStore } from '@/lib/auth';
import { Settings, User, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  const sections = [
    { icon: User, label: 'Perfil', desc: 'Nome, email e avatar' },
    { icon: Bell, label: 'Notificações', desc: 'Preferências de alerta' },
    { icon: Shield, label: 'Segurança', desc: 'Senha e autenticação' },
    { icon: Palette, label: 'Aparência', desc: 'Tema e personalização' },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-3">
          <Settings className="h-6 w-6 text-accent" />
          Configurações
        </h1>
        <p className="text-text-2 mt-1">Gerencie suas preferências</p>
      </div>

      {/* User info card */}
      <div
        className="rounded-2xl border border-border/40 p-6"
        style={{
          backgroundColor: 'rgba(3, 45, 78, 0.5)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center
                          text-xl font-bold text-primary">
            {user?.name?.charAt(0) ?? 'U'}
          </div>
          <div>
            <p className="text-lg font-semibold text-text">{user?.name}</p>
            <p className="text-sm text-text-2">{user?.email}</p>
            <span
              className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: 'rgba(42,190,221,0.15)', color: '#2ABEDD' }}
            >
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Setting sections */}
      <div className="space-y-3">
        {sections.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border/30 p-4 flex items-center gap-4
                       cursor-pointer transition-all duration-200 hover:border-accent/30 hover:bg-surface/20"
            style={{
              backgroundColor: 'rgba(3, 45, 78, 0.3)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="h-10 w-10 rounded-xl bg-surface/50 flex items-center justify-center">
              <s.icon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-text">{s.label}</p>
              <p className="text-xs text-text-2">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-2">
        FusiFlow v1.0 · Modo mock ativo
      </p>
    </div>
  );
}
