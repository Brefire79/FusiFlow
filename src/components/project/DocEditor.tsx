import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Doc } from '@/lib/data/types';
import { docsApi, locksApi, historyApi } from '@/lib/data/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LockBanner from './LockBanner';
import { ArrowLeft, Save, Eye, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { isLockActive, RENEW_MS } from '@/lib/data/locks.api';
import { useAuthStore } from '@/lib/auth';

interface DocEditorProps {
  projectId: string;
  doc: Doc;
  onBack: () => void;
}

export default function DocEditor({ projectId, doc, onBack }: DocEditorProps) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [preview, setPreview] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockInfo, setLockInfo] = useState<{ byName: string; until: string } | null>(null);
  const [version, setVersion] = useState(doc.version);
  const renewRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-text-2 hover:text-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos docs
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setPreview(!preview)}
            icon={preview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          >
            {preview ? 'Editar' : 'Preview'}
          </Button>
          {!locked && (
            <Button
              variant="accent"
              onClick={() => saveMut.mutate()}
              loading={saveMut.isPending}
              icon={<Save className="h-4 w-4" />}
            >
              Salvar
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
        className="text-lg font-semibold"
      />

      {preview ? (
        <div className="rounded-3xl border border-border/50 bg-surface/60 backdrop-blur-md shadow-card p-6 prose-fusi min-h-[400px]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          className="w-full rounded-2xl border border-border/60 bg-bg-2/80 px-4 py-3 text-sm text-text placeholder:text-text-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all min-h-[400px] font-mono"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={locked}
          placeholder="Escreva em Markdown..."
        />
      )}
    </div>
  );
}
