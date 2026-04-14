import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth';
import { ENV } from '@/lib/env';
import { useThemeStore, accentPresets, bgPresets } from '@/lib/theme';
import { Settings, User, Bell, Shield, Palette, ChevronDown, ChevronUp, Check, Rocket } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ClearDataButton from '@/components/ui/ClearDataButton';
import toast from 'react-hot-toast';

/* ── Profile section ── */
function ProfileSection({ defaultOpen }: { defaultOpen?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    try {
      const updated = { ...user, name: name.trim() };

      if (ENV.useFirebase) {
        const { db } = await import('@/lib/firebase');
        const { doc, updateDoc } = await import('firebase/firestore');
        if (db) await updateDoc(doc(db, 'users', user.uid), { displayName: name.trim() });
      } else {
        localStorage.setItem('ff_user', JSON.stringify(updated));
      }

      setUser(updated);
      toast.success('Perfil atualizado!');
    } catch {
      toast.error('Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard
      icon={User}
      label="Perfil"
      desc="Nome, email e avatar"
      open={open}
      onToggle={() => setOpen((v) => !v)}
    >
      <div className="space-y-4 pt-4 border-t border-border/20">
        <Input
          label="Nome de exibição"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-2 uppercase tracking-wider">
            Email
          </label>
          <p className="text-sm text-text-2 px-4 py-2.5 rounded-2xl border border-border/30 bg-bg/50">
            {user?.email}
          </p>
          <p className="text-xs text-text-2 pl-1">O email não pode ser alterado.</p>
        </div>
        <div className="flex justify-end">
          <Button
            variant="accent"
            onClick={handleSave}
            loading={saving}
            disabled={name.trim() === user?.name}
            icon={<Check className="h-4 w-4" />}
          >
            Salvar
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

/* ── Notifications section ── */
function NotificationsSection() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    projectUpdates: true,
    docChanges: true,
    exports: false,
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const items = [
    { key: 'projectUpdates' as const, label: 'Atualizações de projeto', desc: 'Quando um projeto for editado' },
    { key: 'docChanges' as const, label: 'Alterações em documentos', desc: 'Quando um doc for criado ou salvo' },
    { key: 'exports' as const, label: 'Exportações concluídas', desc: 'Quando um PDF/DOCX ficar pronto' },
  ];

  return (
    <SectionCard
      icon={Bell}
      label="Notificações"
      desc="Preferências de alerta"
      open={open}
      onToggle={() => setOpen((v) => !v)}
    >
      <div className="space-y-3 pt-4 border-t border-border/20">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text">{item.label}</p>
              <p className="text-xs text-text-2">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0
                ${prefs[item.key] ? 'bg-accent' : 'bg-surface/60 border border-border/40'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow
                  transition-transform duration-200
                  ${prefs[item.key] ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        ))}
        <p className="text-xs text-text-2 pt-1">
          As preferências são salvas localmente.
        </p>
      </div>
    </SectionCard>
  );
}

/* ── Security section ── */
function SecuritySection() {
  const [open, setOpen] = useState(false);

  return (
    <SectionCard
      icon={Shield}
      label="Segurança"
      desc="Senha e autenticação"
      open={open}
      onToggle={() => setOpen((v) => !v)}
    >
      <div className="pt-4 border-t border-border/20 space-y-3">
        {ENV.useFirebase ? (
          <>
            <p className="text-sm text-text-2">
              Para alterar sua senha, use o link de redefinição enviado ao seu email.
            </p>
            <Button
              variant="ghost"
              onClick={() => toast('Funcionalidade disponível em breve.')}
            >
              Enviar link de redefinição
            </Button>
          </>
        ) : (
          <p className="text-sm text-text-2">
            No modo mock, a autenticação não exige senha real. Ative o Firebase para gerenciar credenciais.
          </p>
        )}
      </div>
    </SectionCard>
  );
}

/* ── Appearance section ── */
function AppearanceSection() {
  const [open, setOpen] = useState(false);
  const { accentId, bgId, setAccent, setBg } = useThemeStore();

  return (
    <SectionCard
      icon={Palette}
      label="Aparência"
      desc="Paleta de cores e fundo"
      open={open}
      onToggle={() => setOpen((v) => !v)}
    >
      <div className="pt-4 border-t border-border/20 space-y-6">

        {/* Accent / palette */}
        <div>
          <p className="text-xs font-medium text-text-2 uppercase tracking-wider mb-3">
            Paleta de cores
          </p>
          <div className="grid grid-cols-5 gap-2">
            {accentPresets.map((p) => {
              const active = accentId === p.id;
              return (
                <button
                  key={p.id}
                  title={p.name}
                  onClick={() => {
                    setAccent(p.id);
                    toast.success(`Paleta ${p.name} aplicada!`);
                  }}
                  className="group flex flex-col items-center gap-2 rounded-2xl p-3 border
                             transition-all duration-200"
                  style={{
                    borderColor: active ? p.accent : 'rgba(68,62,68,0.4)',
                    backgroundColor: active
                      ? `color-mix(in srgb, ${p.accent} 10%, transparent)`
                      : 'rgba(3,45,78,0.3)',
                  }}
                >
                  {/* Two-dot preview: primary + accent */}
                  <div className="flex gap-1.5">
                    <span
                      className="h-5 w-5 rounded-full shadow-sm"
                      style={{ backgroundColor: p.primary }}
                    />
                    <span
                      className="h-5 w-5 rounded-full shadow-sm"
                      style={{ backgroundColor: p.accent }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: active ? p.accent : '#938586' }}
                  >
                    {p.name}
                  </span>
                  {active && (
                    <Check
                      className="h-3 w-3"
                      style={{ color: p.accent }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Background theme */}
        <div>
          <p className="text-xs font-medium text-text-2 uppercase tracking-wider mb-3">
            Tema de fundo
          </p>
          <div className="grid grid-cols-2 gap-2">
            {bgPresets.map((p) => {
              const active = bgId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setBg(p.id);
                    toast.success(`Fundo ${p.name} aplicado!`);
                  }}
                  className="flex items-center gap-3 rounded-2xl p-3 border text-left
                             transition-all duration-200 hover:border-accent/40"
                  style={{
                    borderColor: active ? 'var(--color-accent)' : 'rgba(68,62,68,0.4)',
                    backgroundColor: p.bg,
                  }}
                >
                  {/* Mini preview strip */}
                  <div className="flex gap-1 shrink-0">
                    <span
                      className="h-8 w-3 rounded-l-lg"
                      style={{ backgroundColor: p.bg2 }}
                    />
                    <span
                      className="h-8 w-3 rounded-r-lg"
                      style={{ backgroundColor: p.surface }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: active ? 'var(--color-accent)' : '#D4CCC0' }}
                    >
                      {p.name}
                    </p>
                    <p
                      className="text-[10px] font-mono"
                      style={{ color: '#938586' }}
                    >
                      {p.bg}
                    </p>
                  </div>
                  {active && <Check className="h-4 w-4 text-accent shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-text-2">
          As preferências de aparência são salvas automaticamente.
        </p>
      </div>
    </SectionCard>
  );
}

/* ── Shared accordion card ── */
interface SectionCardProps {
  icon: React.ElementType;
  label: string;
  desc: string;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

function SectionCard({ icon: Icon, label, desc, open, onToggle, children }: SectionCardProps) {
  return (
    <div
      className="rounded-2xl border border-border/30 overflow-hidden transition-all duration-200
                 hover:border-accent/30"
      style={{ backgroundColor: 'rgba(3, 45, 78, 0.3)', backdropFilter: 'blur(8px)' }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div className="h-10 w-10 rounded-xl bg-surface/50 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">{label}</p>
          <p className="text-xs text-text-2">{desc}</p>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-text-2" />
          : <ChevronDown className="h-4 w-4 text-text-2" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

/* ── Page ── */
export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

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
        style={{ backgroundColor: 'rgba(3, 45, 78, 0.5)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center
                          text-xl font-bold text-primary">
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
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

      {/* Sections */}
      <div className="space-y-3">
        <ProfileSection defaultOpen />
        <NotificationsSection />
        <SecuritySection />
        <AppearanceSection />
      </div>

      {/* Zona de Perigo — visível apenas no modo mock */}
      {!ENV.useFirebase && (
        <div
          className="rounded-2xl border border-red-500/30 p-5 space-y-3"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', backdropFilter: 'blur(8px)' }}
        >
          <div>
            <p className="text-sm font-semibold text-red-400">Zona de Perigo</p>
            <p className="text-xs text-text-2 mt-0.5">
              Ações irreversíveis. Use antes de cadastrar os projetos reais.
            </p>
          </div>
          <ClearDataButton />
        </div>
      )}

      {/* Link Checklist de Deploy */}
      <button
        onClick={() => navigate('/settings/completion')}
        className="w-full flex items-center gap-4 rounded-2xl border border-border/30 p-4
                   text-left transition-all duration-200 hover:border-accent/40"
        style={{ backgroundColor: 'rgba(3,45,78,0.3)', backdropFilter: 'blur(8px)' }}
      >
        <div className="h-10 w-10 rounded-xl bg-surface/50 flex items-center justify-center shrink-0">
          <Rocket className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Checklist de Deploy</p>
          <p className="text-xs text-text-2">Passos para colocar o FusiFlow em produção</p>
        </div>
        <ChevronDown className="h-4 w-4 text-text-2 -rotate-90" />
      </button>

      <p className="text-xs text-text-2">
        FusiFlow v1.0 · {ENV.useFirebase ? 'Firebase ativo' : 'Modo mock ativo'}
      </p>
    </div>
  );
}
