import { create } from 'zustand';
import type { Notification } from './data/types';

// Notificações de exemplo para demonstração em modo mock
const initialNotifications: Notification[] = [
  {
    id: '1',
    message: 'Projeto "Landing Page" foi atualizado.',
    type: 'info',
    at: 'há 2 minutos',
    read: false,
  },
  {
    id: '2',
    message: 'Exportação PDF concluída com sucesso.',
    type: 'success',
    at: 'há 15 minutos',
    read: false,
  },
  {
    id: '3',
    message: 'Novo membro adicionado ao projeto "App Mobile".',
    type: 'info',
    at: 'há 1 hora',
    read: true,
  },
];

interface NotificationsState {
  notifications: Notification[];
  /** Marca uma notificação específica como lida */
  markRead: (id: string) => void;
  /** Marca todas as notificações como lidas */
  markAllRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: initialNotifications,
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}));
