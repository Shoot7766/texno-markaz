-- Demo / test CRM va analytics ma’lumotlarini tozalash.
-- Auth foydalanuvchilari (Supabase → Authentication) bu yerda o‘chmaydi — kerak bo‘lsa qo‘lda o‘chiring.

delete from public.students;
delete from public.leads;
delete from public.visitors;
delete from public.activity_logs;
delete from public.groups;

update public.public_stats
set
  students_count = 0,
  graduated_count = 0,
  employed_count = 0,
  applications_count = 0,
  active_students_count = 0,
  updated_at = now();
