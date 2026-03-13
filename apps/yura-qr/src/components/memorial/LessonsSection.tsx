'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { localizedWithFallback, type Locale } from '@/lib/i18n';
import type { Lesson } from '@/types/database';

type Props = {
  readonly lessons: readonly Lesson[];
  readonly locale: Locale;
};

const ICON_MAP: Record<string, React.ReactNode> = {
  preparedness: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4l3 3" /><circle cx="12" cy="12" r="10" />
    </svg>
  ),
  infrastructure: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" /><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    </svg>
  ),
  community: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  policy: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  memory: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M12 6v6l4 2" />
    </svg>
  ),
};

export function LessonsSection({ lessons, locale }: Props) {
  const t = useTranslations('lessons');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (lessons.length === 0) return null;

  return (
    <section id="lessons" className="py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto">
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

        <div className="space-y-4">
          {lessons.map((lesson, i) => {
            const title = localizedWithFallback(locale, lesson.title_ja, lesson.title_en);
            const body = localizedWithFallback(locale, lesson.body_ja, lesson.body_en);
            const isExpanded = expandedId === lesson.id;
            const icon = ICON_MAP[lesson.category] ?? ICON_MAP.memory;

            return (
              <motion.div
                key={lesson.id}
                className="border border-border/50 bg-surface/30"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : lesson.id)}
                  className="w-full flex items-start gap-4 p-5 md:p-6 text-left group"
                  aria-expanded={isExpanded}
                  aria-controls={`lesson-body-${lesson.id}`}
                >
                  <div className="text-accent/60 shrink-0 mt-0.5">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] tracking-[0.2em] uppercase text-foreground/30 mb-1">
                      {t(`category.${lesson.category}`)}
                    </p>
                    <h3 className="font-serif text-foreground/85 text-base md:text-lg group-hover:text-accent transition-colors">
                      {title}
                    </h3>
                  </div>
                  <div className={`text-foreground/30 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      id={`lesson-body-${lesson.id}`}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-5 md:pb-6 pl-14 md:pl-16">
                        <MarkdownRenderer content={body} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
