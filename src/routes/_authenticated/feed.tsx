import { createFileRoute } from '@tanstack/react-router';

import FeedPage from '@/lib/pages/feed';

export const Route = createFileRoute('/_authenticated/feed')({
  component: FeedPage,
});
