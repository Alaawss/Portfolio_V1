'use client';

import { useSyncExternalStore } from 'react';

// The live Casablanca time ("17:35") for the site header.
// Morocco left UTC+1 on 20 September 2026 and has been on UTC+0 all year since (no more Ramadan switches), so
// Casablanca time is simply UTC. It's worked out here rather than with the browser's time-zone data because
// older browsers and devices still have Casablanca at UTC+1
export function casablancaTime() {
  const d = new Date();
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

// useSyncExternalStore: the server renders "--:--" and the browser switches to the real time right after
// hydration (no mismatch warning), then re-reads it every 15s
const subscribe = (onChange: () => void) => {
  const id = window.setInterval(onChange, 15000);
  return () => window.clearInterval(id);
};

export function useCasablancaTime() {
  return useSyncExternalStore(subscribe, casablancaTime, () => '--:--');
}
