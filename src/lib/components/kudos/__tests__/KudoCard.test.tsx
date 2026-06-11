import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vite-plus/test';

import { KudoCard } from '@/lib/components/kudos/card/KudoCard';
import { Provider } from '@/lib/components/ui/provider';
import type { CoreValue, Kudo, KudoMedia } from '@/lib/types';
import { cvLabel } from '@/lib/utils/format/core-value';
import { mockKudo, mockKudoMedia, mockUser } from '@/test/mocks/fixtures';

const longMessage = `${'Excellent work. '.repeat(20)}End.`;

function renderCard(kudo: Kudo) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <Provider>
      <QueryClientProvider client={client}>
        <KudoCard currentUserId={mockUser.id} kudo={kudo} />
      </QueryClientProvider>
    </Provider>
  );
}

const coreValues: Array<CoreValue> = [
  'teamwork',
  'ownership',
  'innovation',
  'integrity',
  'customer_focus',
];

describe('KudoCard', () => {
  it('does not show read more for short messages', () => {
    renderCard({ ...mockKudo, message: 'Short thanks!' });
    expect(screen.queryByRole('button', { name: /read more/i })).toBeNull();
  });

  it('toggles read more for long messages', async () => {
    const user = userEvent.setup();
    renderCard({ ...mockKudo, message: longMessage });
    await user.click(screen.getByRole('button', { name: /read more/i }));
    expect(screen.getByRole('button', { name: /show less/i })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /show less/i }));
    expect(screen.getByRole('button', { name: /read more/i })).toBeTruthy();
  });

  it('renders ready image media without processing badge', () => {
    const media: Array<KudoMedia> = [{ ...mockKudoMedia, status: 'ready' }];
    const { container } = renderCard({ ...mockKudo, media });
    const mediaImg = container.querySelector('img[src*="media.jpg"]');
    expect(mediaImg).toBeTruthy();
    expect(screen.queryByText(/processing/i)).toBeNull();
  });

  it('shows processing badge for image media', () => {
    const media: Array<KudoMedia> = [
      { ...mockKudoMedia, status: 'processing' },
    ];
    renderCard({ ...mockKudo, media });
    expect(screen.getByText(/processing/i)).toBeTruthy();
  });

  it('renders video without duration badge when duration is absent', () => {
    const media: Array<KudoMedia> = [
      {
        id: 'v1',
        type: 'video',
        status: 'ready',
        url: 'https://example.com/v.mp4',
      },
    ];
    const { container } = renderCard({ ...mockKudo, media });
    expect(container.querySelector('video')?.getAttribute('src')).toBe(
      'https://example.com/v.mp4'
    );
    expect(screen.queryByText(/\d+:\d{2}/)).toBeNull();
  });

  it('shows duration badge for video media', () => {
    const media: Array<KudoMedia> = [
      {
        id: 'v1',
        type: 'video',
        status: 'ready',
        url: 'https://example.com/v.mp4',
        durationSecs: 125,
      },
    ];
    renderCard({ ...mockKudo, media });
    expect(screen.getByText('2:05')).toBeTruthy();
  });

  it('shows processing badge for video media', () => {
    const media: Array<KudoMedia> = [
      {
        id: 'v1',
        type: 'video',
        status: 'processing',
        url: 'https://example.com/v.mp4',
      },
    ];
    renderCard({ ...mockKudo, media });
    expect(screen.getAllByText(/processing/i).length).toBeGreaterThanOrEqual(1);
  });

  it('shows comments count from kudo', () => {
    renderCard({ ...mockKudo, commentsCount: 12 });
    expect(screen.getByText(/12 comments/)).toBeTruthy();
  });

  it('hides comment composer when Hide comments is clicked', async () => {
    const user = userEvent.setup();
    renderCard(mockKudo);
    await user.click(screen.getByRole('button', { name: /view comments/i }));
    expect(await screen.findByPlaceholderText(/write a comment/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /hide comments/i }));
    expect(screen.queryByPlaceholderText(/write a comment/i)).toBeNull();
  });

  it('opens comment composer when View comments is clicked', async () => {
    const user = userEvent.setup();
    renderCard(mockKudo);
    await user.click(screen.getByRole('button', { name: /view comments/i }));
    expect(await screen.findByPlaceholderText(/write a comment/i)).toBeTruthy();
  });

  it('applies low points styling class', () => {
    const { container } = renderCard({ ...mockKudo, points: 15 });
    expect(container.querySelector('.gj-points-low')).toBeTruthy();
  });

  it('applies mid points styling class', () => {
    const { container } = renderCard({ ...mockKudo, points: 25 });
    expect(container.querySelector('.gj-points-mid')).toBeTruthy();
  });

  it('applies high points styling class', () => {
    const { container } = renderCard({ ...mockKudo, points: 50 });
    expect(container.querySelector('.gj-points-high')).toBeTruthy();
  });

  it.each(coreValues)('shows core value tag for %s', (coreValue) => {
    renderCard({ ...mockKudo, coreValue });
    const label = cvLabel(coreValue);
    expect(
      screen.getByText((content) => content.replace('#', '') === label)
    ).toBeTruthy();
  });
});
