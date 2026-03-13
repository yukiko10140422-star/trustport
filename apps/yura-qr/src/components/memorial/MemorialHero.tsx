'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { localized, localizedWithFallback, type Locale } from '@/lib/i18n';
import type { Location, Statistic } from '@/types/database';

type Props = {
  readonly location: Location;
  readonly statistics: readonly Statistic[];
  readonly locale: Locale;
};

export function MemorialHero({ location, statistics, locale }: Props) {
  const t = useTranslations('memorial');

  const name = localized(locale, location.name_ja, location.name_en);
  const summary = localizedWithFallback(
    locale,
    location.summary_ja ?? location.description_ja ?? '',
    location.summary_en ?? location.description_en,
  ) || null;

  // Show up to 3 key stats in the hero
  const heroStats = statistics.slice(0, 3);

  return (
    <section
      id="memorial"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background - dark atmospheric */}
      {location.hero_image_url ? (
        <div className="absolute inset-0">
          <img
            src={location.hero_image_url}
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#0d0d0d] to-background" />
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl px-6 text-center">
        {/* Date */}
        <motion.p
          className="text-accent/60 text-sm tracking-[0.3em] font-mono mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {location.disaster_date ?? '2011.03.11'}
        </motion.p>

        {/* Location name */}
        <motion.h1
          className="font-serif text-4xl md:text-6xl lg:text-7xl text-foreground/95 mb-4 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {name}
        </motion.h1>

        {/* Disaster type */}
        <motion.p
          className="text-foreground/40 text-xs tracking-[0.2em] uppercase mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {location.disaster_type}
        </motion.p>

        {/* Summary */}
        {summary && (
          <motion.p
            className="font-serif text-foreground/60 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {summary}
          </motion.p>
        )}

        {/* Key statistics */}
        {heroStats.length > 0 && (
          <motion.div
            className="flex justify-center gap-8 md:gap-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            {heroStats.map((stat) => (
              <div key={stat.id} className="text-center">
                <p className="font-display text-2xl md:text-3xl text-accent">
                  {stat.value_text}
                  {localized(locale, stat.unit_ja, stat.unit_en) && (
                    <span className="text-sm text-foreground/40 ml-1">
                      {localized(locale, stat.unit_ja, stat.unit_en)}
                    </span>
                  )}
                </p>
                <p className="text-foreground/40 text-[10px] tracking-wider mt-1">
                  {localized(locale, stat.label_ja, stat.label_en)}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Scroll indicator */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <p className="text-foreground/20 text-[10px] tracking-[0.3em] uppercase mb-3">
            {t('scrollToLearn')}
          </p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent/40 mx-auto">
              <path d="M12 5v14M19 12l-7 7-7-7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
