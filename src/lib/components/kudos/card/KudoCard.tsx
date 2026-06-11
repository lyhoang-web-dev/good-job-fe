import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
  Badge,
  Box,
  Button,
  Flex,
  Image,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { HiArrowRight } from 'react-icons/hi';

import type { CoreValue, Kudo, KudoMedia } from '@/lib/types';
import { cvLabel } from '@/lib/utils/format/core-value';
import { formatRelativeTime } from '@/lib/utils/format/relative-time';

import { CommentSection } from './CommentSection';
import { ReactionBar } from './ReactionBar';

const CV_BG: Record<CoreValue, string> = {
  teamwork: 'var(--cv-teamwork)',
  ownership: 'var(--cv-ownership)',
  innovation: 'var(--cv-innovation)',
  integrity: 'var(--cv-integrity)',
  customer_focus: 'var(--cv-customer)',
};

function pointsClass(points: number): string {
  if (points <= 20) {
    return 'gj-points-low';
  }
  if (points <= 35) {
    return 'gj-points-mid';
  }
  return 'gj-points-high';
}

function MediaPreview({ media }: { media: Array<KudoMedia> }) {
  if (media.length === 0) {
    return null;
  }
  const images = media.filter((m) => m.type === 'image');
  const videos = media.filter((m) => m.type === 'video');

  return (
    <Flex direction="column" gap={2} marginTop={2}>
      {images.length > 0 && (
        <Flex flexWrap="wrap" gap={2}>
          {images.map((m) => (
            <Box
              borderRadius="12px"
              key={m.id}
              maxHeight="220px"
              maxWidth="100%"
              overflow="hidden"
            >
              <Image alt="" objectFit="cover" src={m.url} width="100%" />
              {m.status === 'processing' && (
                <Badge colorPalette="yellow" marginTop={1}>
                  Processing…
                </Badge>
              )}
            </Box>
          ))}
        </Flex>
      )}
      {videos.map((m) => (
        <Box key={m.id} position="relative">
          <video
            controls
            src={m.url}
            style={{
              borderRadius: '12px',
              maxHeight: 280,
              width: '100%',
            }}
          >
            <track kind="captions" />
          </video>
          {m.durationSecs != null && (
            <Badge position="absolute" right={2} top={2}>
              {Math.floor(m.durationSecs / 60)}:
              {String(m.durationSecs % 60).padStart(2, '0')}
            </Badge>
          )}
          {m.status === 'processing' && (
            <Badge colorPalette="yellow" marginTop={1}>
              Processing…
            </Badge>
          )}
        </Box>
      ))}
    </Flex>
  );
}

type KudoCardProps = {
  kudo: Kudo;
  currentUserId: string;
};

export function KudoCard({ kudo, currentUserId }: KudoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const long = kudo.message.length > 180;
  const shown =
    expanded || !long ? kudo.message : `${kudo.message.slice(0, 180)}…`;

  return (
    <Box className="gj-kudo-card">
      <Flex
        align="center"
        flexWrap="wrap"
        gap={3}
        justify="space-between"
        width="100%"
      >
        <Flex align="center" flex={1} flexWrap="wrap" gap={2} minWidth={0}>
          <AvatarRoot size="sm">
            <AvatarImage src={kudo.sender.avatarUrl} />
            <AvatarFallback name={kudo.sender.name} />
          </AvatarRoot>
          <Text fontSize="sm" fontWeight="semibold" truncate>
            {kudo.sender.name}
          </Text>
          <Box as="span" color="brand.coral" fontSize="md">
            <HiArrowRight />
          </Box>
          <AvatarRoot size="sm">
            <AvatarImage src={kudo.receiver.avatarUrl} />
            <AvatarFallback name={kudo.receiver.name} />
          </AvatarRoot>
          <Text fontSize="sm" fontWeight="semibold" truncate>
            {kudo.receiver.name}
          </Text>
        </Flex>
        <Text color="fg.muted" fontSize="sm" whiteSpace="nowrap">
          {formatRelativeTime(kudo.createdAt)}
        </Text>
      </Flex>

      <Flex align="center" flexWrap="wrap" gap={2} marginTop={3}>
        <Badge
          borderRadius="full"
          className={pointsClass(kudo.points)}
          fontFamily="mono"
          fontSize="13px"
          fontWeight="medium"
          paddingX={3}
          paddingY={1}
        >
          +{kudo.points} pts
        </Badge>
        <Box as="span" background={CV_BG[kudo.coreValue]} className="gj-cv-tag">
          #{cvLabel(kudo.coreValue)}
        </Box>
      </Flex>

      <Box marginTop={4}>
        <Text
          css={{
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 'unset' : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          fontSize="sm"
          lineHeight="1.65"
        >
          &ldquo;{shown}&rdquo;
        </Text>
        {long && (
          <Button
            marginTop={2}
            onClick={() => setExpanded(!expanded)}
            size="xs"
            variant="ghost"
          >
            {expanded ? 'Show less' : 'Read more'}
          </Button>
        )}
      </Box>

      <MediaPreview media={kudo.media} />

      <Box
        borderColor="border.subtle"
        borderTopWidth="1px"
        marginTop={4}
        paddingTop={4}
      >
        <Flex align="center" flexWrap="wrap" gap={3} justify="space-between">
          <Box flex={1} minWidth={0}>
            <ReactionBar
              currentUserId={currentUserId}
              kudoId={kudo.id}
              reactions={kudo.reactions}
            />
          </Box>
          <Text color="fg.muted" fontSize="sm" whiteSpace="nowrap">
            💬 {kudo.commentsCount} comments
          </Text>
        </Flex>
        <Button
          marginTop={2}
          onClick={() => setCommentsOpen(!commentsOpen)}
          size="sm"
          variant="ghost"
        >
          {commentsOpen ? 'Hide comments' : 'View comments'}
        </Button>
        <CommentSection isOpen={commentsOpen} kudoId={kudo.id} />
      </Box>
    </Box>
  );
}
