import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
  Box,
  Button,
  Field,
  Flex,
  Skeleton,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { OffsetPagination } from '@/lib/components/pagination';
import { useOffsetPagination } from '@/lib/hooks/useOffsetPagination';
import { kudosService } from '@/lib/services/kudos';
import { queryKeys } from '@/lib/services/queryKeys';
import type { Comment } from '@/lib/types';
import { bumpCommentsCountForKudo } from '@/lib/utils/cache/query-cache';
import { formatRelativeTime } from '@/lib/utils/format/relative-time';

type CommentSectionProps = {
  kudoId: string;
  isOpen: boolean;
};

const COMMENT_PAGE_SIZE = 8;

export function CommentSection({ kudoId, isOpen }: CommentSectionProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const { page, pageSize, skip, goToPage, reset } = useOffsetPagination({
    pageSize: COMMENT_PAGE_SIZE,
    scrollOnPageChange: false,
  });

  const { data: comments, isLoading } = useQuery({
    queryKey: queryKeys.kudos.comments(kudoId),
    queryFn: () => kudosService.getComments(kudoId),
    enabled: isOpen,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset pagination when `kudoId` changes
  useEffect(() => {
    reset();
  }, [kudoId, reset]);

  const allComments = comments ?? [];
  const commentRows = useMemo(
    () => allComments.slice(skip, skip + pageSize),
    [allComments, pageSize, skip]
  );
  const commentTotalPages = Math.max(
    1,
    Math.ceil(allComments.length / pageSize)
  );

  useEffect(() => {
    if (page > commentTotalPages) {
      goToPage(commentTotalPages);
    }
  }, [commentTotalPages, goToPage, page]);

  const addComment = useMutation({
    mutationFn: () => kudosService.addComment(kudoId, content.trim()),
    onSuccess: (newComment) => {
      setContent('');
      queryClient.setQueryData<Array<Comment>>(
        queryKeys.kudos.comments(kudoId),
        (old) => (old ? [...old, newComment] : [newComment])
      );
      bumpCommentsCountForKudo(queryClient, kudoId);
    },
  });

  if (!isOpen) {
    return null;
  }

  return (
    <Box borderTopWidth="1px" marginTop={3} paddingTop={3}>
      {isLoading && (
        <Flex direction="column" gap={2}>
          <Skeleton height="10" />
          <Skeleton height="10" />
          <Skeleton height="10" />
        </Flex>
      )}
      {!isLoading &&
        commentRows.map((c) => (
          <Flex gap={3} key={c.id} marginBottom={3}>
            <AvatarRoot size="sm">
              <AvatarImage src={c.user.avatarUrl} />
              <AvatarFallback name={c.user.name} />
            </AvatarRoot>
            <Box>
              <Text fontSize="sm" fontWeight="semibold">
                {c.user.name}
              </Text>
              <Text color="fg.muted" fontSize="xs">
                {formatRelativeTime(c.createdAt)}
              </Text>
              <Text marginTop={1}>{c.content}</Text>
            </Box>
          </Flex>
        ))}
      {!isLoading && allComments.length > 0 ? (
        <OffsetPagination
          onPageChange={goToPage}
          page={page}
          pageSize={pageSize}
          showTotal
          totalItems={allComments.length}
          totalPages={commentTotalPages}
        />
      ) : null}
      <Field.Root>
        <Field.Label>Comment</Field.Label>
        <Textarea
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment…"
          rows={2}
          value={content}
        />
      </Field.Root>
      <Button
        disabled={addComment.isPending || content.trim().length === 0}
        loading={addComment.isPending}
        marginTop={2}
        onClick={() => addComment.mutate()}
        size="sm"
      >
        Send
      </Button>
    </Box>
  );
}
