'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { animate, motion, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BrandFont, ProjectBrand, ProjectSlot } from '@/lib/projectsData';
import { brandFontFamily } from '@/lib/brandFonts';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { videoProps } from '@/lib/videoProps';
import { RiseIn, revealEase } from '@/components/ui/Reveal';

// The boxes on a project page (components/sections/ProjectDetail.tsx), one component per slot type.
// Images and videos fill a full-width 16:10 box; the two brand cards sit side by side in 1.1:1 boxes from 1024px.

// How wide each box is on screen, so next/image picks the smallest file that is still sharp. A full box is the
// screen minus the page's side padding (104px from 1024px up, 64px below). A logo is 40% of its card, at most
// 272px: ~20vw beside the fonts card, the 272px cap on a tablet's full-width card, ~40vw on a phone
const FULL_SIZES = '(min-width: 1024px) calc(100vw - 104px), calc(100vw - 64px)';
const LOGO_SIZES = '(min-width: 1024px) 20vw, (min-width: 768px) 272px, 40vw';

interface SlotBoxProps {
  slot: ProjectSlot;
  name: string;
  brand: ProjectBrand;
  /** The first box: on desktop it's the biggest thing on screen when the page opens, so it loads right away */
  eager?: boolean;
}

export function ProjectSlotBox({ slot, name, brand, eager = false }: SlotBoxProps) {
  // The two brand cards only sit side by side from 1024px: a tablet-width half box is too small for three
  // fonts and a palette. Below that they stack full width: the fonts card as tall as its content, the logo card
  // 16:10 like the screenshots (1.1:1 on phones)
  const box =
    slot.type === 'image' || slot.type === 'video'
      ? 'lg:col-span-2 aspect-[16/10] overflow-hidden bg-background'
      : slot.type === 'brandLogo'
        ? 'aspect-[11/10] md:aspect-[16/10] lg:aspect-[11/10]'
        : 'lg:aspect-[11/10]';

  return (
    // w-full min-w-0: the width always comes from the column, never from the content or the ratio, so a box
    // whose content needs more height than 1.1:1 grows taller, not wider. self-stretch: the logo card then grows
    // with the fonts card, so the pair still lines up
    <RiseIn y={32} delay={1.5} className={`relative w-full min-w-0 self-stretch rounded-xl ${box}`}>
      {slot.type === 'image' && (
        <Image
          src={slot.src}
          alt={slot.alt}
          fill
          sizes={FULL_SIZES}
          loading={eager ? 'eager' : 'lazy'}
          className="object-cover"
        />
      )}
      {slot.type === 'video' && <VideoSlot slot={slot} />}
      {slot.type === 'brandType' && <BrandType brand={brand} />}
      {slot.type === 'brandLogo' && <BrandLogo brand={brand} name={name} />}
    </RiseIn>
  );
}

// ---- Video: plays only while at least 40% of it is on screen ----------------------------------------------
function VideoSlot({ slot }: { slot: Extract<ProjectSlot, { type: 'video' }> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return; // reduced motion: there is no video, only its poster
    // preload="none" means nothing is downloaded before the first play(), so a video further down the page
    // costs nothing until you scroll to it
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.4) video.play().catch(() => {}); // rejects if paused before it starts
        else video.pause();
      },
      { threshold: [0, 0.4] }
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reducedMotion]);

  // Reduced motion: the poster as a still
  if (reducedMotion) {
    return <Image src={slot.poster} alt={slot.alt} fill sizes={FULL_SIZES} className="object-cover" />;
  }

  return (
    <video
      ref={videoRef}
      // videoProps + pointer-events-none: reads as part of the design, not a player (lib/videoProps.ts)
      className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover"
      {...videoProps}
      preload="none"
      poster={slot.poster}
      aria-label={slot.alt}
    >
      {/* WebM first (smaller), MP4 for Safari */}
      <source src={slot.webm} type="video/webm" />
      <source src={slot.src} type="video/mp4" />
    </video>
  );
}

// ---- Colour helpers -----------------------------------------------------------------------------------
// WCAG relative luminance of a #RRGGBB colour
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Near-black or white, whichever has the higher contrast on `hex` (coral and olive get dark text, not white)
const INK = '#141414';
const INK_LUMINANCE = luminance(INK);
const textOn = (hex: string) => {
  const l = luminance(hex);
  return 1.05 / (l + 0.05) > (l + 0.05) / (INK_LUMINANCE + 0.05) ? '#ffffff' : INK;
};

