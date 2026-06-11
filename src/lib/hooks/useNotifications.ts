import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationsService } from '@/lib/services/notifications';
import { queryKeys } from '@/lib/services/queryKeys';

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications.all(),
    queryFn: notificationsService.getNotifications,
  });

  const notifications = Array.isArray(data) ? data : [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      });
    },
  });

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead };
}
