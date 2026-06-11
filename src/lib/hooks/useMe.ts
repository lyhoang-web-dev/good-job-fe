import { useQuery } from '@tanstack/react-query';

import { authService } from '@/lib/services/auth';
import { queryKeys } from '@/lib/services/queryKeys';

type UseMeOptions = {
  enabled?: boolean;
};

export function useMe(options?: UseMeOptions) {
  return useQuery({
    queryKey: queryKeys.me(),
    queryFn: authService.me,
    retry: false,
    staleTime: 5 * 60_000,
    enabled: options?.enabled ?? true,
  });
}
