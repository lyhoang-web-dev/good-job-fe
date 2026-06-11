import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vite-plus/test';

import {
  GiveKudoProvider,
  useGiveKudo,
} from '@/lib/components/kudos/GiveKudoProvider';
import { Provider } from '@/lib/components/ui/provider';

function TestConsumer() {
  const { openGiveKudo } = useGiveKudo();
  return (
    <button onClick={openGiveKudo} type="button">
      Open from context
    </button>
  );
}

function renderWithProviders(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <Provider>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </Provider>
  );
}

describe('GiveKudoProvider', () => {
  it('throws when useGiveKudo is used outside provider', () => {
    expect(() => {
      renderWithProviders(<TestConsumer />);
    }).toThrow(/useGiveKudo must be used within GiveKudoProvider/);
  });

  it('renders FAB after mount and opens send drawer', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <GiveKudoProvider>
        <span>child</span>
      </GiveKudoProvider>
    );
    expect(screen.getByText('child')).toBeTruthy();
    const fab = await screen.findByRole('button', { name: /give kudo/i });
    await user.click(fab);
    expect(await screen.findByText('Give a Kudo')).toBeTruthy();
  });

  it('opens modal via context', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <GiveKudoProvider>
        <TestConsumer />
      </GiveKudoProvider>
    );
    await user.click(
      screen.getByRole('button', { name: /open from context/i })
    );
    expect(await screen.findByText('Give a Kudo')).toBeTruthy();
  });

  it('does not portal FAB when showFab is false', async () => {
    renderWithProviders(
      <GiveKudoProvider showFab={false}>
        <span>in</span>
      </GiveKudoProvider>
    );
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /give kudo/i })).toBeNull();
    });
  });
});
