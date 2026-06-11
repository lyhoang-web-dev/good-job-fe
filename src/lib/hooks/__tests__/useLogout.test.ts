import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vite-plus/test';

import * as sessionAccessToken from '@/lib/services/sessionAccessToken';
import { createWrapper } from '@/test/utils/wrapper';

import { useLogout } from '../useLogout';

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useLogout', () => {
  it('clears session token, cache, and navigates to login when settled', async () => {
    const clearToken = vi.spyOn(sessionAccessToken, 'setSessionAccessToken');
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });
    await act(() => {
      result.current.mutate();
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clearToken).toHaveBeenCalledWith(null);
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/login',
      search: { error: undefined },
    });
    clearToken.mockRestore();
  });
});
