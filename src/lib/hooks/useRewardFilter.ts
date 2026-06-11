import { useDeferredValue, useMemo, useState } from 'react';

import {
  DEFAULT_REWARD_FILTERS,
  type RewardFilters,
} from '@/lib/types/reward-filters';

export type {
  RewardAvailabilityFilter,
  RewardFilters,
  RewardSortKey,
} from '@/lib/types/reward-filters';

export function useRewardFilter() {
  const [filters, setFilters] = useState<RewardFilters>({
    ...DEFAULT_REWARD_FILTERS,
  });
  const [page, setPage] = useState(1);

  const deferredSearch = useDeferredValue(filters.search);

  const deferredFilters = useMemo(
    (): RewardFilters => ({
      ...filters,
      search: deferredSearch,
    }),
    [filters, deferredSearch]
  );

  function setFilter<K extends keyof RewardFilters>(
    key: K,
    value: RewardFilters[K]
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function resetFilters() {
    setFilters({ ...DEFAULT_REWARD_FILTERS });
    setPage(1);
  }

  function resetPage() {
    setPage(1);
  }

  function goToPage(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const isFiltered =
    filters.availability !== DEFAULT_REWARD_FILTERS.availability ||
    filters.search.trim() !== '' ||
    filters.sort !== DEFAULT_REWARD_FILTERS.sort;

  return {
    deferredFilters,
    filters,
    goToPage,
    isFiltered,
    page,
    resetFilters,
    resetPage,
    setFilter,
  };
}
