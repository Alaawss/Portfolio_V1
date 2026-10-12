'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { videoProps } from '@/lib/videoProps';
import { useLoaderDone } from '@/lib/loaderStore';
import { revealEase } from '@/components/ui/Reveal';

// The home hero, after itsjay.us: one small line spread across the width ("A · Full-stack · Minded") right above
// one giant line, "DESIGN ENGINEER", low on the screen, and under it "↓ Scroll for the good stuff ↓", with a
// wave running through its letters every few seconds.
// From 768px the showreel isn't part of this section: it lives at the top of the next one (HeroReel.tsx) and is
// pulled up over this one while it's small. On phones a plain reel sits between the small line and the title.
// The entrance follows itsjay.us's timing, counted from when the opening counter goes: the small line rises at
// once (1s), the title and the reel 0.1s later (1.2s), the scroll hint at 0.5s (1s), then its wave starts

// "DESIGN ENGINEER" is sized to fill the width exactly, with CSS alone (no measuring, no jump on load):
// in Special Gothic Expanded One its letters span 10.803× the font size (ENGINEER alone: 5.99×), so the font
// size is the box width ÷ 10.803 (÷ 5.99 on phones, where ENGINEER is the widest line). The first letter starts
// 0.05em in from the left edge, hence the -0.05em nudge. Measured in the browser; redo if the text or the font
// changes (the numbers are written out in the class names below, as Tailwind needs them in full)

// Something that slides up out of a clip once the opening counter has gone. A span by default (it's used inside
// the h1); as="div" for blocks
function Rise({
  show,
  delay,
  duration = 1,
  as = 'span',
  className = '',
  children,
}: {
  show: boolean;
  delay: number;
  duration?: number;
  as?: 'span' | 'div';
  className?: string;
  children: React.ReactNode;
}) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const Outer = as;
  const Inner = as === 'div' ? motion.div : motion.span;
  return (
    <Outer className={`block overflow-hidden ${className}`}>
      <Inner
        className="block"
        initial={{ y: '100%' }}
        animate={{ y: show || reducedMotion ? '0%' : '100%' }}
        transition={{ duration: reducedMotion ? 0 : duration, delay: reducedMotion ? 0 : delay, ease: revealEase }}
      >
        {children}
      </Inner>
    </Outer>
  );
}

export default function Hero() {
  const show = useLoaderDone();

  return (
    <section id="home" className="relative md:h-svh px-4 lg:px-8">
      {/* Phones: in the flow, stacked. From md: pinned 20vh above the bottom of the screen */}
      <div className="flex flex-col gap-6 pt-28 md:p-0 md:gap-1 md:absolute md:inset-x-4 lg:inset-x-8 md:bottom-[20vh]">
        {/* The small line: left, centre, right, rising as one. It reads into the title: "a full-stack minded
            design engineer" */}
        <Rise show={show} delay={0} as="div">
          <span className="relative flex justify-between font-body font-semibold uppercase leading-none text-primary text-[length:clamp(14px,1.2vw,20px)]">
            <span>A</span>
            <span className="absolute left-1/2 -translate-x-1/2">Full-stack</span>
            <span>Minded</span>
          </span>
        </Rise>

        <PhoneReel show={show} />

        {/* @container: the font size is a share of this box's width (cqw), so the line always fills it */}
        <div className="@container">
          <h1 className="-ml-[0.05em] font-display uppercase text-primary leading-none whitespace-nowrap text-[length:calc(100cqw/5.99)] md:text-[length:calc(100cqw/10.803)]">
            {/* Two lines on phones, one line from md */}
            <span className="block md:inline-block">
              <Rise show={show} delay={0.1} duration={1.2}>Design</Rise>
            </span>
            <span className="hidden md:inline">{' '}</span>
            <span className="block md:inline-block">
              <Rise show={show} delay={0.1} duration={1.2}>Engineer</Rise>
            </span>
          </h1>
        </div>
      </div>

      {/* "↓ Scroll for the good stuff ↓", where the roles ticker was. Phones: under the title. From md: centred in
          the band between the title (20vh from the bottom) and the bottom edge */}
      <ScrollHint show={show} />
    </section>
  );
}

// ---- The scroll hint: one line, with a wave running through its letters ----
const HINT = '↓ Scroll for the good stuff ↓';

function ScrollHint({ show }: { show: boolean }) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  // The wave only runs once the line is up (the counter has gone and Rise has played), never with reduced motion
  const waving = show && !reducedMotion;
  return (
    <Rise
      show={show}
      delay={0.5}
      as="div"
      className="mt-10 mb-16 text-center md:m-0 md:absolute md:left-1/2 md:-translate-x-1/2 md:translate-y-1/2 md:bottom-[calc(10vh+24px)]"
    >
      <span className="font-body font-medium whitespace-nowrap text-primary text-[length:clamp(14px,1.1vw,18px)]">
        {/* Screen readers get the sentence once, whole; the letter spans below are only for the eye */}
        <span className="sr-only">{HINT}</span>
        <span aria-hidden>
          {/* Each letter is its own inline-block so it can move on its own. They all run the same 3.2s loop
              (the wave keyframes in globals.css: a dip in the first 12%, then a rest), each one 40ms after the
              letter before it, so the dip travels left to right and the whole line then rests ~2s. The first
              wave waits 1.6s, until the line has finished rising.
              Spaces stay plain text, so the words keep their normal gaps */}
          {Array.from(HINT).map((char, i) =>
            char === ' ' ? (
              ' '
            ) : (
              <span
                key={i}
                className={`inline-block ${waving ? 'animate-[wave_3.2s_ease-in-out_infinite_both]' : ''}`}
                style={waving ? { animationDelay: `${1.6 + i * 0.04}s` } : undefined}
              >
                {char}
              </span>
            )
          )}
        </span>
      </span>
    </Rise>
  );
}

// ---- Phones only: the reel as a plain block between the small line and the title ----
function PhoneReel({ show }: { show: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Plays while on screen (and only after the counter has gone). Hidden from md (display: none never
  // intersects), so bigger screens never download this one
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !show) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, [show, reducedMotion]);

  return (
    <motion.div
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: show || reducedMotion ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)' }}
      transition={{ duration: reducedMotion ? 0 : 1.2, delay: reducedMotion ? 0 : 0.1, ease: revealEase }}
      className="md:hidden relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-900"
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
          <source src="/hero/hero-reel-720.mp4" type="video/mp4" />
        </video>
      )}
    </motion.div>
  );
}
