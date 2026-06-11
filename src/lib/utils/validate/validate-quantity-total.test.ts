import { describe, expect, it } from 'vite-plus/test';

import {
  MAX_REWARD_QUANTITY,
  validateQuantityTotal,
} from '@/lib/utils/validate/validate-quantity-total';

describe('validateQuantityTotal', () => {
  it('returns undefined for valid quantities', () => {
    expect(validateQuantityTotal(1)).toBeUndefined();
    expect(validateQuantityTotal(MAX_REWARD_QUANTITY)).toBeUndefined();
  });

  it('rejects non-finite and below 1', () => {
    expect(validateQuantityTotal(Number.NaN)).toBe(
      'Quantity must be at least 1'
    );
    expect(validateQuantityTotal(0)).toBe('Quantity must be at least 1');
    expect(validateQuantityTotal(-3)).toBe('Quantity must be at least 1');
  });

  it('rejects above maximum', () => {
    expect(validateQuantityTotal(MAX_REWARD_QUANTITY + 1)).toBe(
      'Quantity cannot exceed 10,000,000'
    );
  });
});
