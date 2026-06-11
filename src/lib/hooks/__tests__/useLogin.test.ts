import { act, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { describe, expect, it, vi } from 'vite-plus/test';

import { authService } from '@/lib/services/auth';
import { createWrapper } from '@/test/utils/wrapper';

import { useLogin } from '../useLogin';

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

const toasterCreate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/components/ui/toaster', () => ({
  toaster: { create: toasterCreate },
}));

describe('useLogin', () => {
  it('sets me cache and navigates to feed on success', async () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });
    await act(() => {
      result.current.mutate({ email: 'new@example.com', password: 'secret' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/feed' });
    expect(toasterCreate).not.toHaveBeenCalled();
  });

  it('shows error toast and does not navigate on failed login', async () => {
    const loginError = new axios.AxiosError<{ message: string }>(
      'Unauthorized',
      '401',
      undefined,
      undefined,
      {
        status: 401,
        data: { message: 'Invalid credentials' },
      } as import('axios').AxiosResponse<{ message: string }>
    );
    const loginSpy = vi
      .spyOn(authService, 'login')
      .mockRejectedValueOnce(loginError);
    toasterCreate.mockClear();
    mockNavigate.mockClear();
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });
    await act(() => {
      result.current.mutate({ email: 'bad@example.com', password: 'wrong' });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toasterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        title: 'Login failed',
        description: 'Invalid credentials',
      })
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    loginSpy.mockRestore();
  });
});
