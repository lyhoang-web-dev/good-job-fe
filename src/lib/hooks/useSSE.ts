import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { API_BASE_URL } from '@/lib/services/api';
import { queryKeys } from '@/lib/services/queryKeys';
import { getSessionAccessToken } from '@/lib/services/sessionAccessToken';
import type { Kudo, Notification } from '@/lib/types';
import {
  prependKudoToFeedCache,
  updateKudoReactionsInCache,
} from '@/lib/utils/cache/query-cache';
import { dispatchMediaEvent } from '@/lib/utils/sse/dispatch-media-event';

const SSE_URL = `${API_BASE_URL.replace(/\/$/, '')}/events`;
const MAX_RECONNECT_MS = 60_000;

function buildSseUrl(lastEventId: string): string {
  const params = new URLSearchParams();
  if (lastEventId) {
    params.set('lastEventId', lastEventId);
  }
  const token = getSessionAccessToken();
  if (token) {
    params.set('access_token', token);
  }
  const q = params.toString();
  return q ? `${SSE_URL}?${q}` : SSE_URL;
}

type UseSSEOptions = {
  enabled?: boolean;
};

export function useSSE({ enabled = true }: UseSSEOptions = {}) {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);
  const lastIdRef = useRef('');
  const retryRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const attemptRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    function connect() {
      const url = buildSseUrl(lastIdRef.current);

      const es = new EventSource(url, { withCredentials: true });
      esRef.current = es;

      es.addEventListener('open', () => {
        attemptRef.current = 0;
      });

      es.addEventListener('kudo_created', (e: MessageEvent) => {
        lastIdRef.current = e.lastEventId;
        const kudo = JSON.parse(e.data) as Kudo;
        prependKudoToFeedCache(queryClient, kudo);
      });

      es.addEventListener('reaction_updated', (e: MessageEvent) => {
        lastIdRef.current = e.lastEventId;
        const { kudoId, reactions } = JSON.parse(e.data) as {
          kudoId: string;
          reactions: Kudo['reactions'];
        };
        updateKudoReactionsInCache(queryClient, kudoId, reactions);
      });

      es.addEventListener('notification', (e: MessageEvent) => {
        lastIdRef.current = e.lastEventId;
        const notif = JSON.parse(e.data) as Notification;
        queryClient.setQueryData(
          queryKeys.notifications.all(),
          (old: Array<Notification> | undefined) => [notif, ...(old ?? [])]
        );
      });

      es.addEventListener('media_ready', (e: MessageEvent) => {
        lastIdRef.current = e.lastEventId;
        dispatchMediaEvent('gj-media-ready', e.data);
      });

      es.addEventListener('media_failed', (e: MessageEvent) => {
        lastIdRef.current = e.lastEventId;
        dispatchMediaEvent('gj-media-failed', e.data);
      });

      es.onerror = () => {
        es.close();
        attemptRef.current += 1;
        const delay = Math.min(
          1000 * 2 ** Math.min(attemptRef.current, 6),
          MAX_RECONNECT_MS
        );
        retryRef.current = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      esRef.current?.close();
      clearTimeout(retryRef.current);
    };
  }, [enabled, queryClient]);
}
