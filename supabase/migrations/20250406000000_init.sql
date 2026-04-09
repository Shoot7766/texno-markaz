-- Texno Markaz: initial schema, RLS, seed
-- Run in Supabase SQL Editor or via supabase db push

-- Extensions
create extension if not exists "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================
do $$ begin
  create type public.lead_status as enum (
    'yangi',
    'korib_chiqilmoqda',
    'boglanildi',
    'tasdiqlandi',
    'rad_etildi',
    'oquvchiga_aylantirildi'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.student_status as enum ('active', 'finished', 'paused');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.attendance_status as enum ('keldi', 'kelmadi', 'kechikdi');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_method as enum ('naqd', 'karta', 'online');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.source_type as enum ('instagram', 'telegram', 'tanish', 'maktab', 'boshqa');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('tolangan', 'qarz', 'qisman');
exception when duplicate_object then null;
end $$;

-- ============================================
-- TABLES
-- ============================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.public_stats (
  id uuid primary key default gen_random_uuid(),
  students_count int not null default 0,
  graduated_count int not null default 0,
  employed_count int not null default 0,
  applications_count int not null default 0,
  active_students_count int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  center_name text not null default 'Texno Markaz',
  phone text not null default '+998 90 000 00 00',
  telegram text default '',
  instagram text default '',
  address text default '',
  logo_url text default '',
  seo_title text default '',
  seo_description text default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(12,2) not null default 0,
  duration text not null default '',
  level text default '',
  for_who text[] not null default '{}',
  features text[] not null default '{}',
  icon text default 'book',
  color text default '#2563eb',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(12,2) not null default 0,
  original_price numeric(12,2) not null default 0,
  bonus text not null default '',
  is_recommended boolean not null default false,
  is_active boolean not null default true,
  course_ids uuid[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_id uuid references public.courses (id) on delete set null,
  teacher text default '',
  schedule text default '',
  max_students int not null default 20,
  start_date date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text not null,
  age int,
  course_or_package text not null,
  preferred_time text default '',
  source public.source_type not null default 'boshqa',
  comment text default '',
  status public.lead_status not null default 'yangi',
  admin_note text default '',
  visitor_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id) on delete set null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  parent_phone text default '',
  course_id uuid references public.courses (id) on delete restrict,
  package_id uuid references public.packages (id) on delete set null,
  group_id uuid references public.groups (id) on delete set null,
  start_date date not null,
  end_date date,
  status public.student_status not null default 'active',
  total_amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  payment_status public.payment_status not null default 'qarz',
  comment text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  page_path text not null default '/',
  referrer_path text default '',
  package_slug text,
  utm_source text default '',
  utm_medium text default '',
  utm_campaign text default '',
  submitted_lead boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists visitors_visitor_id_idx on public.visitors (visitor_id);
create index if not exists visitors_created_at_idx on public.visitors (created_at);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  group_id uuid references public.groups (id) on delete set null,
  attendance_date date not null,
  status public.attendance_status not null default 'keldi',
  note text default '',
  created_at timestamptz not null default now(),
  unique (student_id, attendance_date, group_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  amount numeric(12,2) not null,
  method public.payment_method not null default 'naqd',
  paid_at timestamptz not null default now(),
  note text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete cascade,
  content text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint notes_target check (
    (student_id is not null and lead_id is null) or
    (student_id is null and lead_id is not null)
  )
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Triggers: leads updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- Recalculate student paid_amount from payments (optional consistency)
create or replace function public.sync_student_paid()
returns trigger as $$
begin
  update public.students s
  set paid_amount = coalesce((
    select sum(p.amount) from public.payments p where p.student_id = s.id
  ), 0),
  payment_status = case
    when coalesce((select sum(p.amount) from public.payments p where p.student_id = s.id), 0) >= s.total_amount - s.discount then 'tolangan'::public.payment_status
    when coalesce((select sum(p.amount) from public.payments p where p.student_id = s.id), 0) > 0 then 'qisman'::public.payment_status
    else 'qarz'::public.payment_status
  end
  where s.id = coalesce(new.student_id, old.student_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists payments_sync_student on public.payments;
create trigger payments_sync_student
  after insert or update or delete on public.payments
  for each row execute function public.sync_student_paid();

-- ============================================
-- RLS
-- ============================================

alter table public.profiles enable row level security;
alter table public.public_stats enable row level security;
alter table public.settings enable row level security;
alter table public.courses enable row level security;
alter table public.packages enable row level security;
alter table public.groups enable row level security;
alter table public.leads enable row level security;
alter table public.students enable row level security;
alter table public.visitors enable row level security;
alter table public.attendance enable row level security;
alter table public.payments enable row level security;
alter table public.notes enable row level security;
alter table public.activity_logs enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- Profiles: user reads own; admin reads all
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_admin_manage" on public.profiles;
create policy "profiles_admin_manage" on public.profiles
  for all using (public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Public stats (bosh sahifa raqamlari)
drop policy if exists "public_stats_read" on public.public_stats;
create policy "public_stats_read" on public.public_stats for select using (true);

drop policy if exists "public_stats_admin" on public.public_stats;
create policy "public_stats_admin" on public.public_stats for all using (public.is_admin());

-- Settings: public read (for SEO/footer), admin write
drop policy if exists "settings_select_all" on public.settings;
create policy "settings_select_all" on public.settings for select using (true);

drop policy if exists "settings_admin_all" on public.settings;
create policy "settings_admin_all" on public.settings for all using (public.is_admin());

-- Courses & packages: public read active
drop policy if exists "courses_public_read" on public.courses;
create policy "courses_public_read" on public.courses
  for select using (is_active = true or public.is_admin());

drop policy if exists "courses_admin_write" on public.courses;
create policy "courses_admin_write" on public.courses
  for all using (public.is_admin());

drop policy if exists "packages_public_read" on public.packages;
create policy "packages_public_read" on public.packages
  for select using (is_active = true or public.is_admin());

drop policy if exists "packages_admin_write" on public.packages;
create policy "packages_admin_write" on public.packages
  for all using (public.is_admin());

-- Groups: public read active (for forms), admin all
drop policy if exists "groups_public_read" on public.groups;
create policy "groups_public_read" on public.groups
  for select using (is_active = true or public.is_admin());

drop policy if exists "groups_admin_write" on public.groups;
create policy "groups_admin_write" on public.groups
  for all using (public.is_admin());

-- Leads: faqat admin (UI) va service role (API /api/ariza)
drop policy if exists "leads_insert_public" on public.leads;

drop policy if exists "leads_admin_all" on public.leads;
create policy "leads_admin_all" on public.leads
  for all using (public.is_admin());

-- Visitors: anyone can insert (tracking)
drop policy if exists "visitors_insert_public" on public.visitors;
create policy "visitors_insert_public" on public.visitors
  for insert to anon, authenticated with check (true);

drop policy if exists "visitors_admin_select" on public.visitors;
create policy "visitors_admin_select" on public.visitors
  for select using (public.is_admin());

-- Students, attendance, payments, notes, activity: admin only
drop policy if exists "students_admin" on public.students;
create policy "students_admin" on public.students for all using (public.is_admin());

drop policy if exists "attendance_admin" on public.attendance;
create policy "attendance_admin" on public.attendance for all using (public.is_admin());

drop policy if exists "payments_admin" on public.payments;
create policy "payments_admin" on public.payments for all using (public.is_admin());

drop policy if exists "notes_admin" on public.notes;
create policy "notes_admin" on public.notes for all using (public.is_admin());

drop policy if exists "activity_logs_admin" on public.activity_logs;
create policy "activity_logs_admin" on public.activity_logs for all using (public.is_admin());

-- ============================================
-- AUTH: new user -> profile
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- SEED (boshlang‘ich)
-- ============================================
insert into public.public_stats (id, students_count, graduated_count, employed_count, applications_count, active_students_count)
values ('f0000001-0000-4000-8000-000000000001', 0, 0, 0, 0, 0)
on conflict (id) do nothing;

insert into public.settings (id, center_name, phone, telegram, instagram, address, seo_title, seo_description)
values (
  '00000000-0000-0000-0000-000000000001',
  'Texno Markaz',
  '+998 90 123 45 67',
  'https://t.me/texnomarkaz',
  'https://instagram.com/texnomarkaz',
  'Toshkent',
  'Texno Markaz — IT o''quv markazi',
  '0 dan IT kasb o''rganing. Amaliy darslar, ishga yordam, AI bilan o''qitish.'
)
on conflict (id) do nothing;

-- Fixed UUIDs for seed references
insert into public.courses (id, name, slug, description, price, duration, level, for_who, features, icon, color, sort_order)
values
(
  'a0000001-0000-4000-8000-000000000001',
  'Kompyuter savodxonligi',
  'kompyuter-savodxonligi',
  'Windows, Office, internet va fayllar bilan ishlash. Yangi boshlovchilar uchun.',
  800000,
  '2 oy',
  'Boshlang''ich',
  array['Maktab o''quvchilari', 'Ishga kirishni xohlovchilar'],
  array['Amaliy mashg''ulotlar', 'Sertifikat', 'Mentor yordami'],
  'monitor',
  '#0ea5e9',
  1
),
(
  'a0000001-0000-4000-8000-000000000002',
  'Grafik dizayn',
  'grafik-dizayn',
  'Photoshop, Illustrator, brend va ijtimoiy tarmoq dizayni.',
  1200000,
  '3 oy',
  'O''rta',
  array['Ijodkorlar', 'Freelance boshlovchilar'],
  array['Portfolio', 'Real loyihalar'],
  'palette',
  '#a855f7',
  2
),
(
  'a0000001-0000-4000-8000-000000000003',
  'Web dasturlash',
  'web-dasturlash',
  'HTML, CSS, JavaScript, React va zamonaviy web texnologiyalari.',
  1800000,
  '4 oy',
  'O''rta',
  array['Dasturlashni boshlashni xohlovchilar'],
  array['GitHub', 'Deploy', 'Jamoa loyihasi'],
  'code',
  '#22c55e',
  3
),
(
  'a0000001-0000-4000-8000-000000000004',
  'AI asoslari',
  'ai-asoslari',
  'ChatGPT, prompt yozish, avtomatlashtirish va AI vositalari.',
  900000,
  '2 oy',
  'Boshlang''ich',
  array['Zamonaviy kasb egalari'],
  array['Prompt engineering', 'Amaliy case''lar'],
  'sparkles',
  '#f59e0b',
  4
),
(
  'a0000001-0000-4000-8000-000000000005',
  'Microsoft Office',
  'microsoft-office',
  'Word, Excel, PowerPoint — professional hujjatlar, jadvallar va taqdimotlar.',
  650000,
  '1.5 oy',
  'Boshlang''ich',
  array['Ofis xodimlari', 'Hujjatlar bilan ishlaydiganlar'],
  array['Amaliy topshiriqlar', 'Sertifikat'],
  'layout-grid',
  '#38bdf8',
  5
),
(
  'a0000001-0000-4000-8000-000000000006',
  'Robototexnika',
  'robototexnika',
  'Arduino, sensorlar, motorlar va oddiy avtomatlashtirish — amaliy robotika loyihalari.',
  1100000,
  '2.5 oy',
  'O''rta',
  array['Texnika qiziqqanlar', 'Injenerlikka qiziquvchilar'],
  array['Loyihalar', 'Mentor', 'Amaliy laboratoriya'],
  'bot',
  '#06b6d4',
  6
),
(
  'a0000001-0000-4000-8000-000000000007',
  'Kiberxavfsizlik asoslari',
  'kiberxavfsizlik-asoslari',
  'Parollar, phishing, zararli dasturlar, xavfsiz internet va ma''lumotlarni himoya qilish.',
  850000,
  '2 oy',
  'Boshlang''ich',
  array['Barcha foydalanuvchilar', 'Ofis va masofaviy ish'],
  array['Amaliy stsenariylar', 'Zamonaviy tahdidlar', 'Sertifikat'],
  'shield',
  '#ec4899',
  7
)
on conflict (slug) do nothing;

insert into public.packages (id, name, slug, description, price, original_price, bonus, is_recommended, course_ids, sort_order)
values
(
  'b0000001-0000-4000-8000-000000000001',
  'Kompyuter + Dizayn',
  'kompyuter-dizayn',
  'Savodxonlik va grafik dizayn birgalikda.',
  1800000,
  2000000,
  'Portfolio konsultatsiyasi',
  false,
  array['a0000001-0000-4000-8000-000000000001'::uuid, 'a0000001-0000-4000-8000-000000000002'::uuid],
  1
),
(
  'b0000001-0000-4000-8000-000000000002',
  'Dizayn + AI',
  'dizayn-ai',
  'Dizayn va sun''iy intellekt vositalari.',
  1900000,
  2100000,
  'AI dizayn toolkit',
  true,
  array['a0000001-0000-4000-8000-000000000002'::uuid, 'a0000001-0000-4000-8000-000000000004'::uuid],
  2
),
(
  'b0000001-0000-4000-8000-000000000003',
  'Web + AI',
  'web-ai',
  'Fullstack asoslari va AI integratsiyasi.',
  2500000,
  2700000,
  'Mini startup loyihasi',
  false,
  array['a0000001-0000-4000-8000-000000000003'::uuid, 'a0000001-0000-4000-8000-000000000004'::uuid],
  3
),
(
  'b0000001-0000-4000-8000-000000000004',
  'Full IT Start',
  'full-it-start',
  'To''liq IT yo''nalishi: savodxonlik, web, AI.',
  3200000,
  3700000,
  'Karyera maslahati + sertifikatlar',
  true,
  array[
    'a0000001-0000-4000-8000-000000000001'::uuid,
    'a0000001-0000-4000-8000-000000000003'::uuid,
    'a0000001-0000-4000-8000-000000000004'::uuid
  ],
  4
)
on conflict (slug) do nothing;

comment on table public.visitors is 'Har bir tashrif yozuvi (analytics)';
comment on table public.activity_logs is 'Admin harakatlari jurnali';

-- Kurs sahifasi slug (analytics) — yangi loyihalar uchun bitta skriptda
alter table public.visitors
  add column if not exists course_slug text;
