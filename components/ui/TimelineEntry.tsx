'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

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
      {/* Single connecting line — centered under the star, spanning to the NEXT star only, not rendered after the last entry */}
      {!isLast && (
        <div className="absolute left-[10px] top-[26px] bottom-[-26px] w-[2px] bg-primary/40 -translate-x-1/2" />
      )}

      {/* Star bullet point */}
      <div className="relative z-10 flex-shrink-0 mt-1">
        <Image
          src="/Star 1.png"
          alt="Timeline Star"
          width={20}
          height={20}
          className="w-5 h-5 object-contain"
        />
      </div>

      {/* Year — inline, fixed width, same row as title/subtitle */}
      <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.15 + 0.1 }}
      className="text-xl font-bold font-display tracking-wider flex-shrink-0 pr-3 whitespace-nowrap text-primary"
    >
      {year}
    </motion.span>

      {/* Title/subtitle/description */}
      <div className="flex flex-col">
        <h4 className="text-lg font-medium font-heading tracking-wide leading-snug whitespace-nowrap" style={{ color: '#574D4B' }}>
          {title}
        </h4>
        <p className="text-base font-body leading-relaxed" style={{ color: '#574D4B' }}>
          {subtitle}
        </p>
        {description && (
          <p className="text-sm font-body mt-1" style={{ color: '#574D4B', opacity: 0.7 }}>
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
}