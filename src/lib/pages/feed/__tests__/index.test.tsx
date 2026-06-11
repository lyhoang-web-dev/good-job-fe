import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vite-plus/test';

import { GiveKudoProvider } from '@/lib/components/kudos/GiveKudoProvider';
import { Provider } from '@/lib/components/ui/provider';
import FeedPage from '@/lib/pages/feed';
import { server } from '@/test/mocks/server';

const BASE = 'http://localhost:4000/api';

function renderFeedPage() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <Provider>
      <QueryClientProvider client={client}>
        <GiveKudoProvider>
          <FeedPage />
        </GiveKudoProvider>
      </QueryClientProvider>
    </Provider>
  );
}

describe('FeedPage', () => {
  it('renders kudo feed from API', async () => {
    renderFeedPage();
    await waitFor(() => {
      expect(screen.getByText(/Great work on the sprint demo/i)).toBeTruthy();
    });
  });

  it('opens give kudo drawer from empty-feed CTA', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE}/kudos`, () =>
        HttpResponse.json({ data: { data: [], hasMore: false } })
      )
    );
    renderFeedPage();
    expect(
      await screen.findByText(/Be the first to spread some joy/i)
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Give a Kudo →/ }));
    expect(await screen.findByText('Give a Kudo')).toBeTruthy();
  });
});
