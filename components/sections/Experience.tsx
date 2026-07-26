'use client';

import SectionLabel from '@/components/ui/SectionLabel';
import TimelineEntry from '@/components/ui/TimelineEntry';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { experienceData } from '@/lib/data';

export default function Experience() {
  return (
    <div className="flex flex-col gap-6">
      <SectionLabel label="My Resume" />
      
      <ScrollReveal direction="up" delay={0.1}>
        <h2 className="text-primary font-display text-4xl md:text-5xl uppercase tracking-tight">
          Experience
        </h2>
      </ScrollReveal>

      <div className="relative pl-2 border-l border-primary/20 flex flex-col gap-2 mt-2">
        {experienceData.map((item, i) => (
  <TimelineEntry key={i} {...item} index={i} isLast={i === experienceData.length - 1} />
))}
      </div>
    </div>
  );
}
