export const MEDIA_CONSTRAINTS = {
  MAX_FILE_SIZE_MB: 100,
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024,
  MAX_VIDEO_DURATION_SECS: 180,
  MAX_FILES: 3,
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/webm',
  ],
  ALLOWED_EXTENSIONS: /\.(jpg|jpeg|png|gif|mp4|mov|webm)$/i,
} as const;

export const UPLOAD_STATE = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
} as const;

export type MediaUploadState = (typeof UPLOAD_STATE)[keyof typeof UPLOAD_STATE];
