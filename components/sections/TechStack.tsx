'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { techStackItems } from '@/lib/techStackData';
import {
  SiReact,
  SiNextdotjs,
  SiLaravel,
  SiVercel,
  SiFigma,
  SiSupabase,
  SiTailwindcss,
  SiFramer
} from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';

gsap.registerPlugin(ScrambleTextPlugin);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  SiReact,
  SiNextdotjs,
  SiLaravel,
  SiVercel,
  SiFigma,
  SiSupabase,
  SiTailwindcss,
  VscAzure,
};

export default function TechStack() {
  const [activeItem, setActiveItem] = useState<string>('React');
  const headerRef = useRef<HTMLHeadingElement>(null);

  const topRowItems = techStackItems.filter((item) => item.row === 1);
  const bottomRowItems = techStackItems.filter((item) => item.row === 2);

  useEffect(() => {
    if (headerRef.current) {
      gsap.to(headerRef.current, {
        duration: 2,
        scrambleText: {
          text: 'MODERN\nTECH STACK',
          chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
          revealDelay: 0.3,
          speed: 0.4,
        },
        ease: 'none',
      });
    }
  }, []);

  const renderCell = (item: typeof techStackItems[0]) => {
    const IconComponent = iconMap[item.iconKey];
    const isActive = activeItem === item.name;
    const isBottomRow = item.row === 2;

    return (
      <div
        key={item.name}
        onMouseEnter={() => setActiveItem(item.name)}
        className={`relative flex items-center justify-center p-8 h-44 md:h-52 cursor-pointer select-none border-r ${isBottomRow ? '' : 'border-b'} border-primary/20 last:border-r-0`}
      >
        {isActive && (
          <motion.div
            layoutId="techStackActive"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="absolute inset-0 bg-primary z-0"
          />
        )}

        <div className={`relative z-10 flex items-center justify-center gap-3 transition-colors duration-200 ${
          isActive ? 'text-background' : 'text-neutral'
        }`}>
          {item.name === 'Framer Motion' ? (
            <Image
              src={isActive ? "/Mdev-hover.png" : "/Mdev.png"}
              alt="Motion"
              width={90}
              height={33}
              className="h-6 md:h-8 w-auto object-contain"
              unoptimized
            />
          ) : item.name === 'Next.js' ? (
            <span className="font-display text-xl md:text-2xl font-bold tracking-tight">
              NEXT<span className="text-xs">.js</span>
            </span>
          ) : (
            <>
              {IconComponent && <IconComponent className={`${item.name === 'Tailwind CSS' ? 'w-[52px] h-[52px] md:w-[62px] md:h-[62px]' : 'w-10 h-10 md:w-12 md:h-12'}`} />}
              {item.name === 'Vercel' && (
                <span className="font-display text-xl md:text-2xl font-bold tracking-tight">
                  Vercel
                </span>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <section id="tech-stack" className="relative w-full py-12 px-8 md:px-16 bg-background">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <h2
          ref={headerRef}
          className="text-primary font-display text-6xl md:text-8xl lg:text-9xl uppercase tracking-[0.0175em] text-center mb-16 leading-none whitespace-pre-line min-h-[2.05em]"
        >
          MODERN{'\n'}TECH STACK
        </h2>

        <div className="w-full bg-background">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {topRowItems.map(renderCell)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
            {bottomRowItems.map(renderCell)}
          </div>
        </div>
      </div>
    </section>
  );
}