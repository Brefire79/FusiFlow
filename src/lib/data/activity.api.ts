/* ── Activity API — atividade por dia dos últimos 7 dias ── */
import type { HistoryEvent } from './types';
import { ENV } from '../env';
import * as mock from './mockDb';

export interface DayActivity {
  day: string;    // Ex: "Seg"
  date: string;   // ISO date string (YYYY-MM-DD)
  project: number;
  doc: number;
  export: number;
  total: number;
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function dateKey(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

export async function getWeekActivity(): Promise<DayActivity[]> {
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  // Gera os 7 dias (hoje incluso) mais antigos → mais novos
  const days: DayActivity[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return {
      day: DAY_LABELS[d.getDay()],
      date: dateKey(d.toISOString()),
      project: 0,
      doc: 0,
      export: 0,
      total: 0,
    };
  });

  const dayMap = new Map(days.map((d) => [d.date, d]));

  let events: HistoryEvent[] = [];

  if (!ENV.useFirebase) {
    events = mock.getAllHistory();
  } else {
    // Firebase: collectionGroup query (requer índice composto)
    const { db } = await import('../firebase');
    const fs = await import('firebase/firestore');
    const snap = await fs.getDocs(
      fs.query(
        fs.collectionGroup(db!, 'history'),
        fs.where('at', '>=', sevenDaysAgo.toISOString()),
        fs.orderBy('at', 'desc'),
      ),
    );
    events = snap.docs.map((d) => d.data() as HistoryEvent);
  }

  // Classifica cada evento no dia e tipo correto
  for (const ev of events) {
    const key = dateKey(ev.at);
    const day = dayMap.get(key);
    if (!day) continue;

    if (ev.type === 'project_created' || ev.type === 'project_updated') {
      day.project++;
    } else if (ev.type === 'doc_created' || ev.type === 'doc_updated') {
      day.doc++;
    } else if (ev.type === 'export') {
      day.export++;
    }
    day.total++;
  }

  return days;
}
