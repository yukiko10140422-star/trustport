import { supabase } from './supabase';
import type { GarmentWithRelations, BrandContent } from '@/types/database';

export async function getGarmentBySku(sku: string): Promise<GarmentWithRelations | null> {
  const { data: garment } = await supabase
    .from('garments')
    .select('*')
    .eq('sku', sku)
    .single();

  if (!garment) return null;

  const [collectionRes, locationRes, manufacturingRes] = await Promise.all([
    garment.collection_id
      ? supabase.from('collections').select('*').eq('id', garment.collection_id).single()
      : { data: null },
    garment.location_id
      ? supabase.from('locations').select('*').eq('id', garment.location_id).single()
      : { data: null },
    supabase.from('manufacturing_info').select('*').eq('garment_id', garment.id).single(),
  ]);

  let locationPhotos: GarmentWithRelations['location'] extends infer L
    ? L extends { location_photos: infer P } ? P : never
    : never = [];
  let testimonies: GarmentWithRelations['location'] extends infer L
    ? L extends { testimonies: infer T } ? T : never
    : never = [];

  if (locationRes.data) {
    const [photosRes, testimoniesRes] = await Promise.all([
      supabase
        .from('location_photos')
        .select('*')
        .eq('location_id', locationRes.data.id)
        .order('sort_order'),
      supabase
        .from('testimonies')
        .select('*')
        .eq('location_id', locationRes.data.id)
        .order('sort_order'),
    ]);
    locationPhotos = photosRes.data ?? [];
    testimonies = testimoniesRes.data ?? [];
  }

  return {
    ...garment,
    collection: collectionRes.data ?? null,
    location: locationRes.data
      ? { ...locationRes.data, location_photos: locationPhotos, testimonies }
      : null,
    manufacturing_info: manufacturingRes.data ?? null,
  } as GarmentWithRelations;
}

export async function getBrandContent(slug: string): Promise<BrandContent | null> {
  const { data } = await supabase
    .from('brand_content')
    .select('*')
    .eq('slug', slug)
    .single();
  return data;
}
