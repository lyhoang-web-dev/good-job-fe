import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/services/queryKeys';
import type { GivingBudget, Kudo, PaginatedResponse } from '@/lib/types';

export function bumpCommentsCountForKudo(
  queryClient: QueryClient,
  kudoId: string
): void {
  const bump = (k: Kudo) =>
    k.id === kudoId ? { ...k, commentsCount: k.commentsCount + 1 } : k;

  queryClient.setQueryData<InfiniteData<PaginatedResponse<Kudo>>>(
    queryKeys.kudos.feed(),
    (old) => {
      if (!old) {
        return old;
      }
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map(bump),
        })),
      };
    }
  );

  queryClient.setQueriesData<Array<Kudo>>(
    { queryKey: [...queryKeys.kudos.all(), 'user'] },
    (old) => {
      if (!Array.isArray(old)) {
        return old;
      }
      return old.map(bump);
    }
  );
}

export function prependKudoToFeedCache(
  queryClient: QueryClient,
  kudo: Kudo
): void {
  queryClient.setQueryData<InfiniteData<PaginatedResponse<Kudo>>>(
    queryKeys.kudos.feed(),
    (old) => {
      if (!old?.pages?.length) {
        return {
          pageParams: [undefined],
          pages: [{ data: [kudo], hasMore: false }],
        };
      }
      const [firstPage, ...rest] = old.pages;
      const withoutDup = firstPage.data.filter((k) => k.id !== kudo.id);
      return {
        ...old,
        pages: [{ ...firstPage, data: [kudo, ...withoutDup] }, ...rest],
      };
    }
  );
}

export function prependKudoToUserListIfLoaded(
  queryClient: QueryClient,
  userId: string,
  tab: 'received' | 'sent',
  kudo: Kudo
): void {
  queryClient.setQueryData<Array<Kudo>>(
    queryKeys.kudos.userList(userId, tab),
    (old) => {
      if (!Array.isArray(old)) {
        return old;
      }
      return [kudo, ...old.filter((k) => k.id !== kudo.id)];
    }
  );
}

export function applySendKudoSuccessToCache(
  queryClient: QueryClient,
  kudo: Kudo
): void {
  prependKudoToFeedCache(queryClient, kudo);
  prependKudoToUserListIfLoaded(
    queryClient,
    kudo.receiver.id,
    'received',
    kudo
  );
  prependKudoToUserListIfLoaded(queryClient, kudo.sender.id, 'sent', kudo);
}

export function adjustGivingBudgetAfterSend(
  queryClient: QueryClient,
  points: number
): void {
  queryClient.setQueryData<GivingBudget>(
    queryKeys.users.givingBudget(),
    (old) => {
      if (!old) {
        return old;
      }
      return {
        ...old,
        usedPoints: old.usedPoints + points,
        remaining: Math.max(0, old.remaining - points),
      };
    }
  );
}

export function updateKudoReactionsInCache(
  queryClient: QueryClient,
  kudoId: string,
  reactions: Kudo['reactions']
) {
  queryClient.setQueryData<InfiniteData<PaginatedResponse<Kudo>>>(
    queryKeys.kudos.feed(),
    (old) => {
      if (!old) {
        return old;
      }
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((k) =>
            k.id === kudoId ? { ...k, reactions } : k
          ),
        })),
      };
    }
  );
}
