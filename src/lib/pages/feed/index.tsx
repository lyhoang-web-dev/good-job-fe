import { Box } from '@chakra-ui/react';

import { KudoFeed } from '@/lib/components/kudos/feed/KudoFeed';
import { useGiveKudo } from '@/lib/components/kudos/GiveKudoProvider';

export default function FeedPage() {
  const { openGiveKudo } = useGiveKudo();

  return (
    <Box width="full">
      <KudoFeed onGiveKudo={openGiveKudo} />
    </Box>
  );
}
