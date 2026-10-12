'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { navLinks } from '@/lib/data';
import { useCasablancaTime } from '@/lib/casablancaClock';

// The top bar on every page (from md up; phones use the BottomDock instead).
// Left: monogram + name. Centre: the links, with a maroon pill that slides to the hovered link and back to the
// active one (Motion layoutId, the same spring as the tech-stack grid). Right: availability, the Casablanca time
// and "Get in touch". It slides away when you scroll down and comes back as soon as you scroll up.

// Home sections → the link they light up while they're in view
const sectionLink: Record<string, string> = {
  home: 'Home',
  about: 'About Me',
  resume: 'Resume',
  projects: 'Projects',
  contact: 'Contact',
};

export default function Navbar() {
  const pathname = usePathname();
  const time = useCasablancaTime();

  // ---- Hide on scroll down, show on scroll up ----
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // Smooth scrolling fires several events at the same spot; only an actual move decides the direction
      if (Math.abs(y - last) < 4) return;
      setHidden(y > last && y > 120);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ---- Active link: on the home page, the section crossing the middle of the screen ----
  const [sectionActive, setSectionActive] = useState('Home');
  useEffect(() => {
    if (pathname !== '/') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting && sectionLink[e.target.id]) setSectionActive(sectionLink[e.target.id]);
      },
      // a thin band across the middle of the screen: whichever section covers it is "the" section
      { rootMargin: '-45% 0px -54% 0px' }
    );
    Object.keys(sectionLink).forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);
  const active = pathname.startsWith('/projects') ? 'Projects' : sectionActive;

  // The pill sits on the hovered (or keyboard-focused) link, otherwise on the active one
  const [hovered, setHovered] = useState<string | null>(null);
  const pillOn = hovered ?? active;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 hidden md:grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 lg:px-8 py-3.5 backdrop-blur-md bg-[color-mix(in_srgb,var(--color-background)_86%,transparent)] transition-transform duration-[450ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
        hidden ? '-translate-y-[110%]' : 'translate-y-0'
      }`}
    >
      {/* Left: monogram + name (the name from lg up) */}
      <Link href="/#home" aria-label="Alaa Essahih, home" className="justify-self-start flex items-center gap-3 text-primary min-w-0">
        <span className="grid place-items-center size-[38px] shrink-0 rounded-full bg-primary text-background font-display text-[13px] tracking-[0.02em]">
          AE
        </span>
        <span className="hidden lg:inline font-display text-sm tracking-[0.03em] whitespace-nowrap">ALAA ESSAHIH</span>
      </Link>

      {/* Centre: the links and the sliding pill */}
      <nav aria-label="Main" className="flex gap-1 p-1 rounded-full" onMouseLeave={() => setHovered(null)}>
        {navLinks.map((link) => {
          const on = pillOn === link.label;
          return (
            <Link
              key={link.label}
              href={link.href}
              aria-current={active === link.label ? 'page' : undefined}
              onMouseEnter={() => setHovered(link.label)}
              onFocus={() => setHovered(link.label)}
              onBlur={() => setHovered(null)}
              className={`relative isolate rounded-full px-3 lg:px-[18px] py-2 font-heading text-lg lg:text-xl leading-none whitespace-nowrap transition-colors duration-[250ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                on ? 'text-background' : 'text-primary'
              }`}
            >
              {on && (
                <motion.span
                  layoutId="navPill"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className="absolute inset-0 -z-10 rounded-full bg-primary"
                />
              )}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Right: availability + Casablanca time (from lg up) and the call to action */}
      <div className="justify-self-end flex items-center gap-[18px] font-body text-[13px] text-neutral">
        <span className="hidden lg:flex items-center gap-2 whitespace-nowrap">
          <span className="relative size-2 rounded-full bg-[#2BB673]">
            <span className="absolute -inset-1 rounded-full border-2 border-[#2BB673] opacity-0 animate-[ping-ring_2s_infinite] motion-reduce:animate-none" />
          </span>
          Open to work
        </span>
        <span className="hidden lg:inline tabular-nums whitespace-nowrap">Casablanca {time}</span>
        <Link
          href="/#contact"
          className="rounded-full bg-primary text-background px-5 py-[11px] tracking-[0.02em] whitespace-nowrap transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-primary"
        >
          Get in touch
        </Link>
      </div>
    </header>
  );
}
