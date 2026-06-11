import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Provider } from '@/lib/components/ui/provider';
import LoginPage from '@/lib/pages/login';
import { authService } from '@/lib/services/auth';

const mockNavigate = vi.hoisted(() => vi.fn());
const useSearchMock = vi.hoisted(() => vi.fn(() => ({})));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => useSearchMock(),
}));

const toasterCreate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/components/ui/toaster', () => ({
  toaster: { create: toasterCreate },
}));

function renderLogin() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <Provider>
      <QueryClientProvider client={queryClient}>
        <LoginPage />
      </QueryClientProvider>
    </Provider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    useSearchMock.mockReturnValue({});
    toasterCreate.mockClear();
    mockNavigate.mockClear();
  });

  it('shows validation errors when fields are empty', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Email is required')).toBeTruthy();
    expect(screen.getByText('Password is required')).toBeTruthy();
  });

  it('shows error for invalid email format', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(
      screen.getByPlaceholderText('you@company.com'),
      'user@host'
    );
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret12');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid email')).toBeTruthy();
  });

  it('shows error when password is too short', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(
      screen.getByPlaceholderText('you@company.com'),
      'alice@goodjob.com'
    );
    await user.type(screen.getByPlaceholderText('••••••••'), '12345');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Minimum 6 characters')).toBeTruthy();
  });

  it('shows login failed toast when API rejects credentials', async () => {
    const loginError = new axios.AxiosError<{ message: string }>(
      'Unauthorized',
      '401',
      undefined,
      undefined,
      {
        status: 401,
        data: { message: 'Bad login' },
      } as import('axios').AxiosResponse<{ message: string }>
    );
    const loginSpy = vi
      .spyOn(authService, 'login')
      .mockRejectedValueOnce(loginError);
    const user = userEvent.setup();
    renderLogin();

    await user.type(
      screen.getByPlaceholderText('you@company.com'),
      'wrong@goodjob.com'
    );
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() =>
      expect(toasterCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Login failed',
          description: 'Bad login',
        })
      )
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    loginSpy.mockRestore();
  });

  it('submits valid credentials and navigates to feed', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(
      screen.getByPlaceholderText('you@company.com'),
      'alice@goodjob.com'
    );
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/feed' })
    );
    expect(toasterCreate).not.toHaveBeenCalled();
  });

  it('calls authService when Google sign-in is clicked', async () => {
    const googleSpy = vi
      .spyOn(authService, 'loginWithGoogle')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    renderLogin();

    await user.click(
      screen.getByRole('button', { name: /sign in with google/i })
    );

    expect(googleSpy).toHaveBeenCalledTimes(1);
    googleSpy.mockRestore();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderLogin();

    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput.getAttribute('type')).toBe('password');

    await user.click(screen.getByRole('button', { name: '👁' }));
    expect(passwordInput.getAttribute('type')).toBe('text');

    await user.click(screen.getByRole('button', { name: '🙈' }));
    expect(passwordInput.getAttribute('type')).toBe('password');
  });

  it('shows toast when search indicates Google auth failed', () => {
    useSearchMock.mockReturnValue({ error: 'google_auth_failed' });
    renderLogin();

    expect(toasterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        title: 'Google sign-in failed',
      })
    );
  });
});
