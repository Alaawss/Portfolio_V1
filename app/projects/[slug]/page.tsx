import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageShell from '@/components/PageShell';
import ProjectDetail from '@/components/sections/ProjectDetail';
import { projectsData } from '@/lib/projectsData';

type Props = { params: Promise<{ slug: string }> };

// One page per project, built ahead of time from lib/projectsData.ts
export function generateStaticParams() {
  return projectsData.map((project) => ({ slug: project.slug }));
}

// Any other /projects/<something> is a 404
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projectsData.find((p) => p.slug === slug);
  if (!project) return {};

  return {
    title: `${project.name} | Alaa ESSAHIH`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projectsData.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <PageShell>
      <ProjectDetail project={project} />
    </PageShell>
  );
}
