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

create table if not exists public.dentists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  clinic_name_en text not null,
  clinic_name_ar text not null,
  dentist_name_en text,
  dentist_name_ar text,
  area_en text not null,
  area_ar text not null,
  address_en text,
  address_ar text,
  description_en text,
  description_ar text,
  phone text,
  website_url text,
  maps_url text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  services_en text[] not null default '{}',
  services_ar text[] not null default '{}',
  is_sponsored boolean not null default false,
  is_test boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'paused')),
  verified_at date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faqs_published_created_at_idx on public.faqs (status, created_at);
create index if not exists blogs_published_created_at_idx on public.blogs (status, created_at);
create index if not exists dentists_published_idx on public.dentists (status, clinic_name_en);
create index if not exists dentists_coordinates_idx on public.dentists (latitude, longitude);

alter table public.faqs enable row level security;
alter table public.blogs enable row level security;
alter table public.dentists enable row level security;

grant select on public.faqs, public.blogs to anon, authenticated;
grant insert, update, delete on public.faqs, public.blogs to authenticated;
grant select on public.dentists to anon, authenticated;
grant insert, update, delete on public.dentists to authenticated;

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

drop policy if exists "Public can read published dentists" on public.dentists;
create policy "Public can read published dentists"
on public.dentists for select to anon
using (status = 'published');

drop policy if exists "Staff can read all dentists" on public.dentists;
create policy "Staff can read all dentists"
on public.dentists for select to authenticated
using (true);

drop policy if exists "Staff can add dentists" on public.dentists;
create policy "Staff can add dentists"
on public.dentists for insert to authenticated
with check (true);

drop policy if exists "Staff can edit dentists" on public.dentists;
create policy "Staff can edit dentists"
on public.dentists for update to authenticated
using (true) with check (true);

drop policy if exists "Staff can delete dentists" on public.dentists;
create policy "Staff can delete dentists"
on public.dentists for delete to authenticated
using (true);
