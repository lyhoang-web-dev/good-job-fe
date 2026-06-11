import { Flex, Text } from '@chakra-ui/react';

export const Footer = () => {
  return (
    <Flex
      align="center"
      as="footer"
      bg="surface.elevated"
      borderColor="border.subtle"
      borderTop="1px solid"
      bottom={0}
      justifyContent="center"
      left={0}
      paddingBottom="max(0.75rem, env(safe-area-inset-bottom, 0px))"
      paddingTop={3}
      position="fixed"
      right={0}
      width="full"
      zIndex="docked"
    >
      <Text color="fg.muted" fontSize="xs">
        Good Job · {new Date().getFullYear()}
      </Text>
    </Flex>
  );
};
