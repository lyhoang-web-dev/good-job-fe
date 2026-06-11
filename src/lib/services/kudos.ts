import type {
  Comment,
  Kudo,
  PaginatedResponse,
  SendKudoPayload,
} from '@/lib/types';

import api from './api';

export type { SendKudoPayload } from '@/lib/types';

export const kudosService = {
  getKudos: async (cursor?: string) => {
    const { data } = await api.get<PaginatedResponse<Kudo>>('/kudos', {
      params: { cursor, limit: 20 },
    });
    return data;
  },

  getKudosForUser: async (userId: string, direction: 'received' | 'sent') => {
    const { data } = await api.get<Array<Kudo>>(`/users/${userId}/kudos`, {
      params: { direction },
    });
    return data;
  },

  sendKudo: async (payload: SendKudoPayload) => {
    const { data } = await api.post<Kudo>('/kudos', payload);
    return data;
  },

  reactToKudo: async (kudoId: string, emoji: string) => {
    await api.post(`/kudos/${kudoId}/reactions`, { emoji });
  },

  unreactKudo: async (kudoId: string, emoji: string) => {
    await api.delete(`/kudos/${kudoId}/reactions/${encodeURIComponent(emoji)}`);
  },

  getComments: async (kudoId: string) => {
    const { data } = await api.get<Array<Comment>>(`/kudos/${kudoId}/comments`);
    return data;
  },

  addComment: async (kudoId: string, content: string) => {
    const { data } = await api.post<Comment>(`/kudos/${kudoId}/comments`, {
      content,
    });
    return data;
  },
};
