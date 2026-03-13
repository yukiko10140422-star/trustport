'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  HeroSection,
  ReversibleShowcase,
  BeforeAfterSlider,
  TestimonyCard,
  TraceabilityTimeline,
  BrandStorySection,
  CommunitySection,
  StickyNav,
} from '@/components';
import type { GarmentWithRelations, BrandContent } from '@/types/database';

type Props = {
  readonly sku: string;
  readonly locale: string;
  readonly garment: GarmentWithRelations | null;
  readonly brandContent: BrandContent | null;
};

export function GarmentLanding({ sku, locale, garment, brandContent }: Props) {
  const t = useTranslations();

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

  const garmentName = garment
    ? (locale === 'en' ? garment.name_en : garment.name_ja)
    : undefined;

  const photos = garment?.location?.location_photos ?? [];
  const testimonies = garment?.location?.testimonies ?? [];

  return (
    <>
      <StickyNav />

      <main className="min-h-screen">
        {/* Hero */}
        <HeroSection
          sku={sku}
          garmentName={garmentName}
          frontImageUrl={garment?.front_image_url}
          backImageUrl={garment?.back_image_url}
        />

        {/* Reversible Showcase */}
        <ReversibleShowcase locale={locale} />

        {/* Before/After */}
        <section id="before-after" className="py-24 md:py-32 px-6">
          <h2 className="font-serif text-2xl md:text-4xl text-accent mb-16 text-center">
            {t('beforeAfter.title')}
          </h2>

          {photos.length > 0 ? (
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
          ) : (
            <div className="max-w-2xl mx-auto">
              <BeforeAfterSlider
                beforeSrc="/images/placeholder-before.svg"
                afterSrc="/images/placeholder-after.svg"
                beforeAlt={t('beforeAfter.before')}
                afterAlt={t('beforeAfter.after')}
                beforeLabel={t('beforeAfter.before')}
                afterLabel={t('beforeAfter.after')}
                caption={locale === 'ja' ? '浪江町 — 2011年3月 / 2024年' : 'Namie Town — March 2011 / 2024'}
              />
            </div>
          )}
        </section>

        {/* Testimony */}
        <section id="testimony" className="py-24 md:py-32 px-6 bg-surface">
          <h2 className="font-serif text-2xl md:text-4xl text-accent mb-16 text-center">
            {t('testimony.title')}
          </h2>

          {testimonies.length > 0 ? (
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {testimonies.map((testimony) => (
                <TestimonyCard
                  key={testimony.id}
                  testimony={testimony}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="max-w-lg mx-auto">
              <TestimonyCard
                testimony={{
                  id: 'placeholder',
                  location_id: '',
                  speaker_name: locale === 'ja' ? '元住民' : 'Former Resident',
                  speaker_age_at_time: 45,
                  speaker_role: locale === 'ja' ? '浪江町' : 'Namie Town',
                  content_ja: 'あの日のことは忘れない。でも、街が少しずつ変わっていく中で、記憶だけが取り残されていく気がする。この服が、誰かの「知る」きっかけになれば。',
                  content_en: "I will never forget that day. But as the town slowly changes, I feel like only the memories are being left behind. If this garment can be someone's first step to knowing, that's enough.",
                  audio_url: null,
                  audio_duration_seconds: null,
                  source: locale === 'ja' ? 'YURAアーカイブ（仮）' : 'YURA Archive (placeholder)',
                  source_url: null,
                  is_published: true,
                  sort_order: 0,
                  created_at: new Date().toISOString(),
                }}
                locale={locale}
              />
            </div>
          )}
        </section>

        {/* Traceability */}
        <section id="traceability" className="py-24 md:py-32 px-6">
          <h2 className="font-serif text-2xl md:text-4xl text-accent mb-16 text-center">
            {t('traceability.title')}
          </h2>

          {garment?.manufacturing_info ? (
            <TraceabilityTimeline info={garment.manufacturing_info} locale={locale} />
          ) : (
            <TraceabilityTimeline
              info={{
                id: 'placeholder',
                garment_id: '',
                factory_name: locale === 'ja' ? '三恵クレア' : 'Sankei Claire',
                factory_location: locale === 'ja' ? '福島県いわき市' : 'Iwaki, Fukushima',
                fabric_origin: locale === 'ja' ? '福島県産オーガニックコットン' : 'Organic cotton from Fukushima',
                fabric_type: locale === 'ja' ? 'オーガニックコットン 4.0oz' : 'Organic Cotton 4.0oz',
                print_method: locale === 'ja' ? 'DTF転写' : 'DTF Transfer',
                nfc_chip_type: 'NTAG213',
                production_date: '2026-06-01',
                quality_check_date: '2026-06-05',
                carbon_footprint_kg: 3.2,
                notes_ja: null,
                notes_en: null,
                created_at: new Date().toISOString(),
              }}
              locale={locale}
            />
          )}
        </section>

        {/* Brand Story */}
        <BrandStorySection content={brandContent} locale={locale} />

        {/* Community */}
        <CommunitySection
          sku={sku}
          shareUrl={typeof window !== 'undefined' ? window.location.href : `https://yura.style/garment/${sku}`}
        />
      </main>
    </>
  );
}
