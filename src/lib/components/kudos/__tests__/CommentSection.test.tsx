import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vite-plus/test';

import { CommentSection } from '@/lib/components/kudos/card/CommentSection';
import { Provider } from '@/lib/components/ui/provider';
import { queryKeys } from '@/lib/services/queryKeys';
import type { Comment } from '@/lib/types';
import { mockUser } from '@/test/mocks/fixtures';
import { server } from '@/test/mocks/server';

const BASE = 'http://localhost:4000/api';

function makeComments(n: number): Array<Comment> {
  return Array.from({ length: n }, (_, i) => ({
    id: `c-${String(i)}`,
    content: `Comment body ${String(i)}`,
    createdAt: '2025-04-10T12:00:00Z',
    user: mockUser,
  }));
}

function renderSection(kudoId: string, isOpen: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const view = render(
    <Provider>
      <QueryClientProvider client={queryClient}>
        <CommentSection isOpen={isOpen} kudoId={kudoId} />
      </QueryClientProvider>
    </Provider>
  );
  return { ...view, queryClient };
}

describe('CommentSection', () => {
  it('renders nothing when closed', () => {
    const { container } = renderSection('kudo-1', false);
    expect(container.firstChild).toBeNull();
  });

  it('loads and lists comments', async () => {
    server.use(
      http.get(`${BASE}/kudos/kudo-1/comments`, () =>
        HttpResponse.json({
          data: [
            {
              id: 'c-1',
              content: 'Nice kudo!',
              createdAt: '2025-04-10T12:00:00Z',
              user: mockUser,
            },
          ],
        })
      )
    );
    renderSection('kudo-1', true);
    expect(await screen.findByText('Nice kudo!')).toBeTruthy();
  });

  it('shows skeleton while comments load', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    server.use(
      http.get(`${BASE}/kudos/kudo-1/comments`, async () => {
        await gate;
        return HttpResponse.json({ data: [] });
      })
    );
    const { container } = renderSection('kudo-1', true);
    await waitFor(() => {
      expect(container.querySelector('.chakra-skeleton')).toBeTruthy();
    });
    release();
    await waitFor(() => {
      expect(container.querySelector('.chakra-skeleton')).toBeNull();
    });
  });

  it('submits a new comment', async () => {
    const user = userEvent.setup();
    renderSection('kudo-1', true);
    await screen.findByPlaceholderText(/write a comment/i);
    await user.type(screen.getByPlaceholderText(/write a comment/i), 'Thanks!');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText('Thanks!')).toBeTruthy();
  });

  it('paginates when there are more than one page of comments', async () => {
    const user = userEvent.setup();
    const rows = makeComments(10);
    server.use(
      http.get(`${BASE}/kudos/kudo-1/comments`, () =>
        HttpResponse.json({ data: rows })
      )
    );
    renderSection('kudo-1', true);
    expect(await screen.findByText('Comment body 0')).toBeTruthy();
    await user.click(screen.getByLabelText('Page 2'));
    expect(await screen.findByText('Comment body 8')).toBeTruthy();
  });

  it('clamps to last page when comments shrink below current page', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE}/kudos/kudo-1/comments`, () =>
        HttpResponse.json({ data: makeComments(10) })
      )
    );
    const { queryClient } = renderSection('kudo-1', true);
    expect(await screen.findByText('Comment body 0')).toBeTruthy();
    await user.click(screen.getByLabelText('Page 2'));
    expect(await screen.findByText('Comment body 8')).toBeTruthy();

    server.use(
      http.get(`${BASE}/kudos/kudo-1/comments`, () =>
        HttpResponse.json({ data: makeComments(2) })
      )
    );
    await queryClient.invalidateQueries({
      queryKey: queryKeys.kudos.comments('kudo-1'),
    });
    await waitFor(() => {
      expect(screen.queryByLabelText('Page 2')).toBeNull();
    });
    expect(await screen.findByText('Comment body 0')).toBeTruthy();
  });
});
