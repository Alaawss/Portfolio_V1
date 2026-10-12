import { NavLink, TimelineItem } from '@/types';

// "/#..." (not just "#...") so the links also work from /projects and the project pages
export const navLinks: NavLink[] = [
  { label: 'Home', href: '/#home' },
  { label: 'About Me', href: '/#about' },
  { label: 'Resume', href: '/#resume' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/#contact' },
];

export const socialLinks: NavLink[] = [
  { label: 'Linkedin', href: 'https://www.linkedin.com/in/alaa-essahih-76a38333a', external: true },
  { label: 'Github', href: 'https://github.com/Alaawss', external: true },
];

// The words sliding under the hero title (the same kind of ticker as on the project cards). Edit freely; avoid "&",
// which the ticker's font (Elms Sans) draws in an unusual shape
export const heroTicker = [
  'UX/UI design',
  'Full-stack development',
  'Brand identity',
  'Motion design',
  'React',
  'Next.js',
  'React Native',
  'Laravel',
  'Supabase',
  'Figma',
];

// Put your resume PDF in /public with this exact name. The Resume button and the footer both use it.
export const resumeUrl = '/Alaa_ESSAHIH_Resume.pdf';

// Your email: the one place it's written. The contact form shows it ("Prefer another way?", the error message,
// copy buttons) and the footer reads it from here
export const contactEmail = 'alaaessahih9@gmail.com';

export const experienceData: TimelineItem[] = [
  {
    year: '2026',
    title: 'Software Development Intern.',
    subtitle: 'BotSysteme, Casablanca (remote)',
    description: undefined,
  },
  {
    year: '2025',
    title: 'Web Development Intern.',
    subtitle: 'MB Way, Casablanca (remote)',
    description: undefined,
  },
];

export const educationData: TimelineItem[] = [
  {
    year: '2025 - 2026',
    title: 'IFIAG / Cnam France',
    subtitle: "Professional Bachelor's, Development & Security",
  },
  {
    year: '2022 - 2025',
    title: 'Faculty Of Letters And Human Sciences Ben M\'sik',
    subtitle: 'English Studies',
  },
  {
    year: '2020 - 2021',
    title: 'Hassan II High School.',
    subtitle: 'High School Diploma, Physical Sciences',
  },
];
