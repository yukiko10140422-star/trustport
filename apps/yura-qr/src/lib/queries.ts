import { supabase } from './supabase';
import type {
  Garment,
  Collection,
  Location,
  LocationPhoto,
  Testimony,
  ManufacturingInfo,
  BrandContent,
  GarmentWithRelations,
  LocationWithMemorial,
  DisasterTimelineEvent,
  Lesson,
  RecoveryInitiative,
  PhotoGalleryItem,
  Statistic,
} from '@/types/database';

export async function getGarmentBySku(sku: string): Promise<GarmentWithRelations | null> {
  try {
    const { data: garment, error } = await supabase
      .from('garments')
      .select('*')
      .eq('sku', sku)
      .maybeSingle();

    if (error || !garment) return null;

    const [collectionRes, locationRes, manufacturingRes] = await Promise.all([
      garment.collection_id
        ? supabase.from('collections').select('*').eq('id', garment.collection_id).maybeSingle()
        : { data: null, error: null },
      garment.location_id
        ? supabase.from('locations').select('*').eq('id', garment.location_id).maybeSingle()
        : { data: null, error: null },
      supabase.from('manufacturing_info').select('*').eq('garment_id', garment.id).maybeSingle(),
    ]);

    let locationPhotos: LocationPhoto[] = [];
    let testimonies: Testimony[] = [];

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
      locationPhotos = (photosRes.data ?? []) as LocationPhoto[];
      testimonies = (testimoniesRes.data ?? []) as Testimony[];
    }

    return {
      ...(garment as Garment),
      collection: (collectionRes.data as Collection | null) ?? null,
      location: locationRes.data
        ? {
            ...(locationRes.data as Location),
            location_photos: locationPhotos,
            testimonies,
          }
        : null,
      manufacturing_info: (manufacturingRes.data as ManufacturingInfo | null) ?? null,
    };
  } catch (err) {
    console.error('Failed to fetch garment:', err);
    return null;
  }
}

export async function getBrandContent(slug: string): Promise<BrandContent | null> {
  try {
    const { data, error } = await supabase
      .from('brand_content')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) return null;
    return data as BrandContent | null;
  } catch {
    return null;
  }
}

/** Sort helper for arrays with sort_order */
function bySortOrder<T extends { sort_order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

/** Fetch full memorial data for a location (single nested query) */
export async function getLocationMemorial(locationId: string): Promise<LocationWithMemorial | null> {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        location_photos(*),
        testimonies(*),
        disaster_timeline_events(*),
        lessons(*),
        recovery_initiatives(*),
        photo_gallery_items(*),
        statistics(*)
      `)
      .eq('id', locationId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      ...(data as Location),
      location_photos: bySortOrder((data.location_photos ?? []) as LocationPhoto[]),
      testimonies: bySortOrder((data.testimonies ?? []) as Testimony[]),
      timeline_events: bySortOrder((data.disaster_timeline_events ?? []) as DisasterTimelineEvent[]),
      lessons: bySortOrder((data.lessons ?? []) as Lesson[]),
      initiatives: bySortOrder((data.recovery_initiatives ?? []) as RecoveryInitiative[]),
      gallery: bySortOrder((data.photo_gallery_items ?? []) as PhotoGalleryItem[]),
      statistics: bySortOrder((data.statistics ?? []) as Statistic[]),
    };
  } catch (err) {
    console.error('Failed to fetch location memorial:', err);
    return null;
  }
}
