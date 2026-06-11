import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vite-plus/test';

import { RewardFilterBar } from '@/lib/components/reward/RewardFilterBar';
import { Provider } from '@/lib/components/ui/provider';
import {
  DEFAULT_REWARD_FILTERS,
  type RewardFilters,
} from '@/lib/types/reward-filters';

const filters: RewardFilters = { ...DEFAULT_REWARD_FILTERS };

describe('RewardFilterBar', () => {
  it('calls onFilter when search input changes', async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();
    render(
      <Provider>
        <RewardFilterBar
          filteredCount={1}
          filters={filters}
          isFiltered={false}
          onFilter={onFilter}
          onReset={vi.fn()}
          totalCount={5}
        />
      </Provider>
    );
    await user.type(screen.getByPlaceholderText(/search rewards/i), 'mug');
    expect(onFilter).toHaveBeenCalled();
    expect(onFilter.mock.calls.some((c) => c[0] === 'search')).toBe(true);
  });

  it('shows clear filters and calls onReset when filtered', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(
      <Provider>
        <RewardFilterBar
          filteredCount={2}
          filters={{ ...filters, search: 'x' }}
          isFiltered
          onFilter={vi.fn()}
          onReset={onReset}
          totalCount={10}
        />
      </Provider>
    );
    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('shows matching rewards label when filtered', () => {
    render(
      <Provider>
        <RewardFilterBar
          filteredCount={3}
          filters={filters}
          isFiltered
          onFilter={vi.fn()}
          onReset={vi.fn()}
          totalCount={10}
        />
      </Provider>
    );
    expect(screen.getByText('3 matching rewards')).toBeTruthy();
  });

  it('calls onFilter when availability select changes', async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();
    render(
      <Provider>
        <RewardFilterBar
          filteredCount={5}
          filters={filters}
          isFiltered={false}
          onFilter={onFilter}
          onReset={vi.fn()}
          totalCount={5}
        />
      </Provider>
    );
    const [availabilitySelect] = screen.getAllByRole('combobox');
    await user.selectOptions(availabilitySelect, 'affordable');
    expect(onFilter).toHaveBeenCalledWith('availability', 'affordable');
  });

  it('calls onFilter when sort select changes', async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();
    render(
      <Provider>
        <RewardFilterBar
          filteredCount={5}
          filters={filters}
          isFiltered={false}
          onFilter={onFilter}
          onReset={vi.fn()}
          totalCount={5}
        />
      </Provider>
    );
    const selects = screen.getAllByRole('combobox');
    const sortSelect = selects[1];
    await user.selectOptions(sortSelect, 'cost_asc');
    expect(onFilter).toHaveBeenCalledWith('sort', 'cost_asc');
  });

  it('shows total rewards label when not filtered', () => {
    render(
      <Provider>
        <RewardFilterBar
          filteredCount={5}
          filters={filters}
          isFiltered={false}
          onFilter={vi.fn()}
          onReset={vi.fn()}
          totalCount={12}
        />
      </Provider>
    );
    expect(screen.getByText('12 rewards')).toBeTruthy();
  });
});
