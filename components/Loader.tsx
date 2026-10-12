'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { markLoaderDone } from '@/lib/loaderStore';

// The opening counter: 00 → 99 in ~2s, a beat on 99, a glitch down to 03, then the screen fades.
// It's decoration (a timer, not real loading progress), like itsjay.us's loader. It sits in the root layout
// (app/layout.tsx), so it plays on every full page load or refresh, on any page, but not when you move between
// pages inside the site: the layout stays mounted, so it never restarts
export default function Loader() {
  const [count, setCount] = useState(0);
  const [glitching, setGlitching] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timers: number[] = [];
    let n = 0;
    // +1 every 20ms up to 99
    const id = window.setInterval(() => {
      n += 1;
      setCount(n);
      if (n < 99) return;
      window.clearInterval(id);
      // Hold 99 for 0.4s, glitch down to 03 for 0.2s, then fade out 0.3s later
      timers.push(
        window.setTimeout(() => {
          setGlitching(true);
          setCount(3);
          timers.push(
            window.setTimeout(() => {
              setGlitching(false);
              timers.push(
                window.setTimeout(() => {
                  setVisible(false);
                  markLoaderDone(); // the hero starts its reveal now, while this screen fades
                }, 300)
              );
            }, 200)
          );
        }, 400)
      );
    }, 20);
    return () => {
      window.clearInterval(id);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // No scrolling while the counter is up: pinning the body leaves nothing to scroll (smooth scrolling included)
  useEffect(() => {
    if (!visible) return;
    const body = document.body.style;
    const saved = { overflow: body.overflow, height: body.height, position: body.position, width: body.width };
    Object.assign(body, { overflow: 'hidden', height: '100vh', position: 'fixed', width: '100%' });
    return () => {
      Object.assign(body, saved);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        // Rendered on the server at "00", so it already covers the very first paint
        <motion.div
          key="loader"
          aria-hidden
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#FFF3E6] pointer-events-none"
        >
          <motion.div
            animate={
              glitching
                ? { scale: [1, 1.15, 0.9, 1.05, 1], opacity: [1, 0.4, 1, 0.6, 1], x: [-2, 3, -1, 2, 0] }
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
