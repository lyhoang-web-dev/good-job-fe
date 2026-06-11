import { createFileRoute, redirect } from '@tanstack/react-router';

import AdminRewardsPage from '@/lib/pages/admin/rewards';
import { authService } from '@/lib/services/auth';
import { queryKeys } from '@/lib/services/queryKeys';

export const Route = createFileRoute('/_authenticated/admin/rewards')({
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData({
      queryKey: queryKeys.me(),
      queryFn: authService.me,
    });
    if (me.role !== 'admin') {
      throw redirect({ to: '/feed' });
    }
  },
  component: AdminRewardsPage,
});
