-- ============================================================
-- Migration v5 — Lessons & Learning knowledge base
-- Jalankan di Supabase Dashboard → SQL Editor → Run
-- ============================================================

create table if not exists lessons (
  id          uuid primary key default uuid_generate_v4(),

  -- Source info
  source_type text not null default 'youtube',  -- 'youtube' | 'book' | 'podcast' | 'article' | 'twitter' | 'course' | 'other'
  source_name text not null,                     -- nama channel / penulis / podcast
  source_url  text,                              -- link video / artikel
  title       text not null,                     -- judul video / chapter / episode

  -- Content
  summary     text default '',                   -- ringkasan singkat
  highlights  jsonb default '[]',                -- array of { text, timestamp? } untuk poin penting
  my_notes    text default '',                   -- catatan personal kamu
  takeaway    text default '',                   -- key takeaway / actionable insight

  -- Categorization
  tags        text[] default '{}',               -- array tag: ['scalping', 'risk-mgmt', 'psychology']
  rating      integer default 0,                 -- 0-5
  is_favorite boolean default false,

  -- Optional metadata
  date_consumed date,                            -- kapan kamu nonton/baca
  duration_min  integer,                         -- durasi konten dalam menit (opsional)

  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists lessons_source_idx    on lessons(source_type);
create index if not exists lessons_tags_idx      on lessons using gin(tags);
create index if not exists lessons_favorite_idx  on lessons(is_favorite) where is_favorite = true;
create index if not exists lessons_rating_idx    on lessons(rating);
create index if not exists lessons_created_idx   on lessons(created_at desc);

alter table lessons disable row level security;
