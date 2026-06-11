import type { MediaUploadState } from '@/lib/constants/media';

export interface MediaFile {
  duration?: number;
  error?: string;
  file: File;
  id: string;
  mediaId?: string;
  previewUrl: string;
  progress: number;
  state: MediaUploadState;
  type: 'image' | 'video';
}
