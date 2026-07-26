'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface RevealTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function RevealText({ children, className = '', delay = 0 }: RevealTextProps) {
  return (
    <motion.div
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