// The type poster's text colour: the poster colour mixed with white, from 85% white upwards, stopping at the first
// mix that small text can be read on (4.5:1). So it's always a light tint of the brand colour, never plain white
function posterInk(hex: string) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const bg = luminance(hex);
  let tint = hex;
  for (let white = 0.85; white <= 0.97; white += 0.01) {
    tint = '#' + channels.map((c) => Math.round(c + (255 - c) * white).toString(16).padStart(2, '0')).join('');
    if ((luminance(tint) + 0.05) / (bg + 0.05) >= 4.5) break;
  }
  return tint;
}

// ---- Fonts + palette card: a two-slide carousel ------------------------------------------------------------
// Slide 1 is a type poster (TypePoster below), slide 2 the full card: every font and the colour swatches.
// Like an Instagram post: the small arrow or a dot turns the page (and ←/→ once one of them has focus).
// The slides sit side by side on a track that moves by one card width; the card's overflow-hidden hides the one
// that isn't shown
function BrandType({ brand }: { brand: ProjectBrand }) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const [slide, setSlide] = useState(0);
  const slideRef = useRef(0);       // the same, for the handlers below
  const rootRef = useRef<HTMLDivElement>(null);
  const width = useRef(0);          // one slide = the card's width, in px
  const x = useMotionValue(0);      // the track's position
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const ink = posterInk(brand.poster);

  // If keyboard focus is on an arrow, it hides on the other slide: send focus to the arrow that's still there,
  // so it doesn't drop out of the card (and ←/→ keep working)
  const refocusArrow = useRef(false);
  useEffect(() => {
    if (!refocusArrow.current) return;
    refocusArrow.current = false;
    rootRef.current?.querySelector<HTMLButtonElement>('[data-arrow]:not(:disabled)')?.focus();
  }, [slide]);

  const go = (n: number) => {
    const next = Math.max(0, Math.min(1, n));
    refocusArrow.current = !!document.activeElement?.closest('[data-arrow]');
    slideRef.current = next;
    setSlide(next);
    const target = -next * width.current;
    if (reducedMotion) x.set(target);
    else animate(x, target, { duration: 0.45, ease: revealEase });
  };

  // Measure the card, and keep the track on the current slide if the card changes width
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    width.current = root.offsetWidth;
    const ro = new ResizeObserver(() => {
      if (root.offsetWidth === width.current) return;
      width.current = root.offsetWidth;
      x.set(-slideRef.current * width.current);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [x]);

  const copy = async (hex: string, hexLabel: HTMLElement | null) => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      // No clipboard access (plain http, some in-app browsers): select the hex instead, ready for Ctrl/⌘ + C
      if (hexLabel) window.getSelection()?.selectAllChildren(hexLabel);
      return;
    }
    setCopied(hex);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 1500);
  };

  return (
    // min-h-full rather than h-full: if the full card ever needs more than the 1.1:1 box, the card (and the box
    // around it) grows instead of the text spilling out. @container: the slides' sizes follow the card's width
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Fonts and colours"
      className="@container relative min-h-full flex flex-col rounded-xl overflow-hidden"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          go(slideRef.current + (e.key === 'ArrowRight' ? 1 : -1));
        }
      }}
    >
      {/* The track: both slides side by side, slid by the arrow and dots below */}
      <motion.div className="flex flex-1" style={{ x }}>
        {/* Slide 1: the poster */}
        <div role="group" aria-roledescription="slide" aria-label="1 of 2: type poster" inert={slide !== 0} className="relative w-full shrink-0 flex">
          <TypePoster brand={brand} ink={ink} />
        </div>

        {/* Slide 2: the full card. Its own @container: the type and swatch sizes follow its width (cqw).
            The extra bottom padding is the room the dots and arrow need under the swatches */}
        <div
          role="group"
          aria-roledescription="slide"
          aria-label="2 of 2: fonts and colours"
          inert={slide !== 1}
          className="@container w-full shrink-0 px-5 pt-5 pb-11 lg:px-7 lg:pt-7 lg:pb-12 flex flex-col"
          style={{ backgroundColor: brand.surface.bg, color: brand.surface.fg }}
        >
          {/* One row per font. The rows share a 2-column grid (subgrid), so the names all start at the same x,
              and they share out any spare height so the dividers stay evenly spaced */}
          <ul className="flex-1 grid grid-cols-[auto_1fr] auto-rows-[minmax(min-content,1fr)] gap-x-[4cqw]">
            {brand.fonts.map((font) => (
              <FontRow key={font.family + font.role} font={font} />
            ))}
          </ul>

          {/* Palette: 3 per row on phones, all in one row once the card is 340px wide. Click a swatch to copy its hex.
              Labels and padding step down a little in the narrowest cards, so 6 swatches in a row still fit their hex */}
          <ul className="mt-4 @[520px]:mt-6 grid grid-cols-3 gap-1.5 @[340px]:grid-cols-none @[340px]:grid-flow-col @[340px]:auto-cols-fr">
            {brand.colors.map((c) => (
              <li key={c.hex}>
                <button
                  type="button"
                  onClick={(e) => copy(c.hex, e.currentTarget.querySelector('[data-hex]'))}
                  className="w-full h-[clamp(3.25rem,14cqw,9rem)] rounded-lg p-1.5 @[420px]:p-2 flex flex-col items-start justify-end text-left ring-1 ring-inset ring-black/10 cursor-copy transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ backgroundColor: c.hex, color: textOn(c.hex), outlineColor: brand.surface.fg }}
                  aria-label={`Copy ${c.name}, ${c.hex}`}
                >
                  <span className="font-body text-[10px] @[500px]:text-[11px] leading-tight line-clamp-2 opacity-80">{c.name}</span>
                  <span data-hex className="font-body text-[10px] @[420px]:text-[11px] @[500px]:text-xs font-semibold leading-tight tabular-nums">
                    {copied === c.hex ? 'Copied' : c.hex}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <span className="sr-only" aria-live="polite">
            {copied ? `Copied ${copied}` : ''}
          </span>
        </div>
      </motion.div>

      {/* Controls along the bottom edge: ← (on slide 2), the two dots, → (on slide 1). They take the colour of
          the slide they sit on: the poster's tint, then the card's text colour */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-2.5 pb-2 lg:px-3.5 lg:pb-2.5 pointer-events-none transition-colors duration-300"
        style={{ color: slide === 0 ? ink : brand.surface.fg }}
      >
        <SlideArrow dir="prev" hidden={slide === 0} onClick={() => go(slide - 1)} />
        <div className="flex pointer-events-auto">
          {[0, 1].map((i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              aria-current={slide === i ? 'true' : undefined}
              onClick={() => go(i)}
              className="p-1.5 rounded-full focus-visible:outline-2 focus-visible:outline-current"
            >
              <span className={`block size-1.5 rounded-full bg-current transition-opacity duration-300 ${slide === i ? 'opacity-100' : 'opacity-40'}`} />
            </button>
          ))}
        </div>
        <SlideArrow dir="next" hidden={slide === 1} onClick={() => go(slide + 1)} />
      </div>
    </div>
  );
}

// The small round arrow. When there's nowhere to go it stays in place, invisible, so the dots stay centred
function SlideArrow({ dir, hidden, onClick }: { dir: 'prev' | 'next'; hidden: boolean; onClick: () => void }) {
  const Icon = dir === 'next' ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      data-arrow
      aria-label={dir === 'next' ? 'Next slide: fonts and colours' : 'Previous slide: type poster'}
      onClick={onClick}
      disabled={hidden}
      className={`pointer-events-auto grid place-items-center size-7 rounded-full bg-current/15 hover:bg-current/25 transition-[background-color,opacity] duration-300 focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-2 ${
        hidden ? 'invisible opacity-0' : 'opacity-100'
      }`}
    >
      {/* The icon is drawn in the card's colour on a 15% wash of it */}
      <Icon size={16} strokeWidth={2.25} aria-hidden />
    </button>
  );
}

// ---- Type poster (slide 1 of the fonts card) -------------------------------------------------------------
// Like itsjay.us's type card: the brand colour full bleed, the heading font's name top-left, and one big "Aa" in
// its heaviest weight sitting on the bottom-left padding, whole. All text is a light tint of the colour (posterInk)
function TypePoster({ brand, ink }: { brand: ProjectBrand; ink: string }) {
  const heading = brand.fonts.find((f) => f.role === 'Headings') ?? brand.fonts[0];
  const fontFamily = brandFontFamily[heading.family] ?? 'inherit';
  const weight = Math.max(...(heading.weights?.match(/\d+/g) ?? ['700']).map(Number));

  const posterRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  // The Aa's size and position, measured in the browser: it depends on the font's real letter shapes
  const [aa, setAa] = useState<{ w: number; h: number; size: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const poster = posterRef.current;
    const name = nameRef.current;
    if (!poster || !name) return;
    // The name is set in the same font, and its computed style has the real family names (it resolves
    // var(--font-…), which canvas can't read)
    const font = `${weight} 100px ${getComputedStyle(name.firstElementChild ?? name).fontFamily}`;
    let ready = false;

    const measure = () => {
      if (!ready) return;
      // offsetWidth/Height: the layout size, not affected by the page-open scale animation
      const w = poster.offsetWidth;
      const h = poster.offsetHeight;
      const cs = getComputedStyle(poster);
      const padX = parseFloat(cs.paddingLeft);
      const padBottom = parseFloat(cs.paddingBottom);
      const ctx = document.createElement('canvas').getContext('2d');
      if (!ctx || !w || !h) return;
      ctx.font = font;
      const letters = ctx.measureText('Aa');
      const capHeight = ctx.measureText('A').actualBoundingBoxAscent / 100; // per px of font size
      const inkWidth = (letters.actualBoundingBoxLeft + letters.actualBoundingBoxRight) / 100;
      const baseline = h - padBottom;
      // As wide as the inner width allows, but its capitals at most half the card's height, and always at least
      // half a padding below the name
      const room = baseline - (name.offsetTop + name.offsetHeight) - padX / 2;
      const size = Math.min((w - 2 * padX) / inkWidth, (0.5 * h) / capHeight, room / capHeight);
      // x: where the text starts so its ink (not its spacing) lines up with the padding
      setAa({ w, h, size, x: padX + (letters.actualBoundingBoxLeft / 100) * size, y: baseline });
    };

    const ro = new ResizeObserver(measure);
    ro.observe(poster);
    // Measure once the font itself is loaded, otherwise the fallback font's shapes would be used
    document.fonts.load(font).catch(() => []).then(() => {
      ready = true;
      measure();
    });
    return () => {
      ready = false;
      ro.disconnect();
    };
  }, [weight]);

  return (
    // Padding ~9% of the card's width, like itsjay.us's card. The bottom one never goes under 2.75rem: the
    // dots and arrow sit in it
    <div
      ref={posterRef}
      className="relative w-full px-[clamp(1.25rem,9cqw,4rem)] pt-[clamp(1.25rem,9cqw,4rem)] pb-[clamp(2.75rem,9cqw,4rem)]"
      style={{ backgroundColor: brand.poster, color: ink }}
    >
      {/* The Aa as SVG text: SVG places text by its baseline, which sits exactly on the bottom padding */}
      {aa && (
        <svg aria-hidden className="absolute inset-0 w-full h-full" viewBox={`0 0 ${aa.w} ${aa.h}`}>
          <text x={aa.x} y={aa.y} fontSize={aa.size} fontWeight={weight} fill="currentColor" style={{ fontFamily }}>
            Aa
          </text>
        </svg>
      )}

      {/* Top left: the font's name, in itself, and its role + weights */}
      <div ref={nameRef} className="relative flex flex-col gap-1">
        <span className="leading-[1.1] text-[length:clamp(1.25rem,5cqw,2.25rem)]" style={{ fontFamily }}>
          {heading.family}
        </span>
        <span className="font-body text-[11px] uppercase tracking-[0.08em]">
          {[heading.role, heading.weights].filter(Boolean).join(' · ')}
        </span>
      </div>
    </div>
  );
}

