import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Rocket, ChevronLeft, PartyPopper } from 'lucide-react';

/* ── Types ── */
interface CheckItem {
  id: string;
  label: string;
  desc?: string;
  fixed?: boolean; // já concluído, não editável
}

interface Section {
  id: string;
  title: string;
  items: CheckItem[];
}

/* ── Seções do checklist ── */
const SECTIONS: Section[] = [
  {
    id: 'dev',
    title: 'Desenvolvimento',
    items: [
      { id: 'sprint1', label: 'Sprint 1 — Layout responsivo e UX',              fixed: true },
      { id: 'sprint2', label: 'Sprint 2 — Funcionalidades mock completas',       fixed: true },
      { id: 'sprint3', label: 'Sprint 3 — Firebase rules e scripts',             fixed: true },
      { id: 'sprint4', label: 'Sprint 4 — PWA, atalhos e qualidade',             fixed: true },
      { id: 'sprint5', label: 'Sprint 5 — Features profissionais',               fixed: true },
    ],
  },
  {
    id: 'deploy',
    title: 'Deploy',
    items: [
      { id: 'fb-proj',   label: 'Criar projeto no Firebase Console',            desc: 'console.firebase.google.com' },
      { id: 'fb-auth',   label: 'Ativar Auth (Email/Password)',                  desc: 'Firebase Console → Authentication' },
      { id: 'fb-db',     label: 'Ativar Firestore + Storage',                    desc: 'Regras já configuradas em firestore.rules' },
      { id: 'netlify',   label: 'Configurar variáveis no Netlify',               desc: 'VITE_FIREBASE_* no painel de ambiente' },
      { id: 'functions', label: 'Fazer deploy das Cloud Functions',              desc: 'firebase deploy --only functions' },
      { id: 'icons',     label: 'Executar npm run generate-icons',               desc: 'Gera ícones do PWA' },
      { id: 'seed',      label: 'Executar npm run seed (opcional)',              desc: 'Popula dados de demonstração' },
      { id: 'build',     label: 'Fazer build e deploy no Netlify',               desc: 'npm run build → drag & drop ou git push' },
    ],
  },
  {
    id: 'postdeploy',
    title: 'Pós-deploy',
    items: [
      { id: 'login-real',  label: 'Testar login com conta Firebase real',       desc: 'Verificar email/senha no console' },
      { id: 'clear-data',  label: 'Limpar dados de teste',                      desc: 'Settings → Zona de Perigo → Limpar dados' },
      { id: 'real-projs',  label: 'Cadastrar projetos reais da AMB FUSI AÍ',    desc: 'Projetos + documentos definitivos' },
      { id: 'pwa-mobile',  label: 'Testar PWA instalável no celular',           desc: 'Chrome/Safari → Adicionar à tela inicial' },
      { id: 'pdf-docx',    label: 'Testar exportação PDF/DOCX',                 desc: 'Cloud Functions devem estar ativas' },
    ],
  },
];

/* ── Confetti piece ── */
interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
  spin: number;
}

const CONFETTI_COLORS = ['#D07D5F', '#2ABEDD', '#34d399', '#f59e0b', '#a78bfa', '#f472b6'];

function genConfetti(): ConfettiPiece[] {
  return Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2.5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    spin: Math.random() * 360,
  }));
}

function ConfettiOverlay() {
  const [pieces] = useState<ConfettiPiece[]>(genConfetti);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
            animation: `confettiFall ${2 + Math.random() * 2}s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.spin}deg)`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}

/* ── Storage key ── */
const STORAGE_KEY = 'ff_checklist';

