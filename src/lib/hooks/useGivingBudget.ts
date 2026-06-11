import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/services/queryKeys';
import { usersService } from '@/lib/services/users';

export function useGivingBudget() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.users.givingBudget(),
    queryFn: usersService.getGivingBudget,
    staleTime: 60_000,
  });

  const total = data?.totalBudget ?? 0;
  const used = data?.usedPoints ?? 0;
  const remaining = data?.remaining ?? 0;

  return {
    remaining,
    used,
    total,
    percentage: data ? Math.round((used / total) * 100) : 0,
    isLoading,
  };
}
