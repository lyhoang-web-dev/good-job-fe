import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { queryKeys } from '@/lib/services/queryKeys';
import { rewardsService } from '@/lib/services/rewards';
import type { Redemption, Reward, User } from '@/lib/types';
import { DEFAULT_REWARD_FILTERS } from '@/lib/types/reward-filters';
import {
  mockRedemption,
  mockReward,
  mockRewardsPaginated,
  mockUser,
} from '@/test/mocks/fixtures';
import { server } from '@/test/mocks/server';

import { useRedeem } from '../useRedeem';
import { REWARDS_CATALOG_LIMIT } from '../useRewards';

const toasterCreate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/components/ui/toaster', () => ({
  toaster: { create: toasterCreate },
}));

const BASE = 'http://localhost:4000/api';

function createTestWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe('useRedeem', () => {
  beforeEach(() => {
    toasterCreate.mockClear();
  });

  it('shows success toast and updates me balance on redeem', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(queryKeys.me(), mockUser);
    queryClient.setQueryData(
      queryKeys.rewards.catalog(
        DEFAULT_REWARD_FILTERS,
        mockUser.balance,
        1,
        REWARDS_CATALOG_LIMIT
      ),
      mockRewardsPaginated
    );
    queryClient.setQueryData(queryKeys.rewards.redemptions(), []);

    const { result } = renderHook(() => useRedeem(), {
      wrapper: createTestWrapper(queryClient),
    });

    await act(() => {
      result.current.mutate({ rewardId: mockReward.id });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toasterCreate).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success', title: 'Redeemed!' })
    );
    const me = queryClient.getQueryData<User>(queryKeys.me());
    expect(me?.balance).toBe(mockUser.balance - mockRedemption.pointsSpent);
    const history = queryClient.getQueryData<Array<unknown>>(
      queryKeys.rewards.redemptions()
    );
    expect(history?.length).toBeGreaterThanOrEqual(1);
  });

  it('handles 409 out of stock with dedicated toast', async () => {
    server.use(
      http.post(`${BASE}/rewards/redeem`, () =>
        HttpResponse.json(
          { message: 'Reward is out of stock' },
          { status: 409 }
        )
      )
    );
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const stockReward: Reward = { ...mockReward, id: 'reward-stock' };
    queryClient.setQueryData(['rewards', 'seed'], [stockReward]);

    const { result } = renderHook(() => useRedeem(), {
      wrapper: createTestWrapper(queryClient),
    });

    await act(() => {
      result.current.mutate({ rewardId: 'reward-stock' });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toasterCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Out of stock' })
    );
  });

  it('reads conflict message from nested response data on 409', async () => {
    server.use(
      http.post(`${BASE}/rewards/redeem`, () =>
        HttpResponse.json(
          { data: { message: 'Another user claimed it' } },
          { status: 409 }
        )
      )
    );
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useRedeem(), {
      wrapper: createTestWrapper(queryClient),
    });
    await act(() => {
      result.current.mutate({ rewardId: mockReward.id });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toasterCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Redemption conflict' })
    );
  });

  it('only patches matching reward in admin list on success', async () => {
    const other: Reward = {
      ...mockReward,
      id: 'reward-2',
      name: 'Mug',
      quantityRedeemed: 0,
      claimed: 0,
      remaining: 50,
      total: 50,
    };
    const redemption: Redemption = {
      ...mockRedemption,
      reward: {
        ...mockReward,
        quantityRedeemed: 11,
        claimed: 11,
        remaining: 89,
      },
    };
    const redeemSpy = vi
      .spyOn(rewardsService, 'redeemReward')
      .mockResolvedValueOnce(redemption);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    queryClient.setQueryData(queryKeys.rewards.admin(), [mockReward, other]);
    queryClient.setQueryData(queryKeys.rewards.redemptions(), []);

    const { result } = renderHook(() => useRedeem(), {
      wrapper: createTestWrapper(queryClient),
    });
    await act(() => {
      result.current.mutate({ rewardId: mockReward.id });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const adminList = queryClient.getQueryData<Array<Reward>>(
      queryKeys.rewards.admin()
    );
    expect(
      adminList?.find((r) => r.id === mockReward.id)?.quantityRedeemed
    ).toBe(11);
    expect(adminList?.find((r) => r.id === 'reward-2')?.quantityRedeemed).toBe(
      0
    );
    redeemSpy.mockRestore();
  });

  it('shows redemption conflict toast on 409 without out-of-stock message', async () => {
    server.use(
      http.post(`${BASE}/rewards/redeem`, () =>
        HttpResponse.json({ message: 'Concurrent redemption' }, { status: 409 })
      )
    );
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useRedeem(), {
      wrapper: createTestWrapper(queryClient),
    });
    await act(() => {
      result.current.mutate({ rewardId: mockReward.id });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toasterCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Redemption conflict' })
    );
  });

  it('updates admin reward list quantity from API when redemption reward has higher redeemed count', async () => {
    const redemption: Redemption = {
      ...mockRedemption,
      reward: {
        ...mockReward,
        quantityRedeemed: 55,
        claimed: 55,
        remaining: 45,
      },
    };
    const redeemSpy = vi
      .spyOn(rewardsService, 'redeemReward')
      .mockResolvedValueOnce(redemption);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    queryClient.setQueryData(queryKeys.rewards.admin(), [mockReward]);
    queryClient.setQueryData(queryKeys.rewards.redemptions(), []);

    const { result } = renderHook(() => useRedeem(), {
      wrapper: createTestWrapper(queryClient),
    });
    await act(() => {
      result.current.mutate({ rewardId: mockReward.id });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const adminList = queryClient.getQueryData<Array<Reward>>(
      queryKeys.rewards.admin()
    );
    expect(adminList?.[0]?.quantityRedeemed).toBe(55);
    redeemSpy.mockRestore();
  });

  it('increments redeemed count when API value is not higher than cached (admin list)', async () => {
    const redemption: Redemption = {
      ...mockRedemption,
      reward: {
        ...mockReward,
        quantityRedeemed: 5,
        claimed: 5,
        remaining: 95,
      },
    };
    const redeemSpy = vi
      .spyOn(rewardsService, 'redeemReward')
      .mockResolvedValueOnce(redemption);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    queryClient.setQueryData(queryKeys.rewards.admin(), [mockReward]);
    queryClient.setQueryData(queryKeys.rewards.redemptions(), []);

    const { result } = renderHook(() => useRedeem(), {
      wrapper: createTestWrapper(queryClient),
    });
    await act(() => {
      result.current.mutate({ rewardId: mockReward.id });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const adminList = queryClient.getQueryData<Array<Reward>>(
      queryKeys.rewards.admin()
    );
    expect(adminList?.[0]?.quantityRedeemed).toBe(11);
    redeemSpy.mockRestore();
  });

  it('does not set me when me cache is absent on success', async () => {
    const redeemSpy = vi
      .spyOn(rewardsService, 'redeemReward')
      .mockResolvedValueOnce(mockRedemption);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    queryClient.setQueryData(
      queryKeys.rewards.catalog(
        DEFAULT_REWARD_FILTERS,
        mockUser.balance,
        1,
        REWARDS_CATALOG_LIMIT
      ),
      mockRewardsPaginated
    );
    queryClient.setQueryData(queryKeys.rewards.redemptions(), []);

    const { result } = renderHook(() => useRedeem(), {
      wrapper: createTestWrapper(queryClient),
    });
    await act(() => {
      result.current.mutate({ rewardId: mockReward.id });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(queryKeys.me())).toBeUndefined();
    redeemSpy.mockRestore();
  });

  it('shows generic error toast when redeem rejects (non-409 path)', async () => {
    const redeemSpy = vi
      .spyOn(rewardsService, 'redeemReward')
      .mockRejectedValueOnce(new Error('Network down'));

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useRedeem(), {
      wrapper: createTestWrapper(queryClient),
    });
    await act(() => {
      result.current.mutate({ rewardId: mockReward.id });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toasterCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Redemption failed' })
    );
    redeemSpy.mockRestore();
  });
});
