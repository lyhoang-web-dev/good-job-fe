import type { KudoMedia } from '@/lib/types';

import api from './api';

export const mediaService = {
  async uploadFile(
    kudoId: string,
    file: File,
    onProgress: (pct: number) => void
  ): Promise<KudoMedia> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<KudoMedia>(`/kudos/${kudoId}/media`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    });
    return data;
  },
};
