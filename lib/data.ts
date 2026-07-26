import { NavLink, TimelineItem } from '@/types';

export const navLinks: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'Aout Me', href: '#about' },
  { label: 'Resume', href: '#resume' },
  { label: 'Contact', href: '#contact' },
];

export const socialLinks: NavLink[] = [
  { label: 'Linkedin', href: 'https://linkedin.com', external: true },
  { label: 'Github', href: 'https://github.com', external: true },
];

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
    year: '2025 - 2026',
    title: 'Hassan II High School.',
    subtitle: 'High School Diploma, Physical Sciences',
  },
];
