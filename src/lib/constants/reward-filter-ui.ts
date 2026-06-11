import type {
  RewardAvailabilityFilter,
  RewardSortKey,
} from '@/lib/types/reward-filters';

export const REWARD_AVAILABILITY_OPTIONS: Array<{
  label: string;
  value: RewardAvailabilityFilter;
}> = [
  { label: 'All rewards', value: 'all' },
  { label: 'I can afford', value: 'affordable' },
  { label: 'In stock', value: 'in_stock' },
  { label: 'Low stock', value: 'low_stock' },
];

export const REWARD_SORT_OPTIONS: Array<{
  label: string;
  value: RewardSortKey;
}> = [
  { label: 'Availability', value: 'availability' },
  { label: 'Cost: low → high', value: 'cost_asc' },
  { label: 'Cost: high → low', value: 'cost_desc' },
];
