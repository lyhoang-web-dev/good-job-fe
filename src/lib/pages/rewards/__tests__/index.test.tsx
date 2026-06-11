import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Provider } from '@/lib/components/ui/provider';
import RewardsPage from '@/lib/pages/rewards';
import { queryKeys } from '@/lib/services/queryKeys';
import type { Redemption } from '@/lib/types';
import { mockRedemption, mockReward, mockUser } from '@/test/mocks/fixtures';
import { server } from '@/test/mocks/server';

const isMobileMock = vi.hoisted(() => vi.fn(() => false));
vi.mock('@/lib/hooks/useResponsivePagination', () => ({
  useResponsivePagination: () => isMobileMock(),
}));

const toasterCreate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/components/ui/toaster', () => ({
  toaster: { create: toasterCreate },
}));

const BASE = 'http://localhost:4000/api';

let lastQueryClient: QueryClient;

function renderRewardsPage() {
  lastQueryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const tree = (
    <Provider>
      <QueryClientProvider client={lastQueryClient}>
        <RewardsPage />
      </QueryClientProvider>
    </Provider>
  );
  return render(tree);
}

function manyRedemptions(n: number): Array<Redemption> {
  return Array.from({ length: n }, (_, i) => ({
    ...mockRedemption,
    id: `red-${String(i)}`,
  }));
}

describe('RewardsPage', () => {
  beforeEach(() => {
    isMobileMock.mockReturnValue(false);
  });

  it('loads catalog and shows reward name', async () => {
    renderRewardsPage();
    expect(
      await screen.findByRole('heading', { name: 'Rewards' })
    ).toBeTruthy();
    const catalogPanel = await screen.findByRole('tabpanel');
    expect(
      await within(catalogPanel).findByRole('heading', {
        name: mockReward.name,
      })
    ).toBeTruthy();
  });

  it('switches to redemption history tab and lists redemptions', async () => {
    const user = userEvent.setup();
    renderRewardsPage();

    await user.click(
      screen.getByRole('tab', { name: /my redemption history/i })
    );

    const historyPanel = await screen.findByRole('tabpanel');
    expect(
      await within(historyPanel).findByRole('columnheader', { name: 'Reward' })
    ).toBeTruthy();
    expect(
      within(historyPanel).getByText(mockRedemption.reward.name)
    ).toBeTruthy();
  });

  it('shows empty history when there are no redemptions', async () => {
    server.use(
      http.get(`${BASE}/rewards/redemptions`, () =>
        HttpResponse.json({ data: [] })
      )
    );
    const user = userEvent.setup();
    renderRewardsPage();

    await user.click(
      screen.getByRole('tab', { name: /my redemption history/i })
    );
    const historyPanel = await screen.findByRole('tabpanel');
    expect(
      await within(historyPanel).findByText('No redemptions yet')
    ).toBeTruthy();
  });

  it('allows redeem when balance covers catalog price', async () => {
    server.use(
      http.get(`${BASE}/auth/me`, () =>
        HttpResponse.json({
          data: { ...mockUser, balance: 600 },
        })
      )
    );
    toasterCreate.mockClear();

    const user = userEvent.setup();
    renderRewardsPage();

    const catalogPanel = await screen.findByRole('tabpanel');
    expect(
      await within(catalogPanel).findByRole('heading', {
        name: mockReward.name,
      })
    ).toBeTruthy();

    const card = within(catalogPanel)
      .getByRole('heading', { name: mockReward.name })
      .closest('.gj-reward-card');
    expect(card).not.toBeNull();
    const redeemBtn = within(card as HTMLElement).getByRole('button', {
      name: /redeem/i,
    });
    expect((redeemBtn as HTMLButtonElement).disabled).toBe(false);

    await user.click(redeemBtn);
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(toasterCreate).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', title: 'Redeemed!' })
      )
    );
  });

  it('resets infinite catalog queries when layout switches to mobile', async () => {
    const { rerender } = renderRewardsPage();
    const resetSpy = vi.spyOn(lastQueryClient, 'resetQueries');

    isMobileMock.mockReturnValue(true);
    await act(async () => {
      rerender(
        <Provider>
          <QueryClientProvider client={lastQueryClient}>
            <RewardsPage />
          </QueryClientProvider>
        </Provider>
      );
    });

    expect(resetSpy).toHaveBeenCalled();
    const call = resetSpy.mock.calls.find(
      (c) => typeof c[0] === 'object' && c[0] !== null && 'predicate' in c[0]
    )?.[0] as {
      predicate: (q: { queryKey: ReadonlyArray<unknown> }) => boolean;
    };
    expect(call?.predicate({ queryKey: ['rewards', 'catalog-infinite'] })).toBe(
      true
    );
    expect(call?.predicate({ queryKey: ['rewards', 'catalog'] })).toBe(false);
    resetSpy.mockRestore();
  });

  it('shows history skeleton while redemptions are loading', async () => {
    server.use(
      http.get(`${BASE}/rewards/redemptions`, async () => {
        await new Promise((r) => setTimeout(r, 800));
        return HttpResponse.json({ data: [mockRedemption] });
      })
    );
    const user = userEvent.setup();
    renderRewardsPage();
    await user.click(
      screen.getByRole('tab', { name: /my redemption history/i })
    );
    const rewardHeader = await screen.findByRole('columnheader', {
      name: 'Reward',
    });
    const panel = rewardHeader.closest('[role="tabpanel"]');
    expect(panel).toBeTruthy();
    await waitFor(
      () => expect(panel?.querySelector('.chakra-skeleton')).toBeTruthy(),
      { timeout: 2000 }
    );
    expect(
      await within(panel as HTMLElement).findByText(
        mockRedemption.reward.name,
        {},
        { timeout: 4000 }
      )
    ).toBeTruthy();
  });

  it('clamps history page when data shrinks below current page', async () => {
    server.use(
      http.get(`${BASE}/rewards/redemptions`, () =>
        HttpResponse.json({ data: manyRedemptions(22) })
      )
    );
    const user = userEvent.setup();
    renderRewardsPage();
    await user.click(
      screen.getByRole('tab', { name: /my redemption history/i })
    );
    await screen.findByLabelText('Page 3');
    await user.click(screen.getByLabelText('Page 3'));

    server.use(
      http.get(`${BASE}/rewards/redemptions`, () =>
        HttpResponse.json({ data: manyRedemptions(4) })
      )
    );
    await act(async () => {
      await lastQueryClient.invalidateQueries({
        queryKey: queryKeys.rewards.redemptions(),
      });
    });

    await waitFor(() => expect(screen.queryByLabelText('Page 3')).toBeNull());
  });
});
