import type { User } from '@/lib/types';

import api, { API_BASE_URL } from './api';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const { data } = await api.post<User>('/auth/login', { email, password });
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  loginWithGoogle(): void {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },
};
