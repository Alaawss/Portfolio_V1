'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
// TransitionLink: next/link with itsjay.us's page change (components/TransitionLink.tsx)
import Link from '@/components/TransitionLink';
import { motion } from 'framer-motion';
import type { Project, ProjectCardMedia } from '@/lib/projectsData';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { videoProps } from '@/lib/videoProps';
import Ticker from '@/components/ui/Ticker';

// The 4:3 media area is ~46% of the screen wide from md up (two columns) and ~92% on phones (one column).
// The video window is 65% of that (≈30vw), but never narrower than 300px
const WALLPAPER_SIZES = '(min-width: 768px) 46vw, 92vw';
const WINDOW_SIZES = '(min-width: 768px) 30vw, 300px';

// The project card used on the home page and on /projects (same look in both places).
// The whole card opens the project's page (its Visit site / View code links live on that page).
export default function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [inView, setInView] = useState(false);             // any part of the card on screen
  const [mostlyInView, setMostlyInView] = useState(false); // at least 60% of it on screen
  const [armed, setArmed] = useState(false);               // the <video> exists (from the first hover / reveal on)

  const isTouch = useMediaQuery('(hover: none)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // One switch drives the whole hover look: wallpaper zoom, tint + blur, and the video window.
  // Mouse: while hovered (and on screen). Touch screens can't hover: while ≥60% of the card is in view.
  // Reduced motion: never (the window just shows the poster, see below).
  const active = !reducedMotion && (isTouch ? mostlyInView : isHovered && inView);

  // Watches how much of the card is on screen (thresholds: entering at all, and 60%)
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const mostly = entry.intersectionRatio >= 0.6;
        setInView(entry.isIntersecting);
        setMostlyInView(mostly);
        // On touch screens this is the "first hover": create the video now
        if (mostly && window.matchMedia('(hover: none)').matches) setArmed(true);
      },
      { threshold: [0, 0.6] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // itsjay.us's timing: play as soon as the window starts unfolding (preload="none" means this play() is also
  // what starts the download; the catch swallows the harmless error when a quick leave pauses it first).
  // On leave, pause and rewind 1s later, once the 0.7s fold-away has finished, so it never freezes while
  // still visible. Hovering back within that second clears the timer and it just keeps playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.play().catch(() => {});
      return;
    }
    const timer = window.setTimeout(() => {
      video.pause();
      video.currentTime = 0;
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [active, armed]);

  return (
    <div
      ref={cardRef}
      className="relative bg-primary rounded-lg overflow-hidden"
      onMouseEnter={() => {
        setIsHovered(true);
        setArmed(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Covers the whole card so it's clickable */}
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`View ${project.name}`}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      />

      {/* Media area, inset within the burgundy frame. overflow-hidden clips the zoomed wallpaper and is the
          edge the video window rises in from */}
      <div className="relative aspect-[4/3] bg-background mx-auto my-3 w-[92%] rounded overflow-hidden">
        {project.card ? (
          <CardMedia
            media={project.card}
            active={active}
            armed={armed}
            reducedMotion={reducedMotion}
            videoRef={videoRef}
          />
        ) : (
          <PlaceholderMedia name={project.name} isHovered={isHovered} />
        )}
      </div>

      {/* Footer Row - solid burgundy background */}
      <div className="mx-auto my-2 w-[92%] flex flex-wrap justify-between items-baseline gap-x-4">
        <h3 className="text-background font-display text-xl md:text-2xl font-bold uppercase">
          {project.name}
        </h3>
        <div className="text-background/80 font-display text-sm md:text-base uppercase">
          {project.type}
          {project.year && ` • ${project.year}`}
        </div>
      </div>

      {/* Roles/stack ticker (components/ui/Ticker.tsx). With no roles yet, an empty line keeps the card's height */}
      <Ticker items={project.roles} className="mx-auto my-2 w-[92%] text-background/60 font-body text-sm" />
    </div>
  );
}

interface CardMediaProps {
  media: ProjectCardMedia;
  active: boolean;
  armed: boolean;
  reducedMotion: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

// The media area's layers and itsjay.us's card hover (values from its production code). All CSS transitions,
// switched by `active`. motion-reduce:transition-none: with reduced motion the state changes instantly
function CardMedia({ media, active, armed, reducedMotion, videoRef }: CardMediaProps) {
  // Reduced motion: the window is simply always open, showing the poster
  const windowOpen = active || reducedMotion;

  return (
    <>
      {/* 1–3: wallpaper, tint + blur, grain. `isolate` makes this wrapper its own blending group, so the grain's
          overlay blend mixes with these layers only (not with the window or the page). The maroon behind matches
          the card frame, so any soft edge at the borders blends in instead of glowing */}
      <div className="absolute inset-0 isolate bg-primary">
        {/* 1. Wallpaper: slightly zoomed in at rest, settles back to 100% on hover (a zoom *out*) */}
        <Image
          src={media.wallpaper}
          alt=""
          fill
          sizes={WALLPAPER_SIZES}
          className={`object-cover transition-transform duration-500 ease-in-out motion-reduce:transition-none ${
            active ? 'scale-100' : 'scale-105'
          }`}
        />

        {/* 2. Blur + tint: a blurred copy of the wallpaper with a 30% dark layer on it, faded in together.
            Fading one layer's opacity is cheaper and smoother than animating a blur filter on the photo.
            The copy is blurred itself (filter) rather than blurring what's behind it (backdrop-filter): on the
            home page Chrome drew a 1px seam across a backdrop blur, along the top edge of the video window.
            It's zoomed a step further than the wallpaper so the blur's soft edges stay outside the frame.
            Same src and sizes as the wallpaper, so it's the same download */}
        <span
          aria-hidden
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out motion-reduce:transition-none ${
            active ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={media.wallpaper}
            alt=""
            fill
            sizes={WALLPAPER_SIZES}
            className={`object-cover blur-md transition-transform duration-500 ease-in-out motion-reduce:transition-none ${
              active ? 'scale-105' : 'scale-110'
            }`}
          />
          <span className="absolute inset-0 bg-neutral-900/30" />
        </span>

        {/* 3. Grain: one 256×256 noise tile repeated, static (CSS only). Above the blurred copy, so it stays
            crisp on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[url('/projects/grain.png')] bg-repeat opacity-15 mix-blend-overlay"
        />
      </div>

      {/* 4. Video window. Closed: a zero-height line across its middle (clip-path from 30% to 70% of its width,
          both edges at 50% height), sitting a little low (-1/12 of its height). Open: the full rectangle, centred
          (-1/2). Both animate together over 0.7s on a slow–fast–slow curve, so it unfolds from the line while
          rising into place, and folds back into it on leave. Tailwind v4's translate-* sets the CSS `translate`
          property, hence `translate` in the transition list */}
      <span
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 block w-[clamp(300px,65%,600px)] aspect-video rounded-lg overflow-hidden bg-neutral-900 transition-[clip-path,translate] duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] motion-reduce:transition-none ${
          windowOpen
            ? '-translate-y-1/2 [clip-path:polygon(0_100%,100%_100%,100%_0,0_0)]'
            : '-translate-y-1/12 [clip-path:polygon(30%_50%,70%_50%,70%_50%,30%_50%)]'
        }`}
      >
        {reducedMotion ? (
          // Reduced motion: no video at all, just the poster
          <Image src={media.video.poster} alt="" fill sizes={WINDOW_SIZES} className="object-cover" />
        ) : (
          // Not rendered until the first hover, so nothing (poster included) loads before it's wanted
          armed && (
            <video
              ref={videoRef}
              // videoProps + pointer-events-none: reads as part of the design, not a player (lib/videoProps.ts)
              className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover"
              {...videoProps}
              preload="none"
              poster={media.video.poster}
              aria-hidden
            >
              <source src={media.video.webm} type="video/webm" />
              <source src={media.video.mp4} type="video/mp4" />
            </video>
          )
        )}
      </span>
    </>
  );
}

// For a project without card media yet: the old initials ↔ "Screenshot Placeholder" swap
function PlaceholderMedia({ name, isHovered }: { name: string; isHovered: boolean }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-primary/30 font-display text-4xl md:text-5xl font-bold"
        animate={{ opacity: isHovered ? 0 : 1, x: isHovered ? -20 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {name.slice(0, 2).toUpperCase()}
      </motion.div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-primary/5"
        animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="text-center text-primary/40 font-body text-sm">
          <span className="block text-lg mb-1">📸</span>
          Screenshot Placeholder
        </div>
      </motion.div>
    </>
  );
}
