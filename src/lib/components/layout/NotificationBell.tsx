import {
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Popover,
  Portal,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from '@tanstack/react-router';
import { HiBell } from 'react-icons/hi';

import { useNotifications } from '@/lib/hooks/useNotifications';
import type { Notification } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils/format/relative-time';

function iconFor(type: Notification['type']) {
  switch (type) {
    case 'kudo_received':
      return '🎉';
    case 'reaction':
      return '👏';
    case 'comment':
      return '💬';
    case 'redemption_success':
      return '🎁';
    default:
      return '•';
  }
}

export function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Box position="relative">
          <IconButton aria-label="Notifications" size="sm" variant="ghost">
            <HiBell />
          </IconButton>
          {unreadCount > 0 && (
            <Badge
              bg="brand.coral"
              color="white"
              position="absolute"
              right="-2px"
              top="-2px"
            >
              {unreadCount}
            </Badge>
          )}
        </Box>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            className="gj-notif-content"
            maxHeight="360px"
            overflowY="auto"
            width="340px"
          >
            <Flex
              align="center"
              borderBottom="1px solid"
              borderColor="border.subtle"
              justify="space-between"
              padding={3}
            >
              <Text fontWeight="semibold">Notifications</Text>
              <Button
                disabled={unreadCount === 0 || markAllAsRead.isPending}
                fontSize="xs"
                onClick={() => markAllAsRead.mutate()}
                size="xs"
                variant="ghost"
              >
                Mark all ✓
              </Button>
            </Flex>
            {isLoading && (
              <Text color="fg.muted" fontSize="sm" padding={3}>
                Loading…
              </Text>
            )}
            {!isLoading && notifications.length === 0 && (
              <Box padding={8} textAlign="center">
                <Text fontSize="2xl" marginBottom={2}>
                  ○
                </Text>
                <Text className="gj-empty-title" fontSize="md">
                  All caught up!
                </Text>
                <Text color="fg.muted" fontSize="sm" marginTop={1}>
                  You&apos;ll hear when someone appreciates you
                </Text>
              </Box>
            )}
            {notifications.map((n) => (
              <Box
                _hover={{ bg: 'brand.cream' }}
                borderBottom="1px solid"
                borderColor="border.subtle"
                cursor="pointer"
                key={n.id}
                onClick={() => {
                  markAsRead.mutate(n.id);
                  navigate({ to: '/feed' });
                }}
                padding={3}
                role="button"
                transition="background 100ms"
                {...(n.isRead
                  ? {}
                  : {
                      bg: 'rgba(255, 107, 107, 0.06)',
                    })}
              >
                <Flex gap={3}>
                  <Text fontSize="lg">{iconFor(n.type)}</Text>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      {n.type.replaceAll('_', ' ')}
                    </Text>
                    <Text color="fg.muted" fontSize="xs" marginTop={1}>
                      {formatRelativeTime(n.createdAt)}
                      {!n.isRead && (
                        <Text as="span" color="brand.coral" marginLeft={2}>
                          · unread
                        </Text>
                      )}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            ))}
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
