'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ReversibleShowcase } from '@/components/ReversibleShowcase';
import { TraceabilityTimeline } from '@/components/TraceabilityTimeline';
import type { Locale } from '@/lib/i18n';
import type { GarmentWithRelations } from '@/types/database';

type Props = {
  readonly garment: GarmentWithRelations | null;
  readonly locale: Locale;
  readonly sku: string;
};

export function GarmentBridge({ garment, locale, sku }: Props) {
  const t = useTranslations('garmentBridge');

  return (
    <section id="garment" className="py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Transition narrative */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-foreground/25 text-[10px] tracking-[0.3em] uppercase mb-4">
            {sku}
          </p>
          <h2 className="font-serif text-2xl md:text-4xl text-accent mb-6">
            {t('title')}
          </h2>
          <p className="font-serif text-foreground/55 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            {t('narrative')}
          </p>
        </motion.div>

        {/* Reversible Showcase */}
        <ReversibleShowcase locale={locale} />

        {/* Traceability */}
        {garment?.manufacturing_info && (
          <motion.div
            className="mt-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-serif text-xl text-accent mb-8 text-center">
              {t('traceabilityTitle')}
            </h3>
            <TraceabilityTimeline info={garment.manufacturing_info} locale={locale} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
