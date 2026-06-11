import { Box } from '@chakra-ui/react';

export function RewardCardSkeleton() {
  return (
    <Box
      borderColor="border.subtle"
      borderRadius="xl"
      borderWidth="1px"
      className="gj-pagination-skeleton"
      padding={5}
    >
      <Box
        background="gray.200"
        borderRadius="md"
        height="24px"
        marginBottom={3}
        width="60%"
      />
      <Box
        background="gray.200"
        borderRadius="md"
        height="14px"
        marginBottom={2}
        width="80%"
      />
      <Box
        background="gray.200"
        borderRadius="md"
        height="14px"
        marginBottom={4}
        width="50%"
      />
      <Box
        background="gray.200"
        borderRadius="full"
        height="32px"
        width="100%"
      />
    </Box>
  );
}
