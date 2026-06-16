import { useRouterState } from '@tanstack/react-router';

import { useSSE } from '@/lib/hooks/useSSE';

/** SSE is enabled only outside /login — avoids a 401 on GET /events before a session exists. */
export function SseBridge() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sseEnabled = pathname !== '/login';

  useSSE({ enabled: sseEnabled });
  return null;
}
