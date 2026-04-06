-- Kurs sahifasi ko‘rinishlari (analytics)
alter table public.visitors
  add column if not exists course_slug text;

comment on column public.visitors.course_slug is 'Kurs slug (masalan /kurslar/web-dasturlash)';
