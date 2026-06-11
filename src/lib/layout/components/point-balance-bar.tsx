import { Box, Flex, Text } from '@chakra-ui/react';

import { useMe } from '@/lib/hooks/useMe';

export function PointBalanceBar() {
  const { data: me, isLoading } = useMe();

  if (!(me || isLoading)) {
    return null;
  }

  return (
    <Box
      bg="surface.cream"
      borderBottom="1px solid"
      borderColor="rgba(26, 26, 46, 0.06)"
      paddingX={{ base: 4, md: 6 }}
      paddingY={2}
      width="full"
    >
      <Flex justify="flex-end" width="full">
        {me ? (
          <Text fontSize="sm">
            <Box as="span" color="fg.muted" fontWeight="medium">
              Point balance
            </Box>{' '}
            <Box as="span" fontFamily="mono" fontWeight="semibold">
              {me.balance}
            </Box>
            <Box as="span" color="fg.muted" fontSize="xs">
              {' '}
              pts
            </Box>
          </Text>
        ) : (
          <Text color="fg.muted" fontSize="sm">
            …
          </Text>
        )}
      </Flex>
    </Box>
  );
}