// Sample look per role. Sentences (headings, body) read at text size and are cut to 3 lines on phones, 2 above.
// A one-word logo or accent sample ("Lancr", "Artifecta") is set as big as the family name, otherwise a script
// face is too small to see, and Arabic gets a step up because it looks smaller than Latin at the same size.
// Those short ones are never cut: the cut hides whatever sticks out of the line, like script swashes and Arabic marks
const sentence = 'line-clamp-3 md:line-clamp-2 text-[length:clamp(0.75rem,2.6cqw,1.25rem)]';
const sampleStyle: Record<BrandFont['role'], string> = {
  Headings: sentence,
  Body: sentence,
  Arabic: 'text-[length:clamp(0.95rem,3.4cqw,1.6rem)]',
  Logo: 'text-[length:clamp(1rem,4.4cqw,2.25rem)]',
  Accent: 'text-[length:clamp(1rem,4.4cqw,2.25rem)]',
};

function FontRow({ font }: { font: BrandFont }) {
  const fontFamily = brandFontFamily[font.family] ?? 'inherit';
  const arabic = font.role === 'Arabic';

  return (
    // The row padding is only the minimum: in a roomy card the rows share the spare height (1fr), so the gaps
    // around the dividers grow with it
    <li className="col-span-2 grid grid-cols-subgrid items-center py-[1.5cqw] first:pt-0 last:pb-0 border-t border-current/15 first:border-t-0">
      {/* Specimen: Aa (or alef-ba for an Arabic font) */}
      <span aria-hidden className="leading-none text-[length:clamp(2.5rem,14cqw,7rem)]" style={{ fontFamily }}>
        {arabic ? 'أب' : 'Aa'}
      </span>
      <span className="min-w-0 flex flex-col gap-0.5 @[500px]:gap-1">
        <span className="leading-[1.1] text-pretty break-words text-[length:clamp(1rem,4.4cqw,2.25rem)]" style={{ fontFamily }}>
          {font.family}
        </span>
        <span className="font-body text-[11px] uppercase tracking-[0.08em] opacity-65">
          {[font.role, font.weights, font.note].filter(Boolean).join(' · ')}
        </span>
        {/* Real copy from the project, in its font. Arabic keeps its right-to-left letter order (dir) but lines
            up on the left with the rest of the card */}
        <span
          className={`leading-snug opacity-80 text-left ${sampleStyle[font.role]}`}
          style={{ fontFamily }}
          dir={arabic ? 'rtl' : undefined}
        >
          {font.sample}
        </span>
      </span>
    </li>
  );
}

