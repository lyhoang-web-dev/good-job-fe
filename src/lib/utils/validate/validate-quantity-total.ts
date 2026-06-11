export const MAX_REWARD_QUANTITY = 10_000_000;

export function validateQuantityTotal(value: number): string | undefined {
  if (!Number.isFinite(value) || value < 1) {
    return 'Quantity must be at least 1';
  }
  if (value > MAX_REWARD_QUANTITY) {
    return 'Quantity cannot exceed 10,000,000';
  }
  return undefined;
}
