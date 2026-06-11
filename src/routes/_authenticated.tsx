import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { authService } from '@/lib/services/auth';
import { queryKeys } from '@/lib/services/queryKeys';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
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
