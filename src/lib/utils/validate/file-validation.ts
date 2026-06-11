import { MEDIA_CONSTRAINTS } from '@/lib/constants/media';

export interface ValidationResult {
  error?: string;
  ok: boolean;
}

const allowedTypes = MEDIA_CONSTRAINTS.ALLOWED_TYPES as ReadonlyArray<string>;

export function validateFileType(file: File): ValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return {
      ok: false,
      error:
        'Only images (JPEG, PNG, GIF) and videos (MP4, MOV, WebM) are allowed.',
    };
  }
  if (!MEDIA_CONSTRAINTS.ALLOWED_EXTENSIONS.test(file.name)) {
    return { ok: false, error: 'Invalid file extension.' };
  }
  return { ok: true };
}

export function validateFileSize(file: File): ValidationResult {
  if (file.size > MEDIA_CONSTRAINTS.MAX_FILE_SIZE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return {
      ok: false,
      error: `File is ${mb}MB — max ${String(MEDIA_CONSTRAINTS.MAX_FILE_SIZE_MB)}MB.`,
    };
  }
  return { ok: true };
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => URL.revokeObjectURL(objectUrl);
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Video metadata load timed out'));
    }, 10_000);

    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      cleanup();
      resolve(video.duration);
    };
    video.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error('Could not read video metadata'));
    };
    video.src = objectUrl;
  });
}

export async function validateVideoDuration(
  file: File
): Promise<ValidationResult & { duration?: number }> {
  try {
    const duration = await getVideoDuration(file);
    if (duration > MEDIA_CONSTRAINTS.MAX_VIDEO_DURATION_SECS) {
      const mins = Math.floor(duration / 60);
      const secs = Math.round(duration % 60);
      return {
        ok: false,
        error: `Video is ${String(mins)}:${String(secs).padStart(2, '0')} — max 3 minutes.`,
      };
    }
    return { ok: true, duration };
  } catch {
    return { ok: true };
  }
}

export async function validateFile(
  file: File
): Promise<ValidationResult & { duration?: number }> {
  const typeResult = validateFileType(file);
  if (!typeResult.ok) {
    return typeResult;
  }
  const sizeResult = validateFileSize(file);
  if (!sizeResult.ok) {
    return sizeResult;
  }
  if (file.type.startsWith('video/')) {
    const durationResult = await validateVideoDuration(file);
    if (!durationResult.ok) {
      return durationResult;
    }
    return { ok: true, duration: durationResult.duration };
  }
  return { ok: true };
}
