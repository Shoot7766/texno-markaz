insert into public.courses (id, name, slug, description, price, duration, level, for_who, features, icon, color, sort_order)
values
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
