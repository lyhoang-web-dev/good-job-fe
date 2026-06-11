import { render } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { RewardCardSkeleton } from '@/lib/components/reward/RewardCardSkeleton';
import { Provider } from '@/lib/components/ui/provider';

describe('RewardCardSkeleton', () => {
  it('renders placeholder layout for catalog loading', () => {
    const { container } = render(
      <Provider>
        <RewardCardSkeleton />
      </Provider>
    );
    expect(container.querySelector('.gj-pagination-skeleton')).toBeTruthy();
  });
});
