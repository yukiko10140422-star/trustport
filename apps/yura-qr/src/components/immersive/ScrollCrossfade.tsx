'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { localizedWithFallback, type Locale } from '@/lib/i18n';
import type { LocationPhoto } from '@/types/database';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  readonly photos: readonly LocationPhoto[];
  readonly locale: Locale;
};

function CrossfadePair({
  photo,
  locale,
  index,
}: {
  photo: LocationPhoto;
  locale: Locale;
  index: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  const caption = photo.caption_ja
    ? localizedWithFallback(locale, photo.caption_ja, photo.caption_en)
    : null;

  useEffect(() => {
    const container = containerRef.current;
    const afterEl = afterRef.current;
    const captionEl = captionRef.current;
    if (!container || !afterEl) return;

    const ctx = gsap.context(() => {
      // Pin the pair and crossfade on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top center',
          end: 'bottom center',
          scrub: 0.5,
        },
      });

      // Crossfade: after image opacity 0→1
      tl.fromTo(afterEl, { opacity: 0 }, { opacity: 1, duration: 1 });

      // Caption fade in
      if (captionEl) {
        tl.fromTo(
          captionEl,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5 },
          0.5,
        );
      }
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="h-[150vh] relative">
      <div className="sticky top-0 h-screen flex items-center justify-center px-6">
        <div className="relative w-full max-w-4xl aspect-[16/10] overflow-hidden">
          {/* Before image (base layer) */}
          <img
            src={photo.before_image_url}
            alt={locale === 'en' ? 'Before' : '以前'}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* After image (fades in on scroll) */}
          <div ref={afterRef} className="absolute inset-0" style={{ opacity: 0 }}>
            <img
              src={photo.after_image_url}
              alt={locale === 'en' ? 'After' : '現在'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Before/After labels */}
          <div className="absolute top-4 left-4 z-10">
            <span className="text-[9px] tracking-[0.2em] uppercase px-2 py-1 bg-background/60 backdrop-blur-sm text-foreground/50 border border-border/30">
              {locale === 'en' ? 'Before' : '以前'}
            </span>
          </div>
          <div ref={afterRef} className="absolute top-4 right-4 z-10" style={{ opacity: 0 }}>
            <span className="text-[9px] tracking-[0.2em] uppercase px-2 py-1 bg-background/60 backdrop-blur-sm text-foreground/50 border border-border/30">
              {locale === 'en' ? 'After' : '現在'}
            </span>
          </div>

          {/* Caption */}
          {caption && (
            <div ref={captionRef} className="absolute bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-background/80 to-transparent" style={{ opacity: 0 }}>
              <p className="text-foreground/60 text-sm font-serif">
                {caption}
              </p>
              {photo.source && (
                <p className="text-foreground/45 text-[10px] mt-1">
                  {photo.source}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ScrollCrossfade({ photos, locale }: Props) {
  const t = useTranslations('beforeAfter');

  if (photos.length === 0) return null;

  return (
    <section id="before-after">
      <div className="py-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-foreground/40 text-[10px] tracking-[0.4em] uppercase mb-4">
            Before / After
          </p>
          <h2 className="font-serif text-2xl md:text-4xl text-accent/90">
            {t('title')}
          </h2>
        </motion.div>
      </div>

      {photos.map((photo, i) => (
        <CrossfadePair key={photo.id} photo={photo} locale={locale} index={i} />
      ))}
    </section>
  );
}
