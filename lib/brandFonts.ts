import {
  Google_Sans_Flex,
  Inter,
  IBM_Plex_Sans_Arabic,
  Bricolage_Grotesque,
  IBM_Plex_Sans,
  Red_Rose,
  Space_Grotesk,
  Alexandria,
  Unbounded,
  Style_Script,
} from 'next/font/google';

// The fonts each project's brand card shows (components/ui/ProjectSlots.tsx, BrandType).
// preload: false is what keeps them per page: every project page knows all these @font-face rules, but a browser
// only downloads a font file once text on screen actually uses it, so /projects/hibah only fetches Hibah's fonts.
// Variable fonts cover every weight with one file. The card sets everything at 400, so the one static font with
// several weights (IBM Plex Sans Arabic) only declares 400. The Arabic fonts also get their Latin letters, which
// is what the family name in the card is written in.

const googleSansFlex = Google_Sans_Flex({ subsets: ['latin'], preload: false, display: 'swap' });
const inter = Inter({ subsets: ['latin'], preload: false, display: 'swap' });
const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({ subsets: ['arabic', 'latin'], weight: '400', preload: false, display: 'swap' });
const bricolageGrotesque = Bricolage_Grotesque({ subsets: ['latin'], preload: false, display: 'swap' });
const ibmPlexSans = IBM_Plex_Sans({ subsets: ['latin'], preload: false, display: 'swap' });
const redRose = Red_Rose({ subsets: ['latin'], preload: false, display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], preload: false, display: 'swap' });
const alexandria = Alexandria({ subsets: ['arabic', 'latin'], preload: false, display: 'swap' });
const unbounded = Unbounded({ subsets: ['latin'], preload: false, display: 'swap' });
const styleScript = Style_Script({ subsets: ['latin'], weight: '400', preload: false, display: 'swap' });

// Family name (as written in lib/projectsData.ts) → the CSS font-family to set
export const brandFontFamily: Record<string, string> = {
  'Google Sans Flex': googleSansFlex.style.fontFamily,
  'Inter': inter.style.fontFamily,
  'IBM Plex Sans Arabic': ibmPlexSansArabic.style.fontFamily,
  'Bricolage Grotesque': bricolageGrotesque.style.fontFamily,
  'IBM Plex Sans': ibmPlexSans.style.fontFamily,
  'Red Rose': redRose.style.fontFamily,
  'Space Grotesk': spaceGrotesk.style.fontFamily,
  'Alexandria': alexandria.style.fontFamily,
  'Unbounded': unbounded.style.fontFamily,
  'Style Script': styleScript.style.fontFamily,
  // Already loaded for the whole site (app/layout.tsx): it's the portfolio's own display font
  'Special Gothic Expanded One': 'var(--font-special-gothic)',
  // System font, not loaded: shows as Segoe UI on Windows, the closest system sans elsewhere
  'Segoe UI': '"Segoe UI", system-ui, sans-serif',
};
