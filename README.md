# Texno Markaz — o‘quv markazi CRM va marketing sayti

Next.js (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage), React Hook Form, Zod, Recharts. Deploy: Vercel.

## Imkoniyatlar

- **Ommaviy sayt (o‘zbekcha):** bosh sahifa, kurslar, paketlar, ariza formasi (validatsiya, muvaffaqiyat animatsiyasi).
- **Analytics:** `visitor_id` (localStorage), sahifa, referrer, UTM, paket ko‘rinishi, ariza yuborilganligi (visitor yozuvlari).
- **Admin CRM:** dashboard (diagramma, konversiya, ogohlantirishlar), arizalar (status, izoh, o‘quvchiga aylantirish), o‘quvchilar, davomat, to‘lovlar, kurs/paket boshqaruvi, sozlamalar, faollik jurnali.
- **API:** `POST /api/ariza` (service role), `POST /api/track` (anon), `GET /api/admin/export/leads` (CSV), `POST /api/telegram/webhook` (tayyor).
- **Xavfsizlik:** RLS — arizalar faqat server orqali (service role); ommaviy faqat kuzatuv va o‘qish (kurs/paket/sozlamalar).

## O‘rnatish

```bash
npm install
cp .env.example .env.local
```

`.env.local` maydonlari:

| O‘zgaruvchi | Tavsif |
|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase loyiha URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon kalit |
| `SUPABASE_SERVICE_ROLE_KEY` | **Faqat serverda** — ariza va visitor yangilash uchun majburiy |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Ixtiyoriy — yangi ariza xabari |
| `TELEGRAM_WEBHOOK_SECRET` | Ixtiyoriy — `/api/telegram/webhook` uchun |

## Ma’lumotlar bazasi

1. Supabase loyihasida **SQL Editor** oching.
2. `supabase/migrations/20250406000000_init.sql` faylining **barcha** mazmunini nusxalab bitta so‘rov sifatida bajaring.

3. (Agar kerak bo‘lsa) `20250406000001_visitors_course_slug.sql` — `visitors.course_slug`; yangi `init.sql` oxirida ham mavjud bo‘lishi mumkin.

4. Eski demo arizalar/o‘quvchilar qolgan bo‘lsa: `20250406000002_clear_demo_operational_data.sql` ni bajaring.

`init.sql` kurs/paket katalogi va sozlamalarni beradi; bosh sahifa **Raqamlarda** bloki `public_stats` orqali boshlanadi (**0**), haqiqiy raqamlarni **Admin → Sozlamalar → Bosh sahifa statistikasi** da kiriting.

## Admin foydalanuvchi

1. Supabase **Authentication → Users → Add user** — email va parol bilan foydalanuvchi yarating.
2. SQL:

```sql
update public.profiles
set is_admin = true
where id = 'AUTH_USER_UUID_BU_YERGA';
```

`AUTH_USER_UUID_BU_YERGA` o‘rniga yaratilgan foydalanuvchining `id` (UUID) qiymatini qo‘ying.

3. Brauzerda `/admin/login` — shu email va parol bilan kiring.

## Ishga tushirish

```bash
npm run dev
```

- Sayt: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

## Vercel

1. Repozitoriyni ulang.
2. Environment o‘zgaruvchilarini (xususan `SUPABASE_SERVICE_ROLE_KEY`) qo‘shing.
3. Deploy.

## Texnik eslatmalar

- **Ariza** yuborish uchun `SUPABASE_SERVICE_ROLE_KEY` majburiy — u serverda qoladi, klientga chiqmaydi.
- **Logo:** `settings.logo_url` ga Supabase Storage’dagi jamoat URL ni yozing; bucket va siyosatlarni Supabase UI dan sozlang.
- **Telegram:** bot yarating, `TELEGRAM_BOT_TOKEN` va `CHAT_ID` ni to‘ldiring — yangi ariza kelganda xabar yuboriladi.

## Loyiha tuzilishi (qisqa)

- `src/app/(marketing)/` — ommaviy sahifalar
- `src/app/admin/(crm)/` — CRM (layoutda admin tekshiruvi)
- `src/lib/actions/crm.ts` — server actionlar
- `src/lib/supabase/` — klientlar (browser, server, service role, anon API)
- `supabase/migrations/` — SQL migratsiya
