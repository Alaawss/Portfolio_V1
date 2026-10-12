'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navLinks, socialLinks } from '@/lib/data';
import Link from 'next/link';

export default function BottomDock() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bottom Dock */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        initial={false}
        animate={{
          height: isOpen ? 'auto' : '60px',
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Header / Trigger */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-[60px] bg-background/90 backdrop-blur-md border-t border-primary/20 flex items-center justify-center cursor-pointer"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-6 h-0.5 bg-primary"></div>
            <div className="w-6 h-0.5 bg-primary"></div>
          </motion.div>
        </div>

        {/* Expandable Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-background/95 backdrop-blur-md border-t border-primary/20 px-6 py-8"
            >
              <div className="flex flex-col gap-6">
                {/* Navigation Links */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-primary font-display text-sm uppercase tracking-wider opacity-60">
                    Navigation
                  </h3>
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-primary font-heading text-xl tracking-wide hover:underline decoration-primary underline-offset-4 transition-all"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Social Links */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-primary font-display text-sm uppercase tracking-wider opacity-60">
                    Social
                  </h3>
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-heading text-xl tracking-wide hover:underline decoration-primary underline-offset-4 transition-all"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
