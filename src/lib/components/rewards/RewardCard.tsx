import {
  Badge,
  Box,
  Button,
  CloseButton,
  Dialog,
  Heading,
  Image,
  Portal,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { HiGift } from 'react-icons/hi';

import { useRedeem } from '@/lib/hooks/useRedeem';
import type { Reward } from '@/lib/types';

type RewardCardProps = {
  reward: Reward;
  userBalance: number;
};

export function RewardCard({ reward, userBalance }: RewardCardProps) {
  const redeem = useRedeem();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isSold = reward.remaining < 1;
  const cannotAfford = userBalance < reward.pointsCost;
  const need = reward.pointsCost - userBalance;
  const isInactive = !reward.isActive;

  const isDisabled = isSold || cannotAfford || redeem.isPending || isInactive;

  let disabledTitle = 'Redeem this reward';
  if (isInactive) {
    disabledTitle = 'This reward is not available';
  } else if (isSold) {
    disabledTitle = 'Sold out';
  } else if (cannotAfford) {
    disabledTitle = `Need ${need} more pts`;
  }

  return (
    <>
      <Box
        className="gj-reward-card"
        css={
          isInactive || isSold
            ? {
                '&:hover': {
                  transform: 'none',
                  boxShadow: 'var(--shadow-card)',
                },
              }
            : undefined
        }
        height="full"
        padding={6}
        position="relative"
        textAlign="center"
      >
        <Box opacity={isInactive || isSold ? 0.5 : 1}>
          <Box
            alignItems="center"
            aspectRatio={4 / 3}
            bg="brand.cream"
            display="flex"
            justifyContent="center"
            marginBottom={4}
            maxHeight="160px"
            overflow="hidden"
            placeSelf="center"
            rounded="12px"
          >
            {reward.imageUrl ? (
              <Image
                alt=""
                objectFit="cover"
                src={reward.imageUrl}
                width="100%"
              />
            ) : (
              <HiGift size={48} />
            )}
          </Box>
          <Heading fontFamily="heading" size="md">
            {reward.name}
          </Heading>
          {reward.remaining > 0 && reward.remaining <= 10 && (
            <Badge colorPalette="orange" marginTop={2} size="sm">
              {reward.remaining} left
            </Badge>
          )}
          {reward.description && (
            <Text
              color="fg.muted"
              css={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
              fontSize="sm"
              marginTop={2}
            >
              {reward.description}
            </Text>
          )}
          <Text
            color="brand.coral"
            fontFamily="mono"
            fontSize="lg"
            fontWeight="medium"
            marginTop={4}
          >
            ◆ {reward.pointsCost} pts
          </Text>
          <Button
            _hover={
              isInactive || isSold
                ? undefined
                : {
                    bg: 'brand.ink',
                    color: 'white',
                  }
            }
            borderColor="brand.ink"
            borderRadius="10px"
            borderWidth="1.5px"
            disabled={isDisabled}
            loading={redeem.isPending}
            marginTop={4}
            onClick={() => {
              if (!(isInactive || isSold)) {
                setConfirmOpen(true);
              }
            }}
            title={disabledTitle}
            variant="outline"
            width="full"
          >
            Redeem
          </Button>
        </Box>
        {isSold && !isInactive && (
          <Box
            alignItems="center"
            display="flex"
            inset={0}
            justifyContent="center"
            pointerEvents="none"
            position="absolute"
            zIndex={2}
          >
            <Text
              as="span"
              bg="#e8e8ef"
              border="2px double #3d3d52"
              color="#3d3d52"
              fontFamily="Georgia, serif"
              fontSize="sm"
              fontWeight="bold"
              paddingX={3}
              paddingY={1}
              textTransform="uppercase"
              transform="rotate(-10deg)"
            >
              Sold
            </Text>
          </Box>
        )}
        {isInactive && (
          <Box
            alignItems="center"
            display="flex"
            inset={0}
            justifyContent="center"
            pointerEvents="none"
            position="absolute"
            zIndex={2}
          >
            <Text
              as="span"
              bg="#ffe4e4"
              border="2px double #842029"
              color="#842029"
              fontFamily="Georgia, serif"
              fontSize="sm"
              fontWeight="bold"
              paddingX={3}
              paddingY={1}
              textTransform="uppercase"
              transform="rotate(-10deg)"
            >
              Expired
            </Text>
          </Box>
        )}
      </Box>

      <Dialog.Root
        onOpenChange={(e) => setConfirmOpen(e.open)}
        open={confirmOpen && !isInactive && !isSold}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="24px">
              <Dialog.Header>
                <Dialog.Title>Confirm redemption</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Text>
                  Redeem <strong>{reward.name}</strong> for{' '}
                  <strong>{reward.pointsCost}</strong> points?
                </Text>
                <Text color="fg.muted" fontSize="sm" marginTop={3}>
                  {reward.remaining > 0 && reward.remaining <= 10 && (
                    <>Only {reward.remaining} left — </>
                  )}
                  This will deduct {reward.pointsCost} pts from your balance
                  (currently {userBalance} pts). Remaining:{' '}
                  {userBalance - reward.pointsCost} pts
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={() => setConfirmOpen(false)} variant="outline">
                  Cancel
                </Button>
                <Button
                  loading={redeem.isPending}
                  onClick={() => {
                    redeem.mutate(
                      { rewardId: reward.id },
                      {
                        onSuccess: () => setConfirmOpen(false),
                      }
                    );
                  }}
                >
                  Confirm
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
