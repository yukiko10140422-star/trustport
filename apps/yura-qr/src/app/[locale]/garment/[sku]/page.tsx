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

function buildJsonLd({
  garment,
  memorial,
  locale,
}: {
  garment: Awaited<ReturnType<typeof getGarmentBySku>>;
  memorial: Awaited<ReturnType<typeof getLocationMemorial>>;
  locale: string;
}) {
  const isJa = locale === 'ja';
  const graph: Record<string, unknown>[] = [];

  // Place (disaster location)
  if (memorial) {
    const placeName = isJa ? memorial.name_ja : memorial.name_en;
    const placeDesc = isJa ? memorial.description_ja : memorial.description_en;

    const place: Record<string, unknown> = {
      '@type': 'Place',
      name: placeName,
      ...(placeDesc && { description: placeDesc }),
      ...(memorial.municipality && {
        address: {
          '@type': 'PostalAddress',
          ...(memorial.municipality && { addressLocality: memorial.municipality }),
          addressRegion: memorial.prefecture,
          addressCountry: 'JP',
        },
      }),
    };

    if (memorial.latitude != null && memorial.longitude != null) {
      place.geo = {
        '@type': 'GeoCoordinates',
        latitude: memorial.latitude,
        longitude: memorial.longitude,
      };
    }

    graph.push(place);
  }

  // Product (garment)
  if (garment) {
    const productName = isJa ? garment.name_ja : garment.name_en;
    const productDesc = isJa ? garment.description_ja : garment.description_en;

    graph.push({
      '@type': 'Product',
      name: productName,
      sku: garment.sku,
      brand: {
        '@type': 'Brand',
        name: 'YURA',
      },
      ...(productDesc && { description: productDesc }),
      ...(garment.front_image_url && { image: garment.front_image_url }),
    });
  }

  // WebPage
  const locationName = memorial
    ? (isJa ? memorial.name_ja : memorial.name_en)
    : null;
  const pageName = locationName
    ? `${locationName} | ${isJa ? '記憶を未来へ' : 'Memory to the Future'}`
    : `YURA | ${isJa ? '記憶を未来へ' : 'Memory to the Future'}`;
  const pageSummary = memorial
    ? (isJa ? memorial.summary_ja : memorial.summary_en)
    : null;
  const pageDesc = pageSummary
    ?? (isJa
      ? 'QRコードから災害アーカイブへつながるメモリアルページ'
      : 'Memorial page connecting to disaster archives via QR code');

  graph.push({
    '@type': 'WebPage',
    name: pageName,
    description: pageDesc,
    isPartOf: {
      '@type': 'WebSite',
      name: 'YURA',
      url: 'https://yura.style',
    },
  });

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export default async function GarmentPage({ params }: Props) {
  const { sku, locale } = await params;
  const garment = await getGarmentBySku(sku);

  // Fetch memorial data for the garment's location
  const memorial = garment?.location_id
    ? await getLocationMemorial(garment.location_id)
    : null;

  const jsonLd = buildJsonLd({ garment, memorial, locale });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MemorialPage
        sku={sku}
        locale={locale as Locale}
        garment={garment}
        memorial={memorial}
      />
    </>
  );
}
