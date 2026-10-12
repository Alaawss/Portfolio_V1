'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import RollText from '@/components/contact/RollText';
import ContactSentence, { type ContactStatus } from '@/components/contact/ContactSentence';

// What's inside the maroon card, whichever way it was opened (footer card or sheet): the headline that travels from
// where the clicked label was to the top-left and grows, then the form. The card itself (its size and position) is
// drawn by the parent; this only fills it.
//
// Timeline when opening (the card grows in 0.75s meanwhile):
//   0ms     the label starts travelling/growing from its starting spot
//   380ms   it rolls to "Let's talk."
//   820ms   the sentence's intro starts (ContactSentence)
// Closing: the sentence fades out (0.2s), the label rolls back to its first text and travels back.

export const EASE = [0.7, 0, 0.2, 1] as const; // the card's curve: slow start, quick middle, soft landing
export const GROW = 0.75; // seconds

// Where the label sits and how big it is, in px, measured from the card's top-left corner
export type LabelSpot = { left: number; top: number; size: number };

// The headline's size: like clamp(34px, 4.5vw, 58px), in px because Motion animates numbers
export function headlineSize() {
  return Math.min(58, Math.max(34, window.innerWidth * 0.045));
}

// The card's inner padding: roomier from tablets up
export function cardPadding() {
  return window.innerWidth >= 768 ? { x: 40, top: 32, bottom: 32 } : { x: 20, top: 24, bottom: 24 };
}

const LINE = 1.25; // the headline's line height (×font size), kept the same all the way so it doesn't jump

export default function ContactPanel({
  originText,
  originFont,
  from,
  to,
  fromColor,
  closing,
  reduced,
  width,
  padding,
  headingId,
  onRequestClose,
  onContentHeight,
  footer,
  minHeight,
}: {
  originText: string; // the clicked label's text: "Contact" or "Get in touch"
  // ...and its font, so it keeps the look of what was clicked (the pill is in Elms Sans) until it rolls to
  // "Let's talk." in the headline font
  originFont: string;
  from: LabelSpot; // where that label was
  to: LabelSpot; // where the headline ends up
  fromColor: string; // the label's colour before the card turned maroon
  closing: boolean;
  reduced: boolean; // prefers-reduced-motion: no movement at all, final state at once
  width: number; // the card's final width: the content is laid out at that width from the start, so it never reflows
  padding: { x: number; top: number; bottom: number };
  headingId: string;
  onRequestClose: () => void;
  onContentHeight?: (height: number) => void; // for the footer card, whose height follows the content
  // Something to show at the very bottom (the footer card's quote). With minHeight, the content is at least that
  // tall and the footer is pushed to its bottom, so any spare room sits above it rather than under it
  footer?: ReactNode;
  minHeight?: number;
}) {
  // ---- The headline's text: origin text → "Let's talk." → (after sending) "Message sent." → back on close ----
  const [stage, setStage] = useState<'origin' | 'talk'>(reduced ? 'talk' : 'origin');
  const [status, setStatus] = useState<ContactStatus>('idle');
  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(() => setStage('talk'), 380);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  // ---- "expanded": false for the very first frame, then true. Colours change through CSS transitions, which
  // need a "before" value on screen first; closing sets them back ----
  const [expanded, setExpanded] = useState(reduced);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setExpanded(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const open = expanded && !closing;

  // After a successful send: show the thank-you for a moment, then close by itself
  useEffect(() => {
    if (status !== 'sent') return;
    const timer = window.setTimeout(onRequestClose, 2800);
    return () => window.clearTimeout(timer);
  }, [status, onRequestClose]);

  // Report the content's height (the footer card grows to fit it). ResizeObserver tells us whenever it changes:
  // the textarea growing, a hint appearing, the thank-you replacing the form...
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !onContentHeight) return;
    const observer = new ResizeObserver(() => onContentHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, [onContentHeight]);

  const headline =
    closing || stage === 'origin'
      ? { id: 'origin', text: <span className={originFont}>{originText}</span> }
      : status === 'sent'
        ? { id: 'sent', text: <>Message <span className="text-[var(--lime)]">sent.</span></> }
        : { id: 'talk', text: <>Let’s <span className="text-[var(--lime)]">talk.</span></> };

  const move = { duration: reduced ? 0 : GROW, ease: EASE, delay: closing && !reduced ? 0.15 : 0 };
  // A spot as CSS values Motion can animate
  const css = (spot: LabelSpot) => ({ left: spot.left, top: spot.top, fontSize: spot.size });

  return (
    <>
      {/* The headline. left/top/fontSize animate between `from` and `to`; its colour fades through CSS */}
      <motion.h2
        id={headingId}
        className="absolute z-10 m-0 whitespace-nowrap font-display font-bold"
        style={{
          lineHeight: LINE,
          color: open ? 'var(--paper)' : fromColor,
          transition: reduced ? 'none' : `color ${GROW}s`,
        }}
        initial={css(reduced ? to : from)}
        animate={css(closing ? from : to)}
        transition={move}
      >
        <RollText id={headline.id} instant={reduced}>
          {headline.text}
        </RollText>
      </motion.h2>

      {/* Everything else, in normal flow at the card's final width */}
      <div
        ref={contentRef}
        className="flex flex-col"
        style={{ width, minHeight, padding: `${padding.top}px ${padding.x}px ${padding.bottom}px` }}
      >
        {/* Keeps the headline's room at the top (the headline itself floats above, absolutely positioned) */}
        <div aria-hidden style={{ height: to.size * LINE }} />
        <div className="mt-6 md:mt-8">
          <ContactSentence introDelay={reduced ? 0 : 0.82} reduced={reduced} hidden={closing} onStatusChange={setStatus} />
        </div>
        {/* mt-auto: takes up all the spare room above it, which pushes the footer to the bottom */}
        {footer && <div className="mt-auto pt-[30px]">{footer}</div>}
      </div>
    </>
  );
}
