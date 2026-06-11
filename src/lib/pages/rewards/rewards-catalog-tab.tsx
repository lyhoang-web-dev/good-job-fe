import { Box, Center, Grid, Text } from '@chakra-ui/react';
import { type ReactNode, useEffect } from 'react';

import { RewardsCatalogGridSkeleton } from '@/lib/components/layout/PageSkeleton';
import { InfiniteList, OffsetPagination } from '@/lib/components/pagination';
import { RewardCardSkeleton, RewardFilterBar } from '@/lib/components/reward';
import { RewardCard } from '@/lib/components/rewards/RewardCard';
import {
  REWARDS_CATALOG_LIMIT,
  useRewardsInfinite,
  useRewardsPage,
} from '@/lib/hooks/useRewards';
import type { RewardFilters } from '@/lib/types/reward-filters';

type RewardsCatalogTabProps = {
  balance: number;
  deferredFilters: RewardFilters;
  filters: RewardFilters;
  goToPage: (p: number) => void;
  isFiltered: boolean;
  isMobile: boolean;
  page: number;
  resetFilters: () => void;
  setFilter: <K extends keyof RewardFilters>(
    key: K,
    value: RewardFilters[K]
  ) => void;
};

export function RewardsCatalogTab({
  balance,
  deferredFilters,
  filters,
  goToPage,
  isFiltered,
  isMobile,
  page,
  resetFilters,
  setFilter,
}: RewardsCatalogTabProps) {
  const pageQuery = useRewardsPage(deferredFilters, balance, page, {
    enabled: !isMobile,
  });
  const infiniteQuery = useRewardsInfinite(deferredFilters, balance, {
    enabled: isMobile,
  });

  const catalogTotal = isMobile
    ? (infiniteQuery.data?.pages[0]?.total ?? 0)
    : (pageQuery.data?.total ?? 0);

  const totalPages = Math.max(1, pageQuery.data?.totalPages ?? 1);
  const desktopRewards = pageQuery.data?.data ?? [];
  const mobileRewards = infiniteQuery.data?.pages.flatMap((p) => p.data) ?? [];

  useEffect(() => {
    if (isMobile) {
      return;
    }
    if (page > totalPages && totalPages > 0) {
      goToPage(totalPages);
    }
  }, [goToPage, isMobile, page, totalPages]);

  const isInitialLoading = isMobile
    ? infiniteQuery.isPending && infiniteQuery.data === undefined
    : pageQuery.isPending && pageQuery.data === undefined;

  const showComingSoon = catalogTotal === 0 && !isFiltered && !isInitialLoading;
  const showNoFilterResults =
    catalogTotal === 0 && isFiltered && !isInitialLoading;

  if (isInitialLoading) {
    return <RewardsCatalogGridSkeleton />;
  }

  if (showComingSoon) {
    return (
      <Center flexDirection="column" minHeight="200px" padding={8}>
        <Text fontSize="3xl" marginBottom={3}>
          ◈
        </Text>
        <Text className="gj-empty-title" marginBottom={2}>
          Rewards coming soon
        </Text>
        <Text color="fg.muted" fontSize="sm" textAlign="center">
          Keep collecting those points
        </Text>
      </Center>
    );
  }

  let listSection: ReactNode;
  if (showNoFilterResults) {
    listSection = (
      <Box paddingY={12} textAlign="center">
        <Text color="fg.muted" fontSize="sm" marginBottom={3}>
          No rewards match your filters. Use &quot;Clear filters&quot; above to
          reset.
        </Text>
      </Box>
    );
  } else if (isMobile) {
    listSection = (
      <InfiniteList
        emptyTitle="No rewards match your filters"
        fetchNextPage={() => {
          infiniteQuery.fetchNextPage().catch(() => undefined);
        }}
        gap={4}
        hasNextPage={infiniteQuery.hasNextPage ?? false}
        isError={infiniteQuery.isError}
        isFetchingNextPage={infiniteQuery.isFetchingNextPage}
        isLoading={false}
        items={mobileRewards}
        onRetry={() => {
          infiniteQuery.refetch().catch(() => undefined);
        }}
        renderItem={(reward) => (
          <RewardCard key={reward.id} reward={reward} userBalance={balance} />
        )}
        renderSkeleton={() => <RewardCardSkeleton />}
        skeletonCount={6}
      />
    );
  } else {
    listSection = (
      <>
        <Grid
          gap={4}
          opacity={pageQuery.isFetching ? 0.6 : 1}
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          }}
          transition="opacity 200ms"
        >
          {desktopRewards.map((r) => (
            <RewardCard key={r.id} reward={r} userBalance={balance} />
          ))}
        </Grid>
        <OffsetPagination
          isLoading={pageQuery.isFetching}
          onPageChange={goToPage}
          page={page}
          pageSize={REWARDS_CATALOG_LIMIT}
          showTotal
          totalItems={catalogTotal}
          totalPages={totalPages}
        />
      </>
    );
  }

  return (
    <Box>
      <RewardFilterBar
        filteredCount={catalogTotal}
        filters={filters}
        isFiltered={isFiltered}
        onFilter={setFilter}
        onReset={resetFilters}
        totalCount={catalogTotal}
      />
      {listSection}
    </Box>
  );
}
