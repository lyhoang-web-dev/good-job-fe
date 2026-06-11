import { useRouterState } from '@tanstack/react-router';

import { useSSE } from '@/lib/hooks/useSSE';

/** SSE chỉ bật khi không ở /login — tránh GET /events 401 khi chưa có session. */
export function SseBridge() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sseEnabled = pathname !== '/login';

  useSSE({ enabled: sseEnabled });
  return null;
}
