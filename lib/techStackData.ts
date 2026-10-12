// The home page's stack grid (components/sections/TechStack.tsx), laid out like itsjay.us's: three big tiles on
// the first row, seven on the second. The names key both the logos (components/ui/StackLogos.tsx) and the
// official links (lib/stackLinks.ts). logoClass is each logo's size, set by eye so they all weigh the same
// (wordmarks wide, marks smaller); written out in full for Tailwind
export interface TechItem {
  name: string;
  row: 1 | 2;
  logoClass: string;
}

export const techStackItems: TechItem[] = [
  { name: 'React', row: 1, logoClass: 'w-14 md:w-16 lg:w-[86px]' },
  { name: 'Next.js', row: 1, logoClass: 'w-24 md:w-28 lg:w-[150px]' },
  { name: 'Laravel', row: 1, logoClass: 'w-12 md:w-14 lg:w-[72px]' },
  { name: 'GSAP', row: 2, logoClass: 'w-[72px] md:w-20 lg:w-[88px]' },
  { name: 'Motion', row: 2, logoClass: 'w-16 md:w-[72px] lg:w-20' },
  { name: 'Tailwind CSS', row: 2, logoClass: 'w-12 md:w-14 lg:w-16' },
  { name: 'Supabase', row: 2, logoClass: 'w-9 md:w-10 lg:w-12' },
  { name: 'Vercel', row: 2, logoClass: 'w-20 md:w-24 lg:w-[100px]' },
  { name: 'Figma', row: 2, logoClass: 'w-9 md:w-10 lg:w-12' },
  { name: 'Azure', row: 2, logoClass: 'w-10 md:w-11 lg:w-[52px]' },
];
