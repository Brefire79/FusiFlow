import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { ENV } from '@/lib/env';

export default function ConnectionStatus() {
  // Só exibe em modo Firebase real
  if (!ENV.useFirebase) return null;

  return <ConnectionStatusInner />;
}

function ConnectionStatusInner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [visible, setVisible] = useState(!navigator.onLine);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const handleOnline = () => {
      setOffline(false);
      // Banner some após 2 segundos ao reconectar
      hideTimer = setTimeout(() => setVisible(false), 2000);
      toast.success('Conexão restaurada!');
    };

    const handleOffline = () => {
      setOffline(true);
      setVisible(true);
      if (hideTimer) clearTimeout(hideTimer);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center
                 px-4 py-3 border-t"
      style={{
        backgroundColor: '#1a0505',
        borderColor: 'rgba(239, 68, 68, 0.4)',
        animation: offline ? 'slideUp 250ms ease-out' : 'slideDown 250ms ease-out',
      }}
    >
      <WifiOff className="h-4 w-4 text-red-400 shrink-0 mr-2" />
      <p className="text-sm text-red-300">
        {offline
          ? 'Você está offline. As alterações serão salvas quando a conexão for restaurada.'
          : 'Conexão restaurada!'}
      </p>
    </div>
  );
}
