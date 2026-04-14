import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { login, useAuthStore } from '@/lib/auth';
import { ENV } from '@/lib/env';
import Button from '@/components/ui/Button';
import AmbLogo from '@/components/layout/AmbLogo';
import toast from 'react-hot-toast';

export default function Login() {
  const user = useAuthStore((s) => s.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleMockAdminLogin = async () => {
    if (ENV.useFirebase) return;
    setLoading(true);
    try {
      await login('admin@fusiflow.app', 'admin123');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao fazer login mock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: `
          radial-gradient(ellipse at 50% 30%, rgba(20, 85, 150, 0.2) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(208, 125, 95, 0.1) 0%, transparent 50%),
          var(--color-bg)
        `,
      }}
    >
      {/* Stars */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 25% 50%, rgba(255,255,255,0.25), transparent),
            radial-gradient(1.5px 1.5px at 55% 70%, rgba(255,255,255,0.35), transparent),
            radial-gradient(1px 1px at 70% 35%, rgba(255,255,255,0.2), transparent),
            radial-gradient(2px 2px at 90% 10%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 40% 90%, rgba(255,255,255,0.15), transparent)
          `,
        }}
      />

      <div className="relative w-full max-w-md z-10">
        <div
          className="rounded-3xl border border-border/40 p-8"
          style={{
            backgroundColor: 'rgba(3, 45, 78, 0.6)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <AmbLogo size={100} />
            <p className="text-sm text-text-2 mt-4">Gestão de Projetos AMB FUSI AÍ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-text-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                className="w-full rounded-2xl border border-border/60 bg-bg-2/80 px-4 h-11
                           text-sm text-text placeholder:text-text-2
                           focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-text-2 uppercase tracking-wider">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-border/60 bg-bg-2/80 px-4 h-11
                           text-sm text-text placeholder:text-text-2
                           focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              />
            </div>

            <Button variant="accent" type="submit" loading={loading} className="w-full mt-2">
              Entrar
            </Button>

            {!ENV.useFirebase && (
              <Button
                variant="ghost"
                type="button"
                onClick={handleMockAdminLogin}
                disabled={loading}
                className="w-full"
              >
                Entrar como Admin (Mock)
              </Button>
            )}
          </form>

          {!ENV.useFirebase ? (
            <p className="text-xs text-text-2 text-center mt-6">
              Modo mock ativo — qualquer credencial funciona
            </p>
          ) : (
            <p className="text-xs text-text-2 text-center mt-6">
              Use seu email e senha do Firebase Authentication
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
