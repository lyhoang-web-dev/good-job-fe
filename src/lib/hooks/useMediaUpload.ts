import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { toaster } from '@/lib/components/ui/toaster';
import { MEDIA_CONSTRAINTS, UPLOAD_STATE } from '@/lib/constants/media';
import { mediaService } from '@/lib/services/media';
import { getErrorMessage } from '@/lib/types/api';
import type { MediaFile } from '@/lib/types/media';
import { validateFile } from '@/lib/utils/validate/file-validation';

export function useMediaUpload() {
  const [files, setFiles] = useState<Array<MediaFile>>([]);
  const filesRef = useRef<Array<MediaFile>>([]);
  const addingRef = useRef(false);

  useEffect(() => {
    function onReady(e: Event) {
      const { mediaId } = (e as CustomEvent<{ mediaId: string }>).detail ?? {};
      if (!mediaId) {
        return;
      }
      setFiles((prev) => {
        const next = prev.map((f) =>
          f.mediaId === mediaId ? { ...f, state: UPLOAD_STATE.READY } : f
        );
        filesRef.current = next;
        return next;
      });
    }

    function onFailed(e: Event) {
      const { mediaId, reason } =
        (e as CustomEvent<{ mediaId: string; reason?: string }>).detail ?? {};
      if (!mediaId) {
        return;
      }
      setFiles((prev) => {
        const next = prev.map((f) =>
          f.mediaId === mediaId
            ? {
                ...f,
                state: UPLOAD_STATE.FAILED,
                error: reason ?? 'Processing failed',
              }
            : f
        );
        filesRef.current = next;
        return next;
      });
    }

    window.addEventListener('gj-media-ready', onReady);
    window.addEventListener('gj-media-failed', onFailed);
    return () => {
      window.removeEventListener('gj-media-ready', onReady);
      window.removeEventListener('gj-media-failed', onFailed);
    };
  }, []);

  const updateFile = useCallback(
    (localId: string, patch: Partial<MediaFile>) => {
      setFiles((prev) => {
        const next = prev.map((f) =>
          f.id === localId ? { ...f, ...patch } : f
        );
        filesRef.current = next;
        return next;
      });
    },
    []
  );

  const addFiles = useCallback(async (incoming: FileList | Array<File>) => {
    if (addingRef.current) {
      return;
    }
    addingRef.current = true;

    try {
      const arr = Array.from(incoming);
      if (arr.length === 0) {
        return;
      }

      for (const file of arr) {
        if (filesRef.current.length >= MEDIA_CONSTRAINTS.MAX_FILES) {
          break;
        }

        const localId = crypto.randomUUID();
        const isVideo = file.type.startsWith('video/');
        const previewUrl = URL.createObjectURL(file);

        const mediaFile: MediaFile = {
          id: localId,
          file,
          previewUrl,
          type: isVideo ? 'video' : 'image',
          state: UPLOAD_STATE.VALIDATING,
          progress: 0,
        };

        setFiles((prev) => {
          const next = [...prev, mediaFile];
          filesRef.current = next;
          return next;
        });

        const result = await validateFile(file);

        const patch: Partial<MediaFile> = result.ok
          ? {
              state: UPLOAD_STATE.IDLE,
              ...(result.duration !== undefined && {
                duration: result.duration,
              }),
            }
          : {
              state: UPLOAD_STATE.FAILED,
              error: result.error ?? 'This file could not be attached.',
            };

        setFiles((prev) => {
          const next = prev.map((f) =>
            f.id === localId ? { ...f, ...patch } : f
          );
          filesRef.current = next;
          return next;
        });
      }
    } finally {
      addingRef.current = false;
    }
  }, []);

  const uploadFile = useCallback(
    async (kudoId: string, localId: string): Promise<string | null> => {
      const mediaFile = filesRef.current.find((f) => f.id === localId);
      if (!mediaFile || mediaFile.state !== UPLOAD_STATE.IDLE) {
        return null;
      }

      updateFile(localId, { state: UPLOAD_STATE.UPLOADING, progress: 0 });

      try {
        const result = await mediaService.uploadFile(
          kudoId,
          mediaFile.file,
          (pct) => updateFile(localId, { progress: pct })
        );

        updateFile(localId, {
          state: UPLOAD_STATE.PROCESSING,
          mediaId: result.id,
          progress: 100,
        });

        return result.id;
      } catch (err: unknown) {
        const msg = getErrorMessage(err, 'Upload failed');
        updateFile(localId, { state: UPLOAD_STATE.FAILED, error: msg });
        toaster.create({
          type: 'error',
          title: 'Media upload failed',
          description: msg,
          duration: 5000,
        });
        return null;
      }
    },
    [updateFile]
  );

  const uploadAll = useCallback(
    async (kudoId: string): Promise<Array<string>> => {
      const pending = filesRef.current.filter(
        (f) => f.state === UPLOAD_STATE.IDLE
      );
      const results: Array<string> = [];
      for (const f of pending) {
        const id = await uploadFile(kudoId, f.id);
        if (id) {
          results.push(id);
        }
      }
      return results;
    },
    [uploadFile]
  );

  const removeFile = useCallback((localId: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === localId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const next = prev.filter((f) => f.id !== localId);
      filesRef.current = next;
      return next;
    });
  }, []);

  const cleanup = useCallback(() => {
    for (const f of filesRef.current) {
      URL.revokeObjectURL(f.previewUrl);
    }
    setFiles([]);
    filesRef.current = [];
  }, []);

  const derived = useMemo(() => {
    const failedFile = files.find((f) => f.state === UPLOAD_STATE.FAILED);
    return {
      hasErrors: Boolean(failedFile),
      isUploading: files.some((f) => f.state === UPLOAD_STATE.UPLOADING),
      isProcessing: files.some((f) => f.state === UPLOAD_STATE.PROCESSING),
      isValidating: files.some((f) => f.state === UPLOAD_STATE.VALIDATING),
      canAddMore: files.length < MEDIA_CONSTRAINTS.MAX_FILES,
      firstError:
        failedFile?.error ??
        (failedFile ? 'One or more files could not be attached.' : undefined),
    };
  }, [files]);

  return {
    files,
    addFiles,
    removeFile,
    uploadAll,
    cleanup,
    ...derived,
  };
}
