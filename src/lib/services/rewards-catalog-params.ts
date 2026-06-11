import type { RewardFilters } from '@/lib/types/reward-filters';

/** Query params for `GET /rewards` catalog (server applies filters/sort). */
export function buildRewardsCatalogParams(
  filters: Partial<RewardFilters> | undefined,
  userBalance: number | undefined,
  page: number,
  limit: number
): Record<string, string | number> {
  const f = filters;
  const search = f?.search?.trim();
  const includeBalance =
    f?.availability === 'affordable' && userBalance !== undefined;

  return {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(f?.availability && f.availability !== 'all'
      ? { availability: f.availability }
      : {}),
    ...(f?.sort ? { sort: f.sort } : {}),
    ...(includeBalance ? { userBalance } : {}),
  };
}
