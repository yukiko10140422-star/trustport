'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { ManufacturingInfo } from '@/types/database';

type Props = {
  readonly info: ManufacturingInfo;
  readonly locale: string;
};

type TimelineStep = {
  readonly labelKey: string;
  readonly value: string | null;
  readonly icon: string;
};

export function TraceabilityTimeline({ info, locale }: Props) {
  const t = useTranslations('traceability');

  const notes = locale === 'en' && info.notes_en ? info.notes_en : info.notes_ja;

  const steps: readonly TimelineStep[] = [
    { labelKey: 'fabric', value: info.fabric_type, icon: '◇' },
    { labelKey: 'factory', value: info.factory_name ? `${info.factory_name}${info.factory_location ? ` (${info.factory_location})` : ''}` : null, icon: '◇' },
    { labelKey: 'printMethod', value: info.print_method, icon: '◇' },
    { labelKey: 'productionDate', value: info.production_date, icon: '◇' },
    { labelKey: 'qualityCheck', value: info.quality_check_date, icon: '◇' },
  ];

  const visibleSteps = steps.filter((s) => s.value !== null);

  return (
    <div className="max-w-md mx-auto">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-border" />

        {visibleSteps.map((step, i) => (
          <motion.div
            key={step.labelKey}
            className="relative pl-12 pb-8 last:pb-0"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            {/* Node */}
            <div className="absolute left-2.5 top-1 w-3 h-3 border border-accent bg-background rotate-45" />

            {/* Label */}
            <p className="text-accent text-xs tracking-wider uppercase mb-1">
              {t(step.labelKey)}
            </p>

            {/* Value */}
            <p className="text-foreground/70 text-sm font-serif">
              {step.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Carbon footprint */}
      {info.carbon_footprint_kg && (
        <motion.div
          className="mt-8 pt-6 border-t border-border text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-foreground/30 text-xs tracking-wider uppercase mb-1">
            Carbon Footprint
          </p>
          <p className="text-accent font-display text-2xl">
            {info.carbon_footprint_kg}
            <span className="text-sm text-foreground/40 ml-1">kg CO₂</span>
          </p>
        </motion.div>
      )}

      {/* Notes */}
      {notes && (
        <motion.p
          className="mt-6 text-foreground/30 text-xs leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {notes}
        </motion.p>
      )}
    </div>
  );
}
