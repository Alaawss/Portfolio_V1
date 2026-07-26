'use client';

import { useState } from 'react';
import Preloader from '@/components/Preloader';
import CurtainReveal from '@/components/CurtainReveal';
import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import ResumeSection from '@/components/sections/ResumeSection';
import TechStack from '@/components/sections/TechStack';

export default function Home() {
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false);

  return (
    <>
      {/* Preloader & Curtain Wipe */}
      <Preloader onComplete={() => setIsPreloaderComplete(true)} />
      <CurtainReveal isRevealed={isPreloaderComplete} />

      {/* Main Single Page Content */}
      <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-background">
        <Navbar />

        <main className="flex-grow">
          <Hero />
          <About />
          <ResumeSection />
          <TechStack />
        </main>
      </div>
    </>
  );
}
