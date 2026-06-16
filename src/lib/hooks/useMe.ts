import { useQuery } from '@tanstack/react-query';

import { authService } from '@/lib/services/auth';
import { queryKeys } from '@/lib/services/queryKeys';
import { getSessionAccessToken } from '@/lib/services/sessionAccessToken';

type UseMeOptions = {
  enabled?: boolean;
};

export function useMe(options?: UseMeOptions) {
  return useQuery({
    queryKey: queryKeys.me(),
    queryFn: authService.me,
    retry: false,
    staleTime: 5 * 60_000,
    // Never call `/auth/me` without a token — it can only 401 and spam the console.
    enabled: (options?.enabled ?? true) && Boolean(getSessionAccessToken()),
  });
}
