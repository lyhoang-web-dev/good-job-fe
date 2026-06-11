import type { Notification } from '@/lib/types';

import api from './api';

export const notificationsService = {
  getNotifications: async (): Promise<Array<Notification>> => {
    const { data } = await api.get<Array<Notification>>('/notifications');
    return Array.isArray(data) ? data : [];
  },

  markAsRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    await api.patch('/notifications/read-all');
  },
};
