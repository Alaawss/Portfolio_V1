'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { useMediaQuery } from '@/lib/useMediaQuery';
import ContactPanel, { EASE, GROW, cardPadding, headlineSize, type LabelSpot } from '@/components/contact/ContactPanel';
import type { ContactOrigin } from '@/components/contact/ContactProvider';

// The contact form opened from the header pill or the menu: a maroon card that starts exactly where the clicked
// element is (same position, same size, fully rounded) and grows into a big sheet in the middle of the screen,
// over a dimmed, blurred page. Closing (✕, Esc, or a click on the dimmed page) shrinks it back into the element.
//
// How the "grow from the clicked element" works:
//   1. Measure: getBoundingClientRect() gives the element's position and size on screen (left, top, width, height).
//   2. Measure the target: where the sheet should end up (computed from the screen size and the header).
//   3. Animate: the card is position: fixed, and Motion animates its left/top/width/height (and corner radius)
//      from the first set of numbers to the second. Closing animates back to the element's position *now*,
//      measured again, in case anything moved.

type Rect = { left: number; top: number; width: number; height: number };
type Corners = [number, number, number, number]; // top-left, top-right, bottom-right, bottom-left

function rectOf(el: HTMLElement | null): Rect {
  if (!el) return { left: window.innerWidth / 2 - 22, top: 16, width: 44, height: 44 };
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

// Where the sheet goes. Phones (under 640px): full width, right under the header, square bottom corners.
// Bigger screens: centred, at most 1180px wide, 8px under the header, 16px above the bottom
function sheetRect(): { rect: Rect; corners: Corners } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const headerBottom = Math.max(0, document.getElementById('site-header')?.getBoundingClientRect().bottom ?? 0);
  if (vw < 640) {
    return { rect: { left: 0, top: headerBottom, width: vw, height: vh - headerBottom }, corners: [20, 20, 0, 0] };
  }
  const width = Math.min(1180, vw - 32);
  const top = headerBottom + 8;
  return { rect: { left: (vw - width) / 2, top, width, height: vh - top - 16 }, corners: [20, 20, 20, 20] };
}

// The values Motion animates: the rect plus the four corner radii
function frame(rect: Rect, corners: Corners) {
  return {
    ...rect,
    borderTopLeftRadius: corners[0],
    borderTopRightRadius: corners[1],
    borderBottomRightRadius: corners[2],
    borderBottomLeftRadius: corners[3],
  };
}

export default function ContactSheet({
  origin,
  trigger,
  closing,
  onClose,
  onClosed,
}: {
  origin: ContactOrigin;
  trigger: HTMLElement | null;
  closing: boolean;
  onClose: () => void;
  onClosed: () => void;
}) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const headingId = useId();
  const cardRef = useRef<HTMLDivElement>(null);

  // 1 + 2. Measured once, when the sheet opens (useState with a function runs it only the first time)
  const [start] = useState(() => {
    const rect = rectOf(trigger);
    const pill = rect.height / 2; // a full pill: radius = half the height
    return { rect, corners: [pill, pill, pill, pill] as Corners };
  });
  const [target, setTarget] = useState(sheetRect);
  const [padding, setPadding] = useState(cardPadding);
  const [size, setSize] = useState(headlineSize);
  // The screen can change size while it's open (turning a phone): measure again
  useEffect(() => {
    const onResize = () => {
      setTarget(sheetRect());
      setPadding(cardPadding());
      setSize(headlineSize());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Closing goes back to where the element is now
  const end = useMemo(() => {
    if (!closing) return start;
    const rect = rectOf(trigger);
    const pill = rect.height / 2;
    return { rect, corners: [pill, pill, pill, pill] as Corners };
  }, [closing, start, trigger]);

  // The label's journey: from the pill's own text (its padding, its font size, vertically centred) to the headline
  const triggerFont = trigger ? parseFloat(getComputedStyle(trigger).fontSize) || 14 : 14;
  const from: LabelSpot = {
    left: origin === 'header' ? 20 : 10,
    top: (start.rect.height - triggerFont * 1.25) / 2,
    size: triggerFont,
  };
  const to: LabelSpot = { left: padding.x, top: padding.top, size };

  // With reduced motion nothing animates, so "closing" is finished straight away
  useEffect(() => {
    if (closing && reduced) onClosed();
  }, [closing, reduced, onClosed]);

  // ---- Keyboard: Esc closes; Tab and Shift+Tab stay inside the sheet ("focus trap") ----
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !cardRef.current) return;
    const focusable = [
      ...cardRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([tabindex="-1"]), textarea'),
    ];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Focus moves into the sheet as it opens (the name field takes it once the intro has played)
  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true });
  }, []);

  const transition = { duration: reduced ? 0 : GROW, ease: EASE, delay: closing && !reduced ? 0.15 : 0 };

  // Can the content scroll yet? Not while the card is growing or shrinking: the form inside is laid out at the
  // sheet's final size, so in a pill-sized card it would overflow and flash a scrollbar on the card's edge
  const [settled, setSettled] = useState(reduced);
  const scrollable = settled && !closing;

  return (
    <div className="contact-theme">
      {/* The dimmed, slightly blurred page behind. A click on it closes the sheet */}
      <motion.div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-[var(--scrim)] backdrop-blur-[3px]"
        initial={{ opacity: reduced ? 1 : 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: reduced ? 0 : 0.5, delay: closing && !reduced ? 0.3 : 0 }}
      />

      {/* 3. The card: from the element's rect to the sheet's, and back when closing */}
      <motion.div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="fixed z-[71] overflow-hidden bg-[var(--maroon)] text-[var(--paper)] outline-none"
        initial={frame(reduced ? target.rect : start.rect, reduced ? target.corners : start.corners)}
        animate={closing ? frame(end.rect, end.corners) : frame(target.rect, target.corners)}
        transition={transition}
        onAnimationComplete={() => {
          if (closing) onClosed();
          else setSettled(true);
        }}
      >
        {/* The content scrolls inside the sheet when it's taller than the screen. data-lenis-prevent: the
            (paused) smooth scroll leaves the wheel to this box */}
        <div
          data-lenis-prevent
          className={`contact-scroll relative h-full overflow-x-hidden overscroll-contain ${scrollable ? 'overflow-y-auto' : 'overflow-y-hidden'}`}
        >
          <ContactPanel
            originText={origin === 'header' ? 'Get in touch' : 'Contact'}
            originFont={origin === 'header' ? 'font-body font-medium tracking-[0.02em]' : 'font-display font-bold'}
            from={from}
            to={to}
            fromColor="var(--cream)"
            closing={closing}
            reduced={reduced}
            width={target.rect.width}
            padding={padding}
            headingId={headingId}
            onRequestClose={onClose}
          />

          {/* Close button, top right */}
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
        </div>
      </motion.div>
    </div>
  );
}
