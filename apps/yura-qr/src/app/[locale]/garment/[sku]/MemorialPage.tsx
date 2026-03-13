'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  BeforeAfterSlider,
  TestimonyCard,
  StickyNav,
} from '@/components';
import { MemorialHero } from '@/components/memorial/MemorialHero';
import { StatisticsBar } from '@/components/memorial/StatisticsBar';
import { DisasterTimeline } from '@/components/memorial/DisasterTimeline';
import { LessonsSection } from '@/components/memorial/LessonsSection';
import { InitiativesSection } from '@/components/memorial/InitiativesSection';
import { GarmentBridge } from '@/components/memorial/GarmentBridge';
import { TakeActionSection } from '@/components/memorial/TakeActionSection';
import { Footer } from '@/components/shared/Footer';
import { localized, type Locale } from '@/lib/i18n';
import type { GarmentWithRelations, LocationWithMemorial } from '@/types/database';

type Props = {
  readonly sku: string;
  readonly locale: Locale;
  readonly garment: GarmentWithRelations | null;
  readonly memorial: LocationWithMemorial | null;
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yura.style';

export function MemorialPage({ sku, locale, garment, memorial }: Props) {
  const t = useTranslations();
  const [shareUrl, setShareUrl] = useState(`${BASE_URL}/${locale}/garment/${sku}`);

  // Set share URL from browser location after hydration
  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  // Record scan event on mount
  useEffect(() => {
    fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        garment_id: garment?.id ?? null,
        scan_type: 'qr',
        locale,
      }),
    }).catch(() => {
      // Silently fail — analytics should not block UX
    });
  }, [garment?.id, locale]);

  if (!memorial) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-serif text-2xl text-accent mb-4">
            {locale === 'en' ? 'Memorial Not Found' : 'メモリアルが見つかりません'}
          </h1>
          <p className="text-foreground/40 text-sm">
            {locale === 'en'
              ? 'The memorial archive for this garment is not yet available.'
              : 'この衣服に紐づくメモリアルアーカイブはまだ公開されていません。'}
          </p>
        </div>
      </main>
    );
  }

  const photos = memorial.location_photos;
  const testimonies = memorial.testimonies;

  return (
    <>
      <StickyNav />

      <main className="min-h-screen">
        {/* 1. Memorial Hero */}
        <MemorialHero
          location={memorial}
          statistics={memorial.statistics}
          locale={locale}
        />

        {/* 2. Statistics Bar */}
        <StatisticsBar statistics={memorial.statistics} locale={locale} />

        {/* 3. Disaster Timeline */}
        <DisasterTimeline events={memorial.timeline_events} locale={locale} />

        {/* 4. Before/After */}
        {photos.length > 0 && (
          <section id="before-after" className="py-24 md:py-32 px-6 bg-surface/20">
            <h2 className="font-serif text-2xl md:text-4xl text-accent mb-16 text-center">
              {t('beforeAfter.title')}
            </h2>
            <div className="space-y-16">
              {photos.map((photo) => (
                <BeforeAfterSlider
                  key={photo.id}
                  beforeSrc={photo.before_image_url}
                  afterSrc={photo.after_image_url}
                  beforeAlt={t('beforeAfter.before')}
                  afterAlt={t('beforeAfter.after')}
                  beforeLabel={t('beforeAfter.before')}
                  afterLabel={t('beforeAfter.after')}
                  caption={(locale === 'en' ? (photo.caption_en ?? photo.caption_ja) : photo.caption_ja) ?? undefined}
                  source={photo.source ?? undefined}
                  sourceUrl={photo.source_url ?? undefined}
                />
              ))}
            </div>
          </section>
        )}

        {/* 5. Voices / Testimonies */}
        {testimonies.length > 0 && (
          <section id="voices" className="py-24 md:py-32 px-6">
            <h2 className="font-serif text-2xl md:text-4xl text-accent mb-16 text-center">
              {t('testimony.title')}
            </h2>
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {testimonies.map((testimony) => (
                <TestimonyCard
                  key={testimony.id}
                  testimony={testimony}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        )}

        {/* 6. Lessons */}
        <LessonsSection lessons={memorial.lessons} locale={locale} />

        {/* 7. Namie Now — Initiatives */}
        <InitiativesSection initiatives={memorial.initiatives} locale={locale} />

        {/* 8. The Garment */}
        <GarmentBridge garment={garment} locale={locale} sku={sku} />

        {/* 9. Take Action */}
        <TakeActionSection
          sku={sku}
          shareUrl={shareUrl}
          locationName={localized(locale, memorial.name_ja, memorial.name_en)}
        />
      </main>

      <Footer />
    </>
  );
}
