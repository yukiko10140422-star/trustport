'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { localized, localizedWithFallback, type Locale } from '@/lib/i18n';
import type { Statistic } from '@/types/database';

type Props = {
  readonly statistics: readonly Statistic[];
  readonly locale: Locale;
};

export function StatisticsBar({ statistics, locale }: Props) {
  const t = useTranslations('statistics');

  if (statistics.length === 0) return null;

  return (
    <section className="py-16 px-6 border-y border-border/30">
      <motion.p
        className="text-foreground/25 text-[10px] tracking-[0.3em] uppercase text-center mb-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {t('title')}
      </motion.p>

      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {statistics.map((stat, i) => {
          const label = localized(locale, stat.label_ja, stat.label_en);
          const unit = localized(locale, stat.unit_ja, stat.unit_en);
          const context = stat.context_ja
            ? localizedWithFallback(locale, stat.context_ja, stat.context_en)
            : null;

          return (
            <motion.div
              key={stat.id}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="font-display text-2xl md:text-3xl text-accent mb-1">
                {stat.value_text}
                {unit && <span className="text-xs text-foreground/40 ml-1">{unit}</span>}
              </p>
              <p className="text-foreground/50 text-xs tracking-wider">{label}</p>
              {context && (
                <p className="text-foreground/25 text-[10px] mt-1 leading-snug">{context}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
