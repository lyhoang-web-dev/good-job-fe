import { Box, Text, VStack } from '@chakra-ui/react';

import { useGivingBudget } from '@/lib/hooks/useGivingBudget';

function nextResetLabel(): string {
  const next = new Date();
  next.setMonth(next.getMonth() + 1, 1);
  return next.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  });
}

type BudgetWidgetProps = {
  variant?: 'default' | 'compact';
};

export function BudgetWidget({ variant = 'default' }: BudgetWidgetProps) {
  const { used, total, remaining, percentage, isLoading } = useGivingBudget();

  let fillClass = 'gj-budget-danger';
  if (percentage < 50) {
    fillClass = 'gj-budget-ok';
  } else if (percentage <= 80) {
    fillClass = 'gj-budget-warning';
  }

  if (isLoading) {
    return (
      <Box>
        <Text color="fg.muted" fontSize="sm">
          Loading budget…
        </Text>
      </Box>
    );
  }

  if (variant === 'compact') {
    return (
      <VStack align="stretch" gap={1}>
        <Text color="fg.muted" fontSize="xs" fontWeight="medium">
          This month&apos;s giving
        </Text>
        <Box className="gj-budget-track">
          <Box
            className={`gj-budget-fill ${fillClass}`}
            width={`${percentage}%`}
          />
        </Box>
        <Text fontFamily="mono" fontSize="xs">
          {used}/{total} · {remaining} left
        </Text>
      </VStack>
    );
  }

  return (
    <VStack
      align="stretch"
      bg="brand.cream"
      borderColor="border.subtle"
      borderRadius="card"
      borderWidth="1px"
      gap={3}
      padding={4}
      width="full"
    >
      <Text fontSize="sm" fontWeight="medium">
        This month&apos;s giving
      </Text>
      <Box className="gj-budget-track">
        <Box
          className={`gj-budget-fill ${fillClass}`}
          width={`${percentage}%`}
        />
      </Box>
      <Text fontFamily="mono" fontSize="sm">
        {used} / {total} — {remaining} remaining
      </Text>
      <Text color="fg.muted" fontSize="xs">
        Resets {nextResetLabel()}
      </Text>
    </VStack>
  );
}
