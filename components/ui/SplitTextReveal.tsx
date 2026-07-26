'use client';

import { motion, Variants } from 'framer-motion';

interface SplitTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  splitBy?: 'word' | 'line' | 'character';
  tag?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span';
}

export default function SplitTextReveal({ 
  text, 
  className = '', 
  delay = 0,
  splitBy = 'word',
}: SplitTextRevealProps) {
  const splits = splitBy === 'line' 
    ? text.split('\n') 
    : splitBy === 'character' 
      ? text.split('') 
      : text.split(' ');

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: splitBy === 'character' ? 0.02 : 0.05,
        delayChildren: delay,
      },
    },
  };

  const child: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={className}
    >
      {splits.map((segment, i) => (
        <motion.span
          key={i}
          variants={child}
          className="inline-block"
          style={splitBy === 'word' ? { marginRight: '0.3em' } : splitBy === 'line' ? { display: 'block' } : undefined}
        >
          {segment === ' ' ? '\u00A0' : segment}
        </motion.span>
      ))}
    </motion.div>
  );
}
