import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';

import { RewardCard } from '@/lib/components/rewards/RewardCard';
import { Provider } from '@/lib/components/ui/provider';
import type { Reward } from '@/lib/types';
import { mockReward } from '@/test/mocks/fixtures';

const toasterCreate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/components/ui/toaster', () => ({
  toaster: { create: toasterCreate },
}));

function renderCard(reward: Reward, userBalance: number) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <Provider>
      <QueryClientProvider client={queryClient}>
        <RewardCard reward={reward} userBalance={userBalance} />
      </QueryClientProvider>
    </Provider>
  );
}

describe('RewardCard', () => {
  const affordable: Reward = {
    ...mockReward,
    id: 'reward-affordable',
    pointsCost: 100,
    remaining: 20,
    isActive: true,
  };

  it('opens confirm dialog and completes redemption', async () => {
    const user = userEvent.setup();
    toasterCreate.mockClear();
    renderCard(affordable, 500);

    await user.click(screen.getByRole('button', { name: /redeem/i }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/confirm redemption/i)).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(toasterCreate).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', title: 'Redeemed!' })
      )
    );
  });

  it('disables redeem when user cannot afford reward', () => {
    renderCard(affordable, 50);
    const btn = screen.getByRole('button', { name: /redeem/i });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
    expect(btn.getAttribute('title')).toBe('Need 50 more pts');
  });

  it('shows sold overlay when remaining is zero', () => {
    const sold: Reward = { ...affordable, remaining: 0, quantityRedeemed: 100 };
    renderCard(sold, 10_000);
    expect(screen.getByText('Sold')).toBeTruthy();
    expect(
      (screen.getByRole('button', { name: /redeem/i }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });

  it('shows expired overlay when reward is inactive', () => {
    const expired: Reward = { ...affordable, isActive: false };
    renderCard(expired, 10_000);
    expect(screen.getByText('Expired')).toBeTruthy();
    expect(
      (screen.getByRole('button', { name: /redeem/i }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });

  it('shows low-stock badge when remaining is between 1 and 10', () => {
    const low: Reward = { ...affordable, remaining: 3 };
    renderCard(low, 500);
    expect(screen.getByText('3 left')).toBeTruthy();
  });

  it('closes dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderCard(affordable, 500);
    await user.click(screen.getByRole('button', { name: /redeem/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('closes dialog from header close control', async () => {
    const user = userEvent.setup();
    renderCard(affordable, 500);
    await user.click(screen.getByRole('button', { name: /redeem/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /close/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
