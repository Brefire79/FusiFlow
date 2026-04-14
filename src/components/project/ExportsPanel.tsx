import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exportsApi, projectsApi, docsApi } from '@/lib/data/api';
import type { ExportFormat } from '@/lib/data/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { ENV } from '@/lib/env';
import { formatDate, nowISO } from '@/lib/time';
import { Download, FileJson, FileText, FileType, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExportsPanelProps {
  projectId: string;
}

const formatIcons: Record<string, typeof FileJson> = {
  json: FileJson,
  pdf: FileType,
  docx: FileText,
};

export default function ExportsPanel({ projectId }: ExportsPanelProps) {
  const qc = useQueryClient();
  const requiresFunctions = !ENV.useFirebase;
  const [linkLoading, setLinkLoading] = useState(false);

  async function handleShareLink() {
    setLinkLoading(true);
    try {
      const [project, docs] = await Promise.all([
        projectsApi.getProject(projectId),
        docsApi.listDocs(projectId),
      ]);
      const bundle = { project, docs, exportedAt: nowISO() };
      const json = JSON.stringify(bundle);
      const b64 = btoa(unescape(encodeURIComponent(json)));
      const url = `${window.location.origin}/view?data=${b64}`;
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado! Válido apenas neste dispositivo.');
    } catch {
      toast.error('Não foi possível gerar o link.');
    } finally {
      setLinkLoading(false);
    }
  }

  const { data: exports = [], isLoading } = useQuery({
    queryKey: ['exports', projectId],
    queryFn: () => exportsApi.listExports(projectId),
  });

  const exportMut = useMutation({
    mutationFn: (format: ExportFormat) => exportsApi.exportProject(projectId, format),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exports', projectId] });
      qc.invalidateQueries({ queryKey: ['history', projectId] });
      toast.success('Exportação gerada!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text">Exportações</h3>
        <div className="flex gap-2">
          <Button
            variant="accent"
            onClick={() => exportMut.mutate('json')}
            loading={exportMut.isPending}
            icon={<FileJson className="h-4 w-4" />}
          >
            JSON
          </Button>
          <Button
            variant="ghost"
            onClick={() => exportMut.mutate('pdf')}
            disabled={requiresFunctions}
            icon={<FileType className="h-4 w-4" />}
          >
            PDF
          </Button>
          <Button
            variant="ghost"
            onClick={() => exportMut.mutate('docx')}
            disabled={requiresFunctions}
            icon={<FileText className="h-4 w-4" />}
          >
            DOCX
          </Button>
        </div>
      </div>

      {requiresFunctions && (
        <p className="text-xs text-text-2 mb-4">
          PDF/DOCX requer Firebase Functions. Ative VITE_USE_FIREBASE=true para habilitar.
        </p>
      )}

      {isLoading ? (
        <Spinner />
      ) : exports.length === 0 ? (
        <EmptyState
          title="Nenhuma exportação"
          description="Exporte o projeto para JSON, PDF ou DOCX."
          icon={<Download className="h-8 w-8 text-text-2" />}
        />
      ) : (
        <div className="space-y-2">
          {exports.map((exp) => {
            const Icon = formatIcons[exp.format] ?? FileJson;
            return (
              <div
                key={exp.id}
                className="flex items-center justify-between rounded-2xl bg-bg-2/40
                           border border-border/20 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-accent/10 p-2">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text uppercase">{exp.format}</p>
                    <p className="text-xs text-text-2">
                      {exp.authorName} · {formatDate(exp.createdAt)}
                    </p>
                  </div>
                </div>
                {exp.downloadUrl && (
                  <a
                    href={exp.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-accent bg-transparent hover:bg-white/5 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Baixar
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Link de visualização */}
      <div className="mt-8 pt-6 border-t border-border/20">
        <h4 className="text-sm font-semibold text-text mb-1">Link de visualização</h4>
        <p className="text-xs text-text-2 mb-3">
          Gera um link somente-leitura com os dados atuais. Válido apenas neste dispositivo (localStorage).
        </p>
        <Button
          variant="ghost"
          onClick={handleShareLink}
          loading={linkLoading}
          icon={<Link2 className="h-4 w-4" />}
        >
          Gerar e copiar link
        </Button>
      </div>
    </div>
  );
}
