// The order here is the order the projects are shown in. The first 2 also appear on the home page.
// Each project gets its own page at /projects/<slug>. All its files live in public/projects/<slug>/.

// ---- Project page boxes ---------------------------------------------------------------------------
// Every project page shows 5 boxes in this order: 01 image · 02 video · 03 brandType · 04 brandLogo · 05 image/video.
// Images and videos fill a full-width 16:10 box: export stills at 1920×1200, videos at 1600×1000.
// The two brand cards are half-width 1.1:1 boxes from 1024px up, and stack full width below
// (1100×1000 if you ever swap one for a still).
export type ProjectSlot =
  | { type: 'image'; src: string; alt: string; todo?: string }
  | { type: 'video'; src: string; webm: string; poster: string; alt: string; todo?: string } // src = the mp4
  | { type: 'brandType' }  // fonts + colour palette, from `brand`
  | { type: 'brandLogo' }; // the logo on its colour, from `brand`

// ---- Brand (read from each project's own code; anything not found is a TODO, never invented) ----------
export interface BrandFont {
  family: string;  // must be loaded in lib/brandFonts.ts (or be a system font, see `note`)
  role: 'Headings' | 'Body' | 'Arabic' | 'Logo' | 'Accent';
  weights?: string; // the weights the project uses (leave out if unknown)
  sample: string;  // real copy from the project where possible
  note?: string;   // e.g. "system font" for one that isn't loaded
}

export interface ProjectBrand {
  fonts: BrandFont[];
  colors: { name: string; hex: string }[];     // 4–6 swatches
  surface: { bg: string; fg: string };         // the fonts + colours card's own colours
  poster: string;                              // the type poster's colour (one of `colors`); its text is a light tint of it
  logo: {
    light?: { src: string; bg: string };       // the version made for light backgrounds, and that background
    dark?: { src: string; bg: string };        // the version made for dark backgrounds (shown first)
  };
}

// What the project card shows in its 4:3 media area: a wallpaper behind, and a 16:9 video window that
// unfolds in on hover (components/ui/ProjectCard.tsx)
export interface ProjectCardMedia {
  wallpaper: string; // 1600×1200 (4:3) JPG. next/image serves it as WebP/AVIF to browsers that support them
  video: {
    webm: string;    // 16:9 loop, tried first
    mp4: string;     // fallback for browsers without WebM (Safari)
    poster: string;  // first frame, shown until the video plays (and instead of it with reduced motion)
  };
}

export interface Project {
  slug: string;       // the URL: /projects/<slug> (lowercase, dashes, no spaces)
  name: string;
  type: string;
  year: string;       // '' hides it on the card
  roles: string[];    // what I did, then the stack: the card's ticker and the CORE SKILLS chips ([] hides the ticker)
  summary: string;
  liveUrl?: string;   // leave out if there's no live preview
  githubUrl?: string; // leave out if the code isn't public
  card?: ProjectCardMedia; // leave out to show the old "XX" placeholder in the card
  brand: ProjectBrand;
  slots: ProjectSlot[];
}

const cardMedia = (slug: string): ProjectCardMedia => ({
  wallpaper: `/projects/${slug}/card-bg.jpg`,
  video: {
    webm: `/projects/${slug}/card.webm`,
    mp4: `/projects/${slug}/card.mp4`,
    poster: `/projects/${slug}/card-poster.jpg`,
  },
});

// A page video saved as page-NN.mp4 / .webm / -poster.jpg
const pageVideo = (slug: string, n: string, alt: string): ProjectSlot => ({
  type: 'video',
  src: `/projects/${slug}/page-${n}.mp4`,
  webm: `/projects/${slug}/page-${n}.webm`,
  poster: `/projects/${slug}/page-${n}-poster.jpg`,
  alt,
});

// Until a project has its own 1600×1000 page video, box 02 reuses its 16:9 card video (cropped slightly to 16:10)
const cardVideoSlot = (slug: string, alt: string): ProjectSlot => ({
  type: 'video',
  src: `/projects/${slug}/card.mp4`,
  webm: `/projects/${slug}/card.webm`,
  poster: `/projects/${slug}/card-poster.jpg`,
  alt,
  todo: 'temporary: the card video. Replace with a 1600×1000 page video',
});

