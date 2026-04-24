alter table public.students
  add column if not exists payment_due_date date;

