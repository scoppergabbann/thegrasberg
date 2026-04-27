
-- ============================================================
-- FX Journal v2 — Supabase Schema
-- Supabase Dashboard → SQL Editor → New Query → paste → Run
-- ============================================================
create extension if not exists "uuid-ossp";

create table if not exists trades (
  id          uuid primary key default uuid_generate_v4(),
  trade_date  date not null,
  pair        text not null,
  direction   text not null check (direction in ('BUY', 'SELL')),
  pnl         numeric(12, 2) not null,
  lot_size    numeric(8, 4),
  session     text,
  note        text default '',
  created_at  timestamptz default now()
);

create table if not exists day_notes (
  id          uuid primary key default uuid_generate_v4(),
  note_date   date not null unique,
  mood        text,
  analysis    text default '',
  execution   text default '',
  lesson      text default '',
  tags        jsonb default '[]',
  updated_at  timestamptz default now()
);

create table if not exists psych_results (
  id          uuid primary key default uuid_generate_v4(),
  result_date date not null unique,
  score       integer not null,
  max_score   integer not null,
  percentage  integer not null,
  verdict     text not null,
  allowed     boolean not null,
  feedback    jsonb default '[]',
  created_at  timestamptz default now()
);

create index if not exists trades_date_idx on trades(trade_date);
create index if not exists notes_date_idx  on day_notes(note_date);
create index if not exists psych_date_idx  on psych_results(result_date);

alter table trades       disable row level security;
alter table day_notes    disable row level security;
alter table psych_results disable row level security;
