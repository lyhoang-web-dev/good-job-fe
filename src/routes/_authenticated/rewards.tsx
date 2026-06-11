import { createFileRoute } from '@tanstack/react-router';

import RewardsPage from '@/lib/pages/rewards';

export const Route = createFileRoute('/_authenticated/rewards')({
  component: RewardsPage,
});
