'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    // Check session storage
    if (typeof window !== 'undefined' && sessionStorage.getItem('preloader-shown')) {
      setIsVisible(false);
      onComplete();
      return;
    }

    let intervalId: NodeJS.Timeout;
    let current = 0;

    // Count from 0 to 99
    intervalId = setInterval(() => {
      current += 1;
      setCount(current);

      if (current >= 99) {
        clearInterval(intervalId);

        // Hold at 99 for ~400ms
        setTimeout(() => {
          setIsGlitching(true);
          setCount(3); // Drop to 03 as intentional glitch

          // Hold glitch state for 200ms
          setTimeout(() => {
            setIsGlitching(false);

            // Finish after 300ms
            setTimeout(() => {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('preloader-shown', 'true');
              }
              setIsVisible(false);
              onComplete();
            }, 300);
          }, 200);
        }, 400);
      }
    }, 20); // ~2 seconds total count time

    return () => clearInterval(intervalId);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFF3E6] pointer-events-none"
        >
          <motion.div
            animate={
              isGlitching
                ? {
                    scale: [1, 1.15, 0.9, 1.05, 1],
                    opacity: [1, 0.4, 1, 0.6, 1],
                    x: [-2, 3, -1, 2, 0],
                  }
                : {}
            }
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center font-display text-[#6B0132] text-6xl md:text-8xl font-bold tracking-widest select-none"
          >
            <span>{count.toString().padStart(2, '0')}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
