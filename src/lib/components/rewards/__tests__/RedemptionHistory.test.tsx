import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { RedemptionHistory } from '@/lib/components/rewards/RedemptionHistory';
import { Provider } from '@/lib/components/ui/provider';
import type { Redemption } from '@/lib/types';
import { mockRedemption, mockReward } from '@/test/mocks/fixtures';

function renderHistory(rows: Array<Redemption>) {
  return render(
    <Provider>
      <RedemptionHistory rows={rows} />
    </Provider>
  );
}

describe('RedemptionHistory', () => {
  it('shows empty state when there are no rows', () => {
    renderHistory([]);
    expect(screen.getByText('No redemptions yet')).toBeTruthy();
  });

  it('renders redemption rows with reward name and points', () => {
    renderHistory([mockRedemption]);
    expect(screen.getByText(mockReward.name)).toBeTruthy();
    expect(screen.getByText(String(mockRedemption.pointsSpent))).toBeTruthy();
  });

  it('renders pending, completed, and failed statuses', () => {
    const rows: Array<Redemption> = [
      { ...mockRedemption, id: 'r-pending', status: 'pending' },
      { ...mockRedemption, id: 'r-done', status: 'completed' },
      { ...mockRedemption, id: 'r-fail', status: 'failed' },
    ];
    renderHistory(rows);
    expect(screen.getByText('pending')).toBeTruthy();
    expect(screen.getByText('completed')).toBeTruthy();
    expect(screen.getByText('failed')).toBeTruthy();
  });
});
