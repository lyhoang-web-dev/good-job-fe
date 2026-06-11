import { render } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { KudoCardSkeleton } from '@/lib/components/kudos/card/KudoCardSkeleton';
import { Provider } from '@/lib/components/ui/provider';

describe('KudoCardSkeleton', () => {
  it('renders placeholder card shell', () => {
    const { container } = render(
      <Provider>
        <KudoCardSkeleton />
      </Provider>
    );
    expect(container.querySelector('.gj-kudo-card')).toBeTruthy();
  });
});
