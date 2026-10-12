'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

// A photo that slides slowly inside its frame while you scroll (the inner-image parallax from the inspiration;
// based on FUTURE ANIMATION/05-image-parallax/ParallaxImage.tsx, adapted to next/image).
// It fills the frame it's placed in (the frame keeps its own size, corners, border, shadow and animations; it must
// be `relative` and `overflow-hidden`), so the frame itself scrolls normally with the page and only the photo
// inside it lags behind.
//
// How it works:
//   - useScroll gives the frame's progress through the screen: 0 when its top enters at the bottom of the screen,
//     1 when its bottom leaves at the top. Lenis (components/SmoothScroll.tsx) already smooths the scroll.
//   - useTransform turns that 0 → 1 into a y position, -amount% → +amount% of the photo layer's own height.
//   - The photo layer is 124% as tall as the frame and starts 12% above it, so it has room to move without its edge
//     ever showing. That room is 12 / 124 ≈ 9.6% of the layer: keep `amount` at or below it.
//   - With reduced motion the photo simply stays still.
export default function ParallaxImage({
  src,
  alt,
  sizes,
  amount = 8.5, // how far the photo travels, in % of its layer's height. Bigger = stronger effect (max 9.6)
}: {
  src: string;
  alt: string;
  sizes: string;
  amount?: number;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: frame, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);

  return (
    // Same box as the frame: this is what useScroll measures
    <div ref={frame} className="absolute inset-0 overflow-hidden">
      {/* The moving layer: 124% tall, 12% above the frame. next/image's `fill` needs a positioned parent */}
      <motion.div style={{ y: reduceMotion ? 0 : y }} className="absolute inset-x-0 top-[-12%] h-[124%] will-change-transform">
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </motion.div>
    </div>
  );
}
