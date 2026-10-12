'use client';

import ParallaxImage from '@/components/ui/ParallaxImage';
import SectionLabel from '@/components/ui/SectionLabel';
import ScrollReveal from '@/components/ui/ScrollReveal';
import TextHighlighter from '@/components/ui/text-highlighter';
import { ScrollWords, Highlight } from '@/components/ui/ScrollWords';

interface AboutProps {
  image?: string;
}

export default function About({ image }: AboutProps) {
  return (
    <section id="about" className="relative w-full py-12 px-4 lg:px-8 bg-background flex flex-col justify-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Bio & Text */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <SectionLabel label="About Me" />

          <div className="relative">
            <ScrollReveal direction="up" delay={0.1}>
              <h2 className="text-primary font-display text-3xl md:text-5xl lg:text-6xl ">
                Hey There
              </h2>
                <h2 className="text-primary font-display text-5xl md:text-7xl lg:text-8xl ">
                I'm <TextHighlighter type="wavy" highlightColor="currentColor" highlightOpacity={0.85} strokeWidth={3}>
                  <span>ALAA</span>
                </TextHighlighter>,
              </h2>
            </ScrollReveal>
          </div>

          {/* The paragraph lights up word by word as you scroll, then the three key phrases get a lime marker
              stroke (components/ui/ScrollWords.tsx) */}
          <ScrollWords className="text-primary font-body text-[length:clamp(22px,3.1vw,38px)] leading-[1.28] max-w-[26em]">
            Design and code often live with two different people, and the result doesn’t always match the mockup.
            I do both. I’m Alaa, a <Highlight>design engineer</Highlight> who takes products
            from <Highlight>first sketch to a working app</Highlight>: the interface, the frontend and the pieces
            behind it. Open to new opportunities, so <Highlight>let’s build something good</Highlight>.
          </ScrollWords>
        </div>

        {/* Right Column: Photo */}
        {/* Vertically centred on the text column (the grid's items-center); on phones it stacks under the text */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-[300px] h-[380px] md:w-[380px] md:h-[460px] bg-primary/20 rounded-lg overflow-hidden border border-primary/20 shadow-lg">
            {/* The photo, untinted, with no hover effect. The frame scrolls normally; the photo inside it slides
                slowly down as you scroll (inner-image parallax, components/ui/ParallaxImage.tsx) */}
            {image ? (
              <ParallaxImage
                src={image}
                alt="About Alaa ESSAHIH"
                // The frame is 300px wide, 380px from md: the browser picks the file for that width
                sizes="(min-width: 768px) 380px, 300px"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-primary font-heading">
                <span className="text-xl font-bold mb-2">about-photo placeholder</span>
                <span className="text-xs opacity-75 max-w-[200px]">
                  (Person portrait)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}