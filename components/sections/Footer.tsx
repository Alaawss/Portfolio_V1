'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { resumeUrl, socialLinks } from '@/lib/data';
import { useContact } from '@/components/contact/ContactProvider';
import FooterTakeover from '@/components/contact/FooterTakeover';

interface Tile {
  label: string;
  href?: string;
  isExternal?: boolean;
  gridArea: string;
  isEmpty?: boolean;
}

const tiles: Tile[] = [
  // Contact opens the contact form in place (FooterTakeover) instead of linking somewhere
  { label: 'Contact', gridArea: 'work' },
  { label: 'Resume', href: resumeUrl, gridArea: 'lab' },
  { label: 'LinkedIn', href: socialLinks.find((l) => l.label === 'Linkedin')?.href, isExternal: true, gridArea: 'contact' },
  { label: 'GitHub', href: socialLinks.find((l) => l.label === 'Github')?.href, isExternal: true, gridArea: 'github' },
  { label: '', isEmpty: true, gridArea: 'instagram' },
  { label: '', isEmpty: true, gridArea: 'linkedin' },
];

// Tile colors come from the palette in globals.css (neutral at 12%, primary at 10%)
const tileBackground = 'color-mix(in srgb, var(--color-neutral) 12%, transparent)';
const tileBorder = '1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)';

export default function Footer() {
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);

  // ---- The contact takeover (components/contact/) ----
  const contact = useContact();
  const wrapRef = useRef<HTMLDivElement>(null);
  const contactTileRef = useRef<HTMLButtonElement>(null);
  const takeover = contact.session?.origin === 'footer' ? contact.session : null;
  // The other cards: while the form is open they fade out once the growing card has covered them (after 0.6s),
  // and can't be reached by keyboard (inert). On close they're back at once, before the card shrinks off them.
  // (Inline styles, like the rest of the cards' look, so this transition joins their backdrop-filter one)
  const covered = !!takeover && !contact.closing;
  const coveredStyle = {
    opacity: covered ? 0 : 1,
    transition: `backdrop-filter 0.8s ease-out, -webkit-backdrop-filter 0.8s ease-out${covered ? ', opacity 0.15s 0.6s' : ''}`,
  };

  return (
    <section id="contact" className="relative w-full pt-20 pb-4 px-4 lg:px-8 bg-background overflow-hidden">
      {/* Background wordmark - sharp, no blur, full opacity, behind tiles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <h1 className="text-primary font-display text-[12vw] md:text-[16vw] font-semibold leading-none">
          alaa
        </h1>
      </div>

      {/* Bento Grid — layout lives in .footer-bento (globals.css): 2 columns on phones, 3 from md up */}
      <div ref={wrapRef} className="relative z-20 w-full">
        <div className="footer-bento">
          {tiles.map((tile) => (
            tile.isEmpty ? (
              <div
                key={tile.gridArea}
                inert={!!takeover}
                className="relative overflow-hidden cursor-default"
                style={{
                  gridArea: tile.gridArea,
                  backgroundColor: tileBackground,
                  borderRadius: '11px',
                  border: tileBorder,
                  backdropFilter: hoveredTile === tile.gridArea ? 'blur(16px)' : 'blur(8px)',
                  WebkitBackdropFilter: hoveredTile === tile.gridArea ? 'blur(16px)' : 'blur(8px)',
                  ...coveredStyle,
                }}
                onMouseEnter={() => setHoveredTile(tile.gridArea)}
                onMouseLeave={() => setHoveredTile(null)}
              />
            ) : tile.label === 'Contact' ? (
              // Same look as the other cards, but a button: it opens the contact form right here
              <button
                key={tile.label}
                ref={contactTileRef}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={!!takeover}
                onClick={() => contact.open('footer', contactTileRef)}
                className="relative overflow-hidden cursor-pointer text-left"
                style={{
                  gridArea: tile.gridArea,
                  backgroundColor: tileBackground,
                  borderRadius: '11px',
                  border: tileBorder,
                  backdropFilter: hoveredTile === tile.label ? 'blur(16px)' : 'blur(7px)',
                  WebkitBackdropFilter: hoveredTile === tile.label ? 'blur(16px)' : 'blur(8px)',
                  transition: 'backdrop-filter 0.8s ease-out, -webkit-backdrop-filter 0.8s ease-out',
                }}
                onMouseEnter={() => setHoveredTile(tile.label)}
                onMouseLeave={() => setHoveredTile(null)}
              >
                <div className="relative z-10 flex items-end justify-start p-6 h-full text-primary">
                  <span className="font-display text-sm md:text-base font-bold">{tile.label}</span>
                </div>
              </button>
            ) : (
              <Link
                key={tile.label}
                href={tile.href || '#'}
                target={tile.isExternal ? '_blank' : undefined}
                rel={tile.isExternal ? 'noopener noreferrer' : undefined}
                inert={!!takeover}
                className="relative overflow-hidden cursor-pointer"
                style={{
                  gridArea: tile.gridArea,
                  backgroundColor: tileBackground,
                  borderRadius: '11px',
                  border: tileBorder,
                  backdropFilter: hoveredTile === tile.label ? 'blur(16px)' : 'blur(7px)',
                  WebkitBackdropFilter: hoveredTile === tile.label ? 'blur(16px)' : 'blur(8px)',
                  ...coveredStyle,
                }}
                onMouseEnter={() => setHoveredTile(tile.label)}
                onMouseLeave={() => setHoveredTile(null)}
              >
                <div className="relative z-10 flex items-end justify-start p-6 h-full text-primary">
                  <span className="font-display text-sm md:text-base font-bold">
                    {tile.label}
                  </span>
                </div>
              </Link>
            )
          ))}
        </div>

        {/* The takeover card, drawn over the grid while the form is open from here */}
        {takeover && (
          <FooterTakeover
            key={takeover.id}
            wrapRef={wrapRef}
            tileRef={contactTileRef}
            tileBackground={tileBackground}
            tileBorder={tileBorder}
            closing={contact.closing}
            onClose={contact.close}
            onClosed={contact.finishClose}
          />
        )}
      </div>
    </section>
  );
}
