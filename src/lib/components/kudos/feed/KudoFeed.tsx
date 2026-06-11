import { Button, Center, Flex, Text } from '@chakra-ui/react';

import { KudoCard } from '@/lib/components/kudos/card/KudoCard';
import { KudoCardSkeleton } from '@/lib/components/kudos/card/KudoCardSkeleton';
import { InfiniteList } from '@/lib/components/pagination';
import { useKudoFeed } from '@/lib/hooks/useKudoFeed';
import { useMe } from '@/lib/hooks/useMe';

type KudoFeedProps = {
  onGiveKudo?: () => void;
};

export function KudoFeed({ onGiveKudo }: KudoFeedProps) {
  const { data: me } = useMe();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useKudoFeed();

  const kudos = data?.pages.flatMap((p) => p.data) ?? [];
  const currentUserId = me?.id ?? '';

  if (isPending && !data) {
    return (
      <Flex direction="column" gap={4}>
        <KudoCardSkeleton />
        <KudoCardSkeleton />
        <KudoCardSkeleton />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Center flexDirection="column" gap={3} minHeight="200px">
        <Text color="fg.muted" fontSize="sm">
          Failed to load feed
        </Text>
        <Button
          loading={isFetching}
          onClick={() => {
            refetch().catch(() => undefined);
          }}
          size="sm"
          variant="outline"
        >
          Retry
        </Button>
      </Center>
    );
  }

  return (
    <InfiniteList
      fetchNextPage={() => {
        fetchNextPage().catch(() => undefined);
      }}
      gap={4}
      hasNextPage={Boolean(hasNextPage)}
      isError={false}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={false}
      items={kudos}
      renderEmpty={
        onGiveKudo
          ? () => (
              <Center
                className="gj-empty"
                flexDirection="column"
                minHeight="280px"
                padding={8}
              >
                <Text as="h2" className="gj-empty-title" marginBottom={2}>
                  Be the first to spread some joy
                </Text>
                <Text
                  color="fg.muted"
                  fontSize="sm"
                  marginBottom={6}
                  maxWidth="sm"
                  textAlign="center"
                >
                  Recognize someone who made a difference — it only takes a
                  moment.
                </Text>
                <Button
                  _hover={{ bg: 'brand.inkHover' }}
                  bg="brand.ink"
                  borderRadius="full"
                  color="white"
                  fontWeight="semibold"
                  onClick={onGiveKudo}
                  paddingX={6}
                >
                  Give a Kudo →
                </Button>
              </Center>
            )
          : undefined
      }
      renderItem={(kudo) => (
        <KudoCard currentUserId={currentUserId} key={kudo.id} kudo={kudo} />
      )}
      rootMargin="200px"
    />
  );
}
