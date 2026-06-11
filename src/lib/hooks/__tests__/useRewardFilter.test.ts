import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vite-plus/test';

import { DEFAULT_REWARD_FILTERS } from '@/lib/types/reward-filters';

import { useRewardFilter } from '../useRewardFilter';

describe('useRewardFilter', () => {
  it('starts with default filters', () => {
    const { result } = renderHook(() => useRewardFilter());
    expect(result.current.filters).toEqual(DEFAULT_REWARD_FILTERS);
    expect(result.current.isFiltered).toBe(false);
  });

  it('updates search and marks filtered', () => {
    const { result } = renderHook(() => useRewardFilter());
    act(() => {
      result.current.setFilter('search', 'hoodie');
    });
    expect(result.current.filters.search).toBe('hoodie');
    expect(result.current.isFiltered).toBe(true);
  });

  it('marks filtered when availability changes from default', () => {
    const { result } = renderHook(() => useRewardFilter());
    act(() => {
      result.current.setFilter('availability', 'affordable');
    });
    expect(result.current.filters.availability).toBe('affordable');
    expect(result.current.isFiltered).toBe(true);
  });

  it('marks filtered when sort changes', () => {
    const { result } = renderHook(() => useRewardFilter());
    act(() => {
      result.current.setFilter('sort', 'cost_asc');
    });
    expect(result.current.filters.sort).toBe('cost_asc');
    expect(result.current.isFiltered).toBe(true);
  });

  it('resets filters and page', () => {
    const { result } = renderHook(() => useRewardFilter());
    act(() => {
      result.current.setFilter('search', 'x');
    });
    act(() => {
      result.current.goToPage(4);
    });
    expect(result.current.page).toBe(4);

    act(() => {
      result.current.resetFilters();
    });
    expect(result.current.filters.search).toBe('');
    expect(result.current.isFiltered).toBe(false);
    expect(result.current.page).toBe(1);
  });

  it('goToPage scrolls to top', () => {
    const scrollTo = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => undefined);
    const { result } = renderHook(() => useRewardFilter());
    act(() => {
      result.current.goToPage(2);
    });
    expect(result.current.page).toBe(2);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    scrollTo.mockRestore();
  });

  it('resetPage sets page to 1', () => {
    const { result } = renderHook(() => useRewardFilter());
    act(() => {
      result.current.goToPage(3);
    });
    act(() => {
      result.current.resetPage();
    });
    expect(result.current.page).toBe(1);
  });
});
