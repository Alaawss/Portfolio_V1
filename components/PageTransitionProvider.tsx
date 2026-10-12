'use client';

import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// The other half of the page transition (components/TransitionLink.tsx). The browser's View Transitions API
// takes a picture of the old page, then waits for a promise to say "the new page is in place" before it takes
// the second picture and animates between them. A Next.js navigation doesn't hand back such a promise, so the
// link leaves its "done" callback here, and this calls it as soon as the address (pathname) has changed, i.e.
// once React has put the new page on screen.
// It sits in app/layout.tsx, around every page.

type Finish = () => void;

const RegisterFinish = createContext<((finish: Finish) => void) | null>(null);

export default function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pending = useRef<Finish | null>(null);

  // Runs after the page for the new pathname has been rendered (effects run after the DOM is updated)
  useEffect(() => {
    pending.current?.();
    pending.current = null;
  }, [pathname]);

  const register = useCallback((finish: Finish) => {
    pending.current = finish;
  }, []);

  return <RegisterFinish.Provider value={register}>{children}</RegisterFinish.Provider>;
}

// For TransitionLink: null outside the provider, in which case links just navigate normally
export function useRegisterFinish() {
  return useContext(RegisterFinish);
}
