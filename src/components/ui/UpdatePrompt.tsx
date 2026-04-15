import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function UpdatePrompt() {
  const [dismissed, setDismissed] = useState(false);

  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      // Verifica atualizações a cada 60s
      if (r) setInterval(() => r.update(), 60_000);
    },
  });

  if (!needRefresh || dismissed) return null;

  const handleUpdate = async () => {
    await updateServiceWorker(true);
    toast.success('App atualizado com sucesso! ✨');
    window.location.reload();
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-200 flex items-center justify-between gap-3 px-4 py-3
                 text-white shadow-xl"
      style={{
        background: 'linear-gradient(135deg, #D07D5F 0%, #2ABEDD 100%)',
        animation: 'slideDown 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}
    >
      <div className="flex items-center gap-3">
        <RefreshCw className="h-4 w-4 shrink-0 animate-spin" style={{ animationDuration: '2s' }} />
        <div>
          <p className="text-sm font-semibold leading-tight">🎉 Nova versão disponível!</p>
          <p className="text-xs opacity-80 leading-tight">Atualize para ver as últimas melhorias.</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleUpdate}
          className="rounded-full bg-white/20 hover:bg-white/30 transition-colors
                     px-3 py-1.5 text-xs font-semibold"
        >
          Atualizar agora
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Fechar aviso de atualização"
          className="rounded-full p-1.5 hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
