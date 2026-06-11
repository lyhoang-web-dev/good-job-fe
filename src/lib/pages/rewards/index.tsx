import { Heading, Tabs, VStack } from '@chakra-ui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';

import { RewardsRedemptionHistorySkeleton } from '@/lib/components/layout/PageSkeleton';
import { OffsetPagination } from '@/lib/components/pagination';
import { RedemptionHistory } from '@/lib/components/rewards/RedemptionHistory';
import { useMe } from '@/lib/hooks/useMe';
import { useOffsetPagination } from '@/lib/hooks/useOffsetPagination';
import { useResponsivePagination } from '@/lib/hooks/useResponsivePagination';
import { useRewardFilter } from '@/lib/hooks/useRewardFilter';
import { queryKeys } from '@/lib/services/queryKeys';
import { rewardsService } from '@/lib/services/rewards';
import { paginateSlice } from '@/lib/utils/paginate';

import { RewardsCatalogTab } from './rewards-catalog-tab';

const REDEMPTION_PAGE_SIZE = 10;

function isCatalogInfiniteKey(key: ReadonlyArray<unknown>): boolean {
  return key[0] === 'rewards' && key[1] === 'catalog-infinite';
}

export default function RewardsPage() {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const isMobile = useResponsivePagination();
  const historyPagination = useOffsetPagination({
    pageSize: REDEMPTION_PAGE_SIZE,
  });

  const {
    deferredFilters,
    filters,
    goToPage,
    isFiltered,
    page,
    resetFilters,
    resetPage,
    setFilter,
  } = useRewardFilter();

  const balance = me?.balance ?? 0;
  const prevMobileRef = useRef(isMobile);

  useEffect(() => {
    if (prevMobileRef.current === isMobile) {
      return;
    }
    prevMobileRef.current = isMobile;
    resetPage();
    queryClient.resetQueries({
      predicate: (q) => isCatalogInfiniteKey(q.queryKey),
    });
  }, [isMobile, queryClient, resetPage]);

  const historyQuery = useQuery({
    queryKey: queryKeys.rewards.redemptions(),
    queryFn: rewardsService.getRedemptionHistory,
  });

  const allHistory = historyQuery.data ?? [];

  const historyRows = useMemo(
    () =>
      paginateSlice(
        allHistory,
        historyPagination.page,
        historyPagination.pageSize
      ),
    [allHistory, historyPagination.page, historyPagination.pageSize]
  );
  const historyTotalPages = Math.max(
    1,
    Math.ceil(allHistory.length / historyPagination.pageSize)
  );

  useEffect(() => {
    if (historyPagination.page > historyTotalPages) {
      historyPagination.goToPage(historyTotalPages);
    }
  }, [historyPagination.goToPage, historyPagination.page, historyTotalPages]);

  return (
    <VStack align="stretch" gap={6}>
      <Heading fontFamily="heading" size="lg">
        Rewards
      </Heading>
      <Tabs.Root defaultValue="catalog">
        <Tabs.List>
          <Tabs.Trigger value="catalog">Rewards</Tabs.Trigger>
          <Tabs.Trigger value="history">My redemption history</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content paddingTop={4} value="catalog">
          <RewardsCatalogTab
            balance={balance}
            deferredFilters={deferredFilters}
            filters={filters}
            goToPage={goToPage}
            isFiltered={isFiltered}
            isMobile={isMobile}
            page={page}
            resetFilters={resetFilters}
            setFilter={setFilter}
          />
        </Tabs.Content>
        <Tabs.Content paddingTop={4} value="history">
          {historyQuery.isPending && (historyQuery.data ?? []).length === 0 ? (
            <RewardsRedemptionHistorySkeleton />
          ) : (
            <VStack align="stretch" gap={3}>
              <RedemptionHistory rows={historyRows} />
              <OffsetPagination
                isLoading={historyQuery.isFetching}
                onPageChange={historyPagination.goToPage}
                page={historyPagination.page}
                pageSize={historyPagination.pageSize}
                showTotal
                totalItems={allHistory.length}
                totalPages={historyTotalPages}
              />
            </VStack>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </VStack>
  );
}
