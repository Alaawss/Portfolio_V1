'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { navLinks, socialLinks } from '@/lib/data';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      animate={{
        backgroundColor: scrolled ? 'rgba(255, 243, 230, 0.8)' : 'rgba(255, 243, 230, 0)',
        boxShadow: scrolled ? '0 1px 12px rgba(107, 1, 50, 0.08)' : '0 0 0 rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 pt-4 pb-4 px-8 md:px-16 lg:px-20 flex items-center justify-between rounded-b-[10px] ${scrolled ? 'backdrop-blur-md' : ''}`}
    >
      <nav className="flex items-center gap-8 md:gap-12 lg:gap-14">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-primary font-heading text-base md:text-lg lg:text-xl tracking-wide hover:underline decoration-primary underline-offset-4 transition-all"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-8 md:gap-12 lg:gap-14">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-heading text-base md:text-lg lg:text-xl tracking-wide hover:underline decoration-primary underline-offset-4 transition-all"
          >
            {link.label}
          </a>
        ))}
      </div>
    </motion.nav>
  );
}
