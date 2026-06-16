import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { authService } from '@/lib/services/auth';
import { queryKeys } from '@/lib/services/queryKeys';
import { getSessionAccessToken } from '@/lib/services/sessionAccessToken';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    // No token at all means the user is logged out: redirect without calling
    // `/auth/me`, which would only return 401 and log a console error.
    if (!getSessionAccessToken()) {
      throw redirect({ search: { error: undefined }, to: '/login' });
    }
    try {
      await context.queryClient.ensureQueryData({
        queryKey: queryKeys.me(),
        queryFn: authService.me,
        retry: false,
      });
    } catch {
      throw redirect({ search: { error: undefined }, to: '/login' });
    }
  },
  component: () => <Outlet />,
});
