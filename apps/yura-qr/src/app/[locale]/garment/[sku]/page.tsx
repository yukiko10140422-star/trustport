import { getTranslations } from 'next-intl/server';
import { getGarmentBySku, getLocationMemorial } from '@/lib/queries';
import type { Locale } from '@/lib/i18n';
import { MemorialPage } from './MemorialPage';

type Props = {
  params: Promise<{ locale: string; sku: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { sku, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const garment = await getGarmentBySku(sku);

  const name = garment
    ? (locale === 'en' ? garment.name_en : garment.name_ja)
    : sku;

  const locationName = garment?.location
    ? (locale === 'en' ? garment.location.name_en : garment.location.name_ja)
    : '';

  const description = locationName
    ? `${locationName} — ${t('description')}`
    : t('description');

  const title = `${locationName || name} | ${t('title')}`;
  const ogTitle = `${locationName || name} | YURA — ${t('title')}`;

  // Use location hero image for OGP
  const memorial = garment?.location_id
    ? await getLocationMemorial(garment.location_id)
    : null;
  const ogImage = memorial?.hero_image_url ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      type: 'website',
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630, alt: locationName || name }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function GarmentPage({ params }: Props) {
  const { sku, locale } = await params;
  const garment = await getGarmentBySku(sku);

  // Fetch memorial data for the garment's location
  const memorial = garment?.location_id
    ? await getLocationMemorial(garment.location_id)
    : null;

  return (
    <MemorialPage
      sku={sku}
      locale={locale as Locale}
      garment={garment}
      memorial={memorial}
    />
  );
}
