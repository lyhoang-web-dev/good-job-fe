import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

function getIsMobile(): boolean {
  return typeof window === 'undefined'
    ? false
    : window.innerWidth < MOBILE_BREAKPOINT;
}

/** `true` when viewport width &lt; 768px — use infinite scroll; else offset pagination. */
export function useResponsivePagination(): boolean {
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    const mq = window.matchMedia(
      `(max-width: ${String(MOBILE_BREAKPOINT - 1)}px)`
    );

    function onChange(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
    }

    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
