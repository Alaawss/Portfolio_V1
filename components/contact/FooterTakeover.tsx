'use client';

import { useEffect, useId, useLayoutEffect, useState, type RefObject } from 'react';
import { motion } from 'motion/react';
import { useMediaQuery } from '@/lib/useMediaQuery';
import ContactPanel, { EASE, GROW, cardPadding, headlineSize, type LabelSpot } from '@/components/contact/ContactPanel';
import QuoteBand from '@/components/contact/QuoteBand';

// The contact form opened from the footer's Contact card: that card grows, in place, until it covers the whole
// footer grid, and turns maroon. The other cards don't move: the growing card simply covers them (Footer.tsx
// fades them out after 0.6s so no corner peeks out, and shows them again the moment it closes).
// It's drawn on top of the grid (position: absolute inside the grid's wrapper), starting exactly over the Contact
// card: its left/top/width/height animate from the card's slot to the whole grid, and back when closing.

type Box = { left: number; top: number; width: number; height: number };

// An element's position and size relative to another one (here: the Contact card inside the grid's wrapper)
function boxIn(el: HTMLElement, container: HTMLElement): Box {
  const a = el.getBoundingClientRect();
  const b = container.getBoundingClientRect();
  return { left: a.left - b.left, top: a.top - b.top, width: a.width, height: a.height };
}

type Measured = { slot: Box; gridHeight: number; label: LabelSpot; width: number };

export default function FooterTakeover({
  wrapRef,
  tileRef,
  tileBackground,
  tileBorder,
  closing,
  onClose,
  onClosed,
}: {
  wrapRef: RefObject<HTMLDivElement | null>; // the grid's wrapper (positioned), the card's frame of reference
  tileRef: RefObject<HTMLButtonElement | null>; // the Contact card that was clicked
  tileBackground: string; // the card's look before it turns maroon, so the takeover starts identical to it
  tileBorder: string;
  closing: boolean;
  onClose: () => void;
  onClosed: () => void;
}) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const headingId = useId();

  // Measured once, when it opens: the card's slot, the grid's size, the label's spot inside the card.
  // useLayoutEffect runs after React has built the page but before it's painted, so the card is never seen
  // without these numbers (until then it renders nothing)
  const [measured, setMeasured] = useState<Measured | null>(null);
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const tile = tileRef.current;
    if (!wrap || !tile) return;
    const slot = boxIn(tile, wrap);
    const text = tile.querySelector('span');
    const labelSize = text ? parseFloat(getComputedStyle(text).fontSize) : 16;
    setMeasured({
      slot,
      gridHeight: wrap.offsetHeight,
      // The card's label sits in its bottom-left corner, 24px (p-6) in from both edges
      label: { left: 24, top: slot.height - 24 - labelSize * 1.25, size: labelSize },
      width: wrap.clientWidth,
    });
  }, [wrapRef, tileRef]);

  const [padding, setPadding] = useState(cardPadding);
  const [size, setSize] = useState(headlineSize);
  useEffect(() => {
    const onResize = () => {
      const wrap = wrapRef.current;
      if (wrap) setMeasured((m) => (m ? { ...m, width: wrap.clientWidth } : m));
      setPadding(cardPadding());
      setSize(headlineSize());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [wrapRef]);

  // Height = the taller of the footer grid and the form, so on desktop (where the grid is taller) nothing below
  // moves. On phones the form is taller: the wrapper is stretched to fit (min-height), and let go when it closes
  const [contentHeight, setContentHeight] = useState(0);
  const height = Math.max(measured?.gridHeight ?? 0, contentHeight);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !measured) return;
    wrap.style.minHeight = `${height}px`;
    return () => {
      wrap.style.minHeight = '';
    };
  }, [wrapRef, measured, height]);

  // "expanded": false on the first frame, then true; the colour change runs as a CSS transition from there
  const [expanded, setExpanded] = useState(reduced);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setExpanded(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const maroon = expanded && !closing;

  useEffect(() => {
    if (closing && reduced) onClosed();
  }, [closing, reduced, onClosed]);

  if (!measured) return null;
  const { slot, label, width } = measured;
  const full = { left: 0, top: 0, width, height };

  return (
    <motion.div
      role="region"
      aria-labelledby={headingId}
      // Esc closes it (the topic menu stops its own Esc from reaching here)
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      className="contact-theme absolute z-30 overflow-hidden rounded-[11px] text-[var(--paper)]"
      style={{
        backgroundColor: maroon ? 'var(--maroon)' : tileBackground,
        border: maroon ? '1px solid transparent' : tileBorder,
        backdropFilter: 'blur(7px)',
        transition: reduced ? 'none' : `background-color ${GROW}s, border-color ${GROW}s`,
      }}
      initial={reduced ? full : slot}
      animate={closing ? slot : full}
      transition={{ duration: reduced ? 0 : GROW, ease: EASE, delay: closing && !reduced ? 0.15 : 0 }}
      onAnimationComplete={() => {
        if (closing) onClosed();
      }}
    >
      <ContactPanel
        originText="Contact"
        originFont="font-display font-bold"
        from={label}
        to={{ left: padding.x, top: padding.top, size }}
        fromColor="var(--maroon)"
        closing={closing}
        reduced={reduced}
        width={width}
        padding={padding}
        headingId={headingId}
        onRequestClose={onClose}
        onContentHeight={setContentHeight}
        // The quote at the bottom ("Job's not finished."), pushed to the card's bottom when the card is taller than
        // the form
        footer={<QuoteBand reduced={reduced} hidden={closing} />}
        minHeight={measured.gridHeight}
      />

      <motion.button
        type="button"
        onClick={onClose}
        aria-label="Close"
        initial={{ opacity: reduced ? 1 : 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: 0.3, delay: closing || reduced ? 0 : 0.6 }}
        className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-2xl leading-none text-[var(--paper)] hover:bg-[var(--paper-focus)] focus-visible:outline-2 focus-visible:outline-[var(--paper)] md:right-5 md:top-5"
      >
        ✕
      </motion.button>
    </motion.div>
  );
}
