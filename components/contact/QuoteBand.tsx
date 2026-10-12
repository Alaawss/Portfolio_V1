'use client';

import { useLayoutEffect, useRef, type PointerEvent } from 'react';
import { motion } from 'motion/react';
import { useMediaQuery } from '@/lib/useMediaQuery';

// The quote at the bottom of the footer's contact card: "JOB'S NOT FINISHED." — Kobe Bryant.
//
// 1. Fit: it's always one line exactly as wide as the card's content, on any screen. In a given font, text width
//    grows in proportion to font size, so we measure the line once at 100px and scale: if it's 1400px wide at
//    100px and the space is 1280px, the size that fits is 100 × 1280 / 1400 ≈ 91.4px.
// 2. Reveal: every time the card opens, each word rises into view from behind an invisible edge (a mask).
// 3. Spotlight (mouse/trackpad only): a cream copy of the quote lies exactly on top of it, but you only see it
//    inside a soft circle around the cursor, so the letters light up where you point.

const WORDS = ['Job’s', 'not', 'finished.']; // shown in capitals by CSS (uppercase), read normally by screen readers
const REVEAL_AT = 0.9; // seconds after the card opens: once it has finished growing
const STAGGER = 0.09; // seconds between words

export default function QuoteBand({ reduced, hidden }: { reduced: boolean; hidden: boolean }) {
  const bandRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  // The spotlight needs a real hover (a mouse or trackpad); phones and tablets don't get it
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const spotlight = finePointer && !reduced;

  // ---- 1. Fit ----
  useLayoutEffect(() => {
    const band = bandRef.current;
    const line = lineRef.current;
    if (!band || !line) return;

    const fit = () => {
      // Measure the line at 100px...
      line.style.fontSize = '100px';
      const widthAt100 = line.scrollWidth || 1;
      line.style.fontSize = '';
      // ...and scale to the space. Written as a CSS variable on the band, which the quote (and its spotlight copy)
      // read as their font size. A direct DOM write: React doesn't re-render, so nothing flickers
      band.style.setProperty('--quote-size', `${(100 * band.clientWidth) / widthAt100}px`);
    };

    fit(); // before the first paint (useLayoutEffect), so it never shows at the wrong size
    // Again once the fonts have loaded (measured with a fallback font, the width would be wrong)...
    let cancelled = false;
    document.fonts.ready.then(() => !cancelled && fit());
    // ...and whenever the band changes size (window resized, phone turned)
    const observer = new ResizeObserver(fit);
    observer.observe(band);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  // ---- 3. Spotlight: where the circle is, as CSS variables on the copy (no re-render on every mouse move) ----
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const spot = spotRef.current;
    if (!spot) return;
    const box = e.currentTarget.getBoundingClientRect();
    spot.style.setProperty('--x', `${e.clientX - box.left}px`);
    spot.style.setProperty('--y', `${e.clientY - box.top}px`);
    // The circle's radius: 0.9× the quote's height, at least 90px
    spot.style.setProperty('--spot-r', `${Math.max(90, box.height * 0.9)}px`);
  };
  const onPointerLeave = () => spotRef.current?.style.setProperty('--spot-r', '0px');

  const lineClass =
    // w-max: the line is as wide as its text (not the card), so measuring it gives the text's width
    'm-0 w-max whitespace-nowrap font-display uppercase leading-[0.86] tracking-[-0.01em] [font-size:var(--quote-size,48px)]';

  return (
    <motion.figure
      ref={bandRef}
      className="m-0"
      // Fades out with the form when the card closes
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
    >
      <div className="relative" onPointerMove={spotlight ? onPointerMove : undefined} onPointerLeave={spotlight ? onPointerLeave : undefined}>
        <blockquote className="m-0">
          <p ref={lineRef} className={`${lineClass} text-[var(--paper-faint)]`}>
            {WORDS.map((word, i) => (
              <span key={word}>
                {/* ---- 2. Reveal ----
                    The outer span is the mask: overflow-hidden, so anything outside it is invisible. The word inside
                    starts pushed down by 105% of its own height (hidden below the mask's bottom edge) and slides up
                    to 0. Each word starts 0.09s after the one before. It plays every time the card opens, because
                    the card (and this quote with it) is created fresh each time */}
                <span className="inline-block overflow-hidden pb-[0.04em] align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={reduced ? false : { y: '105%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: REVEAL_AT + i * STAGGER, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    {word}
                  </motion.span>
                </span>
                {i < WORDS.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        </blockquote>

        {/* The spotlight copy: the same line in cream, laid exactly over the quote (same font, size and word
            boxes), hidden from screen readers. Its mask is a radial gradient: fully visible (black) in the inner 35%
            of a circle of radius --spot-r around the cursor (--x, --y), fading to invisible at its edge. --spot-r is
            0 until the cursor is over the quote, so nothing shows; it grows to its size (and back to 0 on leaving)
            over 0.3s, thanks to @property --spot-r in globals.css (.spotlight) */}
        {spotlight && (
          <div
            ref={spotRef}
            aria-hidden
            className="spotlight pointer-events-none absolute inset-0"
            style={{
              maskImage: 'radial-gradient(circle var(--spot-r) at var(--x, 50%) var(--y, 50%), #000 35%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(circle var(--spot-r) at var(--x, 50%) var(--y, 50%), #000 35%, transparent 100%)',
            }}
          >
            <p className={`${lineClass} text-[var(--cream)]`}>
              {WORDS.map((word, i) => (
                <span key={word}>
                  <span className="inline-block overflow-hidden pb-[0.04em] align-bottom">
                    <span className="inline-block">{word}</span>
                  </span>
                  {i < WORDS.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>

      <figcaption className="mt-1.5 block text-right font-heading text-[length:clamp(16px,1.4vw,20px)] text-[var(--paper-soft)]">
        — Kobe Bryant
      </figcaption>
    </motion.figure>
  );
}
