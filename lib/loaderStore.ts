'use client';

import { useSyncExternalStore } from 'react';

// "Has the opening counter (components/Loader.tsx) gone yet?" — so the hero can start its reveal the moment
// the counter lifts on a full page load, instead of playing it unseen underneath. Coming back to Home from
// another page, the counter has long gone, so the reveal starts straight away.
let done = false;
const listeners = new Set<() => void>();

export function markLoaderDone() {
  if (done) return;
  done = true;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// The server (and the hydration pass) always says "not yet", so the hero renders hidden first
export function useLoaderDone() {
  return useSyncExternalStore(subscribe, () => done, () => false);
}
