-- Run this file in Supabase Dashboard → SQL Editor.

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question_en text not null,
  question_ar text not null,
  keywords_en text[] not null default '{}',
  keywords_ar text[] not null default '{}',
  replies jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_ar text not null,
  category_en text not null,
  category_ar text not null,
  author_en text not null,
  author_ar text not null,
  excerpt_en text not null,
  excerpt_ar text not null,
  body_en text not null,
  body_ar text not null,
  read_time text not null default '5 MIN READ',
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faqs_published_created_at_idx on public.faqs (status, created_at);
create index if not exists blogs_published_created_at_idx on public.blogs (status, created_at);

alter table public.faqs enable row level security;
alter table public.blogs enable row level security;

grant select on public.faqs, public.blogs to anon, authenticated;
grant insert, update, delete on public.faqs, public.blogs to authenticated;

drop policy if exists "Public can read published FAQs" on public.faqs;
create policy "Public can read published FAQs"
on public.faqs for select to anon
using (status = 'published');

drop policy if exists "Staff can read all FAQs" on public.faqs;
create policy "Staff can read all FAQs"
on public.faqs for select to authenticated
using (true);

drop policy if exists "Staff can add FAQs" on public.faqs;
create policy "Staff can add FAQs"
on public.faqs for insert to authenticated
with check (true);

drop policy if exists "Staff can edit FAQs" on public.faqs;
create policy "Staff can edit FAQs"
on public.faqs for update to authenticated
using (true) with check (true);

drop policy if exists "Staff can delete FAQs" on public.faqs;
create policy "Staff can delete FAQs"
on public.faqs for delete to authenticated
using (true);

drop policy if exists "Public can read published blogs" on public.blogs;
create policy "Public can read published blogs"
on public.blogs for select to anon
using (status = 'published');

drop policy if exists "Staff can read all blogs" on public.blogs;
create policy "Staff can read all blogs"
on public.blogs for select to authenticated
using (true);

drop policy if exists "Staff can add blogs" on public.blogs;
create policy "Staff can add blogs"
on public.blogs for insert to authenticated
with check (true);

drop policy if exists "Staff can edit blogs" on public.blogs;
create policy "Staff can edit blogs"
on public.blogs for update to authenticated
using (true) with check (true);

drop policy if exists "Staff can delete blogs" on public.blogs;
create policy "Staff can delete blogs"
on public.blogs for delete to authenticated
using (true);
