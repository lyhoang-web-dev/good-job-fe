import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { ReactionBar } from '@/lib/components/kudos/card/ReactionBar';
import { Provider } from '@/lib/components/ui/provider';
import type { Reaction } from '@/lib/types';
import { mockUser } from '@/test/mocks/fixtures';

const mutate = vi.hoisted(() => vi.fn());

vi.mock('@/lib/hooks/useReaction', () => ({
  useReaction: () => ({
    mutate: (...args: ReadonlyArray<unknown>) => mutate(...args),
    isPending: false,
  }),
}));

function renderBar(reactions: Array<Reaction>) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <Provider>
      <QueryClientProvider client={client}>
        <ReactionBar
          currentUserId={mockUser.id}
          kudoId="kudo-1"
          reactions={reactions}
        />
      </QueryClientProvider>
    </Provider>
  );
}

describe('ReactionBar', () => {
  beforeEach(() => {
    mutate.mockClear();
  });

  it('renders grouped reactions with counts', () => {
    const reactions: Array<Reaction> = [
      { id: 'r1', emoji: '👏', user: mockUser },
      { id: 'r2', emoji: '👏', user: { ...mockUser, id: 'user-2' } },
      { id: 'r3', emoji: '❤️', user: mockUser },
    ];
    renderBar(reactions);
    const clap = screen.getByRole('button', { name: /👏/i });
    expect(within(clap).getByText('2')).toBeTruthy();
    const heart = screen.getByRole('button', { name: /❤️/i });
    expect(within(heart).getByText('1')).toBeTruthy();
  });

  it('calls mutate to add a reaction from the picker', async () => {
    const user = userEvent.setup();
    renderBar([]);
    await user.click(screen.getByRole('button', { name: /add reaction/i }));
    const dialog = screen.getByRole('dialog', { hidden: true });
    await user.click(within(dialog).getByText('🔥'));
    expect(mutate).toHaveBeenCalledWith({ emoji: '🔥', isReacted: false });
  });

  it('calls mutate to remove when clicking own reaction', async () => {
    const user = userEvent.setup();
    const reactions: Array<Reaction> = [
      { id: 'r1', emoji: '👏', user: mockUser },
    ];
    renderBar(reactions);
    await user.click(screen.getByRole('button', { name: /👏/i }));
    expect(mutate).toHaveBeenCalledWith({ emoji: '👏', isReacted: true });
  });
});
