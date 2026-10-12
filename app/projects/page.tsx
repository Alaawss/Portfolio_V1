import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import ProjectsList from '@/components/sections/ProjectsList';

export const metadata: Metadata = {
  title: 'Projects | Alaa ESSAHIH',
  description: 'Selected projects by Alaa ESSAHIH — Software Developer',
};

export default function ProjectsPage() {
  return (
    <PageShell>
      <ProjectsList />
    </PageShell>
  );
}
