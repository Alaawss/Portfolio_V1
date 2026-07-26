export interface TechItem {
  name: string;
  iconKey: string;
  row: 1 | 2;
}

export const techStackItems: TechItem[] = [
  { name: 'React', iconKey: 'SiReact', row: 1 },
  { name: 'Next.js', iconKey: 'SiNextdotjs', row: 1 },
  { name: 'Laravel', iconKey: 'SiLaravel', row: 1 },
  { name: 'Vercel', iconKey: 'SiVercel', row: 2 },
  { name: 'Figma', iconKey: 'SiFigma', row: 2 },
  { name: 'Supabase', iconKey: 'SiSupabase', row: 2 },
  { name: 'Tailwind CSS', iconKey: 'SiTailwindcss', row: 2 },
  { name: 'Framer Motion', iconKey: '', row: 2 },
  { name: 'Azure', iconKey: 'VscAzure', row: 2 },
];
