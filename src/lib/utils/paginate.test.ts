import { describe, expect, it } from 'vite-plus/test';

import { paginateSlice } from './paginate';

describe('paginateSlice', () => {
  it('returns first page', () => {
    expect(paginateSlice([1, 2, 3, 4, 5], 1, 2)).toEqual([1, 2]);
  });

  it('returns second page', () => {
    expect(paginateSlice([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4]);
  });

  it('returns partial last page', () => {
    expect(paginateSlice([1, 2, 3], 2, 2)).toEqual([3]);
  });
});
