/** 1-based page, client-side window over `items`. */
export function paginateSlice<T>(
  items: Array<T>,
  page: number,
  pageSize: number
): Array<T> {
  const skip = (page - 1) * pageSize;
  return items.slice(skip, skip + pageSize);
}
