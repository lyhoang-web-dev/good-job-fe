import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vite-plus/test';

import { useOffsetPagination } from '../useOffsetPagination';

describe('useOffsetPagination', () => {
  it('computes skip from page and pageSize', () => {
    const { result } = renderHook(() =>
      useOffsetPagination({ initialPage: 2, pageSize: 10 })
    );
    expect(result.current.page).toBe(2);
    expect(result.current.skip).toBe(10);
  });

  it('goToPage updates page and scrolls by default', () => {
    const scrollTo = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => undefined);
    const { result } = renderHook(() => useOffsetPagination());
    act(() => {
      result.current.goToPage(3);
    });
    expect(result.current.page).toBe(3);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    scrollTo.mockRestore();
  });

  it('goToPage skips scroll when scrollOnPageChange is false', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo');
    const { result } = renderHook(() =>
      useOffsetPagination({ scrollOnPageChange: false })
    );
    act(() => {
      result.current.goToPage(2);
    });
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('reset returns to initialPage', () => {
    const { result } = renderHook(() =>
      useOffsetPagination({ initialPage: 2, pageSize: 5 })
    );
    act(() => {
      result.current.goToPage(5);
    });
    expect(result.current.page).toBe(5);
    act(() => {
      result.current.reset();
    });
    expect(result.current.page).toBe(2);
  });
});
