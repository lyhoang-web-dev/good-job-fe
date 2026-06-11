import { Box, Button, Text } from '@chakra-ui/react';
import type { AriaAttributes, ReactNode } from 'react';

type PageButtonProps = {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
} & Pick<AriaAttributes, 'aria-label' | 'aria-current'>;

function PageButton({
  children,
  onClick,
  disabled,
  isActive,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrent,
}: PageButtonProps) {
  return (
    <Button
      aria-current={ariaCurrent}
      aria-label={ariaLabel}
      borderRadius="md"
      colorPalette="brand"
      disabled={disabled}
      flexShrink={0}
      fontWeight={isActive ? 'semibold' : 'normal'}
      height="32px"
      minWidth="32px"
      onClick={onClick}
      padding={0}
      size="sm"
      variant={isActive ? 'solid' : 'outline'}
    >
      {children}
    </Button>
  );
}

function range(start: number, end: number): Array<number> {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function generatePageNumbers(
  current: number,
  total: number,
  siblings: number
): Array<number | '...'> {
  const totalNumbers = siblings * 2 + 3;
  const totalBlocks = totalNumbers + 2;

  if (total <= totalBlocks) {
    return range(1, total);
  }

  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + 2 * siblings;
    return [...range(1, leftCount), '...', total];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + 2 * siblings;
    return [1, '...', ...range(total - rightCount + 1, total)];
  }

  return [1, '...', ...range(leftSibling, rightSibling), '...', total];
}

export type OffsetPaginationProps = {
  page: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showTotal?: boolean;
  totalItems?: number;
  pageSize?: number;
};

export function OffsetPagination({
  page,
  totalPages,
  isLoading = false,
  onPageChange,
  siblingCount = 1,
  showTotal = false,
  totalItems,
  pageSize,
}: OffsetPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = generatePageNumbers(page, totalPages, siblingCount);

  return (
    <Box
      alignItems="center"
      display="flex"
      flexWrap="wrap"
      gap={3}
      justifyContent="space-between"
      paddingY={4}
    >
      {showTotal && totalItems !== undefined ? (
        <Text color="fg.muted" flex="1" fontSize="sm" minWidth="0">
          {totalItems} items
          {pageSize === undefined
            ? null
            : ` · Page ${String(page)} of ${String(totalPages)}`}
        </Text>
      ) : null}

      <Box
        alignItems="center"
        display="flex"
        flexShrink={0}
        flexWrap="wrap"
        gap={1}
      >
        <PageButton
          aria-label="Previous page"
          disabled={page === 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          ←
        </PageButton>

        {pages.map((p, i) =>
          p === '...' ? (
            <Text
              color="fg.muted"
              fontSize="sm"
              key={`ellipsis-${String(i)}`}
              paddingX={2}
            >
              …
            </Text>
          ) : (
            <PageButton
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${String(p)}`}
              disabled={isLoading}
              isActive={p === page}
              key={p}
              onClick={() => onPageChange(p)}
            >
              {p}
            </PageButton>
          )
        )}

        <PageButton
          aria-label="Next page"
          disabled={page === totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          →
        </PageButton>
      </Box>
    </Box>
  );
}
