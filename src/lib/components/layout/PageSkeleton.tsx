import {
  Box,
  Flex,
  Grid,
  Skeleton,
  SkeletonCircle,
  Stack,
  Table,
  VStack,
} from '@chakra-ui/react';

import { KudoCardSkeleton } from '@/lib/components/kudos/card/KudoCardSkeleton';

/** Khi TanStack Router đang lazy-load chunk route. */
export function RoutePendingSkeleton() {
  return (
    <VStack align="stretch" gap={6} maxWidth="720px" paddingY={2} width="full">
      <Skeleton borderRadius="md" height="10" maxWidth="240px" />
      <Flex direction="column" gap={4}>
        <KudoCardSkeleton />
        <KudoCardSkeleton />
        <KudoCardSkeleton />
      </Flex>
    </VStack>
  );
}

export function RewardsCatalogGridSkeleton() {
  return (
    <Grid
      gap={4}
      templateColumns={{
        base: '1fr',
        md: 'repeat(2, 1fr)',
        lg: 'repeat(3, 1fr)',
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Box
          borderRadius="card"
          borderWidth="1px"
          key={`reward-skel-${String(i)}`}
          padding={6}
        >
          <Skeleton aspectRatio={4 / 3} borderRadius="md" width="full" />
          <Stack gap={3} marginTop={4}>
            <Skeleton height="5" marginX="auto" width="60%" />
            <Skeleton height="4" marginX="auto" width="40%" />
            <Skeleton height="10" marginTop={2} width="full" />
          </Stack>
        </Box>
      ))}
    </Grid>
  );
}

export function RewardsRedemptionHistorySkeleton() {
  return (
    <VStack align="stretch" gap={3}>
      <Skeleton borderRadius="md" height="8" maxWidth="280px" />
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Reward</Table.ColumnHeader>
            <Table.ColumnHeader>Points</Table.ColumnHeader>
            <Table.ColumnHeader>Date</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Array.from({ length: 4 }).map((_, i) => (
            <Table.Row key={`red-skel-${String(i)}`}>
              <Table.Cell>
                <Skeleton height="4" width="70%" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton height="4" width="40px" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton height="4" width="80px" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton height="6" width="72px" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </VStack>
  );
}

export function RewardsPageSkeleton() {
  return (
    <VStack align="stretch" gap={10} width="full">
      <Skeleton borderRadius="md" height="10" maxWidth="180px" />
      <RewardsCatalogGridSkeleton />
      <RewardsRedemptionHistorySkeleton />
    </VStack>
  );
}

export function ProfilePageSkeleton() {
  return (
    <VStack align="stretch" gap={6} width="full">
      <Flex align="center" gap={4} wrap="wrap">
        <SkeletonCircle boxSize="16" />
        <Box flex={1} minWidth="200px">
          <Skeleton height="8" marginBottom={2} maxWidth="240px" />
          <Skeleton height="4" maxWidth="160px" />
        </Box>
      </Flex>
      <Skeleton borderRadius="md" height="24" maxWidth="260px" />
      <Stack gap={2}>
        <Flex gap={2}>
          <Skeleton height="10" width="100px" />
          <Skeleton height="10" width="80px" />
        </Flex>
        <Flex direction="column" gap={4} paddingTop={4}>
          <KudoCardSkeleton />
          <KudoCardSkeleton />
        </Flex>
      </Stack>
    </VStack>
  );
}

export function AdminRewardsPageSkeleton() {
  return (
    <VStack align="stretch" gap={6} width="full">
      <Flex align="center" flexWrap="wrap" gap={4} justify="space-between">
        <Skeleton height="9" maxWidth="220px" width="40%" />
        <Skeleton height="10" maxWidth="120px" width="120px" />
      </Flex>
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Points</Table.ColumnHeader>
            <Table.ColumnHeader>Active</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Array.from({ length: 6 }).map((_, i) => (
            <Table.Row key={`adm-skel-${String(i)}`}>
              <Table.Cell>
                <Skeleton height="4" width="55%" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton height="4" width="48px" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton height="8" width="64px" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </VStack>
  );
}
