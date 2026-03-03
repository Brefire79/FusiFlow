import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
      <p className="text-lg text-text mb-2">Página não encontrada</p>
      <p className="text-sm text-text-2 mb-8">
        A página que você procura não existe ou foi movida.
      </p>
      <Button variant="accent" onClick={() => navigate('/')} icon={<ArrowLeft className="h-4 w-4" />}>
        Voltar ao Dashboard
      </Button>
    </div>
  );
}
