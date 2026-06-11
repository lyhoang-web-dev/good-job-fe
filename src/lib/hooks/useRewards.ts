import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/services/queryKeys';
import { rewardsService } from '@/lib/services/rewards';
import type { PaginatedRewards } from '@/lib/types';
import type { RewardFilters } from '@/lib/types/reward-filters';

/** Page size for catalog API (matches BE default). */
export const REWARDS_CATALOG_LIMIT = 12;

/** Desktop: single page / offset controls. */
export function useRewardsPage(
  filters: RewardFilters,
  userBalance: number | undefined,
  page: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.rewards.catalog(
      filters,
      userBalance ?? null,
      page,
      REWARDS_CATALOG_LIMIT
    ),
    queryFn: () =>
      rewardsService.getRewards(
        filters,
        userBalance,
        page,
        REWARDS_CATALOG_LIMIT
      ),
    placeholderData: (previousData: PaginatedRewards | undefined) =>
      previousData,
    enabled: options?.enabled ?? true,
  });
}

/** Mobile: infinite scroll — BE offset pagination, `pageParam` as cursor. */
export function useRewardsInfinite(
  filters: RewardFilters,
  userBalance: number | undefined,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: queryKeys.rewards.catalogInfinite(
      filters,
      userBalance ?? null,
      REWARDS_CATALOG_LIMIT
    ),
    queryFn: ({ pageParam }) =>
      rewardsService.getRewards(
        filters,
        userBalance,
        pageParam as number,
        REWARDS_CATALOG_LIMIT
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: options?.enabled ?? true,
  });
}
