'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useLenis } from 'lenis/react';
import ContactSheet from '@/components/contact/ContactSheet';

// The contact "remote control". One provider (in components/PageShell.tsx, around the header and the footer)
// keeps a single piece of state, "is the contact form open, and who opened it?", and shares it through React
// context. Any component inside can call useContact() and get:
//   open(origin, trigger)  – open the form. origin says which entry point was used, trigger is the element that
//                            was clicked (the card grows out of it and focus returns to it afterwards)
//   close()                – start closing (the card plays its closing animation first)
//   session / closing      – what's open right now, for the components that draw it
//
// Who draws what:
//   origin "footer"           → the footer's Contact card grows in place (components/sections/Footer.tsx)
//   origin "header" or "menu" → a sheet grows out of the pill / the menu button (ContactSheet, rendered below)
// Both show the same form, components/contact/ContactSentence.tsx.

export type ContactOrigin = 'footer' | 'header' | 'menu';
type Trigger = HTMLElement | RefObject<HTMLElement | null> | null | undefined;

type Session = {
  origin: ContactOrigin;
  trigger: HTMLElement | null;
  id: number; // a fresh number each time, so every opening starts from a clean form
};

type ContactContextValue = {
  session: Session | null;
  closing: boolean;
  open: (origin: ContactOrigin, trigger?: Trigger) => void;
  close: () => void;
  // Called by the card once its closing animation has finished: forget the session, give focus back
  finishClose: () => void;
};

const ContactContext = createContext<ContactContextValue | null>(null);

export function useContact() {
  const value = useContext(ContactContext);
  if (!value) throw new Error('useContact() must be used inside <ContactProvider>');
  return value;
}

export default function ContactProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [closing, setClosing] = useState(false);

  const open = useCallback((origin: ContactOrigin, trigger?: Trigger) => {
    // A ref object holds the element in .current; a plain element is used as is
    const element = trigger && 'current' in trigger ? trigger.current : (trigger ?? null);
    // Ignore a second click while it's already open (or still closing)
    setSession((current) => current ?? { origin, trigger: element, id: Date.now() });
    setClosing(false);
  }, []);

  const close = useCallback(() => setClosing(true), []);

  // The latest session, readable from callbacks without re-creating them
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  });

  const finishClose = useCallback(() => {
    const trigger = sessionRef.current?.trigger;
    setSession(null);
    setClosing(false);
    // Back to the button that opened it, without making the page jump to it. One frame later, once the pill is
    // visible again (a hidden element can't take focus)
    requestAnimationFrame(() => trigger?.focus({ preventScroll: true }));
  }, []);

  // While the sheet (header/menu) is open the page behind it can't scroll: a class on <html> (see globals.css)
  // and Lenis, the smooth scroll, paused. The footer version opens in place, so the page stays scrollable
  // (lenis is undefined with reduced motion: then the class alone does it)
  const sheetOpen = session !== null && session.origin !== 'footer';
  const lenis = useLenis();
  useEffect(() => {
    if (!sheetOpen) return;
    document.documentElement.classList.add('contact-open');
    lenis?.stop();
    return () => {
      document.documentElement.classList.remove('contact-open');
      lenis?.start();
    };
  }, [sheetOpen, lenis]);

  const value = useMemo(() => ({ session, closing, open, close, finishClose }), [session, closing, open, close, finishClose]);

  return (
    <ContactContext.Provider value={value}>
      {children}
      {/* The sheet is "portalled" to the end of <body>: it's position: fixed, and this keeps it out of any parent
          that could clip or shift it */}
      {sheetOpen &&
        createPortal(
          <ContactSheet
            key={session.id}
            origin={session.origin}
            trigger={session.trigger}
            closing={closing}
            onClose={close}
            onClosed={finishClose}
          />,
          document.body
        )}
    </ContactContext.Provider>
  );
}
