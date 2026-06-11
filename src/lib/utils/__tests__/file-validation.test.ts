import { describe, expect, it, vi } from 'vite-plus/test';

import { MEDIA_CONSTRAINTS } from '@/lib/constants/media';

import {
  validateFile,
  validateFileSize,
  validateFileType,
  validateVideoDuration,
} from '../validate/file-validation';

const RE_FILE_SIZE_MB = /MB/;
const RE_VIDEO_MAX_DURATION = /3 minutes/;
const RE_ALLOWED_FILE_KINDS = /images|videos/i;

function makeFile(name: string, type: string, size: number): File {
  return new File(['x'.repeat(size)], name, { type });
}

describe('validateFileType', () => {
  it('accepts valid image types', () => {
    expect(validateFileType(makeFile('img.jpg', 'image/jpeg', 100)).ok).toBe(
      true
    );
    expect(validateFileType(makeFile('img.png', 'image/png', 100)).ok).toBe(
      true
    );
    expect(validateFileType(makeFile('img.gif', 'image/gif', 100)).ok).toBe(
      true
    );
  });

  it('accepts valid video types', () => {
    expect(validateFileType(makeFile('v.mp4', 'video/mp4', 100)).ok).toBe(true);
    expect(validateFileType(makeFile('v.mov', 'video/quicktime', 100)).ok).toBe(
      true
    );
    expect(validateFileType(makeFile('v.webm', 'video/webm', 100)).ok).toBe(
      true
    );
  });

  it('rejects invalid type', () => {
    const result = validateFileType(
      makeFile('doc.pdf', 'application/pdf', 100)
    );
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects invalid extension', () => {
    const result = validateFileType(makeFile('file.exe', 'image/jpeg', 100));
    expect(result.ok).toBe(false);
  });
});

describe('validateFileSize', () => {
  it('accepts file under limit', () => {
    const file = makeFile('img.jpg', 'image/jpeg', 1024);
    expect(validateFileSize(file).ok).toBe(true);
  });

  it('rejects file over 100MB', () => {
    const overLimit = MEDIA_CONSTRAINTS.MAX_FILE_SIZE_BYTES + 1;
    const file = makeFile('big.jpg', 'image/jpeg', overLimit);
    const result = validateFileSize(file);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(RE_FILE_SIZE_MB);
  });

  it('accepts file exactly at limit', () => {
    const file = makeFile(
      'exact.jpg',
      'image/jpeg',
      MEDIA_CONSTRAINTS.MAX_FILE_SIZE_BYTES
    );
    expect(validateFileSize(file).ok).toBe(true);
  });
});

describe('validateVideoDuration', () => {
  it('accepts video under 3 minutes', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    const videoEl = {
      preload: '',
      onloadedmetadata: null as null | (() => void),
      onerror: null as null | (() => void),
      src: '',
      duration: 120,
    };
    vi.spyOn(document, 'createElement').mockReturnValue(
      videoEl as unknown as HTMLVideoElement
    );

    const file = makeFile('v.mp4', 'video/mp4', 1000);
    const promise = validateVideoDuration(file);
    videoEl.onloadedmetadata?.();

    const result = await promise;
    expect(result.ok).toBe(true);
  });

  it('rejects video over 3 minutes', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    const videoEl = {
      preload: '',
      onloadedmetadata: null as null | (() => void),
      onerror: null as null | (() => void),
      src: '',
      duration: 200,
    };
    vi.spyOn(document, 'createElement').mockReturnValue(
      videoEl as unknown as HTMLVideoElement
    );

    const file = makeFile('v.mp4', 'video/mp4', 1000);
    const promise = validateVideoDuration(file);
    videoEl.onloadedmetadata?.();

    const result = await promise;
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(RE_VIDEO_MAX_DURATION);
  });

  it('treats metadata read failure as ok (upload may still work)', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    const videoEl = {
      preload: '',
      onloadedmetadata: null as null | (() => void),
      onerror: null as null | (() => void),
      src: '',
      duration: 0,
    };
    vi.spyOn(document, 'createElement').mockReturnValue(
      videoEl as unknown as HTMLVideoElement
    );

    const file = makeFile('v.mp4', 'video/mp4', 1000);
    const promise = validateVideoDuration(file);
    videoEl.onerror?.();

    const result = await promise;
    expect(result.ok).toBe(true);
  });
});

describe('validateFile', () => {
  it('accepts a valid image without reading video metadata', async () => {
    const file = makeFile('a.jpg', 'image/jpeg', 500);
    const result = await validateFile(file);
    expect(result.ok).toBe(true);
  });

  it('returns type error before size or duration checks', async () => {
    const file = makeFile('x.bin', 'application/octet-stream', 500);
    const result = await validateFile(file);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(RE_ALLOWED_FILE_KINDS);
  });
});
