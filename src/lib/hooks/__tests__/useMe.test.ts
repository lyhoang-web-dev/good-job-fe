import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { createWrapper } from '@/test/utils/wrapper';

import { useMe } from '../useMe';

describe('useMe', () => {
  it('loads current user from auth/me', async () => {
    const { result } = renderHook(() => useMe(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe('user-1');
    expect(result.current.data?.email).toBe('alice@goodjob.com');
  });

  it('respects enabled: false (does not fetch)', () => {
    const { result } = renderHook(() => useMe({ enabled: false }), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetched).toBe(false);
  });
});
