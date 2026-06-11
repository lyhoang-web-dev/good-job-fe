import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { createWrapper } from '@/test/utils/wrapper';

import { useKudoFeed } from '../useKudoFeed';

describe('useKudoFeed', () => {
  it('loads first page of kudo feed', async () => {
    const { result } = renderHook(() => useKudoFeed(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const first = result.current.data?.pages[0];
    expect(first?.data).toHaveLength(1);
    expect(first?.data[0]?.id).toBe('kudo-1');
  });
});
