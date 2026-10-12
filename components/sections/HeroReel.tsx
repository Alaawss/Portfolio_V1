'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useAnimationFrame, useMotionValue, useScroll } from 'framer-motion';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { videoProps } from '@/lib/videoProps';
import { useLoaderDone } from '@/lib/loaderStore';
import { revealEase } from '@/components/ui/Reveal';

// The showreel under the hero (from 768px), with itsjay.us's exact motion (numbers from its production code).
// Its real place is the top of this section, at full width. While the hero is on screen it's drawn small (35%)
// and pulled up over the hero, sliding left and right with the mouse. As you scroll, it comes down to its real
// place and grows to full width; by the time this section's top is 10% from the top of the screen it's there.
// Three numbers drive it, set every frame:
//   scale    .35 → 1, with scroll
//   y        a pull-up that depends on the screen width (PULL_UP) → 0, with scroll. Because the pull-up is in vh
//            while the shrink depends on the width, on most laptops the small reel starts a little lower and rises
//            as it grows (e.g. top at 102px → 67px on a 1280×670 window), which is the inspo's "pull up" feel
//   x        glides toward the mouse's horizontal position, within the room left on each side (none at full size)

const SMALL = 0.35;

// How far the reel is pulled up at the start, in vh, by screen width (itsjay.us's table)
const PULL_UP = [
  { maxWidth: 900, vh: -95 },
  { maxWidth: 1200, vh: -105 },
  { maxWidth: 1600, vh: -118 },
  { maxWidth: 2000, vh: -110 },
  { maxWidth: 2500, vh: -115 },
];
const pullUpFor = (width: number) => PULL_UP.find((row) => width <= row.maxWidth)?.vh ?? -125;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function HeroReel() {
  const sectionRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const show = useLoaderDone();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');

  // Scroll progress: 0 when this section's top is at the bottom of the screen (the page at its very top),
  // 1 when it's 10% from the top of the screen
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'start 0.1'] });

  const x = useMotionValue(0);
  const y = useMotionValue('0vh');
  const scale = useMotionValue(SMALL);

  // The mouse, as −1 (left edge of the screen) … 1 (right edge). Only with a mouse and without reduced motion
  const mouse = useRef(0);
  const currentX = useRef(0);
  useEffect(() => {
    mouse.current = 0;
    if (!finePointer || reducedMotion) return;
    const onMove = (e: MouseEvent) => {
      mouse.current = (e.clientX / window.innerWidth - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [finePointer, reducedMotion]);

  useAnimationFrame(() => {
    const box = boxRef.current;
    if (!box || window.innerWidth < 768) return;

    const p = scrollYProgress.get();
    const s = lerp(SMALL, 1, p);

    // Sideways: the room on each side at this size (its full width, which transforms don't change, minus the
    // scaled width, halved), times where the mouse is. Eased 15% of the way each frame, like the inspo, so it
    // glides instead of sticking to the cursor
    const room = (box.offsetWidth * (1 - s)) / 2;
    const target = Math.max(-room, Math.min(room, mouse.current * room));
    currentX.current = lerp(currentX.current, target, 0.15);

    x.set(currentX.current);
    y.set(`${lerp(pullUpFor(window.innerWidth), 0, p)}vh`);
    scale.set(s);
  });

  // The reel plays while it's on screen, once the opening counter has gone
  useEffect(() => {
    const video = videoRef.current;
    const box = boxRef.current;
    if (!video || !box || !show) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(box);
    return () => io.disconnect();
  }, [show, reducedMotion]);

  return (
    // z-10: the small reel floats over the hero's title, as in the inspo. No top padding: the reel sits right at
    // the section's top, which is what the pull-up table is measured from
    <section ref={sectionRef} aria-label="Showreel" className="relative z-10 hidden md:block px-4 lg:px-8">
      <motion.div
        ref={boxRef}
        style={{ x, y, scale }}
        // Revealed top to bottom, 0.1s after the counter has gone (with the title)
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        animate={{ clipPath: show || reducedMotion ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)' }}
        transition={{ clipPath: { duration: reducedMotion ? 0 : 1.2, delay: reducedMotion ? 0 : 0.1, ease: revealEase } }}
        className="relative w-full aspect-video rounded-3xl overflow-hidden bg-neutral-900 will-change-transform"
      >
        {reducedMotion ? (
          <Image src="/hero/hero-reel-poster.jpg" alt="Showreel" fill sizes="100vw" className="object-cover" />
        ) : (
          <video
            ref={videoRef}
            // videoProps + pointer-events-none: reads as part of the design, not a player (lib/videoProps.ts)
            className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover"
            {...videoProps}
            preload="none"
            poster="/hero/hero-reel-poster.jpg"
            aria-label="Showreel"
          >
            {/* The 1080p WebM (4 MB), MP4 for Safari */}
            <source src="/hero/hero-reel-web.webm" type="video/webm" />
            <source src="/hero/hero-reel-web.mp4" type="video/mp4" />
          </video>
        )}
      </motion.div>
    </section>
  );
}
