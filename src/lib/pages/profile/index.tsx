import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
  Box,
  Flex,
  Heading,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';

import { KudoCard } from '@/lib/components/kudos/card/KudoCard';
import { KudoCardSkeleton } from '@/lib/components/kudos/card/KudoCardSkeleton';
import { BudgetWidget } from '@/lib/components/layout/BudgetWidget';
import { ProfilePageSkeleton } from '@/lib/components/layout/PageSkeleton';
import { useMe } from '@/lib/hooks/useMe';
import { kudosService } from '@/lib/services/kudos';
import { queryKeys } from '@/lib/services/queryKeys';
import { usersService } from '@/lib/services/users';

type ProfilePageProps = {
  userId: string;
};

export default function ProfilePage({ userId }: ProfilePageProps) {
  const { data: me } = useMe();
  const profileQuery = useQuery({
    queryKey: queryKeys.users.user(userId),
    queryFn: () => usersService.getUser(userId),
    enabled: Boolean(userId),
  });

  const received = useQuery({
    queryKey: queryKeys.kudos.userList(userId, 'received'),
    queryFn: () => kudosService.getKudosForUser(userId, 'received'),
    enabled: Boolean(userId),
  });

  const sent = useQuery({
    queryKey: queryKeys.kudos.userList(userId, 'sent'),
    queryFn: () => kudosService.getKudosForUser(userId, 'sent'),
    enabled: Boolean(userId),
  });

  const user = profileQuery.data ?? (me?.id === userId ? me : undefined);
  const isSelf = me?.id === userId;
  const currentUserId = me?.id ?? '';

  if (profileQuery.isError) {
    return <Text>User not found</Text>;
  }

  if (!user && (profileQuery.isLoading || !userId)) {
    return <ProfilePageSkeleton />;
  }

  if (!user) {
    return <Text>User not found</Text>;
  }

  return (
    <VStack align="stretch" gap={6}>
      <Flex align="center" gap={4} wrap="wrap">
        <AvatarRoot size="lg">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback name={user.name} />
        </AvatarRoot>
        <Box>
          <Heading size="lg">{user.name}</Heading>
          <Text color="fg.muted">Balance: {user.balance} pts</Text>
        </Box>
      </Flex>
      {isSelf && (
        <Box maxWidth="240px">
          <BudgetWidget />
        </Box>
      )}
      <Tabs.Root defaultValue="received">
        <Tabs.List>
          <Tabs.Trigger value="received">Received</Tabs.Trigger>
          <Tabs.Trigger value="sent">Sent</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="received">
          <VStack align="stretch" gap={4} paddingTop={4}>
            {received.isLoading && (
              <Flex direction="column" gap={4}>
                <KudoCardSkeleton />
                <KudoCardSkeleton />
              </Flex>
            )}
            {received.data?.map((k) => (
              <KudoCard currentUserId={currentUserId} key={k.id} kudo={k} />
            ))}
          </VStack>
        </Tabs.Content>
        <Tabs.Content value="sent">
          <VStack align="stretch" gap={4} paddingTop={4}>
            {sent.isLoading && (
              <Flex direction="column" gap={4}>
                <KudoCardSkeleton />
                <KudoCardSkeleton />
              </Flex>
            )}
            {sent.data?.map((k) => (
              <KudoCard currentUserId={currentUserId} key={k.id} kudo={k} />
            ))}
          </VStack>
        </Tabs.Content>
      </Tabs.Root>
    </VStack>
  );
}
