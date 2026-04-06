-- Bosh sahifa: arizalar va faol o‘quvchilar (admin qo‘lda yoki keyin avtomatik)
alter table public.public_stats
  add column if not exists applications_count int not null default 0,
  add column if not exists active_students_count int not null default 0;
