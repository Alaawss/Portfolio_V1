'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// The page-reveal motions of itsjay.us, with the values read from its production code (it uses motion.dev).
// Every element shares this curve: very fast at first, then a long gentle settle.
export const revealEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface SlideUpProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  /** Lets letters that hang below the line (the j in "Projects") show: the clip reaches lower and the text starts lower */
  descender?: boolean;
  className?: string;
}

// Titles, labels, values, paragraphs, links: the content slides up out of an invisible clip as one piece
export function SlideUp({ children, delay = 0, duration = 1, descender = false, className = '' }: SlideUpProps) {
  return (
    <span className={`block overflow-hidden ${descender ? 'pb-[0.2em] -mb-[0.2em]' : ''} ${className}`}>
      <motion.span
        className="block"
        initial={{ y: descender ? '120%' : '100%' }}
        animate={{ y: '0%' }}
        transition={{ duration, delay, ease: revealEase }}
      >
        {children}
      </motion.span>
    </span>
  );
}

interface RiseInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  scale?: number;
  className?: string;
  /** 'li' for items inside a list (the skill chips) */
  as?: 'div' | 'li';
}

// Panels, cards, chips, media: fade in while rising and growing back to full size
export function RiseIn({ children, delay = 0, duration = 1, y = 24, scale = 0.98, className = '', as = 'div' }: RiseInProps) {
  const Tag = as === 'li' ? motion.li : motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, scale }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration, delay, ease: revealEase }}
    >
      {children}
    </Tag>
  );
}
