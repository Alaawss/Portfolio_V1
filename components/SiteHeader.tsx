'use client';

import { useEffect, useRef, useState } from 'react';
// TransitionLink: next/link with itsjay.us's page change (components/TransitionLink.tsx)
import Link from '@/components/TransitionLink';
import { usePathname } from 'next/navigation';
import { useLenis } from 'lenis/react';
import { AnimatePresence, motion } from 'framer-motion';
import { navLinks, socialLinks } from '@/lib/data';
import { useCasablancaTime } from '@/lib/casablancaClock';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { revealEase } from '@/components/ui/Reveal';
import LogoMark from '@/components/ui/LogoMark';
import { useContact } from '@/components/contact/ContactProvider';

// The site header, "info row + menu" version (inspired by itsjay.us's top row), on every page and screen size.
// The bar: logo mark + name | where I'm based | availability + Casablanca time | Get in touch + the menu stripes.
// Menu opens a full-screen maroon panel with the page links (big, numbered) and the socials. The bar stays on
// top of the panel, in cream, and its stripes become a cross. The bar slides away when you scroll down and
// comes back as soon as you scroll up.
// (The earlier top bar with the sliding pill is still in components/Navbar.tsx, and the phone dock in
// components/BottomDock.tsx: PageShell picks which one is used.)

// Home sections → the link they mark as current while they're in view
const sectionLink: Record<string, string> = {
  home: 'Home',
  about: 'About Me',
  resume: 'Resume',
  projects: 'Projects',
  contact: 'Contact',
};

