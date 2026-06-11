import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_REWARD_FILTERS } from '@/lib/types/reward-filters';
import { mockReward } from '@/test/mocks/fixtures';
import { server } from '@/test/mocks/server';
import { createWrapper } from '@/test/utils/wrapper';

import {
  REWARDS_CATALOG_LIMIT,
  useRewardsInfinite,
  useRewardsPage,
} from '../useRewards';

const BASE = 'http://localhost:4000/api';

describe('useRewardsPage', () => {
  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(
      () => useRewardsPage(DEFAULT_REWARD_FILTERS, 350, 1, { enabled: false }),
      { wrapper: createWrapper() }
    );
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.isFetching).toBe(false);
  });

  it('fetches catalog page with filters', async () => {
    const { result } = renderHook(
      () => useRewardsPage(DEFAULT_REWARD_FILTERS, 350, 1, { enabled: true }),
      { wrapper: createWrapper() }
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.page).toBe(1);
  });
});

describe('useRewardsInfinite', () => {
  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(
      () => useRewardsInfinite(DEFAULT_REWARD_FILTERS, 350, { enabled: false }),
      { wrapper: createWrapper() }
    );
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.isFetching).toBe(false);
  });

  it('loads first page and exposes next page when totalPages > 1', async () => {
    server.use(
      http.get(`${BASE}/rewards`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('all') === 'true') {
          return HttpResponse.json({ data: [mockReward] });
        }
        const page = Number(url.searchParams.get('page') ?? '1');
        return HttpResponse.json({
          data: {
            data: [mockReward],
            limit: REWARDS_CATALOG_LIMIT,
            page,
            total: 24,
            totalPages: 2,
          },
        });
      })
    );

    const { result } = renderHook(
      () => useRewardsInfinite(DEFAULT_REWARD_FILTERS, 350, { enabled: true }),
      { wrapper: createWrapper() }
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.data?.pages[0]?.page).toBe(1);
  });
});
