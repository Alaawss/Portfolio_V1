'use client';

import { motion } from 'framer-motion';

interface SectionLabelProps {
  label: string;
  className?: string;
}

export default function SectionLabel({ label, className = '' }: SectionLabelProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`text-lg md:text-xl italic tracking-wide text-primary font-heading ${className}`}
    >
      {label}
    </motion.p>
  );
}
