'use client';

import ParallaxImage from '@/components/ui/ParallaxImage';
import Experience from './Experience';
import Education from './Education';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { LayeredButton } from '@/components/ui/layered-button';
import { motion } from 'framer-motion';
import { resumeUrl } from '@/lib/data';

interface ResumeSectionProps {
  resumeImage?: string;
}

export default function ResumeSection({ resumeImage }: ResumeSectionProps) {
  return (
    <section id="resume" className="relative w-full py-12 px-4 lg:px-8 bg-background">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Timeline list (Experience before Education) */}
        <div className="lg:col-span-7 flex flex-col gap-12">
          <Experience />
          <Education />
        </div>

        {/* Right Column: Photo + Resume CTA */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end gap-8 pt-8">
          <ScrollReveal direction="left" delay={0.2}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              className="relative w-[300px] h-[380px] md:w-[360px] md:h-[440px] bg-primary/20 rounded-lg overflow-hidden border border-primary/20 shadow-lg"
            >
              {/* The photo slides slowly inside the frame as you scroll (components/ui/ParallaxImage.tsx); the
                  frame keeps its own scale-in */}
              {resumeImage ? (
                <ParallaxImage
                  src={resumeImage}
                  alt="Resume Photo"
                  // The frame is 300px wide, 360px from md: the browser picks the file for that width
                  sizes="(min-width: 768px) 360px, 300px"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-primary font-heading">
                  <span className="text-xl font-bold mb-2">resume-photo placeholder</span>
                  <span className="text-xs opacity-75 max-w-[200px]">
                    (Person portrait with pink/burgundy tint)
                  </span>
                </div>
              )}
            </motion.div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.3} className="flex flex-col items-center gap-4 text-center">
            <h3 className="text-primary font-display text-2xl md:text-3xl">
              Want to know more ?
            </h3>
            <a
              href={resumeUrl}
              download
            >
              <LayeredButton
                variant="default"
                className="bg-neutral text-background hover:bg-primary"
              >
                Download My Resume
              </LayeredButton>
            </a>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
