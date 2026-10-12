'use client';

import { startTransition, type ComponentProps, type MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLenis } from 'lenis/react';
import { useRegisterFinish } from '@/components/PageTransitionProvider';

// A drop-in for next/link that changes page the way itsjay.us does: the old page shrinks, fades and drifts up
// while the new one slides up from the bottom of the screen and covers it.
// Copied from his site (his JS uses the next-view-transitions library; same mechanism, written out here):
// the browser's View Transitions API takes a picture of the whole screen before and after the change, and the
// two animations below move those pictures (::view-transition-old(root) / -new(root)). The matching CSS, which
// stacks the new page above the old and turns off the browser's default crossfade, is in app/globals.css.
//
// It only does this for a real change of page. A link to a section of the page you're on (/#about while on the
// home page), an external or new-tab link, a modified click (cmd/ctrl/shift/middle), a browser without View
// Transitions, or reduced motion all fall back to the normal link.
// A link to a section of the page you're on, while Lenis (the smooth scroll) is running, is left to Lenis: it
// glides there and stops below the header (its `anchors` option, components/SmoothScroll.tsx).

const EASE = 'cubic-bezier(0.87, 0, 0.13, 1)'; // slow start, fast middle, slow landing; 1s, as on his site

function pageTransition() {
  // The old page: down to 95%, half faded, 100px up
  document.documentElement.animate(
    [
      { opacity: 1, scale: 1, transform: 'translateY(0)' },
      { opacity: 0.5, scale: 0.95, transform: 'translateY(-100px)' },
    ],
    { duration: 1000, easing: EASE, fill: 'forwards', pseudoElement: '::view-transition-old(root)' }
  );
  // The new page: from one screen below up into place
  document.documentElement.animate(
    [{ transform: 'translateY(100%)' }, { transform: 'translateY(0%)' }],
    { duration: 1000, easing: EASE, fill: 'forwards', pseudoElement: '::view-transition-new(root)' }
  );
}

export default function TransitionLink({ href, onClick, ...props }: ComponentProps<typeof Link>) {
  const router = useRouter();
  const registerFinish = useRegisterFinish();
  const lenis = useLenis();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !registerFinish || typeof href !== 'string') return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (props.target && props.target !== '_self') return;

    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname) {
      // Same page, to a section: stop Next from jumping there itself, so Lenis's glide is the only scroll
      if (url.hash && lenis) e.preventDefault();
      return;
    }
    if (!('startViewTransition' in document) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    e.preventDefault();
    const transition = document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          // Safety net: if the page never changes (an error, say), let the browser finish after 3s anyway
          const timer = window.setTimeout(resolve, 3000);
          registerFinish(() => {
            window.clearTimeout(timer);
            resolve();
          });
          startTransition(() => router.push(href));
        })
    );
    // "ready" = both pictures are taken and about to be shown: start moving them
    transition.ready.then(pageTransition).catch(() => {});
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
