import { useInfiniteQuery } from '@tanstack/react-query';

import { kudosService } from '@/lib/services/kudos';
import { queryKeys } from '@/lib/services/queryKeys';

export function useKudoFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.kudos.feed(),
    queryFn: ({ pageParam }) => kudosService.getKudos(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
