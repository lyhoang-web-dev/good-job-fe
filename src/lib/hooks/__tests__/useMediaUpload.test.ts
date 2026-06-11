import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { UPLOAD_STATE } from '@/lib/constants/media';
import { mediaService } from '@/lib/services/media';
import * as fileValidation from '@/lib/utils/validate/file-validation';

import { useMediaUpload } from '../useMediaUpload';

function smallJpeg(): File {
  return new File(['x'.repeat(200)], 'a.jpg', { type: 'image/jpeg' });
}

const toasterCreate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/components/ui/toaster', () => ({
  toaster: { create: toasterCreate },
}));

describe('useMediaUpload', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds a valid file and reaches idle after validation', async () => {
    const { result } = renderHook(() => useMediaUpload());
    const file = smallJpeg();

    await act(async () => {
      await result.current.addFiles([file]);
    });
    await waitFor(() =>
      expect(
        result.current.files.some((f) => f.state === UPLOAD_STATE.IDLE)
      ).toBe(true)
    );
    expect(result.current.files).toHaveLength(1);
    expect(result.current.canAddMore).toBe(true);
  });

  it('removeFile drops entry and revokes preview URL', async () => {
    const revoke = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined);
    const { result } = renderHook(() => useMediaUpload());

    await act(async () => {
      await result.current.addFiles([smallJpeg()]);
    });
    await waitFor(() =>
      expect(
        result.current.files.some((f) => f.state === UPLOAD_STATE.IDLE)
      ).toBe(true)
    );
    const id = result.current.files[0]?.id;
    expect(id).toBeDefined();
    act(() => {
      result.current.removeFile(id as string);
    });
    expect(result.current.files).toHaveLength(0);
    expect(revoke).toHaveBeenCalled();
    revoke.mockRestore();
  });

  it('cleanup clears all files', async () => {
    const { result } = renderHook(() => useMediaUpload());
    await act(async () => {
      await result.current.addFiles([smallJpeg()]);
    });
    await waitFor(() =>
      expect(
        result.current.files.some((f) => f.state === UPLOAD_STATE.IDLE)
      ).toBe(true)
    );
    act(() => {
      result.current.cleanup();
    });
    expect(result.current.files).toHaveLength(0);
  });

  it('marks failed state when file fails validation', async () => {
    const { result } = renderHook(() => useMediaUpload());
    const bad = new File(['x'], 'x.pdf', { type: 'application/pdf' });
    await act(async () => {
      await result.current.addFiles([bad]);
    });
    await waitFor(() => expect(result.current.hasErrors).toBe(true));
    expect(result.current.firstError).toBeDefined();
    expect(
      result.current.files.some((f) => f.state === UPLOAD_STATE.FAILED)
    ).toBe(true);
  });

  it('ignores empty file list', async () => {
    const { result } = renderHook(() => useMediaUpload());
    await act(async () => {
      await result.current.addFiles([]);
    });
    expect(result.current.files).toHaveLength(0);
  });

  it('second concurrent addFiles returns while first is in progress', async () => {
    const { result } = renderHook(() => useMediaUpload());
    const slow = new File(['x'.repeat(200)], 'slow.jpg', {
      type: 'image/jpeg',
    });
    const fast = new File(['y'.repeat(200)], 'fast.jpg', {
      type: 'image/jpeg',
    });
    let p1: Promise<void>;
    let p2: Promise<void>;
    await act(() => {
      p1 = result.current.addFiles([slow]);
      p2 = result.current.addFiles([fast]);
    });
    await act(async () => {
      await Promise.all([p1!, p2!]);
    });
    await waitFor(() =>
      expect(result.current.files.length).toBeGreaterThanOrEqual(1)
    );
  });

  it('stores duration when validateFile returns duration', async () => {
    vi.spyOn(fileValidation, 'validateFile').mockResolvedValue({
      ok: true,
      duration: 42,
    });
    const { result } = renderHook(() => useMediaUpload());
    await act(async () => {
      await result.current.addFiles([
        new File(['b'], 'clip.mp4', { type: 'video/mp4' }),
      ]);
    });
    await waitFor(() => expect(result.current.files[0]?.duration).toBe(42));
  });

  it('uploadAll moves idle file to processing and returns media id', async () => {
    const uploadSpy = vi
      .spyOn(mediaService, 'uploadFile')
      .mockImplementation(async (_kudoId, _file, onProgress) => {
        onProgress(33);
        return {
          id: 'media-up-1',
          type: 'image',
          status: 'ready',
          url: 'https://example.com/x.jpg',
        };
      });
    const { result } = renderHook(() => useMediaUpload());
    await act(async () => {
      await result.current.addFiles([smallJpeg()]);
    });
    await waitFor(() =>
      expect(
        result.current.files.some((f) => f.state === UPLOAD_STATE.IDLE)
      ).toBe(true)
    );
    const id = result.current.files[0]?.id as string;
    let ids: Array<string> = [];
    await act(async () => {
      ids = await result.current.uploadAll('kudo-1');
    });
    expect(ids).toEqual(['media-up-1']);
    const uploaded = result.current.files.find((f) => f.id === id);
    expect(uploaded?.state).toBe(UPLOAD_STATE.PROCESSING);
    expect(uploaded?.progress).toBe(100);
    uploadSpy.mockRestore();
  });

  it('uploadAll skips non-idle files', async () => {
    const { result } = renderHook(() => useMediaUpload());
    await act(async () => {
      await result.current.addFiles([new File(['x'], 'bad.exe')]);
    });
    await waitFor(() =>
      expect(
        result.current.files.some((f) => f.state === UPLOAD_STATE.FAILED)
      ).toBe(true)
    );
    let ids: Array<string> = [];
    await act(async () => {
      ids = await result.current.uploadAll('kudo-1');
    });
    expect(ids).toHaveLength(0);
  });

  it('uploadAll shows toast on upload failure', async () => {
    toasterCreate.mockClear();
    vi.spyOn(mediaService, 'uploadFile').mockRejectedValueOnce(
      new Error('boom')
    );
    const { result } = renderHook(() => useMediaUpload());
    await act(async () => {
      await result.current.addFiles([smallJpeg()]);
    });
    await waitFor(() =>
      expect(
        result.current.files.some((f) => f.state === UPLOAD_STATE.IDLE)
      ).toBe(true)
    );
    await act(async () => {
      await result.current.uploadAll('kudo-1');
    });
    expect(toasterCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Media upload failed' })
    );
  });

  it('uploadAll uploads each idle file', async () => {
    vi.spyOn(mediaService, 'uploadFile').mockResolvedValue({
      id: 'm-a',
      type: 'image',
      status: 'ready',
      url: 'u',
    });
    const { result } = renderHook(() => useMediaUpload());
    await act(async () => {
      await result.current.addFiles([smallJpeg(), smallJpeg()]);
    });
    await waitFor(() =>
      expect(
        result.current.files.filter((f) => f.state === UPLOAD_STATE.IDLE).length
      ).toBe(2)
    );
    let ids: Array<string> = [];
    await act(async () => {
      ids = await result.current.uploadAll('kudo-1');
    });
    expect(ids).toHaveLength(2);
  });

  it('gj-media-ready marks processing file as ready', async () => {
    vi.spyOn(mediaService, 'uploadFile').mockResolvedValue({
      id: 'sse-media',
      type: 'image',
      status: 'ready',
      url: 'https://example.com/m.jpg',
    });
    const { result } = renderHook(() => useMediaUpload());
    await act(async () => {
      await result.current.addFiles([smallJpeg()]);
    });
    await waitFor(() =>
      expect(
        result.current.files.some((f) => f.state === UPLOAD_STATE.IDLE)
      ).toBe(true)
    );
    await act(async () => {
      await result.current.uploadAll('k1');
    });
    act(() => {
      window.dispatchEvent(
        new CustomEvent('gj-media-ready', {
          detail: { mediaId: 'sse-media' },
        })
      );
    });
    await waitFor(() =>
      expect(
        result.current.files.find((f) => f.mediaId === 'sse-media')?.state
      ).toBe(UPLOAD_STATE.READY)
    );
  });

  it('gj-media-failed uses default message when reason omitted', async () => {
    const { result } = renderHook(() => useMediaUpload());
    await act(async () => {
      await result.current.addFiles([smallJpeg()]);
    });
    await waitFor(() =>
      expect(
        result.current.files.some((f) => f.state === UPLOAD_STATE.IDLE)
      ).toBe(true)
    );
    vi.spyOn(mediaService, 'uploadFile').mockResolvedValue({
      id: 'mf-0',
      type: 'image',
      status: 'ready',
      url: '',
    });
    await act(async () => {
      await result.current.uploadAll('k1');
    });
    act(() => {
      window.dispatchEvent(
        new CustomEvent('gj-media-failed', { detail: { mediaId: 'mf-0' } })
      );
    });
    await waitFor(() =>
      expect(
        result.current.files.find((f) => f.mediaId === 'mf-0')?.error
      ).toBe('Processing failed')
    );
  });

  it('gj-media-failed sets failed with reason', async () => {
    const { result } = renderHook(() => useMediaUpload());
    await act(async () => {
      await result.current.addFiles([smallJpeg()]);
    });
    await waitFor(() =>
      expect(
        result.current.files.some((f) => f.state === UPLOAD_STATE.IDLE)
      ).toBe(true)
    );
    vi.spyOn(mediaService, 'uploadFile').mockResolvedValue({
      id: 'mf-1',
      type: 'image',
      status: 'processing',
      url: '',
    });
    await act(async () => {
      await result.current.uploadAll('k1');
    });
    act(() => {
      window.dispatchEvent(
        new CustomEvent('gj-media-failed', {
          detail: { mediaId: 'mf-1', reason: 'Transcode error' },
        })
      );
    });
    await waitFor(() =>
      expect(
        result.current.files.find((f) => f.mediaId === 'mf-1')?.error
      ).toBe('Transcode error')
    );
  });
});