export const projectsData: Project[] = [
  {
    slug: 'hibah',
    name: 'Hibah',
    type: 'Web app',
    year: '2026',
    roles: [
      'UX', 'UI', 'Web Design', 'Product Design', 'Brand Design', 'Motion Design',
      'React', 'Tailwind CSS', 'GSAP', 'Motion', 'Laravel', 'MySQL',
    ],
    summary:
      'Hibah is a crowdfunding platform for Morocco built around one promise: every dirham accounted for. Organisers start a fundraiser in five guided steps, an admin reviews it before it goes live, donors give in a few taps, and organisers post updates and follow their donations from their own dashboard. I designed and built it end to end: a React front end animated with GSAP and Motion (including a 46-second film that runs live in the page), full English, French and Arabic support with right-to-left layout, and a Laravel API behind dashboards for donors, organisers and admins.',
    // TODO: GitHub link (marked public; the local repo has no GitHub remote yet)
    card: cardMedia('hibah'),
    brand: {
      fonts: [
        { family: 'Google Sans Flex', role: 'Headings', weights: '400–700', sample: 'Give Hope. Make a Difference.' },
        { family: 'Inter', role: 'Body', weights: '400–700', sample: 'Discover causes that matter and support meaningful campaigns.' },
        { family: 'IBM Plex Sans Arabic', role: 'Arabic', weights: '400–700', sample: 'كل درهم محسوب' },
      ],
      colors: [
        { name: 'Ink 900', hex: '#28233D' },
        { name: 'Coral 500', hex: '#F78E88' },
        { name: 'Coral 700', hex: '#C24A42' },
        { name: 'Canvas', hex: '#FDEEEA' },
        { name: 'Surface', hex: '#FFFAF8' },
      ],
      surface: { bg: '#FFFAF8', fg: '#28233D' },
      poster: '#C24A42', // Coral 700: light text can't be read on the lighter Coral 500
      logo: {
        light: { src: '/projects/hibah/logo-light.svg', bg: '#FDEEEA' },
        dark: { src: '/projects/hibah/logo-dark.svg', bg: '#28233D' },
      },
    },
    slots: [
      { type: 'image', src: '/projects/hibah/page-01.webp', alt: 'Hibah homepage: "Give Hope. Make a Difference." above the photo strip' },
      pageVideo('hibah', '02', 'Donating to a Hibah campaign, from the campaign page to the confirmation'),
      { type: 'brandType' },
      { type: 'brandLogo' },
      pageVideo('hibah', '05', 'Switching Hibah from English to Arabic: the whole page mirrors right to left'),
    ],
  },
  {
    slug: 'edulink',
    name: 'EduLink',
    type: 'Mobile app',
    year: '2026',
    roles: [
      'UX research', 'UX', 'UI', 'Product Design', 'Brand Design', 'Media Production',
      'React Native', 'Expo', 'Supabase', 'Paddle',
    ],
    summary:
      'EduLink is a tutoring app for Morocco, made for a client, that connects students and parents with qualified teachers to find, compare and book lessons online or in person. I led the design: the UX research, the interface and the full brand identity (logo, colours, typography and media). I built the app with React Native, Expo and Supabase, including teacher subscription plans paid through Paddle, push notifications, and French, Arabic (right to left) and English.',
    card: cardMedia('edulink'),
    brand: {
      fonts: [
        { family: 'Bricolage Grotesque', role: 'Headings', weights: '600, 800', sample: 'Find the right teacher, close to home.' },
        { family: 'IBM Plex Sans', role: 'Body', weights: '400–600', sample: 'Verified teachers across Morocco, online or at your home.' },
        { family: 'IBM Plex Sans Arabic', role: 'Arabic', weights: '400–700', sample: 'تعلّم مع أفضل الأساتذة' },
      ],
      colors: [
        { name: 'Purple', hex: '#7F3AED' },
        { name: 'Lime', hex: '#C6FF34' },
        { name: 'Ink', hex: '#313132' },
        { name: 'Canvas', hex: '#F1EFF5' },
        { name: 'Night', hex: '#1B1526' },
      ],
      surface: { bg: '#F1EFF5', fg: '#313132' },
      poster: '#7F3AED',
      logo: {
        light: { src: '/projects/edulink/logo-light.svg', bg: '#F1EFF5' },
        dark: { src: '/projects/edulink/logo-dark.svg', bg: '#1B1526' },
      },
    },
    slots: [
      { type: 'image', src: '/projects/edulink/page-01.webp', alt: 'Three EduLink screens: welcome, finding a teacher, and choosing a time' },
      pageVideo('edulink', '02', 'Booking a lesson in EduLink, from the student side and the teacher side'),
      { type: 'brandType' },
      { type: 'brandLogo' },
      pageVideo('edulink', '05', 'A teacher\'s subscription payment and their stats in EduLink'),
    ],
  },
  {
    slug: 'lancr',
    name: 'Lancr',
    type: 'Web app',
    year: '2026',
    roles: [
      'UX', 'Art Direction',
      'Next.js', 'React', 'Tailwind CSS', 'Supabase', 'Paddle', 'PostHog', 'Vercel',
    ],
    summary:
      'Lancr is a referral waitlist tool for founders getting ready to launch. They create a waitlist, share its public page, and every person who signs up gets a referral link to spread it further. I built it on my own with Next.js and Supabase: the dashboard that tracks views, signups and conversion for each waitlist, subscriptions through Paddle, and product analytics with PostHog.',
    liveUrl: 'https://lancr-seven.vercel.app/',
    // The repo's name ends in a dot ("Lancr."). Renaming it to "Lancr" on GitHub keeps this link working (it redirects)
    githubUrl: 'https://github.com/Alaawss/Lancr.',
    card: cardMedia('lancr'),
    brand: {
      fonts: [
        { family: 'Special Gothic Expanded One', role: 'Headings', weights: '400', sample: 'Build hype before you launch.' },
        { family: 'Red Rose', role: 'Logo', weights: '400–700', sample: 'Lancr' },
        // TODO: body font. Lancr's CSS names "NOHEMI", but it's never loaded, so visitors see a system font
      ],
      colors: [
        { name: 'Brand red', hex: '#FF2A54' },
        { name: 'Red dark', hex: '#CC2244' },
        { name: 'Red light', hex: '#FF6B8E' },
        { name: 'Dark navy', hex: '#0F172A' },
        { name: 'Light gray', hex: '#E2E8F0' },
        { name: 'White', hex: '#FFFFFF' },
      ],
      surface: { bg: '#E2E8F0', fg: '#0F172A' },
      poster: '#CC2244', // Red dark: light text is hard to read on the brighter Brand red
      logo: { dark: { src: '/projects/lancr/logo.png', bg: '#0F172A' } },
    },
    slots: [
      { type: 'image', src: '/projects/lancr/page-01.png', alt: 'Lancr landing page: "Build hype before you launch."', todo: 'temporary 16:9 still: replace with a 1920×1200 export' },
      cardVideoSlot('lancr', 'Lancr: landing page and dashboard tour'),
      { type: 'brandType' },
      { type: 'brandLogo' },
      { type: 'image', src: '/projects/lancr/page-05.webp', alt: 'Lancr subscription page: the Free plan and the $19 Pro plan, billed through Paddle', todo: 'from the 1080p dashboard recording (1280×800): a 1920×1200 export would be sharper on retina screens' },
    ],
  },
  {
    slug: 'iride',
    name: 'iRide',
    type: 'Web app',
    year: '2026',
    roles: ['UX', 'UI', 'Web Design', 'React', 'Tailwind CSS'],
    summary:
      'iRide is a peer-to-peer car rental platform for Morocco, built by a team of four. I built the homepage and the Cars page: location search powered by OpenStreetMap, filters for price, type and availability, and the mobile and tablet layouts, using React, TypeScript and Tailwind CSS.',
    // TODO: GitHub link (the team repo is on a teammate's account: github.com/LatestPhysx/iRentFrontend)
    card: cardMedia('iride'),
    brand: {
      fonts: [
        { family: 'Space Grotesk', role: 'Headings', weights: '300–700', sample: 'Rent a Car in Minutes.' },
        { family: 'Inter', role: 'Body', weights: '400–700', sample: 'Pick a location, choose your dates, and hit the road.' },
        { family: 'Alexandria', role: 'Arabic', weights: '100–900', sample: 'بلا صداع' },
      ],
      colors: [
        { name: 'Primary purple', hex: '#673AB6' },
        { name: 'Olive accent', hex: '#98A869' },
        { name: 'Background light', hex: '#F7F6F8' },
        { name: 'Footer light', hex: '#F1F1F4' },
        { name: 'Background dark', hex: '#18141E' },
      ],
      surface: { bg: '#F7F6F8', fg: '#18141E' },
      poster: '#673AB6',
      logo: {
        light: { src: '/projects/iride/logo-light.png', bg: '#F7F6F8' },
        dark: { src: '/projects/iride/logo-dark.png', bg: '#18141E' },
      },
    },
    slots: [
      { type: 'image', src: '/projects/iride/page-01.png', alt: 'iRide homepage: "Rent a Car in Minutes." with the location and date search', todo: 'temporary 16:9 still: replace with a 1920×1200 export' },
      cardVideoSlot('iride', 'iRide: searching and browsing cars'),
      { type: 'brandType' },
      { type: 'brandLogo' },
      { type: 'image', src: '/projects/iride/page-05.png', alt: 'iRide car page: a Tesla Model 3 with its price breakdown and Book Now button', todo: 'temporary still (1500×844): replace with a 1920×1200 export' },
    ],
  },
  {
    slug: 'artifecta',
    name: 'Artifecta',
    type: 'Website',
    year: '2026',
    roles: [
      'UX research', 'UX', 'UI', 'Web Design', 'Product Design', 'Brand Design', 'Naming & Copywriting',
      'React', 'Tailwind CSS', 'Framer Motion', 'Node.js', 'Resend', 'Figma',
    ],
    summary:
      'Artifecta is the website for a studio working across AI, design and engineering. I shaped its visual identity and designed and built the site: a React front end animated with Framer Motion, with a contact form that emails every message through Resend.',
    card: cardMedia('artifecta'),
    brand: {
      fonts: [
        { family: 'Unbounded', role: 'Headings', weights: '400–800', sample: 'The perfect fusion of AI, Design, and Engineering' },
        { family: 'Style Script', role: 'Accent', weights: '400', sample: 'Artifecta' },
        { family: 'Segoe UI', role: 'Body', sample: 'We craft scalable digital experiences powered by design, technology, and AI.', note: 'system font' },
      ],
      colors: [
        { name: 'Navy', hex: '#142638' },
        { name: 'Slate', hex: '#4E6C80' },
        { name: 'Mist', hex: '#A9C2D8' },
        { name: 'Pale', hex: '#D7E3EE' },
        { name: 'White', hex: '#FFFFFF' },
      ],
      surface: { bg: '#D7E3EE', fg: '#142638' },
      poster: '#142638',
      logo: { light: { src: '/projects/artifecta/logo.png', bg: '#D7E3EE' } },
    },
    slots: [
      { type: 'image', src: '/projects/artifecta/page-01.png', alt: 'Artifecta homepage: "The perfect fusion of AI, Design, and Engineering"', todo: 'temporary 16:9 still: replace with a 1920×1200 export' },
      cardVideoSlot('artifecta', 'Artifecta: the homepage, services and contact pages'),
      { type: 'brandType' },
      { type: 'brandLogo' },
      { type: 'image', src: '/projects/artifecta/page-05.webp', alt: 'Artifecta services along a winding path: UI/UX design, web design, web development, AI integration and digital product development', todo: 'from the 1080p services recording (1728×1080): a 1920×1200 export would be sharper on retina screens' },
    ],
  },
];
