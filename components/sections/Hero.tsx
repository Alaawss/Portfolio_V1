'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface HeroProps {
  tintedImage?: string;
  neutralImage?: string;
}

export default function Hero({ tintedImage, neutralImage }: HeroProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLSpanElement>(null);

  // Register GSAP ScrollTrigger
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (wordmarkRef.current) {
      gsap.fromTo(
        wordmarkRef.current,
        {
          opacity: 1,
          scale: 1,
          x: 0
        },
        {
          opacity: 0.3,
          scale: 0.8,
          x: -220,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Scroll-linked exit animation hook
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.75], [1, 0.96]);
  const yOffset = useTransform(scrollYProgress, [0, 0.75], [0, -40]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-background pt-28 pb-0"
    >
      <motion.div
        style={{ opacity, scale, y: yOffset }}
        className="relative w-full min-h-[calc(100vh-7rem)] flex flex-col justify-between"
      >
        {/* Absolute positioning based on Figma measurements */}
        <div className="relative w-full max-w-[1440px] mx-auto z-10">
          
          {/* "ALaa ESSAHIH" - Static text at exact Figma position */}
          <div 
            className="absolute text-primary font-heading font-normal tracking-wide leading-tight whitespace-nowrap"
            style={{
              top: '143.11px',
              left: '184px',
              fontSize: '35.37px'
            }}
          >
            ALaa ESSAHIH
          </div>

          {/* "SCROLL TO DISCOVER" - Static text at exact Figma position */}
          <div 
            className="absolute text-primary font-display uppercase font-bold tracking-wider leading-tight z-30"
            style={{
              top: '220px',
              left: '297px',
              fontSize: '23px'
            }}
          >
            SCROLL TO<br />DISCOVER
          </div>

          {/* Hero Image Placeholder - Exact Figma measurements */}
          <div 
            className="absolute z-10"
            style={{
              top: '63px',
              left: '472px'
            }}
          >
            <div 
              className="relative transition-transform duration-300 hover:rotate-0"
              style={{ transform: 'rotate(-4.12deg)' }}
            >
              <div
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative bg-[#A0E0E7] border border-primary/20 overflow-hidden cursor-pointer shadow-xl"
                style={{
                  width: '539.5px',
                  height: '404.32px'
                }}
              >
                {tintedImage && neutralImage ? (
                  <>
                    <Image
                      src={tintedImage}
                      alt="Alaa ESSAHIH"
                      fill
                      className="object-cover"
                      priority
                    />
                    {isHovered && (
                      <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                        style={{
                          maskImage: `radial-gradient(circle 80px at ${mousePos.x}px ${mousePos.y}px, black 100%, transparent 100%)`,
                          WebkitMaskImage: `radial-gradient(circle 80px at ${mousePos.x}px ${mousePos.y}px, black 100%, transparent 100%)`,
                        }}
                      >
                        <Image
                          src={neutralImage}
                          alt="Alaa ESSAHIH Neutral"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-primary/70 font-heading">
                    <span className="text-xl font-bold mb-2">hero-photo placeholder</span>
                    <span className="text-xs max-w-[200px] opacity-75">
                      (Hover cursor for dual-image reveal once assets provided)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vertical "O - 3" Signature - Exact Figma position */}
          <div 
            className="absolute text-primary font-display tracking-widest uppercase select-none whitespace-nowrap z-30"
            style={{
              top: '70px',
              left: '983.83px',
              transform: 'rotate(90.42deg)',
              fontSize: '25px'
            }}
          >
            O - 3
          </div>

        </div>

       {/* Giant "ALAA" Background Wordmark (Layered behind cyan box, extending tall into center) */}
        <div className="absolute bottom-0 left-0 right-0 w-full flex justify-start items-end pointer-events-none select-none z-0">
          <span 
            ref={wordmarkRef}
            className="text-primary font-display text-[42vw] md:text-[38vw] lg:text-[35vw] tracking-tighter leading-[0.65] uppercase whitespace-nowrap translate-y-[22%] -ml-[3.5vw]"
            style={{ transform: 'rotate(-4.12deg)' }}
          >
            ESSAHIH
          </span>
        </div>

      </motion.div>
    </section>
  );
}
