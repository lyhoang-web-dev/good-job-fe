import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { createWrapper } from '@/test/utils/wrapper';

import { useGivingBudget } from '../useGivingBudget';

describe('useGivingBudget', () => {
  it('returns correct derived values after load', async () => {
    const { result } = renderHook(() => useGivingBudget(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.remaining).toBe(150);
    expect(result.current.used).toBe(50);
    expect(result.current.total).toBe(200);
    expect(result.current.percentage).toBe(25);
  });

  it('uses zeroed defaults before budget is loaded', () => {
    const { result } = renderHook(() => useGivingBudget(), {
      wrapper: createWrapper(),
    });

    expect(result.current.remaining).toBe(0);
    expect(result.current.used).toBe(0);
    expect(result.current.total).toBe(0);
    expect(result.current.percentage).toBe(0);
  });
});
