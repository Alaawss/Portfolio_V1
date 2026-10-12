'use client';

import SectionLabel from '@/components/ui/SectionLabel';
import TimelineEntry from '@/components/ui/TimelineEntry';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { educationData } from '@/lib/data';

export default function Education() {
  return (
    <div className="flex flex-col gap-6">
      <SectionLabel label="My Resume" />
      
      <ScrollReveal direction="up" delay={0.1}>
        <h2 className="text-primary font-display text-4xl md:text-5xl uppercase tracking-tight">
          Education
        </h2>
      </ScrollReveal>

      <div className="relative flex flex-col gap-2 mt-2">
        {educationData.map((item, i) => (
        <TimelineEntry key={i} {...item} index={i} isLast={i === educationData.length - 1} />
      ))}
      </div>
    </div>
  );
}
