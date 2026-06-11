import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { useResponsivePagination } from '../useResponsivePagination';

function createMatchMediaMock(initialMatches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  const mq = {
    get matches() {
      return initialMatches;
    },
    addEventListener: vi.fn(
      (_event: 'change', handler: (e: MediaQueryListEvent) => void) => {
        listeners.push(handler);
      }
    ),
    removeEventListener: vi.fn(
      (_event: 'change', handler: (e: MediaQueryListEvent) => void) => {
        const i = listeners.indexOf(handler);
        if (i !== -1) {
          listeners.splice(i, 1);
        }
      }
    ),
    /** Simulate browser media query change */
    emitChange(matches: boolean) {
      const event = { matches } as MediaQueryListEvent;
      for (const h of listeners) {
        h(event);
      }
    },
  };
  return mq;
}

describe('useResponsivePagination', () => {
  let mq: ReturnType<typeof createMatchMediaMock>;

  beforeEach(() => {
    mq = createMatchMediaMock(false);
    vi.spyOn(window, 'matchMedia').mockImplementation(
      () => mq as unknown as MediaQueryList
    );
  });

  it('returns false on desktop (>= 768px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
    });
    const { result } = renderHook(() => useResponsivePagination());
    expect(result.current).toBe(false);
  });

  it('returns true on mobile (< 768px)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
    const { result } = renderHook(() => useResponsivePagination());
    expect(result.current).toBe(true);
  });

  it('updates when MediaQuery fires change event', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
    });
    const { result } = renderHook(() => useResponsivePagination());
    expect(result.current).toBe(false);

    act(() => {
      mq.emitChange(true);
    });

    expect(result.current).toBe(true);
  });

  it('removes event listener on unmount', () => {
    const { unmount } = renderHook(() => useResponsivePagination());
    unmount();
    expect(mq.removeEventListener).toHaveBeenCalled();
  });
});
