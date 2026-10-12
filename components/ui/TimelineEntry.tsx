'use client';

import { motion } from 'framer-motion';

interface TimelineEntryProps {
  year: string;
  title: string;
  subtitle: string;
  description?: string;
  index?: number;
  isLast?: boolean;
}

export default function TimelineEntry({ year, title, subtitle, description, index = 0, isLast = false }: TimelineEntryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.15 }}
      className="flex items-start gap-4 py-4 relative"
    >
      {/* Connecting line, from this star's center to the NEXT star's center (not rendered after the last entry).
          Star center = py-4 (16px) + mt-1 (4px) + half the 20px star = 30px from the entry top, so top is 30px
          and bottom is -(parent gap-2 (8px) + 30px) = -38px. Both ends hide under the stars, so the line meets their tips.
          left-[9px] + 2px wide = centered on the star's 10px middle. It draws down once the next star has slid in. */}
      {!isLast && (
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          // Top/bottom only: on phones the line sits ~40px from the screen edge, so a -50px side margin never saw it
          viewport={{ once: true, margin: '-50px 0px' }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.15 + 0.4 }}
          className="absolute left-[9px] top-[30px] bottom-[-38px] w-[2px] bg-primary/40 origin-top"
        />
      )}

      {/* Star bullet point — the PNG is only used as a mask (its shape), the color is bg-primary,
          so the star follows the palette instead of staying burgundy */}
      <div className="relative z-10 flex-shrink-0 mt-1">
        <span
          aria-hidden
          className="block w-5 h-5 bg-primary"
          style={{
            maskImage: "url('/Star 1.png')", maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
            WebkitMaskImage: "url('/Star 1.png')", WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
          }}
        />
      </div>

      {/* Year above the title on phones, side by side from sm up */}
      <div className="flex flex-col gap-1 sm:flex-row sm:gap-4 min-w-0">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.15 + 0.1 }}
          className="text-xl font-bold font-display tracking-wider flex-shrink-0 pr-3 whitespace-nowrap text-primary"
        >
          {year}
        </motion.span>

        {/* Title/subtitle/description — allowed to wrap (whitespace-nowrap pushed long titles off phone screens) */}
        <div className="flex flex-col min-w-0">
          <h4 className="text-lg font-medium font-heading tracking-wide leading-snug text-neutral">
            {title}
          </h4>
          <p className="text-base font-body leading-relaxed text-neutral">
            {subtitle}
          </p>
          {description && (
            <p className="text-sm font-body mt-1 text-neutral opacity-70">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}