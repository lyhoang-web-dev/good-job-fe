import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router';

import LoginPage from '@/lib/pages/login';
import { authService } from '@/lib/services/auth';
import { queryKeys } from '@/lib/services/queryKeys';
import { getSessionAccessToken } from '@/lib/services/sessionAccessToken';

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    // No token: the user is not logged in, so stay on /login without calling
    // `/auth/me` (which would only 401 and log a console error).
    if (!getSessionAccessToken()) {
      return;
    }
    try {
      await context.queryClient.ensureQueryData({
        queryKey: queryKeys.me(),
        queryFn: authService.me,
        retry: false,
      });
      throw redirect({ to: '/feed' });
    } catch (e) {
      if (isRedirect(e)) {
        throw e;
      }
    }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: LoginPage,
});
