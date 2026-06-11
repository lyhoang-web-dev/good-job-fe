import { Box, Skeleton, SkeletonCircle, Stack } from '@chakra-ui/react';

export function KudoCardSkeleton() {
  return (
    <Box className="gj-kudo-card">
      <Stack align="center" direction="row" gap={3}>
        <SkeletonCircle height="10" width="10" />
        <Skeleton height="4" width="40%" />
      </Stack>
      <Stack gap={3} marginTop={4}>
        <Skeleton height="4" width="100%" />
        <Skeleton height="4" width="90%" />
        <Skeleton height="4" width="60%" />
      </Stack>
    </Box>
  );
}
