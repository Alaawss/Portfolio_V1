'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useMediaQuery } from '@/lib/useMediaQuery';

// How fast every ticker moves, in px per second, so they all match. A fixed loop time made a long
// list (EduLink, 20 skills) race at ~120px/s next to iRide's 38. 46 is the average of Lancr's and iRide's old speeds
export const TICKER_SPEED = 46;

const FADE = 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)';

// A line of words ("UX • UI • React • …") sliding left forever, with faded ends. Used on the project cards and
// under the hero title. The text is repeated 4 times (each copy ending in a " • "), so sliding left by exactly one
// copy's width loops seamlessly; the loop time follows that width, so it moves at TICKER_SPEED however long the
// list is. With reduced motion it stays still.
// `className` styles the outer box (width, spacing, font, colour)
export default function Ticker({ items, className = '' }: { items: string[]; className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const text = items.join(' • ');

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reducedMotion) return;

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    // Wait for the fonts, otherwise the width is measured with the fallback font
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const copyWidth = track.scrollWidth / 4;
      ctx = gsap.context(() => {
        gsap.to(track, { x: -copyWidth, duration: copyWidth / TICKER_SPEED, repeat: -1, ease: 'none' });
      });
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [text, reducedMotion]);

  return (
    <div className={`overflow-hidden ${className}`} style={{ maskImage: FADE, WebkitMaskImage: FADE }}>
      {items.length > 0 ? (
        <div ref={trackRef} className="inline-block whitespace-nowrap">
          {/* Non-breaking spaces around the "•" after each copy: a trailing normal space would be dropped
              and make the measured width (and the loop) a few pixels short */}
          {`${text} • `.repeat(4)}
        </div>
      ) : (
        // No words yet: an empty line keeps the height
        ' '
      )}
    </div>
  );
}
