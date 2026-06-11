import { useCallback, useState } from 'react';

type UseOffsetPaginationOptions = {
  initialPage?: number;
  pageSize?: number;
  scrollOnPageChange?: boolean;
};

export function useOffsetPagination({
  initialPage = 1,
  pageSize = 10,
  scrollOnPageChange = true,
}: UseOffsetPaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);

  const goToPage = useCallback(
    (p: number) => {
      setPage(p);
      if (scrollOnPageChange) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [scrollOnPageChange]
  );

  const reset = useCallback(() => setPage(initialPage), [initialPage]);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    goToPage,
    reset,
  };
}
