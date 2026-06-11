import { useEffect, useRef } from 'react';

type UsePaginationObserverOptions = {
  onIntersect: () => void;
  enabled?: boolean;
  threshold?: number;
  rootMargin?: string;
  /**
   * When this value changes, the observer is re-attached (e.g. `items.length`
   * after the sentinel first mounts).
   */
  observationKey?: number | string;
};

export function usePaginationObserver({
  onIntersect,
  enabled = true,
  threshold = 0.1,
  rootMargin = '100px',
  observationKey = 0,
}: UsePaginationObserverOptions) {
  const ref = useRef<HTMLDivElement | null>(null);
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-attach when `observationKey` changes
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const el = ref.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersectRef.current();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, threshold, rootMargin, observationKey]);

  return ref;
}
