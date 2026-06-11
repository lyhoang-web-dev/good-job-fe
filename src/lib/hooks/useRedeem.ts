import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { toaster } from '@/lib/components/ui/toaster';
import { queryKeys } from '@/lib/services/queryKeys';
import { rewardsService } from '@/lib/services/rewards';
import type { Redemption, Reward, User } from '@/lib/types';
import { getErrorMessage } from '@/lib/types/api';

function redeemConflictMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return '';
  }
  const raw = error.response?.data;
  if (typeof raw !== 'object' || raw === null) {
    return '';
  }
  const top = (raw as { message?: unknown }).message;
  if (typeof top === 'string' && top.length > 0) {
    return top;
  }
  const nested = (raw as { data?: { message?: unknown } }).data?.message;
  if (typeof nested === 'string' && nested.length > 0) {
    return nested;
  }
  return '';
}

function applySuccessfulRedemption(
  list: Array<Reward> | undefined,
  redemption: Redemption
): Array<Reward> | undefined {
  if (!Array.isArray(list)) {
    return list;
  }
  const patch = redemption.reward;
  return list.map((r) => {
    if (r.id !== patch.id) {
      return r;
    }
    const total = patch.quantityTotal ?? r.quantityTotal;
    const apiRedeemed = patch.quantityRedeemed;
    const nextRedeemed =
      typeof apiRedeemed === 'number' && apiRedeemed > r.quantityRedeemed
        ? apiRedeemed
        : r.quantityRedeemed + 1;
    const nextRemaining = Math.max(0, total - nextRedeemed);

    return {
      ...r,
      ...patch,
      quantityTotal: total,
      quantityRedeemed: nextRedeemed,
      claimed: patch.claimed ?? nextRedeemed,
      total: patch.total ?? total,
      remaining: nextRemaining,
    };
  });
}

export function useRedeem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rewardId }: { rewardId: string }) =>
      rewardsService.redeemReward(rewardId),
    onSuccess: (redemption: Redemption) => {
      queryClient.setQueriesData<Array<Reward>>(
        { queryKey: queryKeys.rewards.all() },
        (old) => applySuccessfulRedemption(old, redemption)
      );

      queryClient.setQueryData<User>(queryKeys.me(), (old) =>
        old
          ? {
              ...old,
              balance: old.balance - redemption.pointsSpent,
            }
          : old
      );

      queryClient.setQueryData<Array<Redemption>>(
        queryKeys.rewards.redemptions(),
        (old) => (old ? [redemption, ...old] : [redemption])
      );

      toaster.create({
        type: 'success',
        title: 'Redeemed!',
        description: 'Your reward has been claimed.',
        duration: 3000,
      });
    },
    onError: (error, variables) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const msg = redeemConflictMessage(error).toLowerCase();

        if (msg.includes('out of stock')) {
          queryClient.setQueriesData<Array<Reward>>(
            { queryKey: queryKeys.rewards.all() },
            (old) =>
              Array.isArray(old)
                ? old.map((r) =>
                    r.id === variables.rewardId
                      ? {
                          ...r,
                          remaining: 0,
                          quantityRedeemed: r.quantityTotal,
                          claimed: r.total,
                        }
                      : r
                  )
                : old
          );
          toaster.create({
            type: 'error',
            title: 'Out of stock',
            description: 'This reward has just run out. Please choose another.',
            duration: 5000,
          });
          return;
        }

        toaster.create({
          type: 'error',
          title: 'Redemption conflict',
          description: 'Please try again.',
          duration: 5000,
        });
        return;
      }

      toaster.create({
        type: 'error',
        title: 'Redemption failed',
        description: getErrorMessage(error),
        duration: 5000,
      });
    },
  });
}
