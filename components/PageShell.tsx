'use client';

import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/sections/Footer';
import ContactProvider from '@/components/contact/ContactProvider';

// The frame every page shares (home, /projects and the project pages): the header with its menu and the
// footer, around the page's own content. The opening loader and the smooth scroll are in app/layout.tsx.
// To go back to the earlier header: swap SiteHeader for Navbar (components/Navbar.tsx) and add back
// BottomDock (components/BottomDock.tsx, the phone menu) with pb-[60px] md:pb-0 on the wrapper below.
export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* ContactProvider: lets the header pill, the menu and the footer card all open the same contact form */}
      <ContactProvider>
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-background">
          <SiteHeader />

          <main className="flex-grow">
            {children}
            <Footer />
          </main>
        </div>
      </ContactProvider>
    </>
  );
}
