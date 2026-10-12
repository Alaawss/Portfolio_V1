'use client';

import { projectsData } from '@/lib/projectsData';
import ProjectCard from '@/components/ui/ProjectCard';
import { SlideUp, RiseIn } from '@/components/ui/Reveal';

// /projects: every project, with the same cards as the home page.
// Reveal timings are itsjay.us /work's: nothing moves for 0.8s, then panel + label, title, and cards one by one
export default function ProjectsList() {
  return (
    <section id="projects">
      {/* Header — on the same 16/32px edge as the home sections; from md the top padding clears the
          fixed navbar (phones use the bottom dock instead) */}
      <div className="px-4 lg:px-8 pt-12 md:pt-28 lg:pt-[12vw]">
        {/* Interlocked lockup: from sm up, "Selected" sits in the empty space above "rojects", beside the top of
            the tall P. Its wrapper is positioned in the title's em, so the lockup scales with the title.
            On phones it stacks above instead */}
        <h1 className="relative font-display text-primary leading-none text-[length:clamp(3.5rem,13vw,14rem)]">
          {/* left 0.9em: just past the P's bowl. top 0.03em + size 0.26em: the label's baseline lands ~0.055em above
              the lowercase letters, and it ends ~0.12em before the j's dot (measured on the display font) */}
          <span className="block sm:absolute sm:left-[0.9em] sm:top-[0.03em]">
            {/* pr: room for the italic's last letter, which leans past its box and would be clipped */}
            <SlideUp delay={0.8} duration={0.8} className="font-heading italic tracking-wide leading-none text-[0.45em] sm:text-[0.26em] pr-[0.1em]">
              Selected
            </SlideUp>
          </span>
          <SlideUp descender delay={0.9}>Projects</SlideUp>
        </h1>
      </div>

      {/* Tinted panel: 8/16px from the screen edge with 8/16px of padding, so the cards inside land on
          the same 16/32px edge as the title. Same tint as the footer tiles */}
      <div className="px-2 lg:px-4 py-6">
        <RiseIn
          scale={0.95}
          delay={0.8}
          className="rounded-[20px] p-2 lg:p-4 bg-[color-mix(in_srgb,var(--color-neutral)_12%,transparent)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            {projectsData.map((project, i) => (
              // All cards come in on load, one after the other, over 1.5s (lower ones are settled before you scroll there)
              <RiseIn key={project.slug} duration={1.5} delay={1 + 0.075 * i}>
                <ProjectCard project={project} />
              </RiseIn>
            ))}
          </div>
        </RiseIn>
      </div>
    </section>
  );
}
