/** Supabase DB types for YURA QR Memorial Archive */

export type Collection = {
  readonly id: string;
  readonly slug: string;
  readonly name_ja: string;
  readonly name_en: string;
  readonly description_ja: string | null;
  readonly description_en: string | null;
  readonly season: string;
  readonly theme: string | null;
  readonly cover_image_url: string | null;
  readonly is_published: boolean;
  readonly published_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
};

export type Location = {
  readonly id: string;
  readonly collection_id: string | null;
  readonly name_ja: string;
  readonly name_en: string;
  readonly prefecture: string;
  readonly municipality: string | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly description_ja: string | null;
  readonly description_en: string | null;
  readonly disaster_type: string;
  readonly disaster_date: string | null;
  readonly hero_image_url: string | null;
  readonly hero_video_url: string | null;
  readonly summary_ja: string | null;
  readonly summary_en: string | null;
  readonly created_at: string;
  readonly updated_at: string;
};

export type LocationPhoto = {
  readonly id: string;
  readonly location_id: string;
  readonly before_image_url: string;
  readonly after_image_url: string;
  readonly before_date: string | null;
  readonly after_date: string | null;
  readonly caption_ja: string | null;
  readonly caption_en: string | null;
  readonly source: string | null;
  readonly source_url: string | null;
  readonly license: string | null;
  readonly sort_order: number;
  readonly created_at: string;
};

export type Testimony = {
  readonly id: string;
  readonly location_id: string;
  readonly speaker_name: string | null;
  readonly speaker_age_at_time: number | null;
  readonly speaker_role: string | null;
  readonly content_ja: string;
  readonly content_en: string | null;
  readonly audio_url: string | null;
  readonly audio_duration_seconds: number | null;
  readonly source: string | null;
  readonly source_url: string | null;
  readonly is_published: boolean;
  readonly sort_order: number;
  readonly category: string;
  readonly created_at: string;
};

export type Garment = {
  readonly id: string;
  readonly sku: string;
  readonly collection_id: string | null;
  readonly location_id: string | null;
  readonly name_ja: string;
  readonly name_en: string;
  readonly description_ja: string | null;
  readonly description_en: string | null;
  readonly product_type: string;
  readonly color: string | null;
  readonly size: string | null;
  readonly front_image_url: string | null;
  readonly back_image_url: string | null;
  readonly model_image_url: string | null;
  readonly price_jpy: number | null;
  readonly is_published: boolean;
  readonly created_at: string;
  readonly updated_at: string;
};

export type ManufacturingInfo = {
  readonly id: string;
  readonly garment_id: string;
  readonly factory_name: string | null;
  readonly factory_location: string | null;
  readonly fabric_origin: string | null;
  readonly fabric_type: string | null;
  readonly print_method: string | null;
  readonly nfc_chip_type: string | null;
  readonly production_date: string | null;
  readonly quality_check_date: string | null;
  readonly carbon_footprint_kg: number | null;
  readonly notes_ja: string | null;
  readonly notes_en: string | null;
  readonly created_at: string;
};

export type ScanEvent = {
  readonly id: string;
  readonly garment_id: string | null;
  readonly scan_type: 'qr' | 'nfc';
  readonly user_agent: string | null;
  readonly ip_country: string | null;
  readonly ip_city: string | null;
  readonly referrer: string | null;
  readonly locale: string | null;
  readonly created_at: string;
};

export type BrandContent = {
  readonly id: string;
  readonly slug: string;
  readonly title_ja: string;
  readonly title_en: string;
  readonly body_ja: string;
  readonly body_en: string | null;
  readonly cover_image_url: string | null;
  readonly sort_order: number;
  readonly is_published: boolean;
  readonly created_at: string;
  readonly updated_at: string;
};

// ---- Memorial Archive Types ----

