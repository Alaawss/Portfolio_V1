import PageShell from '@/components/PageShell';
import Hero from '@/components/sections/Hero';
import HeroReel from '@/components/sections/HeroReel';
import About from '@/components/sections/About';
import ResumeSection from '@/components/sections/ResumeSection';
import TechStack from '@/components/sections/TechStack';
import Projects from '@/components/sections/Projects';

// The home page: the sections inside the frame every page shares (smooth scroll, header, footer).
// The loader that opens the site lives in app/layout.tsx
export default function Home() {
  return (
    <PageShell>
      <Hero />
      {/* The showreel: small and pulled up over the hero, it grows into place here as you scroll (from 768px) */}
      <HeroReel />
      <About image="/about.jpeg" />
      <ResumeSection resumeImage="/experience.jpeg" />
      <TechStack />
      <Projects />
    </PageShell>
  );
}
