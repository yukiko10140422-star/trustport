'use client';

import { useEffect, useState } from 'react';
import { StickyNav } from '@/components';
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider';
import { AudioProvider } from '@/providers/AudioProvider';
import { ImmersiveOpening } from '@/components/immersive/ImmersiveOpening';
import { ImpactNumbers } from '@/components/immersive/ImpactNumbers';
import { ScrollTimeline } from '@/components/immersive/ScrollTimeline';
import { ScrollCrossfade } from '@/components/immersive/ScrollCrossfade';
import { VoicesSection } from '@/components/immersive/VoicesSection';
import { LessonsArchive } from '@/components/immersive/LessonsArchive';
import { MemorialMoment } from '@/components/immersive/MemorialMoment';
import { InitiativesSection } from '@/components/memorial/InitiativesSection';
import { GarmentBridge } from '@/components/memorial/GarmentBridge';
import { TakeActionSection } from '@/components/memorial/TakeActionSection';
import { Footer } from '@/components/shared/Footer';
import { localized, localizedWithFallback, type Locale } from '@/lib/i18n';
import type { GarmentWithRelations, LocationWithMemorial } from '@/types/database';

type Props = {
  readonly sku: string;
  readonly locale: Locale;
  readonly garment: GarmentWithRelations | null;
  readonly memorial: LocationWithMemorial | null;
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yura.style';

export function MemorialPage({ sku, locale, garment, memorial }: Props) {
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

  const locationName = localized(locale, memorial.name_ja, memorial.name_en);
  const summary = localizedWithFallback(
    locale,
    memorial.summary_ja ?? memorial.description_ja ?? '',
    memorial.summary_en ?? memorial.description_en,
  ) || undefined;

  return (
    <AudioProvider useProceduralOcean>
      <SmoothScrollProvider>
        <StickyNav />

        <main className="min-h-screen">
          {/* 1. Immersive Opening — Video/Counter/Sound */}
          <ImmersiveOpening
            locationName={locationName}
            disasterDate={memorial.disaster_date ?? '2011-03-11'}
            heroVideoUrl={memorial.hero_video_url}
            heroImageUrl={memorial.hero_image_url}
            summary={summary}
          />

          {/* 2. Impact Numbers — GSAP Counter Animation */}
          <ImpactNumbers statistics={memorial.statistics} locale={locale} />

          {/* 3. Scrollytelling Timeline — Horizontal Pin Scroll */}
          <ScrollTimeline events={memorial.timeline_events} locale={locale} />

          {/* 4. Before/After — Scroll-Linked Crossfade */}
          <ScrollCrossfade photos={memorial.location_photos} locale={locale} />

          {/* 5. Voices — Audio Waveform Visualizer */}
          <VoicesSection testimonies={memorial.testimonies} locale={locale} />

          {/* 6. Lessons Archive — Fullscreen Modal */}
          <LessonsArchive lessons={memorial.lessons} locale={locale} />

          {/* 7. Memorial Moment — Three.js Particles */}
          <MemorialMoment />

          {/* 8. Namie Now — Recovery Initiatives */}
          <InitiativesSection initiatives={memorial.initiatives} locale={locale} />

          {/* 9. The Garment — Bridge to Product */}
          <GarmentBridge garment={garment} locale={locale} sku={sku} />

          {/* 10. Take Action */}
          <TakeActionSection
            sku={sku}
            shareUrl={shareUrl}
            locationName={locationName}
          />
        </main>

        <Footer />
      </SmoothScrollProvider>
    </AudioProvider>
  );
}
