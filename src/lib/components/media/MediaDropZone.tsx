import { Box, Text } from '@chakra-ui/react';
import { useCallback, useRef, useState } from 'react';

import { MEDIA_CONSTRAINTS } from '@/lib/constants/media';

type MediaDropZoneProps = {
  onFiles: (files: FileList | Array<File>) => void;
  disabled?: boolean;
  canAddMore: boolean;
};

export function MediaDropZone({
  onFiles,
  disabled,
  canAddMore,
}: MediaDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || !canAddMore) {
        return;
      }
      const dropped = [...e.dataTransfer.files];
      if (dropped.length > 0) {
        onFiles(dropped);
      }
    },
    [canAddMore, disabled, onFiles]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFiles(e.target.files);
      e.target.value = '';
    }
  };

  if (!canAddMore) {
    return null;
  }

  return (
    <Box
      bg={isDragging ? 'surface.cream' : 'transparent'}
      borderColor={isDragging ? 'brand.coral' : 'rgba(26, 26, 46, 0.2)'}
      borderRadius="xl"
      borderStyle="dashed"
      borderWidth="1.5px"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      onClick={() => {
        if (!disabled) {
          inputRef.current?.click();
        }
      }}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDrop={handleDrop}
      opacity={disabled ? 0.5 : 1}
      padding={5}
      textAlign="center"
      transition="background 150ms ease, border-color 150ms ease"
    >
      <input
        accept={MEDIA_CONSTRAINTS.ALLOWED_TYPES.join(',')}
        hidden
        multiple
        onChange={handleChange}
        ref={inputRef}
        type="file"
      />
      <Text color="fg.muted" fontSize="sm" marginBottom={1}>
        Drop files here or click to browse
      </Text>
      <Text color="fg.muted" fontSize="xs">
        Images (JPEG, PNG, GIF) or video up to 3 min · Max{' '}
        {String(MEDIA_CONSTRAINTS.MAX_FILES)} files · Up to{' '}
        {String(MEDIA_CONSTRAINTS.MAX_FILE_SIZE_MB)}MB each
      </Text>
    </Box>
  );
}
