-- YURA QR Landing App - Initial Schema
-- 8 tables: collections, locations, location_photos, testimonies,
--           garments, manufacturing_info, scan_events, brand_content

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================================
-- 1. collections: コレクション（シーズン単位）
-- =============================================================
create table collections (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name_ja text not null,
  name_en text not null,
  description_ja text,
  description_en text,
  season text not null,            -- e.g. '2026-AW'
  theme text,                      -- e.g. 'NAMIE（浪江）'
  cover_image_url text,
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================================
-- 2. locations: 被災地の地点
-- =============================================================
create table locations (
  id uuid primary key default uuid_generate_v4(),
  collection_id uuid references collections(id) on delete cascade,
  name_ja text not null,
  name_en text not null,
  prefecture text not null,        -- e.g. '福島県'
  municipality text,               -- e.g. '浪江町'
  latitude double precision,
  longitude double precision,
  description_ja text,
  description_en text,
  disaster_type text not null,     -- e.g. '東日本大震災', '原発事故'
  disaster_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================================
-- 3. location_photos: Before/After写真ペア
-- =============================================================
create table location_photos (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id) on delete cascade,
  before_image_url text not null,
  after_image_url text not null,
  before_date date,                -- 撮影日（被災時）
  after_date date,                 -- 撮影日（現在）
  caption_ja text,
  caption_en text,
  source text,                     -- 出典（例: '国土地理院'）
  source_url text,
  license text,                    -- 例: 'パブリックドメイン', 'CC BY 4.0'
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- =============================================================
-- 4. testimonies: 証言（テキスト+音声）
-- =============================================================
create table testimonies (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id) on delete cascade,
  speaker_name text,               -- 匿名可: null
  speaker_age_at_time integer,
  speaker_role text,               -- e.g. '元住民', '消防団員'
  content_ja text not null,
  content_en text,
  audio_url text,                  -- Supabase Storage URL
  audio_duration_seconds integer,
  source text,                     -- 出典
  source_url text,
  is_published boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- =============================================================
-- 5. garments: 衣服（SKU = QRコードID）
-- =============================================================
create table garments (
  id uuid primary key default uuid_generate_v4(),
  sku text unique not null,        -- e.g. 'YURA-001-NME-BK-M'
  collection_id uuid references collections(id) on delete set null,
  location_id uuid references locations(id) on delete set null,
  name_ja text not null,
  name_en text not null,
  description_ja text,
  description_en text,
  product_type text not null,      -- e.g. 'reversible-tee', 'hoodie'
  color text,
  size text,
  front_image_url text,
  back_image_url text,
  model_image_url text,            -- 着用イメージ
  price_jpy integer,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================================
-- 6. manufacturing_info: 製造トレーサビリティ（1:1 with garments）
-- =============================================================
create table manufacturing_info (
  id uuid primary key default uuid_generate_v4(),
  garment_id uuid unique not null references garments(id) on delete cascade,
  factory_name text,
  factory_location text,           -- e.g. '福島県いわき市'
  fabric_origin text,              -- 生地の産地
  fabric_type text,                -- e.g. 'オーガニックコットン 4.0oz'
  print_method text,               -- e.g. 'DTF転写'
  nfc_chip_type text,              -- e.g. 'NTAG213'
  production_date date,
  quality_check_date date,
  carbon_footprint_kg numeric(6,2),
  notes_ja text,
  notes_en text,
  created_at timestamptz default now()
);

-- =============================================================
-- 7. scan_events: スキャン分析（匿名）
-- =============================================================
create table scan_events (
  id uuid primary key default uuid_generate_v4(),
  garment_id uuid references garments(id) on delete set null,
  scan_type text not null default 'qr',  -- 'qr' or 'nfc'
  user_agent text,
  ip_country text,
  ip_city text,
  referrer text,
  locale text,                     -- 検出された言語
  created_at timestamptz default now()
);

-- =============================================================
-- 8. brand_content: ブランドストーリー（CMS的利用）
-- =============================================================
create table brand_content (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,       -- e.g. 'mission', 'about', 'philosophy'
  title_ja text not null,
  title_en text not null,
  body_ja text not null,           -- Markdown
  body_en text,                    -- Markdown
  cover_image_url text,
  sort_order integer default 0,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================================
-- Indexes
-- =============================================================
create index idx_locations_collection on locations(collection_id);
create index idx_location_photos_location on location_photos(location_id);
create index idx_testimonies_location on testimonies(location_id);
create index idx_garments_sku on garments(sku);
create index idx_garments_collection on garments(collection_id);
create index idx_garments_location on garments(location_id);
create index idx_manufacturing_garment on manufacturing_info(garment_id);
create index idx_scan_events_garment on scan_events(garment_id);
create index idx_scan_events_created on scan_events(created_at);
create index idx_brand_content_slug on brand_content(slug);

-- =============================================================
-- Row Level Security
-- =============================================================

-- Enable RLS on all tables
alter table collections enable row level security;
alter table locations enable row level security;
alter table location_photos enable row level security;
alter table testimonies enable row level security;
alter table garments enable row level security;
alter table manufacturing_info enable row level security;
alter table scan_events enable row level security;
alter table brand_content enable row level security;

-- Read: public (anon can SELECT published content)
create policy "public_read_collections" on collections
  for select using (is_published = true);

create policy "public_read_locations" on locations
  for select using (true);

create policy "public_read_location_photos" on location_photos
  for select using (true);

create policy "public_read_testimonies" on testimonies
  for select using (is_published = true);

create policy "public_read_garments" on garments
  for select using (is_published = true);

create policy "public_read_manufacturing_info" on manufacturing_info
  for select using (true);

create policy "public_read_brand_content" on brand_content
  for select using (is_published = true);

-- scan_events: anon can INSERT only (anonymous tracking)
create policy "anon_insert_scan_events" on scan_events
  for insert with check (true);

-- scan_events: no public read (admin only via service_role)
-- Write: service_role bypasses RLS by default, no additional policies needed

-- =============================================================
-- Updated_at trigger function
-- =============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_collections_updated_at
  before update on collections
  for each row execute function update_updated_at();

create trigger tr_locations_updated_at
  before update on locations
  for each row execute function update_updated_at();

create trigger tr_garments_updated_at
  before update on garments
  for each row execute function update_updated_at();

create trigger tr_brand_content_updated_at
  before update on brand_content
  for each row execute function update_updated_at();
