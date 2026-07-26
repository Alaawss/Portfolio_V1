'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface CurtainRevealProps {
  isRevealed: boolean;
}

export default function CurtainReveal({ isRevealed }: CurtainRevealProps) {
  return (
    <AnimatePresence>
      {!isRevealed && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-40 bg-primary"
        />
      )}
    </AnimatePresence>
  );
}
