-- CMS + media for vietdungphat.com /adminbp
-- Run once in Supabase → SQL Editor

create table if not exists public.cms_docs (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_cms_docs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cms_docs_touch on public.cms_docs;
create trigger cms_docs_touch
  before update on public.cms_docs
  for each row execute function public.touch_cms_docs_updated_at();

create table if not exists public.media (
  id text primary key,
  name text not null,
  url text not null,
  key text,
  size bigint not null default 0,
  alt text not null default '',
  storage text not null default 'supabase',
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists media_uploaded_at_idx on public.media (uploaded_at desc);
create index if not exists media_key_idx on public.media (key);

alter table public.cms_docs enable row level security;
alter table public.media enable row level security;

drop policy if exists "cms_docs_public_read" on public.cms_docs;
create policy "cms_docs_public_read"
  on public.cms_docs for select using (true);

drop policy if exists "media_public_read" on public.media;
create policy "media_public_read"
  on public.media for select using (true);

alter table public.media alter column storage set default 'supabase';

insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 12582912)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

drop policy if exists "media_bucket_public_read" on storage.objects;
create policy "media_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'media');

-- Lượt truy cập khách hàng (ghi bằng service role, không public)
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  title text not null default '',
  referrer text not null default '',
  session_id text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);
create index if not exists page_views_session_idx on public.page_views (session_id);

alter table public.page_views enable row level security;
