import type {
  CreateRewardPayload,
  PaginatedRewards,
  Redemption,
  Reward,
} from '@/lib/types';
import type { RewardFilters } from '@/lib/types/reward-filters';

import api from './api';
import { buildRewardsCatalogParams } from './rewards-catalog-params';

export type { CreateRewardPayload } from '@/lib/types';

export const rewardsService = {
  getRewards: async (
    filters?: Partial<RewardFilters>,
    userBalance?: number,
    page = 1,
    limit = 12
  ): Promise<PaginatedRewards> => {
    const { data } = await api.get<PaginatedRewards>('/rewards', {
      params: buildRewardsCatalogParams(filters, userBalance, page, limit),
    });
    return data;
  },

  getRewardsAdmin: async (): Promise<Array<Reward>> => {
    const { data } = await api.get<Array<Reward> | PaginatedRewards>(
      '/rewards',
      {
        params: { all: 'true' },
      }
    );
    if (Array.isArray(data)) {
      return data;
    }
    return data.data ?? [];
  },

  redeemReward: async (rewardId: string) => {
    const { data } = await api.post<Redemption>('/rewards/redeem', {
      rewardId,
    });
    return data;
  },

  getRedemptionHistory: async () => {
    const { data } = await api.get<Array<Redemption>>('/rewards/redemptions');
    return data;
  },

  createReward: async (payload: CreateRewardPayload) => {
    const { data } = await api.post<Reward>('/rewards', payload);
    return data;
  },

  patchReward: async (
    id: string,
    patch: Partial<CreateRewardPayload> & { isActive?: boolean }
  ) => {
    const { data } = await api.patch<Reward>(`/rewards/${id}`, patch);
    return data;
  },
};
