'use client';

import { ArrowUpRight } from 'lucide-react';
import { SiGithub } from 'react-icons/si';
import type { Project } from '@/lib/projectsData';
import { SlideUp, RiseIn } from '@/components/ui/Reveal';
import { ProjectSlotBox } from '@/components/ui/ProjectSlots';

// Reveal timings are itsjay.us's project page: nothing moves for 0.8s, then the panel, the name (1.0s),
// the labels (1.2s), the values, summary, chips and links (1.3s), and the boxes (1.5s)

// Small uppercase label above each info column (YEAR, CORE SKILLS, SUMMARY)
const InfoLabel = ({ children }: { children: React.ReactNode }) => (
  <SlideUp delay={1.2} className="font-body text-xs uppercase tracking-[0.05em] text-background/60">
    {children}
  </SlideUp>
);

// Chip look shared by the skills and the Visit site / View code buttons
const chip = 'inline-flex items-center gap-1.5 bg-primary text-background font-body text-xs uppercase tracking-[0.09em] px-2 pt-2 pb-1.5 rounded-md';
// The same chip as a link (Visit site / View code): it inverts on hover
const linkChip = `${chip} transition-colors hover:bg-background hover:text-primary`;

// /projects/[slug]: burgundy panel with the project name, an info strip, then the screenshots/recordings
export default function ProjectDetail({ project }: { project: Project }) {
  return (
    // 8/16px from the screen edge + 8/16px of panel padding = the inner panel lands on the site's 16/32px edge
    <section className="px-2 lg:px-4 pt-4 md:pt-24 lg:pt-[12vw]">
      <RiseIn
        scale={0.95}
        delay={0.8}
        className="bg-primary rounded-[20px] px-2 lg:px-4 pb-2 lg:pb-4 pt-16 lg:pt-32 flex flex-col gap-10 lg:gap-[6vw]"
      >
        {/* text-balance + break-words: long names wrap onto two lines instead of running off a phone screen.
            A wrapped name slides up as one piece */}
        <h1 className="text-background font-display uppercase text-center leading-none text-[length:clamp(2.5rem,8vw,9rem)] text-balance break-words px-2">
          <SlideUp delay={1}>{project.name}</SlideUp>
        </h1>

        {/* Inner panel: a muted burgundy-grey, like the Figma */}
        <div className="rounded-xl px-4 lg:px-5 pt-6 pb-5 flex flex-col gap-10 lg:gap-16 bg-[color-mix(in_srgb,var(--color-neutral)_35%,var(--color-primary))]">
          {/* Info strip — 12 columns on desktop: year (2), skills (4), gap, summary (5) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
            <div className="flex flex-col gap-3 lg:col-span-2">
              <InfoLabel>Year</InfoLabel>
              <SlideUp delay={1.3} className="font-display text-background leading-none text-4xl lg:text-[length:clamp(2.25rem,3.5vw,4rem)]">
                {project.year}
              </SlideUp>
            </div>

            <div className="flex flex-col gap-3 lg:col-span-4">
              <InfoLabel>Core skills</InfoLabel>
              <ul className="flex flex-wrap gap-1.5">
                {project.roles.map((role, i) => (
                  <RiseIn key={role} as="li" scale={0.9} delay={1.3 + 0.025 * i} className={chip}>
                    {role}
                  </RiseIn>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 md:col-span-2 lg:col-span-5 lg:col-start-8">
              <InfoLabel>Summary</InfoLabel>
              <SlideUp delay={1.3} className="font-body text-background leading-snug text-base lg:text-[length:clamp(1rem,1.3vw,1.5rem)]">
                {project.summary}
              </SlideUp>
              {(project.liveUrl || project.githubUrl) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.liveUrl && (
                    <SlideUp delay={1.3}>
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={linkChip}>
                        Visit site
                        <ArrowUpRight size={14} />
                      </a>
                    </SlideUp>
                  )}
                  {project.githubUrl && (
                    <SlideUp delay={1.3}>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={linkChip}>
                        <SiGithub size={13} />
                        View code
                      </a>
                    </SlideUp>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* The boxes, in the order of project.slots: screenshots and recordings take the whole row,
              the fonts + colours card and the logo card pair up from 1024px (they stack below) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5">
            {project.slots.map((slot, i) => (
              <ProjectSlotBox key={i} slot={slot} name={project.name} brand={project.brand} eager={i === 0} />
            ))}
          </div>
        </div>
      </RiseIn>
    </section>
  );
}
