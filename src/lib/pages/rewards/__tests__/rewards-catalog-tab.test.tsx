import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';

import { Provider } from '@/lib/components/ui/provider';
import { RewardsCatalogTab } from '@/lib/pages/rewards/rewards-catalog-tab';
import type { PaginatedRewards } from '@/lib/types';
import { DEFAULT_REWARD_FILTERS } from '@/lib/types/reward-filters';
import { mockReward } from '@/test/mocks/fixtures';

const useRewardsPageMock = vi.hoisted(() => vi.fn());
const useRewardsInfiniteMock = vi.hoisted(() => vi.fn());
const lastIntersectionCallback = vi.hoisted(() => ({
  current: undefined as IntersectionObserverCallback | undefined,
}));

function fireIntersection(): void {
  lastIntersectionCallback.current?.(
    [{ isIntersecting: true }] as IntersectionObserverEntry[],
    {} as IntersectionObserver
  );
}

vi.mock('@/lib/hooks/useRewards', () => ({
  REWARDS_CATALOG_LIMIT: 12,
  useRewardsPage: (...args: ReadonlyArray<unknown>) =>
    useRewardsPageMock(...args),
  useRewardsInfinite: (...args: ReadonlyArray<unknown>) =>
    useRewardsInfiniteMock(...args),
}));

const desktopOk: PaginatedRewards = {
  data: [mockReward],
  limit: 12,
  page: 1,
  total: 1,
  totalPages: 1,
};

const defaultProps = {
  balance: 350,
  deferredFilters: DEFAULT_REWARD_FILTERS,
  filters: DEFAULT_REWARD_FILTERS,
  goToPage: vi.fn(),
  isFiltered: false,
  isMobile: false,
  page: 1,
  resetFilters: vi.fn(),
  setFilter: vi.fn(),
};

function renderTab(overrides?: Partial<typeof defaultProps>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <Provider>
      <QueryClientProvider client={queryClient}>
        <RewardsCatalogTab {...defaultProps} {...overrides} />
      </QueryClientProvider>
    </Provider>
  );
}

describe('RewardsCatalogTab', () => {
  beforeEach(() => {
    lastIntersectionCallback.current = undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class implements Partial<IntersectionObserver> {
        constructor(cb: IntersectionObserverCallback) {
          lastIntersectionCallback.current = cb;
        }
        disconnect = vi.fn();
        observe = vi.fn();
        takeRecords = () => [];
        unobserve = vi.fn();
      } as unknown as typeof IntersectionObserver
    );
    vi.clearAllMocks();
    useRewardsPageMock.mockReturnValue({
      data: desktopOk,
      isPending: false,
      isFetching: false,
    });
    useRewardsInfiniteMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isFetching: false,
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn().mockResolvedValue(undefined),
      refetch: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows coming soon when catalog is empty and not filtered', () => {
    useRewardsPageMock.mockReturnValue({
      data: { ...desktopOk, data: [], total: 0, totalPages: 1 },
      isPending: false,
      isFetching: false,
    });
    renderTab();
    expect(screen.getByText('Rewards coming soon')).toBeTruthy();
  });

  it('shows empty-filter message when catalog is empty while filtered', () => {
    useRewardsPageMock.mockReturnValue({
      data: { ...desktopOk, data: [], total: 0, totalPages: 1 },
      isPending: false,
      isFetching: false,
    });
    renderTab({ isFiltered: true });
    expect(screen.getByText(/No rewards match your filters/i)).toBeTruthy();
  });

  it('shows catalog grid skeleton while desktop query is pending', () => {
    useRewardsPageMock.mockReturnValue({
      data: undefined,
      isPending: true,
      isFetching: false,
    });
    const { container } = renderTab();
    expect(container.querySelector('.chakra-skeleton')).toBeTruthy();
  });

  it('calls goToPage when current page exceeds total pages', async () => {
    const goToPage = vi.fn();
    useRewardsPageMock.mockReturnValue({
      data: { ...desktopOk, totalPages: 1 },
      isPending: false,
      isFetching: false,
    });
    renderTab({ page: 5, goToPage });
    await waitFor(() => expect(goToPage).toHaveBeenCalledWith(1));
  });

  it('renders infinite list on mobile with rewards from infinite query', () => {
    useRewardsInfiniteMock.mockReturnValue({
      data: {
        pages: [{ ...desktopOk, data: [mockReward] }],
        pageParams: [1],
      },
      isPending: false,
      isFetching: false,
      hasNextPage: true,
      isError: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn().mockResolvedValue(undefined),
      refetch: vi.fn().mockResolvedValue(undefined),
    });
    renderTab({ isMobile: true });
    expect(screen.getByText(mockReward.name)).toBeTruthy();
  });

  it('swallows rejection when infinite fetchNextPage fails after sentinel intersects', async () => {
    const fetchNextPage = vi.fn().mockRejectedValue(new Error('network'));
    useRewardsInfiniteMock.mockReturnValue({
      data: {
        pages: [{ ...desktopOk, data: [mockReward] }],
        pageParams: [1],
      },
      isPending: false,
      isFetching: false,
      hasNextPage: true,
      isError: false,
      isFetchingNextPage: false,
      fetchNextPage,
      refetch: vi.fn().mockResolvedValue(undefined),
    });
    renderTab({ isMobile: true });
    await waitFor(() => {
      expect(lastIntersectionCallback.current).toBeDefined();
    });
    fireIntersection();
    await waitFor(() => expect(fetchNextPage).toHaveBeenCalled());
  });

  it('swallows rejection when infinite refetch fails after Retry', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn().mockRejectedValue(new Error('network'));
    useRewardsInfiniteMock.mockReturnValue({
      data: {
        pages: [{ ...desktopOk, data: [], total: 1 }],
        pageParams: [1],
      },
      isPending: false,
      isFetching: false,
      hasNextPage: false,
      isError: true,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn().mockResolvedValue(undefined),
      refetch,
    });
    renderTab({ isMobile: true });
    await user.click(screen.getByRole('button', { name: /retry/i }));
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });
});
