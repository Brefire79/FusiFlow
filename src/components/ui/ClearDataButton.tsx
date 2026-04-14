import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { ENV } from '@/lib/env';
import Button from './Button';
import ConfirmModal from './ConfirmModal';

/**
 * Botão de limpeza de dados de teste.
 * Visível APENAS em modo mock (ENV.useFirebase === false).
 *
 * Remove todas as chaves 'ff_*' do localStorage, limpa o cache do TanStack Query
 * e redireciona para a home com toast de confirmação.
 */
export default function ClearDataButton() {
  // Não render nada no modo Firebase real
  if (ENV.useFirebase) return null;

  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleClear = () => {
    // Remover todas as chaves com prefixo 'ff_'
    const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith('ff_'));
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // Limpar cache do TanStack Query para forçar re-fetch após re-seed
    qc.clear();

    toast.success('Dados de teste removidos. Cadastre seus projetos reais!', {
      duration: 5000,
    });

    navigate('/');
    // Recarregar para acionar o seed limpo
    window.location.reload();
  };

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Limpar dados de teste
      </Button>

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleClear}
        title="Limpar todos os dados de teste?"
        description="Isso apagará todos os projetos, documentos e histórico do localStorage. Use antes de cadastrar os projetos reais da AMB FUSI AÍ."
        confirmLabel="Sim, limpar tudo"
        confirmVariant="danger"
      />
    </>
  );
}
