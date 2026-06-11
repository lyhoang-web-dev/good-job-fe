import {
  type InfiniteData,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';

import { kudosService } from '@/lib/services/kudos';
import { queryKeys } from '@/lib/services/queryKeys';
import type { Kudo, PaginatedResponse } from '@/lib/types';
import { mockKudo, mockUser } from '@/test/mocks/fixtures';

import { useReaction } from '../useReaction';

function createTestWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

function feedSeed(): InfiniteData<PaginatedResponse<Kudo>> {
  return {
    pages: [{ data: [{ ...mockKudo, reactions: [] }], hasMore: false }],
    pageParams: [undefined],
  };
}

describe('useReaction', () => {
  it('optimistically adds reaction then settles', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(queryKeys.kudos.feed(), feedSeed());
    queryClient.setQueryData(queryKeys.me(), mockUser);

    const { result } = renderHook(() => useReaction('kudo-1', mockUser.id), {
      wrapper: createTestWrapper(queryClient),
    });

    await act(() => {
      result.current.mutate({ emoji: '👍', isReacted: false });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const feed = queryClient.getQueryData<
      InfiniteData<PaginatedResponse<Kudo>>
    >(queryKeys.kudos.feed());
    const kudo = feed?.pages[0]?.data[0];
    expect(kudo?.reactions.some((r) => r.emoji === '👍')).toBe(true);
  });

  it('optimistically removes reaction when isReacted is true', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const reacted: Kudo = {
      ...mockKudo,
      reactions: [
        {
          id: 'r1',
          emoji: '👍',
          user: mockUser,
        },
      ],
    };
    queryClient.setQueryData(queryKeys.kudos.feed(), {
      pages: [{ data: [reacted], hasMore: false }],
      pageParams: [undefined],
    });

    const { result } = renderHook(() => useReaction('kudo-1', mockUser.id), {
      wrapper: createTestWrapper(queryClient),
    });

    await act(() => {
      result.current.mutate({ emoji: '👍', isReacted: true });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const feed = queryClient.getQueryData<
      InfiniteData<PaginatedResponse<Kudo>>
    >(queryKeys.kudos.feed());
    expect(feed?.pages[0]?.data[0]?.reactions).toHaveLength(0);
  });

  it('rolls feed back on mutation error', async () => {
    const reactSpy = vi
      .spyOn(kudosService, 'reactToKudo')
      .mockRejectedValueOnce(new Error('network'));
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const seed = feedSeed();
    queryClient.setQueryData(queryKeys.kudos.feed(), seed);
    queryClient.setQueryData(queryKeys.me(), mockUser);

    const { result } = renderHook(() => useReaction('kudo-1', mockUser.id), {
      wrapper: createTestWrapper(queryClient),
    });

    await act(() => {
      result.current.mutate({ emoji: '🎉', isReacted: false });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    const feed = queryClient.getQueryData<
      InfiniteData<PaginatedResponse<Kudo>>
    >(queryKeys.kudos.feed());
    expect(feed).toEqual(seed);
    reactSpy.mockRestore();
  });

  it('patches user kudos list queries', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(queryKeys.kudos.feed(), feedSeed());
    queryClient.setQueryData(
      queryKeys.kudos.userList(mockUser.id, 'received'),
      [{ ...mockKudo, reactions: [] }]
    );
    queryClient.setQueryData(queryKeys.me(), mockUser);

    const { result } = renderHook(() => useReaction('kudo-1', mockUser.id), {
      wrapper: createTestWrapper(queryClient),
    });

    await act(() => {
      result.current.mutate({ emoji: '🔥', isReacted: false });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const userKudos = queryClient.getQueryData<Array<Kudo>>(
      queryKeys.kudos.userList(mockUser.id, 'received')
    );
    expect(userKudos?.[0]?.reactions.some((r) => r.emoji === '🔥')).toBe(true);
  });

  it('uses placeholder user when me cache is missing', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(queryKeys.kudos.feed(), feedSeed());

    const { result } = renderHook(() => useReaction('kudo-1', mockUser.id), {
      wrapper: createTestWrapper(queryClient),
    });

    await act(() => {
      result.current.mutate({ emoji: '✨', isReacted: false });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const feed = queryClient.getQueryData<
      InfiniteData<PaginatedResponse<Kudo>>
    >(queryKeys.kudos.feed());
    const reaction = feed?.pages[0]?.data[0]?.reactions.find(
      (r) => r.emoji === '✨'
    );
    expect(reaction?.user.id).toBe(mockUser.id);
    expect(reaction?.user.name).toBe('You');
  });

  it('only patches matching kudo in feed with multiple items', async () => {
    const other: Kudo = {
      ...mockKudo,
      id: 'kudo-2',
      reactions: [],
    };
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(queryKeys.kudos.feed(), {
      pages: [
        { data: [{ ...mockKudo, reactions: [] }, other], hasMore: false },
      ],
      pageParams: [undefined],
    });
    queryClient.setQueryData(queryKeys.me(), mockUser);

    const { result } = renderHook(() => useReaction('kudo-1', mockUser.id), {
      wrapper: createTestWrapper(queryClient),
    });

    await act(() => {
      result.current.mutate({ emoji: '🎯', isReacted: false });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const feed = queryClient.getQueryData<
      InfiniteData<PaginatedResponse<Kudo>>
    >(queryKeys.kudos.feed());
    expect(feed?.pages[0]?.data[0]?.reactions.length).toBeGreaterThan(0);
    expect(feed?.pages[0]?.data[1]?.reactions).toHaveLength(0);
  });

  it('ignores non-array user kudos cache shape', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(queryKeys.kudos.feed(), feedSeed());
    queryClient.setQueryData(
      queryKeys.kudos.userList(mockUser.id, 'received'),
      {} as never
    );
    queryClient.setQueryData(queryKeys.me(), mockUser);

    const { result } = renderHook(() => useReaction('kudo-1', mockUser.id), {
      wrapper: createTestWrapper(queryClient),
    });

    await act(() => {
      result.current.mutate({ emoji: '🧪', isReacted: false });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('completes when feed cache is absent', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(queryKeys.me(), mockUser);

    const { result } = renderHook(() => useReaction('kudo-1', mockUser.id), {
      wrapper: createTestWrapper(queryClient),
    });

    await act(() => {
      result.current.mutate({ emoji: '👋', isReacted: false });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
