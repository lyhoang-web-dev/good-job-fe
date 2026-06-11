import { describe, expect, it } from 'vite-plus/test';

import { buildRewardsCatalogParams } from '../rewards-catalog-params';

describe('buildRewardsCatalogParams', () => {
  it('includes page and limit', () => {
    expect(buildRewardsCatalogParams(undefined, undefined, 2, 24)).toEqual({
      page: 2,
      limit: 24,
    });
  });

  it('trims search and includes when non-empty', () => {
    const p = buildRewardsCatalogParams(
      { search: '  hoodie  ', availability: 'all', sort: 'availability' },
      100,
      1,
      12
    );
    expect(p.search).toBe('hoodie');
  });

  it('omits search when blank', () => {
    const p = buildRewardsCatalogParams(
      { search: '   ', availability: 'all', sort: 'availability' },
      100,
      1,
      12
    );
    expect('search' in p).toBe(false);
  });

  it('omits availability when all', () => {
    const p = buildRewardsCatalogParams(
      { availability: 'all', search: '', sort: 'availability' },
      100,
      1,
      12
    );
    expect('availability' in p).toBe(false);
  });

  it('includes availability when not all', () => {
    const p = buildRewardsCatalogParams(
      { availability: 'in_stock', search: '', sort: 'availability' },
      100,
      1,
      12
    );
    expect(p.availability).toBe('in_stock');
  });

  it('includes userBalance only for affordable filter', () => {
    const withBalance = buildRewardsCatalogParams(
      { availability: 'affordable', search: '', sort: 'availability' },
      350,
      1,
      12
    );
    expect(withBalance.userBalance).toBe(350);

    const noBalance = buildRewardsCatalogParams(
      { availability: 'affordable', search: '', sort: 'availability' },
      undefined,
      1,
      12
    );
    expect('userBalance' in noBalance).toBe(false);
  });

  it('includes sort key', () => {
    const p = buildRewardsCatalogParams(
      { availability: 'all', search: '', sort: 'cost_desc' },
      100,
      1,
      12
    );
    expect(p.sort).toBe('cost_desc');
  });
});
