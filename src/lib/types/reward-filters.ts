export type RewardSortKey = 'availability' | 'cost_asc' | 'cost_desc';

export type RewardAvailabilityFilter =
  | 'affordable'
  | 'all'
  | 'in_stock'
  | 'low_stock';

export interface RewardFilters {
  availability: RewardAvailabilityFilter;
  search: string;
  sort: RewardSortKey;
}

export const DEFAULT_REWARD_FILTERS: RewardFilters = {
  availability: 'all',
  search: '',
  sort: 'availability',
};
