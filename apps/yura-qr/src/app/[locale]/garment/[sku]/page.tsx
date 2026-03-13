import { getTranslations } from 'next-intl/server';
import { getGarmentBySku, getBrandContent } from '@/lib/queries';
import { GarmentLanding } from './GarmentLanding';

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

  return {
    title: `${name} | ${t('title')}`,
    description: t('description'),
    openGraph: {
      title: `${name} | YURA`,
      description: t('description'),
      type: 'website',
    },
  };
}

export default async function GarmentPage({ params }: Props) {
  const { sku, locale } = await params;
  const [garment, brandContent] = await Promise.all([
    getGarmentBySku(sku),
    getBrandContent('mission'),
  ]);

  return (
    <GarmentLanding
      sku={sku}
      locale={locale}
      garment={garment}
      brandContent={brandContent}
    />
  );
}
