import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import type { ReactNode } from 'react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';

import { KudoFeed } from '@/lib/components/kudos/feed/KudoFeed';
import { Provider } from '@/lib/components/ui/provider';
import { mockKudo, mockKudosFeed } from '@/test/mocks/fixtures';
import { server } from '@/test/mocks/server';

const BASE = 'http://localhost:4000/api';

const lastIntersectionCallback = vi.hoisted(() => ({
  current: undefined as IntersectionObserverCallback | undefined,
}));

function fireIntersection(): void {
  lastIntersectionCallback.current?.(
    [{ isIntersecting: true }] as IntersectionObserverEntry[],
    {} as IntersectionObserver
  );
}

function renderFeed(node: ReactNode) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <Provider>
      <QueryClientProvider client={client}>{node}</QueryClientProvider>
    </Provider>
  );
}

describe('KudoFeed', () => {
  beforeEach(() => {
    lastIntersectionCallback.current = undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class implements Partial<IntersectionObserver> {
        constructor(cb: IntersectionObserverCallback) {
          lastIntersectionCallback.current = cb;
        }
        disconnect = vi.fn();
        observe = vi.fn();
        takeRecords = () => [];
        unobserve = vi.fn();
      } as unknown as typeof IntersectionObserver
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows skeletons until the first page resolves', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    server.use(
      http.get(`${BASE}/kudos`, async () => {
        await gate;
        return HttpResponse.json({ data: mockKudosFeed });
      })
    );
    renderFeed(<KudoFeed />);
    await waitFor(() => {
      expect(document.querySelectorAll('.gj-kudo-card').length).toBe(3);
    });
    release();
    await waitFor(() => {
      expect(screen.getByText(/Great work on the sprint demo/i)).toBeTruthy();
    });
  });

  it('renders kudos from the feed', async () => {
    renderFeed(<KudoFeed />);
    await waitFor(() => {
      expect(screen.getByText(/Great work on the sprint demo/i)).toBeTruthy();
    });
  });

  it('shows retry on error', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE}/kudos`, () =>
        HttpResponse.json({ message: 'fail' }, { status: 400 })
      )
    );
    renderFeed(<KudoFeed />);
    expect(await screen.findByText(/Failed to load feed/i)).toBeTruthy();
    expect(await screen.findByRole('button', { name: /retry/i })).toBeTruthy();
    server.use(
      http.get(`${BASE}/kudos`, () =>
        HttpResponse.json({ data: mockKudosFeed })
      )
    );
    await user.click(screen.getByRole('button', { name: /retry/i }));
    await waitFor(() => {
      expect(screen.getByText(/Great work on the sprint demo/i)).toBeTruthy();
    });
  });

  it('stays on error when retry refetch still fails', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE}/kudos`, () =>
        HttpResponse.json({ message: 'fail' }, { status: 400 })
      )
    );
    renderFeed(<KudoFeed />);
    await screen.findByText(/Failed to load feed/i);
    await user.click(screen.getByRole('button', { name: /retry/i }));
    await waitFor(() => {
      expect(screen.getByText(/Failed to load feed/i)).toBeTruthy();
    });
  });

  it('shows empty CTA when feed is empty and onGiveKudo is set', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE}/kudos`, () =>
        HttpResponse.json({ data: { data: [], hasMore: false } })
      )
    );
    const onGiveKudo = vi.fn();
    renderFeed(<KudoFeed onGiveKudo={onGiveKudo} />);
    expect(
      await screen.findByText(/Be the first to spread some joy/i)
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /give a kudo/i }));
    expect(onGiveKudo).toHaveBeenCalledTimes(1);
  });

  it('uses default empty copy when feed is empty and no callback', async () => {
    server.use(
      http.get(`${BASE}/kudos`, () =>
        HttpResponse.json({ data: { data: [], hasMore: false } })
      )
    );
    renderFeed(<KudoFeed />);
    expect(await screen.findByText(/Nothing here yet/i)).toBeTruthy();
  });

  it('swallows rejection when infinite fetchNextPage fails', async () => {
    server.use(
      http.get(`${BASE}/kudos`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('cursor') === 'next') {
          return HttpResponse.json({ message: 'bad' }, { status: 400 });
        }
        return HttpResponse.json({
          data: {
            data: [mockKudo],
            hasMore: true,
            nextCursor: 'next',
          },
        });
      })
    );
    renderFeed(<KudoFeed />);
    await waitFor(() => {
      expect(screen.getByText(/Great work on the sprint demo/i)).toBeTruthy();
    });
    await waitFor(() => {
      expect(lastIntersectionCallback.current).toBeDefined();
    });
    fireIntersection();
    await waitFor(() => {
      expect(screen.getByText(/Great work on the sprint demo/i)).toBeTruthy();
    });
  });
});
