'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { sanitizeExternalUrl } from '@/lib/url';
import { localizedWithFallback, type Locale } from '@/lib/i18n';
import type { RecoveryInitiative } from '@/types/database';

type Props = {
  readonly initiatives: readonly RecoveryInitiative[];
  readonly locale: Locale;
};

const STATUS_STYLES: Record<string, string> = {
  ongoing: 'bg-emerald-600/15 text-emerald-500 border-emerald-600/30',
  completed: 'bg-blue-600/15 text-blue-400 border-blue-600/30',
  planned: 'bg-amber-600/15 text-amber-400 border-amber-600/30',
};

export function InitiativesSection({ initiatives, locale }: Props) {
  const t = useTranslations('initiatives');

  if (initiatives.length === 0) return null;

  return (
    <section id="namie-now" className="py-24 md:py-32 px-6 bg-surface/30">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="font-serif text-2xl md:text-4xl text-accent mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('title')}
        </motion.h2>
        <motion.p
          className="text-foreground/40 text-sm text-center mb-16 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {t('subtitle')}
        </motion.p>

        <div className="grid md:grid-cols-2 gap-6">
          {initiatives.map((initiative, i) => {
            const title = localizedWithFallback(locale, initiative.title_ja, initiative.title_en);
            const description = initiative.description_ja
              ? localizedWithFallback(locale, initiative.description_ja, initiative.description_en)
              : null;

            return (
              <motion.div
                key={initiative.id}
                className="border border-border/40 bg-background overflow-hidden group"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                {/* Image */}
                {initiative.image_url && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={initiative.image_url}
                      alt={title}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="p-5 md:p-6">
                  {/* Category & Status */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] tracking-[0.15em] uppercase text-foreground/35">
                      {t(`category.${initiative.category}`)}
                    </span>
                    <span className={`text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-sm border ${STATUS_STYLES[initiative.status] ?? ''}`}>
                      {t(`status.${initiative.status}`)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-foreground/85 text-base md:text-lg mb-2">
                    {title}
                  </h3>

                  {/* Description */}
                  {description && (
                    <p className="text-foreground/50 text-sm leading-relaxed line-clamp-3 mb-4">
                      {description}
                    </p>
                  )}

                  {/* Link */}
                  {sanitizeExternalUrl(initiative.website_url) && (
                    <a
                      href={sanitizeExternalUrl(initiative.website_url)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-accent text-xs tracking-wider hover:text-accent-dim transition-colors"
                    >
                      {t('learnMore')}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M7 17l9.2-9.2M17 17V7.8H7.8" />
                      </svg>
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