// ---- Logo card -------------------------------------------------------------------------------------------
function BrandLogo({ brand, name }: { brand: ProjectBrand; name: string }) {
  // The dark version first (on the brand's own dark colour) when there is one
  const versions = (['dark', 'light'] as const).flatMap((key) => {
    const logo = brand.logo[key];
    return logo ? [{ key, ...logo }] : [];
  });
  const [shown, setShown] = useState(versions[0]?.key);
  const current = versions.find((v) => v.key === shown);
  if (!current) return null;
  const fg = textOn(current.bg);

  return (
    // A one-cell grid: both versions sit in the same cell, centred, and cross-fade, so switching never shows a
    // logo on the wrong background
    <div
      className="relative h-full rounded-xl grid place-items-center transition-colors duration-500"
      style={{ backgroundColor: current.bg }}
    >
      {versions.map((v) => (
        <div
          key={v.key}
          aria-hidden={v.key !== shown}
          // 40% of the card (max 17rem): big enough to read, small enough not to blow up a small raster logo
          className={`relative col-start-1 row-start-1 w-[40%] max-w-[17rem] aspect-square transition-opacity duration-500 ${
            v.key === shown ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {v.src.endsWith('.svg') ? (
            // SVGs stay sharp at any size, so they skip next/image
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.src} alt={`${name} logo`} className="absolute inset-0 w-full h-full object-contain" />
          ) : (
            <Image src={v.src} alt={`${name} logo`} fill sizes={LOGO_SIZES} className="object-contain" />
          )}
        </div>
      ))}

      {versions.length > 1 && (
        <div
          role="group"
          aria-label="Logo version"
          className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 flex gap-1 rounded-full p-1 font-body text-[11px] uppercase tracking-[0.08em] transition-colors duration-500"
          style={{ backgroundColor: fg === INK ? 'rgb(0 0 0 / 0.07)' : 'rgb(255 255 255 / 0.12)', color: fg }}
        >
          {versions.map((v) => (
            <button
              key={v.key}
              type="button"
              aria-pressed={v.key === shown}
              onClick={() => setShown(v.key)}
              className="rounded-full px-3 pt-1.5 pb-1 transition-colors duration-300"
              style={v.key === shown ? { backgroundColor: fg, color: current.bg } : undefined}
            >
              {v.key === 'dark' ? 'Dark' : 'Light'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
