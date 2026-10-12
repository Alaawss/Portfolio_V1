'use client';

import { useSyncExternalStore } from 'react';

// Live result of a CSS media query, e.g. '(hover: none)' or '(prefers-reduced-motion: reduce)'.
// useSyncExternalStore: the server renders with `false`, then React switches to the real value right after
// hydration without a mismatch warning, and it updates if the setting changes while the page is open.
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
