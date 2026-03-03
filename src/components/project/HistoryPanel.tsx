import { useQuery } from '@tanstack/react-query';
import { historyApi } from '@/lib/data/api';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/time';
import {
  History,
  PlusCircle,
  Edit3,
  Lock,
  Unlock,
  Download,
  FileText,
} from 'lucide-react';

interface HistoryPanelProps {
  projectId: string;
}

const iconMap: Record<string, typeof History> = {
  project_created: PlusCircle,
  project_updated: Edit3,
  doc_created: FileText,
  doc_updated: FileText,
  export: Download,
  lock_acquired: Lock,
  lock_released: Unlock,
};

export default function HistoryPanel({ projectId }: HistoryPanelProps) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['history', projectId],
    queryFn: () => historyApi.listHistory(projectId),
  });

  if (isLoading) return <Spinner />;

  if (events.length === 0) {
    return (
      <EmptyState
        title="Sem eventos"
        description="O histórico de alterações aparecerá aqui."
        icon={<History className="h-8 w-8 text-text-2" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {events.map((ev) => {
        const Icon = iconMap[ev.type] ?? History;
        return (
          <div
            key={ev.id}
            className="flex items-start gap-3 rounded-2xl bg-bg-2/40 border border-border/20 p-4"
          >
            <div className="mt-0.5 rounded-full bg-accent/10 p-2">
              <Icon className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text">{ev.changesSummary}</p>
              <p className="text-xs text-text-2 mt-1">
                {ev.actorName} · {formatDate(ev.at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
