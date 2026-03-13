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

  return {
    title: `${locationName || name} | ${t('title')}`,
    description,
    openGraph: {
      title: `${locationName || name} | YURA — ${t('title')}`,
      description,
      type: 'website',
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
