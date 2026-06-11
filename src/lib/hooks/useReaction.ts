import type { InfiniteData } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { kudosService } from '@/lib/services/kudos';
import { queryKeys } from '@/lib/services/queryKeys';
import type { Kudo, PaginatedResponse, User } from '@/lib/types';

function isUserKudosQueryKey(key: ReadonlyArray<unknown>): boolean {
  return key[0] === 'kudos' && key[1] === 'user';
}

export function useReaction(kudoId: string, currentUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      emoji,
      isReacted,
    }: {
      emoji: string;
      isReacted: boolean;
    }) =>
      isReacted
        ? kudosService.unreactKudo(kudoId, emoji)
        : kudosService.reactToKudo(kudoId, emoji),

    onMutate: async ({ emoji, isReacted }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.kudos.all() });

      const previousFeed = queryClient.getQueryData<
        InfiniteData<PaginatedResponse<Kudo>>
      >(queryKeys.kudos.feed());

      const me = queryClient.getQueryData<User>(queryKeys.me());
      const reactionUser: User =
        me ??
        ({
          id: currentUserId,
          email: '',
          name: 'You',
          role: 'user',
          balance: 0,
        } satisfies User);

      const patchKudo = (kudo: Kudo): Kudo => {
        if (kudo.id !== kudoId) {
          return kudo;
        }
        return {
          ...kudo,
          reactions: isReacted
            ? kudo.reactions.filter(
                (r) => !(r.emoji === emoji && r.user.id === currentUserId)
              )
            : [
                ...kudo.reactions,
                {
                  id: `temp-${String(Date.now())}`,
                  emoji,
                  user: reactionUser,
                },
              ],
        };
      };

      queryClient.setQueryData(
        queryKeys.kudos.feed(),
        (old: InfiniteData<PaginatedResponse<Kudo>> | undefined) => {
          if (!old) {
            return old;
          }
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map(patchKudo),
            })),
          };
        }
      );

      queryClient.setQueriesData<Array<Kudo>>(
        {
          predicate: (q) => isUserKudosQueryKey(q.queryKey),
        },
        (old) => {
          if (!Array.isArray(old)) {
            return old;
          }
          return old.map(patchKudo);
        }
      );

      return { previousFeed };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(queryKeys.kudos.feed(), context.previousFeed);
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.kudos.all() });
    },
  });
}
