/* ── Data Types ── */

export type Role = 'admin' | 'member';
export type ProjectMemberRole = 'admin' | 'manager' | 'member';
export type ProjectMembersMap = Record<string, ProjectMemberRole>;
export type ProjectStatus = 'backlog' | 'andamento' | 'revisao' | 'concluido';
export type Phase = 'planejamento' | 'execução' | 'entrega';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface Lock {
  byUid: string;
  byName: string;
  until: string; // ISO
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  phase: Phase;
  tags: string[];
  members: ProjectMembersMap;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  version: number;
  lock: Lock | null;
}

export interface Doc {
  id: string;
  projectId: string;
  type: string;
  title: string;
  content: string;
  updatedBy: string;
  updatedAt: string;
  version: number;
}

export type HistoryEventType =
  | 'project_created'
  | 'project_updated'
  | 'doc_created'
  | 'doc_updated'
  | 'export'
  | 'lock_acquired'
  | 'lock_released';

export interface HistoryEvent {
  id: string;
  projectId: string;
  type: HistoryEventType;
  actorUid: string;
  actorName: string;
  at: string;
  target: string;
  targetId: string;
  changesSummary: string;
}

export type ExportFormat = 'json' | 'pdf' | 'docx';

export interface ExportRecord {
  id: string;
  projectId: string;
  format: ExportFormat;
  authorUid: string;
  authorName: string;
  createdAt: string;
  downloadUrl: string | null;
  filePath: string | null;
}

/* ── Notifications ── */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  /** Texto relativo de tempo (ex: "há 5 min") ou ISO string */
  at: string;
  read: boolean;
}
