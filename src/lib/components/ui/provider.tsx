import { ChakraProvider } from '@chakra-ui/react';

import { theme } from '@/lib/styles/theme';

export function Provider(props: React.PropsWithChildren) {
  return <ChakraProvider value={theme}>{props.children}</ChakraProvider>;
}
