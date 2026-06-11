import { Box } from '@chakra-ui/react';
import { useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { GiveKudoProvider } from '@/lib/components/kudos/GiveKudoProvider';

import { Footer } from './components/footer';
import { Header } from './components/header';
import { Meta } from './components/meta';
import { PointBalanceBar } from './components/point-balance-bar';
import { MAIN_SCROLL_PADDING_BOTTOM } from './fixed-bottom';

type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = pathname === '/login';

  return (
    <>
      <Meta />
      <GiveKudoProvider showFab={!isLogin}>
        {isLogin ? (
          <Box as="main" minHeight="100dvh" width="full">
            {children}
          </Box>
        ) : (
          <Box bg="#FAFAF8" minHeight="100dvh" width="full">
            <Box position="sticky" top={0} width="full" zIndex="sticky">
              <PointBalanceBar />
              <Header />
            </Box>
            <Box
              as="main"
              className="gj-page"
              marginX="auto"
              maxWidth="720px"
              paddingBottom={MAIN_SCROLL_PADDING_BOTTOM}
              paddingTop={6}
              paddingX={4}
              width="full"
            >
              {children}
            </Box>
            <Footer />
          </Box>
        )}
      </GiveKudoProvider>
    </>
  );
};
