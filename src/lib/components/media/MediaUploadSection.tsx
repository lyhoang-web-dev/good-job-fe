import { Box, Text } from '@chakra-ui/react';

import { MediaDropZone } from '@/lib/components/media/MediaDropZone';
import { MediaPreviewItem } from '@/lib/components/media/MediaPreviewItem';
import { MEDIA_CONSTRAINTS } from '@/lib/constants/media';
import type { useMediaUpload } from '@/lib/hooks/useMediaUpload';

type MediaUploadSectionProps = {
  uploadHook: ReturnType<typeof useMediaUpload>;
  disabled?: boolean;
};

export function MediaUploadSection({
  uploadHook,
  disabled,
}: MediaUploadSectionProps) {
  const { files, addFiles, removeFile, canAddMore } = uploadHook;

  return (
    <Box>
      {files.length > 0 ? (
        <Box display="flex" flexWrap="wrap" gap={2} marginBottom={3}>
          {files.map((media) => (
            <MediaPreviewItem
              key={media.id}
              media={media}
              onRemove={removeFile}
            />
          ))}
        </Box>
      ) : null}

      <MediaDropZone
        canAddMore={canAddMore}
        disabled={disabled}
        onFiles={addFiles}
      />

      <Text color="fg.muted" fontSize="xs" marginTop={1} textAlign="right">
        {String(files.length)} / {String(MEDIA_CONSTRAINTS.MAX_FILES)} files
      </Text>
    </Box>
  );
}
