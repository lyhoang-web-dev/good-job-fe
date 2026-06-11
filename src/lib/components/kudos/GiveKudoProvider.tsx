import { Button } from '@chakra-ui/react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { SendKudoModal } from '@/lib/components/kudos/send-modal';
import { GIVE_KUDO_FAB_BOTTOM } from '@/lib/layout/fixed-bottom';

type GiveKudoContextValue = {
  openGiveKudo: () => void;
};

const GiveKudoContext = createContext<GiveKudoContextValue | null>(null);

export function useGiveKudo(): GiveKudoContextValue {
  const ctx = useContext(GiveKudoContext);
  if (!ctx) {
    throw new Error('useGiveKudo must be used within GiveKudoProvider');
  }
  return ctx;
}

type GiveKudoProviderProps = {
  children: React.ReactNode;
  /** When false (e.g. on /login), hide FAB and close modal — provider still wraps so hooks never break during route transitions. */
  showFab?: boolean;
};

export function GiveKudoProvider(props: GiveKudoProviderProps) {
  const { children, showFab = true } = props;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showFab) {
      setOpen(false);
    }
  }, [showFab]);

  const openGiveKudo = useCallback(() => setOpen(true), []);

  const value = useMemo(
    () => ({
      openGiveKudo,
    }),
    [openGiveKudo]
  );

  const fab = (
    <Button
      _hover={{
        bg: 'brand.inkHover',
        transform: 'translateY(-1px)',
      }}
      bg="brand.ink"
      borderRadius="full"
      bottom={GIVE_KUDO_FAB_BOTTOM}
      color="white"
      fontWeight="semibold"
      onClick={openGiveKudo}
      paddingX={{ base: 6, md: 8 }}
      paddingY={{ base: 5, md: 6 }}
      position="fixed"
      right="calc(1.5rem + env(safe-area-inset-right, 0px))"
      shadow="dropdown"
      transition="all 200ms ease-out"
      zIndex="sticky"
    >
      Give Kudo
    </Button>
  );

  return (
    <GiveKudoContext.Provider value={value}>
      {children}
      <SendKudoModal isOpen={open} onClose={() => setOpen(false)} />
      {mounted && showFab ? createPortal(fab, document.body) : null}
    </GiveKudoContext.Provider>
  );
}
