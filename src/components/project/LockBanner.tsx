import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

interface LockBannerProps {
  name: string;
  until: string;
  onRetry: () => void;
}

export default function LockBanner({ name, until, onRetry }: LockBannerProps) {
  const untilTime = new Date(until).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 px-5 py-3">
      <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />
      <p className="text-sm text-yellow-300 flex-1">
        <strong>Aguarde:</strong> {name} está editando até {untilTime}
      </p>
      <Button variant="ghost" onClick={onRetry} icon={<RefreshCw className="h-4 w-4" />}>
        Tentar novamente
      </Button>
    </div>
  );
}
