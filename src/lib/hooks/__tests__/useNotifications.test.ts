import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { createWrapper } from '@/test/utils/wrapper';

import { useNotifications } from '../useNotifications';

describe('useNotifications', () => {
  it('loads notifications and counts unread', async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
  });

  it('markAsRead invalidates list', async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => {
      result.current.markAsRead.mutate('notif-1');
    });
    await waitFor(() => expect(result.current.markAsRead.isSuccess).toBe(true));
  });

  it('markAllAsRead invalidates list', async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => {
      result.current.markAllAsRead.mutate();
    });
    await waitFor(() =>
      expect(result.current.markAllAsRead.isSuccess).toBe(true)
    );
  });
});
