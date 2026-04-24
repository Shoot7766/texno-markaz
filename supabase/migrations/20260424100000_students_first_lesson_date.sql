alter table public.students
  add column if not exists first_lesson_date date;

comment on column public.students.first_lesson_date is 'O‘quvchi birinchi marta darsga kelgan sana';
