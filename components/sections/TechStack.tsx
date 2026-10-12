'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { techStackItems } from '@/lib/techStackData';
import { stackLinks } from '@/lib/stackLinks';
import StackLogo from '@/components/ui/StackLogos';

gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger);

// Only characters no wider than the title's own letters (W, M, O, Q, G, A, C, D, H, V, X, Y, 0 left out),
// so a scrambled line is never wider than the real one and doesn't wrap onto a third line mid-animation
const SCRAMBLE_CHARS = 'BEFIJKLNPRSTUZ123456789';

// The highlight's size before scaling: it's a 100x100 box stretched to the tile with scale() (see placeHighlight)
const HIGHLIGHT_BASE = 100;

export default function TechStack() {
  const [activeItem, setActiveItem] = useState<string>('React');
  const headerRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef(new Map<string, HTMLAnchorElement>());

  const topRowItems = techStackItems.filter((item) => item.row === 1);
  const bottomRowItems = techStackItems.filter((item) => item.row === 2);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        // The title is opacity-0 until now; onStart runs on the first frame, which is already
        // scrambled, so the plain text is never seen before the animation
        onStart: () => {
          gsap.set(header, { opacity: 1 });
        },
        // Wait until the title is on screen, otherwise it plays behind the preloader.
        // Starts as soon as its top enters the screen, so it's scrambling from the first pixel
        scrollTrigger: {
          trigger: header,
          start: 'top bottom',
          once: true,
        },
      });

      // Each word scrambles in its own span, so the line break and the space survive (scrambling the
      // whole title made it one long line running off the screen). All words scramble straight away,
      // then resolve one after another, left to right, 0.1s per letter.
      let revealAt = 0.9; // letters keep scrambling for ~1s while the title scrolls up into view
      header.querySelectorAll<HTMLElement>('.scramble-word').forEach((word) => {
        const text = word.textContent ?? '';
        const revealTime = text.length * 0.1;
        tl.to(word, {
          duration: revealAt + revealTime,
          scrambleText: { text, chars: SCRAMBLE_CHARS, revealDelay: revealAt, speed: 0.4 },
          ease: 'none',
        }, 0);
        revealAt += revealTime;
      });
    });

    return () => ctx.revert();
  }, []);

  // ---- The maroon highlight, as on itsjay.us ----
  // One box for the whole grid that glides from tile to tile (his site does the same, with a 300ms CSS
  // transition). Only its transform changes: translate to the tile's corner, scale to the tile's size, so the
  // browser moves it on the GPU without re-laying out the page. (The earlier version mounted a new Framer
  // Motion layoutId box in each tile and sprang it across, which stuttered.)
  // instant: skip the glide, for the first placement and when the grid is resized
  const placeHighlight = (instant: boolean) => {
    const grid = gridRef.current;
    const box = highlightRef.current;
    const tile = tileRefs.current.get(activeItem);
    if (!grid || !box || !tile) return;
    const g = grid.getBoundingClientRect();
    const t = tile.getBoundingClientRect();
    if (instant) box.style.transition = 'none';
    box.style.transform = `translate(${t.left - g.left}px, ${t.top - g.top}px) scale(${t.width / HIGHLIGHT_BASE}, ${t.height / HIGHLIGHT_BASE})`;
    if (instant) {
      box.getBoundingClientRect(); // makes the browser apply the jump now, before the transition comes back
      box.style.transition = '';
    }
  };

  // Glide to the hovered/focused tile. useLayoutEffect: placed before the browser paints, so the first frame
  // already has it on React and nothing flashes in the corner
  const placedOnce = useRef(false);
  useLayoutEffect(() => {
    placeHighlight(!placedOnce.current);
    placedOnce.current = true;
  });

  // When the grid changes size (window resize, breakpoint), jump straight to the tile's new spot
  const placeRef = useRef(placeHighlight);
  useLayoutEffect(() => {
    placeRef.current = placeHighlight;
  });
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const ro = new ResizeObserver(() => placeRef.current(true));
    ro.observe(grid);
    return () => ro.disconnect();
  }, []);

  const renderCell = (item: typeof techStackItems[0]) => {
    const isActive = activeItem === item.name;

    return (
      // Each tile opens the tool's official site (lib/stackLinks.ts) in a new tab, like itsjay.us's grid.
      // Hover or keyboard focus moves the maroon highlight onto it
      <a
        key={item.name}
        ref={(el) => {
          if (el) tileRefs.current.set(item.name, el);
          else tileRefs.current.delete(item.name);
        }}
        href={stackLinks[item.name]}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${item.name} website`}
        onMouseEnter={() => setActiveItem(item.name)}
        onFocus={() => setActiveItem(item.name)}
        // Heights as on itsjay.us from lg: the big first row is 20vw tall, the row of seven 15vw (200-400px)
        className={`group relative flex items-center justify-center p-4 lg:p-8 h-32 md:h-44 cursor-pointer select-none bg-background focus-visible:outline-none ${
          item.row === 1 ? 'lg:h-[clamp(200px,20vw,400px)]' : 'lg:h-[clamp(200px,15vw,400px)]'
        }`}
      >
        {/* Keyboard focus ring: its own layer above the highlight (an outline on the link would sit under it) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-1.5 z-20 rounded-sm ring-2 ring-background opacity-0 group-focus-visible:opacity-100"
        />
        <div className={`relative z-10 flex items-center justify-center transition-[color,scale] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isActive ? 'text-background scale-105' : 'text-neutral'
        }`}>
          <StackLogo name={item.name} className={`h-auto ${item.logoClass}`} />
        </div>
      </a>
    );
  };

  return (
    <section id="tech-stack" className="relative w-full py-12 px-4 lg:px-8 bg-background">
      <div className="w-full flex flex-col items-center">
        {/* Font size follows the screen width (10vw, capped at 8rem) so "TECH STACK" stays on one line.
            opacity-0: hidden until the scramble starts (see the effect above), so the plain text never flashes */}
        <h2
          ref={headerRef}
          className="text-primary font-display text-[length:clamp(2.25rem,10vw,8rem)] uppercase tracking-[0.0175em] text-center mb-16 leading-none whitespace-pre-line min-h-[2.05em] opacity-0"
        >
          <span className="scramble-word">MODERN</span>{'\n'}
          <span className="scramble-word">TECH</span>{' '}
          <span className="scramble-word">STACK</span>
        </h2>

        {/* The grid lines are the 1px gaps letting this wrapper's color show between the cells,
            so they stay correct however many columns there are. isolate: the highlight (z-[1]) paints over the
            tiles' cream but under their logos (z-10), and that layering stays inside this grid.
            From lg: itsjay.us's layout, 3 big tiles over a row of 7. Below lg the two rows are display: contents,
            so all 10 tiles flow into one even grid (2 columns on phones, 5 on tablets) with no empty cell */}
        <div ref={gridRef} className="relative isolate w-full grid grid-cols-2 md:grid-cols-5 lg:flex lg:flex-col gap-px bg-primary/20">
          <div className="contents lg:grid lg:grid-cols-3 lg:gap-px">
            {topRowItems.map(renderCell)}
          </div>
          <div className="contents lg:grid lg:grid-cols-7 lg:gap-px">
            {bottomRowItems.map(renderCell)}
          </div>
          {/* The highlight. Absolutely placed, so it takes no grid cell. 300ms with Tailwind's default ease, as on
              itsjay.us; with reduced motion it just jumps */}
          <div
            ref={highlightRef}
            aria-hidden
            style={{ width: HIGHLIGHT_BASE, height: HIGHLIGHT_BASE }}
            className="pointer-events-none absolute left-0 top-0 z-[1] origin-top-left bg-primary will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
          />
        </div>
      </div>
    </section>
  );
}