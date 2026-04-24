alter table public.groups
  add column if not exists schedule_days text[] not null default '{}',
  add column if not exists schedule_time text not null default '';

alter table public.students
  add column if not exists lesson_days text[] not null default '{}',
  add column if not exists lesson_time text not null default '';

