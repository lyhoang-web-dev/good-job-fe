import { Badge, Box, Table, Text } from '@chakra-ui/react';

import type { Redemption } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils/format/relative-time';

const statusTone = (s: Redemption['status']) => {
  if (s === 'pending') {
    return 'yellow';
  }
  if (s === 'completed') {
    return 'green';
  }
  return 'red';
};

type RedemptionHistoryProps = {
  rows: Array<Redemption>;
};

export function RedemptionHistory({ rows }: RedemptionHistoryProps) {
  if (rows.length === 0) {
    return (
      <Box paddingY={8}>
        <Text color="fg.muted" textAlign="center">
          No redemptions yet
        </Text>
      </Box>
    );
  }

  return (
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
        {rows.map((r) => (
          <Table.Row key={r.id}>
            <Table.Cell>{r.reward.name}</Table.Cell>
            <Table.Cell>{r.pointsSpent}</Table.Cell>
            <Table.Cell>{formatRelativeTime(r.createdAt)}</Table.Cell>
            <Table.Cell>
              <Badge colorPalette={statusTone(r.status)}>{r.status}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