export type DisasterTimelineEvent = {
  readonly id: string;
  readonly location_id: string;
  readonly event_date: string;
  readonly event_time: string | null;
  readonly event_type: 'earthquake' | 'tsunami' | 'nuclear' | 'evacuation' | 'recovery';
  readonly title_ja: string;
  readonly title_en: string;
  readonly description_ja: string | null;
  readonly description_en: string | null;
  readonly impact_ja: string | null;
  readonly impact_en: string | null;
  readonly image_url: string | null;
  readonly video_url: string | null;
  readonly source: string | null;
  readonly source_url: string | null;
  readonly sort_order: number;
  readonly is_published: boolean;
  readonly created_at: string;
};

export type Lesson = {
  readonly id: string;
  readonly location_id: string;
  readonly title_ja: string;
  readonly title_en: string;
  readonly body_ja: string;
  readonly body_en: string | null;
  readonly category: 'preparedness' | 'infrastructure' | 'community' | 'policy' | 'memory';
  readonly icon_name: string | null;
  readonly sort_order: number;
  readonly is_published: boolean;
  readonly created_at: string;
  readonly updated_at: string;
};

export type RecoveryInitiative = {
  readonly id: string;
  readonly location_id: string;
  readonly title_ja: string;
  readonly title_en: string;
  readonly description_ja: string | null;
  readonly description_en: string | null;
  readonly category: 'agriculture' | 'tourism' | 'community' | 'education' | 'culture' | 'infrastructure';
  readonly status: 'ongoing' | 'completed' | 'planned';
  readonly start_date: string | null;
  readonly website_url: string | null;
  readonly image_url: string | null;
  readonly sort_order: number;
  readonly is_published: boolean;
  readonly created_at: string;
  readonly updated_at: string;
};

export type PhotoGalleryItem = {
  readonly id: string;
  readonly location_id: string;
  readonly initiative_id: string | null;
  readonly image_url: string;
  readonly thumbnail_url: string | null;
  readonly caption_ja: string | null;
  readonly caption_en: string | null;
  readonly photographer: string | null;
  readonly date_taken: string | null;
  readonly category: 'disaster' | 'recovery' | 'present' | 'people';
  readonly source: string | null;
  readonly source_url: string | null;
  readonly license: string | null;
  readonly sort_order: number;
  readonly is_published: boolean;
  readonly created_at: string;
};

export type Statistic = {
  readonly id: string;
  readonly location_id: string;
  readonly label_ja: string;
  readonly label_en: string;
  readonly value_text: string;
  readonly unit_ja: string | null;
  readonly unit_en: string | null;
  readonly context_ja: string | null;
  readonly context_en: string | null;
  readonly category: 'casualties' | 'displacement' | 'economic' | 'recovery';
  readonly reference_date: string | null;
  readonly source: string | null;
  readonly source_url: string | null;
  readonly sort_order: number;
  readonly is_published: boolean;
  readonly created_at: string;
};

/** Garment with all relations joined */
export type GarmentWithRelations = Garment & {
  readonly collection: Collection | null;
  readonly location: (Location & {
    readonly location_photos: readonly LocationPhoto[];
    readonly testimonies: readonly Testimony[];
  }) | null;
  readonly manufacturing_info: ManufacturingInfo | null;
};

/** Location with all memorial data joined */
export type LocationWithMemorial = Location & {
  readonly location_photos: readonly LocationPhoto[];
  readonly testimonies: readonly Testimony[];
  readonly timeline_events: readonly DisasterTimelineEvent[];
  readonly lessons: readonly Lesson[];
  readonly initiatives: readonly RecoveryInitiative[];
  readonly gallery: readonly PhotoGalleryItem[];
  readonly statistics: readonly Statistic[];
};

/** Locale type for i18n */
export type Locale = 'ja' | 'en';

/** Helper to pick localized field */
export type Localized<T> = T extends { readonly name_ja: string; readonly name_en: string }
  ? T & { readonly localizedName: string }
  : T;
