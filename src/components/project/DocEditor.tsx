import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Doc } from '@/lib/data/types';
import { docsApi, locksApi } from '@/lib/data/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LockBanner from './LockBanner';
import { ArrowLeft, Save, Eye, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { RENEW_MS } from '@/lib/data/locks.api';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface DocEditorProps {
  projectId: string;
  doc: Doc;
  onBack: () => void;
}

export default function DocEditor({ projectId, doc, onBack }: DocEditorProps) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [preview, setPreview] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockInfo, setLockInfo] = useState<{ byName: string; until: string } | null>(null);
  const [version, setVersion] = useState(doc.version);
  const renewRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const isDirty = title !== doc.title || content !== doc.content;

  // Acquire lock on mount
  useEffect(() => {
    let mounted = true;

    async function acquire() {
      try {
        const res = await locksApi.acquireLock(projectId);
        if (!mounted) return;
        if (!res.ok && res.lock) {
          setLocked(true);
          setLockInfo({ byName: res.lock.byName, until: res.lock.until });
        } else {
          setLocked(false);
          // Renew
          renewRef.current = setInterval(async () => {
            await locksApi.renewLock(projectId);
          }, RENEW_MS);
        }
      } catch {
        // ignore
      }
    }
    acquire();

    return () => {
      mounted = false;
      if (renewRef.current) clearInterval(renewRef.current);
      locksApi.releaseLock(projectId).catch(() => {});
    };
  }, [projectId]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const updated = await docsApi.updateDoc(projectId, doc.id, { title, content }, version);
      return updated;
    },
    onSuccess: (updated) => {
      setVersion(updated.version);
      qc.invalidateQueries({ queryKey: ['docs', projectId] });
      qc.invalidateQueries({ queryKey: ['history', projectId] });
      toast.success('Salvo!');
      // reset dirty baseline to saved values
      doc.title = updated.title;
      doc.content = updated.content;
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const retryLock = async () => {
    const res = await locksApi.acquireLock(projectId);
    if (res.ok) {
      setLocked(false);
      setLockInfo(null);
      renewRef.current = setInterval(async () => {
        await locksApi.renewLock(projectId);
      }, RENEW_MS);
      toast.success('Lock adquirido!');
    } else {
      toast.error('Ainda bloqueado');
    }
  };

  // Warn before browser unload when there are unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Keyboard shortcuts: Ctrl+S → save, Ctrl+P → toggle preview, Esc → back
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 's') {
        e.preventDefault();
        if (!locked && !saveMut.isPending) saveMut.mutate();
      } else if (ctrl && e.key === 'p') {
        e.preventDefault();
        setPreview(p => !p);
      } else if (e.key === 'Escape') {
        if (isDirty) setShowExitConfirm(true);
        else onBack();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, saveMut.isPending, saveMut.mutate, isDirty, onBack]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => { if (isDirty) setShowExitConfirm(true); else onBack(); }}
          title="Voltar (Esc)"
          className="flex items-center gap-1.5 text-sm text-text-2 hover:text-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos docs
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setPreview(!preview)}
            title={preview ? 'Editar (Ctrl+P)' : 'Preview (Ctrl+P)'}
            icon={preview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          >
            {preview ? 'Editar' : 'Preview'}
          </Button>
          {!locked && (
            <Button
              variant="accent"
              onClick={() => saveMut.mutate()}
              loading={saveMut.isPending}
              title="Salvar (Ctrl+S)"
              icon={<Save className="h-4 w-4" />}
            >
              {isDirty ? 'Salvar\u00a0*' : 'Salvar'}
            </Button>
          )}
        </div>
      </div>

      {locked && lockInfo && (
        <LockBanner name={lockInfo.byName} until={lockInfo.until} onRetry={retryLock} />
      )}

      <Input
        placeholder="Título do documento"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        disabled={locked}
        className={`text-lg font-semibold${isDirty ? ' ring-1 ring-orange-400/50' : ''}`}
      />

      {preview ? (
        <div className="rounded-3xl border border-border/50 bg-surface/60 backdrop-blur-md shadow-card p-6 prose-fusi min-h-100">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          className="w-full rounded-2xl border border-border/60 bg-bg-2/80 px-4 py-3 text-sm text-text placeholder:text-text-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all min-h-100 font-mono"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={locked}
          placeholder="Escreva em Markdown..."
        />
      )}

      <ConfirmModal
        open={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={() => { setShowExitConfirm(false); onBack(); }}
        title="Sair sem salvar?"
        description="Você tem alterações não salvas. Se sair agora, elas serão perdidas."
        confirmLabel="Sair sem salvar"
        confirmVariant="danger"
      />
    </div>
  );
}