function loadChecked(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

/* ── Page ── */
export default function Completion() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState<Record<string, boolean>>(() => loadChecked());
  const [showConfetti, setShowConfetti] = useState(false);

  /* Calcular progresso — apenas itens não-fixos são checkable */
  const checkableItems = SECTIONS.flatMap((s) => s.items.filter((i) => !i.fixed));
  const fixedItems     = SECTIONS.flatMap((s) => s.items.filter((i) => i.fixed));
  const totalFixed     = fixedItems.length;
  const totalCheckable = checkableItems.length;
  const doneCheckable  = checkableItems.filter((i) => checked[i.id]).length;
  const total          = totalFixed + totalCheckable;
  const done           = totalFixed + doneCheckable;
  const pct            = total === 0 ? 0 : Math.round((done / total) * 100);

  /* Persistir no localStorage */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  /* Disparar confetti quando chega a 100% */
  useEffect(() => {
    if (pct === 100 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [pct, showConfetti]);

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const progressColor =
    pct === 100 ? '#34d399' :
    pct >= 60   ? '#2ABEDD' :
    '#D07D5F';

  return (
    <div className="max-w-2xl space-y-8">
      {showConfetti && <ConfettiOverlay />}

      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-1.5 text-sm text-text-2 hover:text-text mb-4
                     transition-colors duration-150"
        >
          <ChevronLeft className="h-4 w-4" />
          Configurações
        </button>

        <h1 className="text-2xl font-bold text-text flex items-center gap-3">
          <Rocket className="h-6 w-6 text-accent" />
          Checklist de Deploy
        </h1>
        <p className="text-text-2 mt-1">
          Tudo que precisa ser feito para colocar o FusiFlow em produção.
        </p>
      </div>

      {/* Barra de progresso */}
      <div
        className="rounded-2xl border border-border/30 p-5 space-y-3"
        style={{ backgroundColor: 'rgba(3,45,78,0.4)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text">Progresso geral</span>
          <span
            className="text-xl font-bold tabular-nums"
            style={{ color: progressColor }}
          >
            {pct}%
          </span>
        </div>

        <div className="h-3 rounded-full bg-surface/50 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: progressColor }}
          />
        </div>

        <p className="text-xs text-text-2">
          {done} de {total} itens concluídos
        </p>

        {/* Mensagem de conclusão */}
        {pct === 100 && (
          <div
            className="flex items-center gap-3 rounded-xl p-4 border mt-1"
            style={{
              backgroundColor: 'rgba(52,211,153,0.1)',
              borderColor: 'rgba(52,211,153,0.4)',
              animation: 'fadeInUp 0.4s ease forwards',
            }}
          >
            <PartyPopper className="h-5 w-5 shrink-0" style={{ color: '#34d399' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#34d399' }}>
                FusiFlow pronto para produção!
              </p>
              <p className="text-xs text-text-2 mt-0.5">
                Todos os passos foram concluídos. Bom deploy! 🚀
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Seções */}
      {SECTIONS.map((section) => (
        <div key={section.id} className="space-y-2">
          <h2 className="text-xs font-semibold text-text-2 uppercase tracking-widest pl-1">
            {section.title}
          </h2>

          <div
            className="rounded-2xl border border-border/30 overflow-hidden divide-y divide-border/20"
            style={{ backgroundColor: 'rgba(3,45,78,0.3)', backdropFilter: 'blur(8px)' }}
          >
            {section.items.map((item) => {
              const isDone = item.fixed || !!checked[item.id];

              return (
                <button
                  key={item.id}
                  disabled={item.fixed}
                  onClick={() => !item.fixed && toggle(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left
                             transition-colors duration-150
                             disabled:cursor-default
                             hover:enabled:bg-surface/20"
                >
                  {isDone ? (
                    <CheckCircle2
                      className="h-5 w-5 shrink-0"
                      style={{ color: item.fixed ? '#34d399' : '#2ABEDD' }}
                    />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-text-2/40" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: isDone ? (item.fixed ? '#34d399' : '#2ABEDD') : 'var(--color-text)',
                        textDecoration: isDone && !item.fixed ? 'line-through' : 'none',
                        opacity: isDone && !item.fixed ? 0.6 : 1,
                      }}
                    >
                      {item.label}
                    </p>
                    {item.desc && (
                      <p className="text-xs text-text-2 mt-0.5 truncate">{item.desc}</p>
                    )}
                  </div>

                  {item.fixed && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: 'rgba(52,211,153,0.15)', color: '#34d399' }}
                    >
                      Concluído
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-xs text-text-2 pb-4">
        O progresso é salvo automaticamente no navegador.
      </p>
    </div>
  );
}
