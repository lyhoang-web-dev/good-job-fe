import type { GivingBudget, User } from '@/lib/types';

import api from './api';

export const usersService = {
  getUsers: async (search?: string) => {
    const { data } = await api.get<Array<User>>('/users', {
      params: { search },
    });
    return data;
  },

  getUser: async (id: string) => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  getGivingBudget: async () => {
    const { data } = await api.get<GivingBudget>('/users/me/giving-budget');
    return data;
  },
};
