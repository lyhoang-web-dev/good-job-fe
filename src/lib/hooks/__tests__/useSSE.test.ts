import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';

import { queryKeys } from '@/lib/services/queryKeys';
import { setSessionAccessToken } from '@/lib/services/sessionAccessToken';
import type { Notification } from '@/lib/types';
import * as queryCache from '@/lib/utils/cache/query-cache';
import * as dispatchMedia from '@/lib/utils/sse/dispatch-media-event';
import { mockKudo, mockNotification } from '@/test/mocks/fixtures';

import { useSSE } from '../useSSE';

function createTestWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

type Listener = (e: Event) => void;

class MockEventSource {
  static last: MockEventSource | null = null;
  url: string;
  readonly listeners = new Map<string, Listener[]>();
  onerror: (() => void) | null = null;
  close = vi.fn();

  constructor(url: string, _opts?: { withCredentials?: boolean }) {
    this.url = url;
    MockEventSource.last = this;
  }

  addEventListener(type: string, listener: Listener) {
    const list = this.listeners.get(type) ?? [];
    list.push(listener);
    this.listeners.set(type, list);
  }

  emitOpen() {
    const e = new Event('open');
    for (const fn of this.listeners.get('open') ?? []) {
      fn(e);
    }
  }

  emitMessage(type: string, data: string, lastEventId = 'evt-1') {
    const e = new MessageEvent(type, { data, lastEventId });
    for (const fn of this.listeners.get(type) ?? []) {
      fn(e);
    }
  }

  runOnError() {
    this.onerror?.();
  }
}

describe('useSSE', () => {
  const OriginalEventSource = globalThis.EventSource;

  beforeEach(() => {
    setSessionAccessToken(null);
    MockEventSource.last = null;
    globalThis.EventSource = MockEventSource as unknown as typeof EventSource;
  });

  afterEach(() => {
    globalThis.EventSource = OriginalEventSource;
    vi.useRealTimers();
  });

  it('does not connect when enabled is false', () => {
    const queryClient = new QueryClient();
    renderHook(() => useSSE({ enabled: false }), {
      wrapper: createTestWrapper(queryClient),
    });
    expect(MockEventSource.last).toBeNull();
  });

  it('registers listeners and handles SSE payloads', () => {
    const prependSpy = vi.spyOn(queryCache, 'prependKudoToFeedCache');
    const reactionsSpy = vi.spyOn(queryCache, 'updateKudoReactionsInCache');
    const dispatchSpy = vi.spyOn(dispatchMedia, 'dispatchMediaEvent');

    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKeys.notifications.all(), []);

    renderHook(() => useSSE({ enabled: true }), {
      wrapper: createTestWrapper(queryClient),
    });

    const es = MockEventSource.last;
    expect(es).not.toBeNull();
    expect(es?.listeners.has('kudo_created')).toBe(true);

    es?.emitOpen();

    es?.emitMessage('kudo_created', JSON.stringify(mockKudo));
    expect(prependSpy).toHaveBeenCalled();

    es?.emitMessage(
      'reaction_updated',
      JSON.stringify({
        kudoId: mockKudo.id,
        reactions: [{ id: 'r1', emoji: '👍', user: mockKudo.sender }],
      })
    );
    expect(reactionsSpy).toHaveBeenCalled();

    es?.emitMessage('notification', JSON.stringify(mockNotification));
    const notifs = queryClient.getQueryData<Array<Notification>>(
      queryKeys.notifications.all()
    );
    expect(notifs?.some((n) => n.id === mockNotification.id)).toBe(true);

    es?.emitMessage('media_ready', JSON.stringify({ mediaId: 'm1' }));
    es?.emitMessage('media_failed', JSON.stringify({ mediaId: 'm2' }));
    expect(dispatchSpy).toHaveBeenCalledWith(
      'gj-media-ready',
      expect.any(String)
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      'gj-media-failed',
      expect.any(String)
    );

    prependSpy.mockRestore();
    reactionsSpy.mockRestore();
    dispatchSpy.mockRestore();
  });

  it('prepends notification when cache was undefined', () => {
    const queryClient = new QueryClient();
    renderHook(() => useSSE({ enabled: true }), {
      wrapper: createTestWrapper(queryClient),
    });
    const es = MockEventSource.last;
    expect(es).not.toBeNull();
    es?.emitOpen();
    es?.emitMessage('notification', JSON.stringify(mockNotification));
    const notifs = queryClient.getQueryData<Array<Notification>>(
      queryKeys.notifications.all()
    );
    expect(notifs).toEqual([mockNotification]);
  });

  it('includes access_token in URL when session token is set', () => {
    setSessionAccessToken('sse-test-jwt');
    const queryClient = new QueryClient();
    renderHook(() => useSSE({ enabled: true }), {
      wrapper: createTestWrapper(queryClient),
    });
    const es = MockEventSource.last;
    expect(es?.url).toContain('access_token=');
    expect(decodeURIComponent(es?.url ?? '')).toContain('sse-test-jwt');
  });

  it('reconnect uses lastEventId in URL after error', () => {
    vi.useFakeTimers();
    const queryClient = new QueryClient();
    const { unmount } = renderHook(() => useSSE({ enabled: true }), {
      wrapper: createTestWrapper(queryClient),
    });

    const first = MockEventSource.last;
    expect(first).not.toBeNull();
    first?.emitMessage('kudo_created', JSON.stringify(mockKudo), 'cursor-abc');

    first?.runOnError();
    vi.runAllTimers();

    const reconnected = MockEventSource.last;
    expect(reconnected).not.toBe(first);
    expect(reconnected?.url).toContain('lastEventId=');
    expect(decodeURIComponent(reconnected?.url ?? '')).toContain('cursor-abc');

    unmount();
  });
});
