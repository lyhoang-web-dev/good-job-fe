import { describe, expect, it } from 'vite-plus/test';

describe('@/lib/components/reward barrel', () => {
  it('re-exports skeleton and filter bar', async () => {
    const mod = await import('@/lib/components/reward');
    expect(mod.RewardCardSkeleton).toBeTypeOf('function');
    expect(mod.RewardFilterBar).toBeTypeOf('function');
  });
});