export default function SiteHeader() {
  const pathname = usePathname();
  const time = useCasablancaTime();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const pill = useRef<HTMLButtonElement>(null);
  // The contact form (components/contact/): the pill and the menu's Contact item open it as a sheet
  const contact = useContact();
  const pillGrown = contact.session?.origin === 'header';

  // ---- Hide on scroll down, show on scroll up; a cream background once the page has moved ----
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      // Smooth scrolling fires several events at the same spot; only an actual move decides the direction
      if (Math.abs(y - last) < 4) return;
      setHidden(y > last && y > 120);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ---- Measure the header, so section links stop just below it ----
  // Its height changes with the screen size (and the font size), so it's measured live rather than written down.
  // It goes to two places: lenis.options.anchors, the offset Lenis applies when a /#section link glides to its
  // section (components/SmoothScroll.tsx), and the --header-h CSS variable, which globals.css uses for the
  // browser's own jumps when Lenis is off (reduced motion). offsetHeight ignores the slide-away transform
  const lenis = useLenis();
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const measure = () => {
      const height = header.offsetHeight;
      document.documentElement.style.setProperty('--header-h', `${height}px`);
      if (lenis) lenis.options.anchors = { offset: -height };
    };
    const ro = new ResizeObserver(measure);
    ro.observe(header);
    return () => ro.disconnect();
  }, [lenis]);

  // ---- Current page: on the home page, the section crossing the middle of the screen ----
  const [sectionActive, setSectionActive] = useState('Home');
  useEffect(() => {
    if (pathname !== '/') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting && sectionLink[e.target.id]) setSectionActive(sectionLink[e.target.id]);
      },
      { rootMargin: '-45% 0px -54% 0px' }
    );
    Object.keys(sectionLink).forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);
  const active = pathname.startsWith('/projects') ? 'Projects' : sectionActive;

  // ---- While the menu is open: the page can't scroll, Esc closes it, focus goes to the first link and comes
  // back to the Menu button afterwards ----
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const focusTimer = window.setTimeout(() => firstLink.current?.focus(), reducedMotion ? 0 : 400);
    const button = menuButton.current;
    return () => {
      html.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
      button?.focus();
    };
  }, [open, reducedMotion]);

  const close = () => setOpen(false);
  // The menu's big page links (and its Contact button, which looks the same)
  const menuLinkClass =
    'flex items-start gap-3 lg:gap-5 py-2 lg:py-3 font-display uppercase leading-[0.95] text-[length:clamp(40px,7.5vw,120px)] transition-[opacity,translate] duration-300 group-hover/menu:opacity-40 hover:opacity-100! hover:translate-x-3 focus-visible:opacity-100! focus-visible:outline-none';
  // The second line of each pair is in Elms Sans (font-body), the bar's font before the switch to Cormorant
  // Unicase: Unicase draws lowercase as a mix of small and big capitals ("DesIGn enGIneeR"), which reads badly
  // in a sentence-case line
  const muted = `font-body font-medium text-[length:clamp(14px,1.05vw,17px)] ${open ? 'text-background/60' : 'text-neutral'}`;
  const dot = (
    <span className="relative size-2 shrink-0 rounded-full bg-[#2BB673]">
      <span className="absolute -inset-1 rounded-full border-2 border-[#2BB673] opacity-0 animate-[ping-ring_2s_infinite] motion-reduce:animate-none" />
    </span>
  );

  return (
    <>
      <header
        ref={headerRef}
        id="site-header"
        // data-lenis-prevent: while the menu is open, the smooth scroll ignores the wheel here too
        data-lenis-prevent={open ? '' : undefined}
        className={`fixed inset-x-0 top-0 z-[60] transition-[translate,background-color,color] duration-[450ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
          hidden && !open ? '-translate-y-[110%]' : 'translate-y-0'
        } ${open ? 'text-background' : 'text-primary'} ${
          scrolled && !open ? 'bg-[color-mix(in_srgb,var(--color-background)_86%,transparent)] backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        {/* The bar's first lines are in Cormorant Unicase (font-heading), the serif of the section labels ("About Me",
            "My Resume") and of the earlier navbar; the second lines and the Get in touch pill are in
            Elms Sans (see muted) */}
        <div className="grid grid-cols-12 items-center gap-4 px-4 lg:px-8 py-3.5 lg:py-4 font-heading font-semibold tracking-wide leading-tight text-[length:clamp(15px,1.2vw,19px)]">
          {/* Logo mark + name. The mark takes the text colour, so it turns cream with the menu open */}
          <Link href="/#home" onClick={close} aria-label="Alaa Essahih, home" className="col-span-6 md:col-span-4 lg:col-span-3 flex items-center gap-3 min-w-0">
            <LogoMark className="h-10 w-auto shrink-0" />
            <span className="hidden sm:flex flex-col">
              <span>Alaa Essahih</span>
              <span className={`transition-colors duration-[450ms] ${muted}`}>Design engineer</span>
            </span>
          </Link>

          {/* Where I'm based (from lg up) */}
          <div className="hidden lg:flex flex-col col-span-3">
            <span>Based in Morocco</span>
            <span className={`transition-colors duration-[450ms] ${muted}`}>Working globally</span>
          </div>

          {/* Availability + the Casablanca time (from lg up) */}
          <div className="hidden lg:flex flex-col col-span-3">
            <span className="flex items-center gap-2">{dot}Open to work</span>
            <span className={`tabular-nums transition-colors duration-[450ms] ${muted}`}>Casablanca {time}</span>
          </div>

          {/* Get in touch + Menu */}
          <div className="col-span-6 md:col-span-8 lg:col-span-3 justify-self-end flex items-center gap-5 lg:gap-7">
            {/* One plain pill in Elms Sans, maroon on cream (reversed with the menu open). On hover the words roll up
                and an identical copy rises from below to take their place: the hover of the site's first navbar
                (its HoverReveal, 0.25s ease-in-out), here on the whole pill rather than only over the text.
                A click opens the contact sheet, which grows out of the pill: meanwhile the pill itself is hidden
                (invisible keeps its place), so it looks like the pill is what grows */}
            <button
              ref={pill}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={pillGrown}
              onClick={() => {
                close();
                contact.open('header', pill);
              }}
              className={`group/cta hidden sm:inline-flex ${pillGrown ? 'invisible' : ''} items-center h-11 px-5 rounded-full whitespace-nowrap font-body font-medium tracking-[0.02em] text-[length:clamp(13px,0.95vw,15px)] transition-colors duration-[450ms] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-current ${
                open ? 'bg-background text-primary' : 'bg-primary text-background'
              }`}
            >
              {/* A one-line window; the stack inside it (the words, then their copy) moves up one line on hover */}
              <span className="relative block overflow-hidden leading-[1.3]">
                <span className="relative block transition-transform duration-[250ms] ease-in-out group-hover/cta:-translate-y-full motion-reduce:transition-none">
                  Get in touch
                  <span aria-hidden className="absolute inset-x-0 top-full block">
                    Get in touch
                  </span>
                </span>
              </span>
            </button>

            {/* Menu: just three stripes (short, long, short, staggered). Hovering evens them out; open, the outer
                two cross into an X and the middle one shrinks away. 44px hit area */}
            <button
              ref={menuButton}
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
              className="group/menu-btn -mr-2 grid place-items-center size-11 rounded-full focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-current"
            >
              <span aria-hidden className="relative block w-7 h-[17px]">
                <span
                  className={`absolute right-0 top-0 h-[3px] rounded-full bg-current transition-[width,top,rotate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    open ? 'w-7 top-[7px] rotate-45' : 'w-[60%] group-hover/menu-btn:w-7'
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-[3px] w-7 rounded-full bg-current transition-[scale,opacity] duration-300 ${
                    open ? 'scale-x-0 opacity-0' : ''
                  }`}
                />
                <span
                  className={`absolute left-0 top-[14px] h-[3px] rounded-full bg-current transition-[width,top,rotate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    open ? 'w-7 top-[7px] -rotate-45' : 'w-[60%] group-hover/menu-btn:w-7'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ---- The menu panel ---- */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-lenis-prevent
            // Wipes down from the top like a blind, and back up on close
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.1, ease: [0.87, 0, 0.13, 1] } }}
            transition={{ duration: reducedMotion ? 0 : 0.75, ease: [0.87, 0, 0.13, 1] }}
            className="fixed inset-0 z-[55] bg-primary text-background flex flex-col justify-between overflow-y-auto px-4 lg:px-8 pt-28 lg:pt-36 pb-6 lg:pb-8"
          >
            {/* The page links: each one rises out of its row, one after another. Hovering one dims the others */}
            <nav aria-label="Pages">
              <ul className="group/menu flex flex-col">
                {navLinks.map((link, i) => (
                  <li key={link.label} className="overflow-hidden border-t border-background/15 last:border-b">
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: '0%' }}
                      // Leaving is quicker and all at once, so closing doesn't drag
                      exit={{ y: '100%', transition: { duration: reducedMotion ? 0 : 0.3, ease: [0.7, 0, 0.84, 0] } }}
                      transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.25 + 0.06 * i, ease: revealEase }}
                    >
                      {link.label === 'Contact' ? (
                        // Contact doesn't go to the footer: it closes the menu and opens the contact sheet, which
                        // grows out of the menu button
                        <button
                          type="button"
                          aria-haspopup="dialog"
                          onClick={() => {
                            close();
                            contact.open('menu', menuButton);
                          }}
                          className={`w-full text-left ${menuLinkClass}`}
                        >
                          <span className="font-body text-xs lg:text-sm tracking-[0.1em] opacity-60 pt-[0.5em]">0{i + 1}</span>
                          {link.label}
                        </button>
                      ) : (
                        <Link
                          ref={i === 0 ? firstLink : undefined}
                          href={link.href}
                          onClick={close}
                          aria-current={active === link.label ? 'page' : undefined}
                          className={menuLinkClass}
                        >
                          <span className="font-body text-xs lg:text-sm tracking-[0.1em] opacity-60 pt-[0.5em]">0{i + 1}</span>
                          {link.label}
                          {active === link.label && <span aria-hidden className="mt-[0.35em] size-[0.12em] min-w-2 min-h-2 rounded-full bg-background" />}
                        </Link>
                      )}
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Socials and availability */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.2 } }}
              transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.55 }}
              className="flex flex-wrap items-end justify-between gap-6 pt-10 font-body text-sm"
            >
              <div className="flex gap-6">
                {socialLinks.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                    {s.label} ↗
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-2 text-background/70">
                {dot}
                <span>Open to work · Casablanca {time}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
