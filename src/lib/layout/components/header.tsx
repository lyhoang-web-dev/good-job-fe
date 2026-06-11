import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  Heading,
  IconButton,
  Portal,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { LuMenu } from 'react-icons/lu';

import { BudgetWidget } from '@/lib/components/layout/BudgetWidget';
import { NotificationBell } from '@/lib/components/layout/NotificationBell';
import { useLogout } from '@/lib/hooks/useLogout';
import { useMe } from '@/lib/hooks/useMe';

const navLink = { className: 'gj-nav-link' };

export const Header = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onLogin = pathname === '/login';
  const { data: me } = useMe({ enabled: !onLogin });
  const [menuOpen, setMenuOpen] = useState(false);
  const logout = useLogout();

  const closeMenu = () => setMenuOpen(false);

  return (
    <Flex
      align="center"
      as="header"
      bg="surface.elevated"
      borderBottom="1px solid"
      borderColor="border.subtle"
      gap={3}
      justify="space-between"
      minHeight="64px"
      paddingX={{ base: 4, md: 6 }}
      paddingY={3}
      width="full"
      wrap="nowrap"
    >
      <Flex align="center" flex="1" gap={{ base: 3, md: 8 }} minWidth={0}>
        <Box display={{ base: 'block', md: 'none' }} flexShrink={0}>
          <IconButton
            aria-label="Open navigation menu"
            onClick={() => setMenuOpen(true)}
            size="sm"
            variant="ghost"
          >
            <LuMenu size={22} />
          </IconButton>
        </Box>
        <RouterLink to="/feed">
          <Heading
            as="span"
            color="brand.ink"
            fontFamily="heading"
            fontSize={{ base: 'lg', md: 'xl' }}
            fontStyle="italic"
            fontWeight="semibold"
            letterSpacing="-0.02em"
          >
            Good Job
          </Heading>
        </RouterLink>
        <Flex
          align="center"
          display={{ base: 'none', md: 'flex' }}
          flexWrap="wrap"
          gap={{ base: 3, md: 5 }}
        >
          <RouterLink to="/feed" {...navLink}>
            Feed
          </RouterLink>
          <RouterLink to="/rewards" {...navLink}>
            Rewards
          </RouterLink>
          {me && (
            <RouterLink
              params={{ userId: me.id }}
              to="/profile/$userId"
              {...navLink}
            >
              Profile
            </RouterLink>
          )}
          {me?.role === 'admin' && (
            <RouterLink to="/admin/rewards" {...navLink}>
              Admin
            </RouterLink>
          )}
          {me && (
            <Button
              loading={logout.isPending}
              onClick={() => logout.mutate()}
              size="sm"
              variant="ghost"
            >
              Log out
            </Button>
          )}
        </Flex>
      </Flex>

      <Box
        display={{ base: 'none', md: 'block' }}
        flexShrink={0}
        maxWidth="200px"
        width="full"
      >
        <BudgetWidget variant="compact" />
      </Box>

      <Flex align="center" flexShrink={0} gap={2}>
        {!onLogin && <NotificationBell />}
        {me && (
          <AvatarRoot size="sm">
            <AvatarImage src={me.avatarUrl} />
            <AvatarFallback name={me.name} />
          </AvatarRoot>
        )}
      </Flex>

      <Drawer.Root
        onOpenChange={(e) => setMenuOpen(e.open)}
        open={menuOpen}
        placement="start"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content bg="surface.elevated">
              <Drawer.Header>
                <Drawer.Title>
                  <Text
                    fontFamily="heading"
                    fontSize="lg"
                    fontWeight="semibold"
                  >
                    Menu
                  </Text>
                </Drawer.Title>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Drawer.CloseTrigger>
              </Drawer.Header>
              <Drawer.Body paddingTop={2}>
                <VStack align="stretch" gap={1}>
                  <Button
                    asChild
                    justifyContent="flex-start"
                    variant="ghost"
                    width="full"
                  >
                    <RouterLink onClick={closeMenu} to="/feed">
                      Feed
                    </RouterLink>
                  </Button>
                  <Button
                    asChild
                    justifyContent="flex-start"
                    variant="ghost"
                    width="full"
                  >
                    <RouterLink onClick={closeMenu} to="/rewards">
                      Rewards
                    </RouterLink>
                  </Button>
                  {me && (
                    <Button
                      asChild
                      justifyContent="flex-start"
                      variant="ghost"
                      width="full"
                    >
                      <RouterLink
                        onClick={closeMenu}
                        params={{ userId: me.id }}
                        to="/profile/$userId"
                      >
                        Profile
                      </RouterLink>
                    </Button>
                  )}
                  {me?.role === 'admin' && (
                    <Button
                      asChild
                      justifyContent="flex-start"
                      variant="ghost"
                      width="full"
                    >
                      <RouterLink onClick={closeMenu} to="/admin/rewards">
                        Admin
                      </RouterLink>
                    </Button>
                  )}
                  {me && (
                    <Button
                      justifyContent="flex-start"
                      loading={logout.isPending}
                      marginTop={2}
                      onClick={() => {
                        closeMenu();
                        logout.mutate();
                      }}
                      variant="outline"
                      width="full"
                    >
                      Log out
                    </Button>
                  )}
                </VStack>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Flex>
  );
};
