'use client';

import { AnimatePresence, motion } from 'motion/react';

// Text that "rolls" when it changes: the old text slides up and out of a clipped box while the new text slides up
// into it from below. Used by the contact headline ("Contact" → "Let's talk." → "Message sent.") and the topic
// button ("a full-time role" → "a new project").
//
// `id` says when it's a *different* text (React's `key`): when the id changes, AnimatePresence keeps the old one
// on screen just long enough to play its exit while the new one plays its entrance. Both sit in the same grid
// cell (inline-grid + col/row 1), so they overlap instead of stacking, and the box is as wide as the wider one.
export default function RollText({
  id,
  children,
  instant = false,
  duration = 0.5,
  className = '',
}: {
  id: string;
  children: React.ReactNode;
  instant?: boolean; // reduced motion: swap without moving
  duration?: number;
  className?: string;
}) {
  const ease = [0.7, 0, 0.2, 1] as const;
  return (
    <span className={`inline-grid overflow-hidden align-bottom ${className}`}>
      {/* initial={false}: the first text is just there; only later changes roll */}
      <AnimatePresence initial={false}>
        <motion.span
          key={id}
          className="col-start-1 row-start-1 whitespace-nowrap"
          initial={{ y: instant ? 0 : '105%' }}
          animate={{ y: 0 }}
          exit={{ y: instant ? 0 : '-105%', opacity: instant ? 0 : 1 }}
          transition={{ duration: instant ? 0 : duration, ease }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
