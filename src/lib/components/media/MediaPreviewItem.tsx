import { Box, Flex, Spinner, Text } from '@chakra-ui/react';

import { UPLOAD_STATE } from '@/lib/constants/media';
import type { MediaFile } from '@/lib/types/media';

type MediaState = MediaFile['state'];

type MediaPreviewItemProps = {
  media: MediaFile;
  onRemove: (id: string) => void;
};

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${String(m)}:${String(s).padStart(2, '0')}`;
}

function StateOverlay({
  bg,
  children,
  opacity = 1,
}: {
  bg: string;
  children: React.ReactNode;
  opacity?: number;
}) {
  return (
    <Box
      alignItems="center"
      bg={bg}
      display="flex"
      flexDirection="column"
      inset={0}
      justifyContent="center"
      opacity={opacity}
      position="absolute"
    >
      {children}
    </Box>
  );
}

function previewBorderColor(state: MediaState): string {
  if (state === UPLOAD_STATE.FAILED) {
    return 'red.200';
  }
  if (state === UPLOAD_STATE.READY) {
    return 'green.200';
  }
  return 'rgba(26, 26, 46, 0.12)';
}

export function MediaPreviewItem({ media, onRemove }: MediaPreviewItemProps) {
  const canRemove = media.state !== UPLOAD_STATE.UPLOADING;
  const borderColor = previewBorderColor(media.state);

  return (
    <Box
      borderColor={borderColor}
      borderRadius="lg"
      borderWidth="1px"
      flexShrink={0}
      height="96px"
      overflow="hidden"
      position="relative"
      width="96px"
    >
      {media.type === 'image' ? (
        <img
          alt={media.file.name}
          src={media.previewUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <video
          muted
          playsInline
          src={media.previewUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}

      {media.state === UPLOAD_STATE.VALIDATING ? (
        <StateOverlay bg="blackAlpha.600">
          <Spinner color="white" size="sm" />
        </StateOverlay>
      ) : null}

      {media.state === UPLOAD_STATE.UPLOADING ? (
        <StateOverlay bg="blackAlpha.600">
          <Spinner color="blue.200" size="sm" />
          <Text color="white" fontSize="10px" marginTop={1}>
            {String(media.progress)}%
          </Text>
        </StateOverlay>
      ) : null}

      {media.state === UPLOAD_STATE.PROCESSING ? (
        <StateOverlay bg="blackAlpha.600">
          <Spinner color="yellow.300" size="sm" />
          <Text
            color="white"
            fontSize="9px"
            marginTop={1}
            paddingX={1}
            textAlign="center"
          >
            Processing…
          </Text>
        </StateOverlay>
      ) : null}

      {media.state === UPLOAD_STATE.FAILED ? (
        <StateOverlay bg="red.600" opacity={0.88}>
          <Text
            color="white"
            fontSize="9px"
            lineHeight="1.35"
            paddingX={1}
            textAlign="center"
          >
            {media.error ?? 'Error'}
          </Text>
        </StateOverlay>
      ) : null}

      {media.type === 'video' &&
      media.duration !== undefined &&
      media.state === UPLOAD_STATE.IDLE ? (
        <Box
          background="blackAlpha.700"
          borderRadius="sm"
          bottom={1}
          color="white"
          fontSize="10px"
          left={1}
          paddingX={1}
          position="absolute"
        >
          {formatDuration(media.duration)}
        </Box>
      ) : null}

      {canRemove ? (
        <Flex
          _hover={{ bg: 'red.500' }}
          alignItems="center"
          background="blackAlpha.700"
          borderRadius="full"
          color="white"
          cursor="pointer"
          fontSize="10px"
          height="20px"
          justifyContent="center"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(media.id);
          }}
          position="absolute"
          right={1}
          top={1}
          transition="background 150ms ease"
          width="20px"
        >
          ✕
        </Flex>
      ) : null}
    </Box>
  );
}
