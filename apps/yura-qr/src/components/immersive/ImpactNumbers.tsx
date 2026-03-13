'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { localized, localizedWithFallback, type Locale } from '@/lib/i18n';
import type { Statistic } from '@/types/database';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  readonly statistics: readonly Statistic[];
  readonly locale: Locale;
};

function CounterCell({
  stat,
  locale,
  index,
}: {
  stat: Statistic;
  locale: Locale;
  index: number;
}) {
  const cellRef = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState('0');
  const label = localized(locale, stat.label_ja, stat.label_en);
  const unit = localized(locale, stat.unit_ja, stat.unit_en);
  const context = stat.context_ja
    ? localizedWithFallback(locale, stat.context_ja, stat.context_en)
    : null;

  // Parse numeric value from text (handles "15,899" etc.)
  const numericTarget = parseInt(stat.value_text.replace(/[^0-9]/g, ''), 10) || 0;
  const isNumeric = numericTarget > 0;

  useEffect(() => {
    const el = cellRef.current;
    if (!el || !isNumeric) {
      setDisplayValue(stat.value_text);
      return;
    }

    const counter = { val: 0 };

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          val: numericTarget,
          duration: 2.2,
          delay: index * 0.15,
          ease: 'power2.out',
          onUpdate: () => {
            setDisplayValue(Math.floor(counter.val).toLocaleString());
          },
        });
      },
    });

    return () => trigger.kill();
  }, [numericTarget, isNumeric, index, stat.value_text]);

  return (
    <div ref={cellRef} className="text-center py-8 md:py-12">
      {/* Value */}
      <div className="mb-3">
        <span className="font-display text-4xl md:text-5xl lg:text-6xl text-accent tabular-nums tracking-tight">
          {displayValue}
        </span>
        {unit && (
          <span className="text-foreground/30 text-sm md:text-base ml-2 font-serif">
            {unit}
          </span>
        )}
      </div>

      {/* Label */}
      <p className="text-foreground/50 text-xs md:text-sm tracking-wider font-serif">
        {label}
      </p>

      {/* Context */}
      {context && (
        <p className="text-foreground/20 text-[10px] md:text-[11px] mt-2 leading-relaxed max-w-[200px] mx-auto">
          {context}
        </p>
      )}
    </div>
  );
}

export function ImpactNumbers({ statistics, locale }: Props) {
  const t = useTranslations('statistics');

  if (statistics.length === 0) return null;

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Subtle gradient separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <motion.p
        className="text-foreground/15 text-[10px] tracking-[0.4em] uppercase text-center mb-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {t('title')}
      </motion.p>

      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-0 md:gap-x-8">
          {statistics.slice(0, 8).map((stat, i) => (
            <CounterCell key={stat.id} stat={stat} locale={locale} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom separator */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
    </section>
  );
}
