'use client';

import Image from 'next/image';
import SectionLabel from '@/components/ui/SectionLabel';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function About() {
  const loremText = "HFEHWOFEHEOIFHEWIHFOIHWEOIFHWEOIFHOIEWHF OIWHFOIWHFOIWHOIFHWIFHOIWHFOIWHFOIHWOI FHWOIFHOIEWHFOIWHFOIEWHFOIEWHFOIEWHFOI HEFOIWHCFOIEWHFOIWHFOIWHCFOIWHFOICWHFOI WHFOIWHFOICHWFOICWHFOICWHFOIWHCFOIWWFC WFWEFEWFWFEWE.";

  const lines = loremText.split(' ');
  const paragraphRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of THIS section only, not the whole page
  const { scrollYProgress } = useScroll({
    target: paragraphRef,
    offset: ['start 0.9', 'start 0.3'],
  });

  return (
    <section id="about" className="relative w-full py-12 px-8 md:px-16 bg-background flex flex-col justify-center">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Bio & Text */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <SectionLabel label="About Me" />

          <div className="relative">
            <ScrollReveal direction="up" delay={0.1}>
              <h2 className="text-primary font-display text-3xl md:text-5xl lg:text-6xl ">
                Hey There
              </h2>
                <h2 className="text-primary font-display text-5xl md:text-7xl lg:text-8xl ">
                I'm ALAA,
              </h2>
            </ScrollReveal>
          </div>

          <div
            ref={paragraphRef}
            className="text-neutral font-body text-base md:text-lg leading-relaxed max-w-2xl tracking-widest break-all opacity-85"
          >
            {lines.map((line, index) => {
              // Stagger each line's reveal window across the section's own scroll progress
              const start = index / lines.length;
              const end = Math.min(start + 0.15, 1);
              const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
              const y = useTransform(scrollYProgress, [start, end], [20, 0]);
              return (
                <motion.span
                  key={index}
                  style={{ opacity, y }}
                  className="inline-block mr-2"
                >
                  {line}
                </motion.span>
              );
            })}
          </div>
        </div>

        {/* Right Column: Photo */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <ScrollReveal direction="left" delay={0.3}>
            <div className="relative w-[300px] h-[380px] md:w-[380px] md:h-[460px] bg-primary/20 rounded-lg overflow-hidden border border-primary/20 shadow-lg">
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-primary font-heading">
                <span className="text-xl font-bold mb-2">about-photo placeholder</span>
                <span className="text-xs opacity-75 max-w-[200px]">
                  (Person portrait with burgundy/pink tint)
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}