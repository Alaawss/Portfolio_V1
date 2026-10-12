import type { Metadata } from 'next';
import { Special_Gothic_Expanded_One, Cormorant_Unicase, Elms_Sans, Geist } from 'next/font/google';
// Lenis's own small stylesheet (before globals.css, so the site's rules win where they overlap)
import 'lenis/dist/lenis.css';
import './globals.css';
import { cn } from "@/lib/utils";
import Loader from '@/components/Loader';
import SmoothScroll from '@/components/SmoothScroll';
import PageTransitionProvider from '@/components/PageTransitionProvider';

// preload: false: Geist is only the UI kit's fallback (html's font-sans); body sets Elms Sans, so no text on the site
// actually uses it, and preloading it made the browser warn about a download that's never used
const geist = Geist({ subsets: ['latin'], variable: '--font-sans', preload: false });

const specialGothic = Special_Gothic_Expanded_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-special-gothic',
  display: 'swap',
});

const cormorant = Cormorant_Unicase({
  // No 300: nothing on the site sets Cormorant in light, and each weight is its own preloaded file
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
});

const elms = Elms_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-elms',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Alaa ESSAHIH | Developer Portfolio',
  description: 'Personal developer portfolio of Alaa ESSAHIH — Software Developer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // No scroll-behavior: smooth (and so no data-scroll-behavior here): Lenis does the smoothing, see
    // components/SmoothScroll.tsx
    <html
      lang="en"
      className={cn("antialiased", specialGothic.variable, cormorant.variable, elms.variable, "font-sans", geist.variable)}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. WOT adds wotdisconnected="true") write attributes
          onto <body> before React starts, which React reports as a mismatch. This ignores the body tag's own
          attributes only; everything inside it is still checked */}
      <body className="min-h-screen" suppressHydrationWarning>
        {/* The opening counter (itsjay.us-style). Here in the layout it plays on every full load, never on
            in-site navigation */}
        <Loader />
        {/* Smooth scrolling for the whole site (off with reduced motion) */}
        <SmoothScroll />
        {/* Lets TransitionLink know when a new page is on screen, for the itsjay.us-style page change */}
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </body>
    </html>
  );
}
