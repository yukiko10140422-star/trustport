-- YURA QR - Memorial Archive Schema Extension
-- Adds tables for disaster timeline, lessons, recovery initiatives,
-- photo gallery, statistics, and location enhancements

-- =============================================================
-- Alter existing tables
-- =============================================================

-- locations: メモリアルヒーロー用の追加カラム
alter table locations
  add column if not exists hero_image_url text,
  add column if not exists hero_video_url text,
  add column if not exists summary_ja text,
  add column if not exists summary_en text;

-- testimonies: カテゴリ分類
alter table testimonies
  add column if not exists category text default 'survivor';
  -- survivor, firstresponder, volunteer, returnee

-- =============================================================
-- 9. disaster_timeline_events: 災害タイムライン
-- =============================================================
create table disaster_timeline_events (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id) on delete cascade,
  event_date date not null,
  event_time time,
  event_type text not null,           -- earthquake, tsunami, nuclear, evacuation, recovery
  title_ja text not null,
  title_en text not null,
  description_ja text,
  description_en text,
  impact_ja text,                     -- 影響の要約（例: '死者15,899人'）
  impact_en text,
  image_url text,
  video_url text,
  source text,
  source_url text,
  sort_order integer default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

-- =============================================================
-- 10. lessons: 教訓
-- =============================================================
create table lessons (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id) on delete cascade,
  title_ja text not null,
  title_en text not null,
  body_ja text not null,              -- Markdown
  body_en text,                       -- Markdown
  category text not null,             -- preparedness, infrastructure, community, policy, memory
  icon_name text,                     -- SVGアイコン名
  sort_order integer default 0,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================================
-- 11. recovery_initiatives: 復興の取り組み
-- =============================================================
create table recovery_initiatives (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id) on delete cascade,
  title_ja text not null,
  title_en text not null,
  description_ja text,                -- Markdown
  description_en text,                -- Markdown
  category text not null,             -- agriculture, tourism, community, education, culture, infrastructure
  status text default 'ongoing',      -- ongoing, completed, planned
  start_date date,
  website_url text,
  image_url text,
  sort_order integer default 0,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================================
-- 12. photo_gallery_items: フォトギャラリー
-- =============================================================
create table photo_gallery_items (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id) on delete cascade,
  initiative_id uuid references recovery_initiatives(id) on delete set null,
  image_url text not null,
  thumbnail_url text,
  caption_ja text,
  caption_en text,
  photographer text,
  date_taken date,
  category text not null,             -- disaster, recovery, present, people
  source text,
  source_url text,
  license text,
  sort_order integer default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

-- =============================================================
-- 13. statistics: 統計データ
-- =============================================================
create table statistics (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id) on delete cascade,
  label_ja text not null,
  label_en text not null,
  value_text text not null,           -- 例: '15,899', '21,434'
  unit_ja text,                       -- 例: '人'
  unit_en text,                       -- 例: 'people'
  context_ja text,                    -- 補足説明
  context_en text,
  category text not null,             -- casualties, displacement, economic, recovery
  reference_date date,
  source text,
  source_url text,
  sort_order integer default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

-- =============================================================
-- Indexes
-- =============================================================
create index idx_timeline_events_location on disaster_timeline_events(location_id);
create index idx_timeline_events_date on disaster_timeline_events(event_date);
create index idx_lessons_location on lessons(location_id);
create index idx_lessons_category on lessons(category);
create index idx_initiatives_location on recovery_initiatives(location_id);
create index idx_initiatives_category on recovery_initiatives(category);
create index idx_gallery_location on photo_gallery_items(location_id);
create index idx_gallery_category on photo_gallery_items(category);
create index idx_statistics_location on statistics(location_id);

-- =============================================================
-- Row Level Security
-- =============================================================
alter table disaster_timeline_events enable row level security;
alter table lessons enable row level security;
alter table recovery_initiatives enable row level security;
alter table photo_gallery_items enable row level security;
alter table statistics enable row level security;

create policy "public_read_timeline_events" on disaster_timeline_events
  for select using (is_published = true);

create policy "public_read_lessons" on lessons
  for select using (is_published = true);

create policy "public_read_initiatives" on recovery_initiatives
  for select using (is_published = true);

create policy "public_read_gallery" on photo_gallery_items
  for select using (is_published = true);

create policy "public_read_statistics" on statistics
  for select using (is_published = true);

-- =============================================================
-- Updated_at triggers
-- =============================================================
create trigger tr_lessons_updated_at
  before update on lessons
  for each row execute function update_updated_at();

create trigger tr_initiatives_updated_at
  before update on recovery_initiatives
  for each row execute function update_updated_at();
