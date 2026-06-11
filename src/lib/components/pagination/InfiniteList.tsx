import { Box, Button, Center, Flex, Spinner, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import { usePaginationObserver } from '@/lib/components/pagination/usePaginationObserver';

export type InfiniteListProps<T> = {
  items: Array<T>;
  renderItem: (item: T, index: number) => ReactNode;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isLoading?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
  renderSkeleton?: () => ReactNode;
  skeletonCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  /** When set, replaces the default empty state (e.g. CTA). */
  renderEmpty?: () => ReactNode;
  gap?: number | string;
  rootMargin?: string;
};

function DefaultSkeleton() {
  return (
    <Box
      borderColor="border.subtle"
      borderRadius="xl"
      borderWidth="1px"
      className="gj-pagination-skeleton"
      height="120px"
    />
  );
}

export function InfiniteList<T>({
  items,
  renderItem,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading = false,
  isEmpty = false,
  isError = false,
  onRetry,
  isRetrying = false,
  renderSkeleton,
  skeletonCount = 3,
  emptyTitle = 'Nothing here yet',
  emptyDescription = '',
  renderEmpty,
  gap = 4,
  rootMargin = '100px',
}: InfiniteListProps<T>) {
  const sentinelRef = usePaginationObserver({
    onIntersect: fetchNextPage,
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    rootMargin,
    observationKey: items.length,
  });

  if (isLoading) {
    return (
      <Flex direction="column" gap={gap}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Box key={`sk-${String(i)}`}>
            {renderSkeleton ? renderSkeleton() : <DefaultSkeleton />}
          </Box>
        ))}
      </Flex>
    );
  }

  if (isError) {
    return (
      <Center flexDirection="column" gap={3} minHeight="200px" paddingY={12}>
        <Text color="fg.muted" fontSize="sm">
          Failed to load. Please try again.
        </Text>
        {onRetry ? (
          <Button
            loading={isRetrying}
            onClick={onRetry}
            size="sm"
            variant="outline"
          >
            Retry
          </Button>
        ) : null}
      </Center>
    );
  }

  if (isEmpty || items.length === 0) {
    if (renderEmpty) {
      return <>{renderEmpty()}</>;
    }
    return (
      <Center flexDirection="column" gap={2} minHeight="200px" paddingY={12}>
        <Text color="fg.muted" fontSize="2xl">
          ◎
        </Text>
        <Text color="fg.muted" fontSize="sm" fontWeight="medium">
          {emptyTitle}
        </Text>
        {emptyDescription ? (
          <Text color="fg.muted" fontSize="xs" textAlign="center">
            {emptyDescription}
          </Text>
        ) : null}
      </Center>
    );
  }

  return (
    <Flex direction="column" gap={gap}>
      {items.map((item, index) => renderItem(item, index))}
      <Box height="1px" ref={sentinelRef} />
      {isFetchingNextPage ? (
        <Flex justify="center" paddingY={4}>
          <Spinner size="sm" />
        </Flex>
      ) : null}
      {!hasNextPage && items.length > 0 ? (
        <Center paddingY={4}>
          <Text color="fg.muted" fontSize="xs">
            You&apos;ve seen everything
          </Text>
        </Center>
      ) : null}
    </Flex>
  );
}
