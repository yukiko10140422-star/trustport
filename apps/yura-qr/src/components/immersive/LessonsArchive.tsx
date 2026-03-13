'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { localizedWithFallback, type Locale } from '@/lib/i18n';
import type { Lesson } from '@/types/database';

type Props = {
  readonly lessons: readonly Lesson[];
  readonly locale: Locale;
};

const CATEGORY_ICONS: Record<string, string> = {
  preparedness: 'M12 9v4l3 3M12 2a10 10 0 100 20 10 10 0 000-20z',
  infrastructure: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4',
  community: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  policy: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8',
  memory: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 6v6l4 2',
};

export function LessonsArchive({ lessons, locale }: Props) {
  const t = useTranslations('lessons');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedLesson = lessons.find((l) => l.id === selectedId);

  // Lock body scroll when modal open
  useEffect(() => {
    if (selectedId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedId]);

  if (lessons.length === 0) return null;

  return (
    <section id="lessons" className="py-24 md:py-36 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-foreground/40 text-[10px] tracking-[0.4em] uppercase mb-4">
            Archive
          </p>
          <h2 className="font-serif text-2xl md:text-4xl text-accent/90 mb-4">
            {t('title')}
          </h2>
          <p className="text-foreground/50 text-sm max-w-md mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {lessons.map((lesson, i) => {
            const title = localizedWithFallback(locale, lesson.title_ja, lesson.title_en);
            const iconPath = CATEGORY_ICONS[lesson.category] ?? CATEGORY_ICONS.memory;

            return (
              <motion.button
                key={lesson.id}
                onClick={() => setSelectedId(lesson.id)}
                className="text-left p-6 md:p-8 border border-border/30 bg-surface/20 hover:border-accent/20 hover:bg-surface/40 transition-all duration-500 group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="shrink-0 w-10 h-10 rounded-full border border-accent/15 flex items-center justify-center group-hover:border-accent/30 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent/70 group-hover:text-accent/90 transition-colors">
                      <path d={iconPath} />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] tracking-[0.2em] uppercase text-foreground/45 mb-2">
                      {t(`category.${lesson.category}`)}
                    </p>
                    <h3 className="font-serif text-foreground/80 text-base md:text-lg leading-snug group-hover:text-accent/90 transition-colors">
                      {title}
                    </h3>

                    {/* Read more indicator */}
                    <div className="flex items-center gap-2 mt-4 text-accent/60 group-hover:text-accent/80 transition-colors">
                      <div className="w-4 h-[1px] bg-current" />
                      <span className="text-[10px] tracking-[0.2em] uppercase">Read</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {selectedLesson && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/95 backdrop-blur-md"
              onClick={() => setSelectedId(null)}
            />

            {/* Modal content */}
            <motion.div
              className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto mx-6 p-8 md:p-12 border border-border/30 bg-background"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0, 1] }}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-foreground/50 hover:text-foreground/70 transition-colors"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Category */}
              <p className="text-[9px] tracking-[0.2em] uppercase text-accent/70 mb-4">
                {t(`category.${selectedLesson.category}`)}
              </p>

              {/* Title */}
              <h2 className="font-serif text-2xl md:text-3xl text-foreground/90 leading-snug mb-8">
                {localizedWithFallback(locale, selectedLesson.title_ja, selectedLesson.title_en)}
              </h2>

              <div className="w-12 h-[1px] bg-accent/20 mb-8" />

              {/* Body */}
              <MarkdownRenderer
                content={localizedWithFallback(locale, selectedLesson.body_ja, selectedLesson.body_en)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
