'use client';

import { useEffect, useRef } from 'react';
// TransitionLink: next/link with itsjay.us's page change (components/TransitionLink.tsx)
import Link from '@/components/TransitionLink';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { projectsData } from '@/lib/projectsData';
import ProjectCard from '@/components/ui/ProjectCard';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function Projects() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);

  // Scroll-linked animation using Framer Motion - extended range for 60% slower animation
  const { scrollYProgress } = useScroll({
    target: titleWrapperRef,
    offset: ['start end', 'end center'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [220, 0]);

  useEffect(() => {
    if (!titleRef.current || !titleWrapperRef.current) return;

    // Simple static top-to-bottom color fade on the text itself — no card
    // overlap, no scroll-tied masking. This matches the Figma reference,
    // where the title just sits above the cards with a normal gap.
    titleRef.current.style.maskImage =
      'linear-gradient(to bottom, black 0%, black 15%, transparent 100%)';
    titleRef.current.style.webkitMaskImage =
      'linear-gradient(to bottom, black 0%, black 15%, transparent 78%)';

    // Auto-fit font-size so "Projects" always spans the exact full width
    // of its container without wrapping.
    const fitTitleWidth = () => {
      if (!titleRef.current || !titleWrapperRef.current) return;
      const el = titleRef.current;
      const containerWidth = titleWrapperRef.current.clientWidth;
      el.style.fontSize = '100px';
      const currentTextWidth = el.scrollWidth;
      const newFontSize = (containerWidth / currentTextWidth) * 100;
      el.style.fontSize = `${newFontSize}px`;
    };

    fitTitleWidth();
    window.addEventListener('resize', fitTitleWidth);

    return () => {
      window.removeEventListener('resize', fitTitleWidth);
    };
  }, []);

  return (
    <section id="projects" className="relative w-full py-12 px-4 lg:px-8 bg-background">
      <div className="w-full">
        {/* Section Title with scroll-linked entrance - normal spacing, no card overlap */}
        <div ref={titleWrapperRef} className="text-left overflow-hidden">
          <motion.h2
            ref={titleRef}
            style={{ opacity, scale, y }}
            className="text-primary font-display leading-none whitespace-nowrap inline-block"
          >
            Projects
          </motion.h2>
        </div>

        {/* Projects Grid - tight gap below the title so the fade reads as emerging from behind it */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-[-10px] md:mt-[-30px]">
          {/* The first 2 projects; the rest are on /projects */}
          {projectsData.slice(0, 2).map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        <ScrollReveal direction="up" className="flex justify-center mt-12 md:mt-16">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 text-primary font-heading text-xl md:text-2xl tracking-wide hover:underline decoration-primary underline-offset-4"
          >
            See all
            <ArrowRight size={22} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}