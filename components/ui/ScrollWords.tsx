'use client';

import { Children, isValidElement, useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useMediaQuery } from '@/lib/useMediaQuery';

// <ScrollWords>: a paragraph whose words light up one by one as you scroll through it, plus <Highlight>: a lime
// marker stroke drawn behind a phrase as soon as its words are lit. Reusable in any section:
//
//   <ScrollWords className="...">
//     Plain text, then <Highlight>these words get the marker</Highlight>, then more text.
//   </ScrollWords>
//
// How it works, in three steps:
//   1. useScroll gives one number, from 0 to 1, saying how far the paragraph has travelled through the screen.
//   2. Each word turns that number into its own opacity with useTransform: word 1 brightens first, word 2 a
//      little later, and so on, so the light sweeps through the text as you scroll.
//   3. Each highlighted phrase draws its stroke once the sweep reaches its last word, so the strokes come in one
//      after another, right behind the light. When the number drops back to 0 (you scrolled back up past the
//      paragraph), they all retract, so they play again next time.

// ---- Settings ----
const DIM = 0.14; // how visible a word is before it's reached (0 = invisible, 1 = full)
const WORD_SPAN = 0.15; // how much of the scroll each single word takes to go from dim to full
const DRAW_WHEN = 0.6; // a phrase draws when its last word is this far into lighting up (0.6 = 60%)

export function ScrollWords({
  children,
  className = '',
  as: Tag = 'p',
}: {
  children: ReactNode;
  className?: string;
  as?: 'p' | 'div';
}) {
  const ref = useRef<HTMLParagraphElement & HTMLDivElement>(null);

  // true if the visitor asked their system for less motion: then everything is shown at once. (The site's own
  // hook, lib/useMediaQuery.ts, rather than Motion's useReducedMotion: it follows the setting live, like the
  // rest of the site does)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // 1. Scroll progress of this paragraph, as a "motion value" (a number that changes without re-rendering React).
  //    offset: progress is 0 when the paragraph's top ("start") reaches 85% down the screen, and 1 when its
  //    bottom ("end") reaches 45% down, i.e. a little above the middle
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });

  // ---- Split the children into words ----
  // The children are a mix of plain text and <Highlight> elements. First count every word, so each one knows
  // its place in the sentence (word 7 of 52, say) and therefore when it should light up
  const parts = Children.toArray(children);
  const total = parts.reduce<number>((sum, part) => sum + splitWords(textOf(part)).filter(isWord).length, 0);
  // Where word number n starts lighting up: a bit after the word before it, scaled so the last word still has
  // room to reach full opacity by the end
  const startOf = (n: number) => (n / total) * (1 - WORD_SPAN);

  // 3. For every highlighted phrase, in reading order: the progress at which its stroke draws (when its last
  //    word is DRAW_WHEN of the way to full opacity). Kept in a ref because it's only read, never displayed
  const thresholds: number[] = [];
  let counted = 0;
  for (const part of parts) {
    counted += splitWords(textOf(part)).filter(isWord).length;
    if (isHighlight(part)) thresholds.push(startOf(counted - 1) + WORD_SPAN * DRAW_WHEN);
  }
  const thresholdsRef = useRef(thresholds);
  useEffect(() => {
    thresholdsRef.current = thresholds;
  });

  // How many phrases have their stroke drawn (0 to all). Unlike the opacities this is a real React state: it only
  // changes a few times, and a CSS transition then does the drawing
  const [drawnCount, setDrawnCount] = useState(0);
  const update = (progress: number) => {
    // Back below the start: retract everything, so it replays
    if (progress <= 0) return setDrawnCount(0);
    // Otherwise: every phrase whose moment has come. Never fewer than already drawn, so scrolling back up a
    // little doesn't erase them
    const reached = thresholdsRef.current.filter((at) => progress >= at).length;
    setDrawnCount((before) => Math.max(before, reached));
  };
  // Called every time the progress changes...
  useMotionValueEvent(scrollYProgress, 'change', update);
  // ...and once at the start, in case the page opens already scrolled past the paragraph
  useEffect(() => {
    const frame = requestAnimationFrame(() => update(scrollYProgress.get()));
    return () => cancelAnimationFrame(frame);
  }, [scrollYProgress]);

  // ---- Render ----
  let index = 0; // the running word number, across plain text and highlights alike
  let phrase = 0; // the running highlight number
  const renderWords = (text: string) =>
    splitWords(text).map((piece, i) => {
      // Spaces stay plain text between the words, so lines wrap exactly like a normal paragraph
      if (!isWord(piece)) return piece;
      const start = startOf(index++);
      // 2. This word's slice of the scroll: from `start`, WORD_SPAN long
      return reducedMotion ? (
        <span key={i}>{piece}</span>
      ) : (
        <Word key={i} progress={scrollYProgress} range={[start, start + WORD_SPAN]}>
          {piece}
        </Word>
      );
    });

  return (
    <Tag ref={ref} className={className}>
      {parts.map((part, i) => {
        if (!isHighlight(part)) return <span key={i}>{renderWords(textOf(part))}</span>;
        const n = phrase++;
        return (
          <Marker key={i} drawn={reducedMotion || n < drawnCount} animate={!reducedMotion}>
            {renderWords(textOf(part))}
          </Marker>
        );
      })}
    </Tag>
  );
}

// One word. It has to be its own little component because hooks (useTransform) can't be called inside a loop:
// as a component, every word gets its own hook call.
// useTransform maps the paragraph's progress onto this word's opacity: below range[0] it stays at DIM, between
// range[0] and range[1] it rises, after range[1] it stays at 1. motion.span applies it straight to the page
// as you scroll, without re-rendering React, which keeps it smooth
function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [DIM, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

// Marks a phrase for the lime stroke. Inside <ScrollWords> it's only a label: ScrollWords finds it, splits its
// words and draws the stroke at the right moment. Used on its own, it simply shows the stroke, already drawn
export function Highlight({ children }: { children: ReactNode }) {
  return (
    <Marker drawn animate={false}>
      {children}
    </Marker>
  );
}

// The stroke itself: a background image (a flat lime gradient) covering the bottom 42% of the text, whose width
// animates from 0% to 100%, so it draws left to right in 0.8s with an ease-out curve.
// box-decoration-break: clone gives each line its own full stroke when the phrase wraps onto two lines (without
// it the stroke would be one strip cut in two). The small padding lets the stroke stick out a hair past the
// letters; the matching negative margin keeps the text where it was
function Marker({ children, drawn, animate }: { children: ReactNode; drawn: boolean; animate: boolean }) {
  return (
    <span
      style={{
        backgroundImage: 'linear-gradient(#C6FF34, #C6FF34)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 100%',
        backgroundSize: drawn ? '100% 42%' : '0% 42%',
        transition: animate ? 'background-size 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
        padding: '0 0.08em',
        margin: '0 -0.08em',
      }}
    >
      {children}
    </span>
  );
}

// ---- Small helpers ----

// "design engineer in" → ["design", " ", "engineer", " ", "in"]: words and the spaces between them
function splitWords(text: string) {
  return text.split(/(\s+)/).filter(Boolean);
}

function isWord(piece: string) {
  return piece.trim() !== '';
}

function isHighlight(node: ReactNode): node is ReactElement<{ children?: ReactNode }> {
  return isValidElement(node) && node.type === Highlight;
}

// The text inside a child: a plain string, or the text inside a <Highlight>
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (isHighlight(node)) return Children.toArray(node.props.children).map(textOf).join('');
  return '';
}
