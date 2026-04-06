insert into public.courses (id, name, slug, description, price, duration, level, for_who, features, icon, color, sort_order)
values (
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
)
on conflict (slug) do nothing;
