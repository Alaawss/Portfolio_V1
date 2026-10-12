'use client';

import { useEffect } from 'react';
import type { LenisOptions } from 'lenis';
import { ReactLenis, useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMediaQuery } from '@/lib/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

// Lenis, the site's smooth scroll: the one and only instance, made once in app/layout.tsx so it lives across
// page changes. Any component reaches it with useLenis() from 'lenis/react' (the contact form pauses it, the
// header sets the anchor offset, TransitionLink checks it's there).
//
// Kept outside the render so it's the same object every time: <ReactLenis> rebuilds Lenis whenever its options
// change, and a new object on each render would rebuild it constantly
const LENIS_OPTIONS: LenisOptions = {
  // Each frame the page moves 10% of the remaining way to where the wheel sent it: the soft "glide". Higher is
  // snappier (1 = no smoothing), lower is floatier. Don't add `duration`/`easing`: with those set Lenis switches
  // to a fixed-length glide per wheel tick and ignores lerp (an earlier 1.8s made the page trail the wheel)
  lerp: 0.1,
  // Smooth the mouse wheel and trackpad
  smoothWheel: true,
  // Phones and tablets keep their own native scrolling (with its momentum), Lenis leaves touch alone
  syncTouch: false,
  // One wheel tick scrolls the normal distance (2 would scroll twice as far)
  wheelMultiplier: 1,
  // Clicking a link to a section of this page (/#about while on /) glides there through Lenis. The offset keeps
  // the section from ending up under the fixed header: 0 here, then components/SiteHeader.tsx measures the
  // header and writes the real value (minus its height) into lenis.options.anchors, and keeps it up to date
  anchors: { offset: 0 },
  // A link to another page cancels any glide still running, so it doesn't carry on over the new page
  stopInertiaOnNavigate: true,
  // false: Lenis doesn't run its own frame loop. GSAP's ticker drives it instead (see the effect below), so the
  // scroll position and the GSAP ScrollTrigger animations (About photo parallax, Stack title) update in the
  // same frame
  autoRaf: false,
};

export default function SmoothScroll() {
  // "no-preference" rather than "reduce": the server and the first render (hydration) see false, so someone who
  // asked for reduced motion never gets Lenis, not even for a frame. They keep the browser's own scrolling
  const enabled = useMediaQuery('(prefers-reduced-motion: no-preference)');

  return enabled ? (
    <>
      {/* root: Lenis scrolls the page itself (window), and with no children it wraps nothing, so switching it on
          or off never re-mounts the page */}
      <ReactLenis root options={LENIS_OPTIONS} />
      <GsapSync />
    </>
  ) : null;
}

// Ties Lenis to GSAP: GSAP's ticker (its frame loop) moves Lenis each frame, and every Lenis scroll tells
// ScrollTrigger to recheck its animations
function GsapSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const offScroll = lenis.on('scroll', ScrollTrigger.update);
    // GSAP gives seconds, Lenis wants milliseconds
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // Normally GSAP pretends no time passed after a long frame (a tab switch, a heavy load), which would make
    // the scroll jump; 0 turns that off so the scroll always follows real time
    gsap.ticker.lagSmoothing(0);

    return () => {
      offScroll();
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's default, for when Lenis is switched off
    };
  }, [lenis]);

  return null;
}
