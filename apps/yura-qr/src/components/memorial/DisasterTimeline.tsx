'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { sanitizeExternalUrl } from '@/lib/url';
import { localizedWithFallback, type Locale } from '@/lib/i18n';
import type { DisasterTimelineEvent } from '@/types/database';

type Props = {
  readonly events: readonly DisasterTimelineEvent[];
  readonly locale: Locale;
};

const EVENT_COLORS: Record<string, string> = {
  earthquake: 'border-red-700 bg-red-700/10',
  tsunami: 'border-blue-700 bg-blue-700/10',
  nuclear: 'border-yellow-600 bg-yellow-600/10',
  evacuation: 'border-gray-500 bg-gray-500/10',
  recovery: 'border-emerald-600 bg-emerald-600/10',
};

const EVENT_DOT_COLORS: Record<string, string> = {
  earthquake: 'bg-red-700',
  tsunami: 'bg-blue-700',
  nuclear: 'bg-yellow-600',
  evacuation: 'bg-gray-500',
  recovery: 'bg-emerald-600',
};

export function DisasterTimeline({ events, locale }: Props) {
  const t = useTranslations('timeline');

  if (events.length === 0) return null;

  return (
    <section id="timeline" className="py-24 md:py-32 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.h2
          className="font-serif text-2xl md:text-4xl text-accent mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('title')}
        </motion.h2>
        <motion.p
          className="text-foreground/40 text-sm text-center mb-16 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {t('subtitle')}
        </motion.p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-6 top-0 bottom-0 w-[1px] bg-border" />

          {events.map((event, i) => {
            const title = localizedWithFallback(locale, event.title_ja, event.title_en);
            const description = event.description_ja
              ? localizedWithFallback(locale, event.description_ja, event.description_en)
              : null;
            const impact = event.impact_ja
              ? localizedWithFallback(locale, event.impact_ja, event.impact_en)
              : null;

            return (
              <motion.div
                key={event.id}
                className="relative pl-12 md:pl-16 pb-10 last:pb-0"
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                {/* Dot */}
                <div
                  className={`absolute left-2.5 md:left-4.5 top-1.5 w-3 h-3 rounded-full ${EVENT_DOT_COLORS[event.event_type] ?? 'bg-accent'}`}
                />

                {/* Date & time */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-foreground/50 text-xs font-mono">
                    {event.event_date}
                    {event.event_time && ` ${event.event_time.slice(0, 5)}`}
                  </span>
                  <span className={`text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-sm ${EVENT_COLORS[event.event_type] ?? 'border-accent bg-accent/10'} border`}>
                    {t(`type.${event.event_type}`)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-foreground/90 text-base md:text-lg mb-2">
                  {title}
                </h3>

                {/* Description */}
                {description && (
                  <p className="text-foreground/55 text-sm leading-relaxed mb-2">
                    {description}
                  </p>
                )}

                {/* Impact stat */}
                {impact && (
                  <p className="text-accent/70 text-xs font-mono tracking-wide">
                    {impact}
                  </p>
                )}

                {/* Image */}
                {event.image_url && (
                  <div className="mt-3 rounded overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={title}
                      className="w-full max-h-48 object-cover opacity-80"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Source */}
                {event.source && (
                  <p className="text-foreground/20 text-[10px] mt-2">
                    {sanitizeExternalUrl(event.source_url) ? (
                      <a href={sanitizeExternalUrl(event.source_url)!} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                        {event.source}
                      </a>
                    ) : event.source}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
