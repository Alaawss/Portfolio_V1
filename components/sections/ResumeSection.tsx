'use client';

import Experience from './Experience';
import Education from './Education';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function ResumeSection() {
  return (
    <section id="resume" className="relative w-full py-12 px-8 md:px-16 bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Timeline list (Experience before Education) */}
        <div className="lg:col-span-7 flex flex-col gap-12">
          <Experience />
          <Education />
        </div>

        {/* Right Column: Photo + Resume CTA */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end gap-8 pt-8">
          <ScrollReveal direction="left" delay={0.2}>
            <div className="relative w-[300px] h-[380px] md:w-[360px] md:h-[440px] bg-primary/20 rounded-lg overflow-hidden border border-primary/20 shadow-lg">
              {/* Labeled Placeholder */}
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-primary font-heading">
                <span className="text-xl font-bold mb-2">resume-photo placeholder</span>
                <span className="text-xs opacity-75 max-w-[200px]">
                  (Person portrait with pink/burgundy tint)
                </span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.3} className="flex flex-col items-center gap-4 text-center">
            <h3 className="text-primary font-display text-2xl md:text-3xl">
              Want to know more ?
            </h3>
            <a
              href="/Alaa_ESSAHIH_Resume.pdf"
              download
              className="px-6 py-2.5 bg-neutral text-background font-body text-sm rounded-full shadow hover:bg-primary transition-colors duration-300"
            >
              Download My Resume
            </a>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
