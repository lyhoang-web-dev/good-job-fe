import { Box, Button, Flex, Input, NativeSelect, Text } from '@chakra-ui/react';

import {
  REWARD_AVAILABILITY_OPTIONS,
  REWARD_SORT_OPTIONS,
} from '@/lib/constants/reward-filter-ui';
import type {
  RewardAvailabilityFilter,
  RewardFilters,
  RewardSortKey,
} from '@/lib/types/reward-filters';

type RewardFilterBarProps = {
  filteredCount: number;
  filters: RewardFilters;
  isFiltered: boolean;
  onFilter: <K extends keyof RewardFilters>(
    key: K,
    value: RewardFilters[K]
  ) => void;
  onReset: () => void;
  totalCount: number;
};

export function RewardFilterBar({
  filteredCount,
  filters,
  isFiltered,
  onFilter,
  onReset,
  totalCount,
}: RewardFilterBarProps) {
  const countLabel = isFiltered
    ? `${filteredCount} matching rewards`
    : `${totalCount} rewards`;

  return (
    <Box marginBottom={5}>
      <Flex align="center" flexWrap="wrap" gap={3}>
        <Input
          maxWidth="220px"
          onChange={(e) => onFilter('search', e.target.value)}
          placeholder="Search rewards…"
          size="sm"
          value={filters.search}
        />

        <NativeSelect.Root size="sm" width="160px">
          <NativeSelect.Field
            onChange={(e) =>
              onFilter(
                'availability',
                e.currentTarget.value as RewardAvailabilityFilter
              )
            }
            value={filters.availability}
          >
            {REWARD_AVAILABILITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>

        <NativeSelect.Root size="sm" width="180px">
          <NativeSelect.Field
            onChange={(e) =>
              onFilter('sort', e.currentTarget.value as RewardSortKey)
            }
            value={filters.sort}
          >
            {REWARD_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>

        {isFiltered && (
          <Button color="fg.muted" onClick={onReset} size="sm" variant="ghost">
            Clear filters
          </Button>
        )}

        <Text color="fg.muted" fontSize="sm" marginLeft="auto">
          {countLabel}
        </Text>
      </Flex>
    </Box>
  );
}
