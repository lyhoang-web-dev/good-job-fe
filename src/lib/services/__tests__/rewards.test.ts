import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vite-plus/test';

import { mockReward, mockRewardsPaginated } from '@/test/mocks/fixtures';
import { server } from '@/test/mocks/server';

import { rewardsService } from '../rewards';

const BASE = 'http://localhost:4000/api';

describe('rewardsService.getRewards', () => {
  it('requests catalog with expected query params', async () => {
    let requestUrl = '';
    server.use(
      http.get(`${BASE}/rewards`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('all') === 'true') {
          return HttpResponse.json({ data: [mockReward] });
        }
        requestUrl = request.url;
        return HttpResponse.json({ data: mockRewardsPaginated });
      })
    );

    await rewardsService.getRewards(
      {
        search: 'hoodie',
        availability: 'affordable',
        sort: 'cost_asc',
      },
      300,
      2,
      12
    );

    const url = new URL(requestUrl);
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('limit')).toBe('12');
    expect(url.searchParams.get('search')).toBe('hoodie');
    expect(url.searchParams.get('availability')).toBe('affordable');
    expect(url.searchParams.get('sort')).toBe('cost_asc');
    expect(url.searchParams.get('userBalance')).toBe('300');
  });
});

describe('rewardsService.getRewardsAdmin', () => {
  it('returns array body as-is', async () => {
    const rows = await rewardsService.getRewardsAdmin();
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0]?.id).toBeDefined();
  });

  it('unwraps paginated body when API returns a page object', async () => {
    server.use(
      http.get(`${BASE}/rewards`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('all') !== 'true') {
          return HttpResponse.json({ data: mockRewardsPaginated });
        }
        return HttpResponse.json({ data: mockRewardsPaginated });
      })
    );
    const rows = await rewardsService.getRewardsAdmin();
    expect(rows).toHaveLength(mockRewardsPaginated.data.length);
  });
});

describe('rewardsService mutations and history', () => {
  it('redeemReward posts rewardId', async () => {
    const r = await rewardsService.redeemReward('reward-1');
    expect(r.id).toBeDefined();
    expect(r.pointsSpent).toBeGreaterThan(0);
  });

  it('getRedemptionHistory returns rows', async () => {
    const rows = await rewardsService.getRedemptionHistory();
    expect(Array.isArray(rows)).toBe(true);
    expect(rows[0]?.reward).toBeDefined();
  });

  it('createReward posts payload', async () => {
    const created = await rewardsService.createReward({
      name: 'Mug',
      pointsCost: 50,
      quantityTotal: 10,
    });
    expect(created.name).toBeDefined();
  });

  it('patchReward sends patch', async () => {
    const updated = await rewardsService.patchReward('reward-1', {
      name: 'Updated',
    });
    expect(updated.id).toBe('reward-1');
  });
});
