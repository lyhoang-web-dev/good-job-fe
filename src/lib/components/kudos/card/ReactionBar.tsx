import { Badge, Button, Flex, Popover, Portal, Text } from '@chakra-ui/react';
import { useState } from 'react';

import { useReaction } from '@/lib/hooks/useReaction';
import type { Reaction } from '@/lib/types';

const PRESET_EMOJIS = ['👏', '❤️', '🔥', '🎉', '💪'];

type ReactionBarProps = {
  reactions: Array<Reaction>;
  kudoId: string;
  currentUserId: string;
};

function buildReactionMap(reactions: Array<Reaction>, currentUserId: string) {
  const map = new Map<string, { count: number; userReacted: boolean }>();
  for (const r of reactions) {
    const cur = map.get(r.emoji) ?? { count: 0, userReacted: false };
    cur.count += 1;
    if (r.user.id === currentUserId) {
      cur.userReacted = true;
    }
    map.set(r.emoji, cur);
  }
  return map;
}

export function ReactionBar({
  reactions,
  kudoId,
  currentUserId,
}: ReactionBarProps) {
  const mutation = useReaction(kudoId, currentUserId);
  const [pickerOpen, setPickerOpen] = useState(false);
  const grouped = buildReactionMap(reactions, currentUserId);

  const toggle = (emoji: string) => {
    const userReacted = reactions.some(
      (r) => r.emoji === emoji && r.user.id === currentUserId
    );
    mutation.mutate({ emoji, isReacted: userReacted });
  };

  return (
    <Flex align="center" flexWrap="wrap" gap={2}>
      {[...grouped.entries()].map(([emoji, { count, userReacted }]) => (
        <Button
          borderColor={userReacted ? 'blue.500' : 'border'}
          borderWidth="1px"
          disabled={mutation.isPending}
          key={emoji}
          onClick={() => toggle(emoji)}
          paddingX={2}
          size="xs"
          variant={userReacted ? 'subtle' : 'outline'}
        >
          <Text as="span" marginRight={1}>
            {emoji}
          </Text>
          <Badge size="sm">{count}</Badge>
        </Button>
      ))}
      <Popover.Root
        onOpenChange={(e) => setPickerOpen(e.open)}
        open={pickerOpen}
      >
        <Popover.Trigger asChild>
          <Button
            aria-label="Add reaction"
            disabled={mutation.isPending}
            size="xs"
            variant="outline"
          >
            +
          </Button>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content padding={2} width="auto">
              <Flex gap={1}>
                {PRESET_EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    onClick={() => {
                      toggle(emoji);
                      setPickerOpen(false);
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    {emoji}
                  </Button>
                ))}
              </Flex>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </Flex>
  );
}
