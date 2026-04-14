import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { docsApi } from '@/lib/data/api';
import type { Doc } from '@/lib/data/types';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import DocEditor from './DocEditor';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { timeAgo } from '@/lib/time';
import toast from 'react-hot-toast';

interface DocsPanelProps {
  projectId: string;
}

export default function DocsPanel({ projectId }: DocsPanelProps) {
  const qc = useQueryClient();
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  // ID do documento aguardando confirmação de exclusão
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['docs', projectId],
    queryFn: () => docsApi.listDocs(projectId),
  });

  const createMut = useMutation({
    mutationFn: () => docsApi.createDoc({ projectId, title: 'Novo Documento' }),
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ['docs', projectId] });
      qc.invalidateQueries({ queryKey: ['history', projectId] });
      setSelectedDoc(doc);
      toast.success('Documento criado');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (docId: string) => docsApi.removeDoc(projectId, docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['docs', projectId] });
      setSelectedDoc(null);
      toast.success('Documento removido');
    },
  });

  if (selectedDoc) {
    return (
      <DocEditor
        projectId={projectId}
        doc={selectedDoc}
        onBack={() => {
          setSelectedDoc(null);
          qc.invalidateQueries({ queryKey: ['docs', projectId] });
        }}
      />
    );
  }

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text">Documentos</h3>
        <Button
          variant="accent"
          onClick={() => createMut.mutate()}
          loading={createMut.isPending}
          icon={<Plus className="h-4 w-4" />}
        >
          Novo Doc
        </Button>
      </div>

      {docs.length === 0 ? (
        <EmptyState
          title="Nenhum documento"
          description="Crie o primeiro documento para este projeto."
          icon={<FileText className="h-8 w-8 text-text-2" />}
        />
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-2xl bg-bg-2/50
                         border border-border/30 p-4 hover:border-accent/30
                         transition-all duration-150 cursor-pointer group"
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-accent/60" />
                <div>
                  <p className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                    {doc.title}
                  </p>
                  <p className="text-xs text-text-2">
                    Atualizado {timeAgo(doc.updatedAt)} · v{doc.version}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDocToDelete(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity
                           rounded-full p-1.5 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        open={docToDelete !== null}
        onClose={() => setDocToDelete(null)}
        onConfirm={() => docToDelete && deleteMut.mutate(docToDelete)}
        title="Remover documento"
        description="Tem certeza? Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        confirmVariant="danger"
      />
    </div>
  );
}
