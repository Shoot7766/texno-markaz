import type { Course } from "@/lib/types";

/** Supabase da migratsiya hali bajarilmagan bo‘lsa, katalog to‘liq ko‘rinsin */
const FALLBACK_SLUGS: Record<string, Course> = {
  robototexnika: {
    id: "a0000001-0000-4000-8000-000000000006",
    name: "Robototexnika",
    slug: "robototexnika",
    description:
      "Arduino, sensorlar, motorlar va oddiy avtomatlashtirish — amaliy robotika loyihalari.",
    price: 1100000,
    duration: "2.5 oy",
    level: "O‘rta",
    for_who: ["Texnika qiziqqanlar", "Injenerlikka qiziquvchilar"],
    features: ["Loyihalar", "Mentor", "Amaliy laboratoriya"],
    icon: "bot",
    color: "#06b6d4",
    is_active: true,
    sort_order: 6,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  "kiberxavfsizlik-asoslari": {
    id: "a0000001-0000-4000-8000-000000000007",
    name: "Kiberxavfsizlik asoslari",
    slug: "kiberxavfsizlik-asoslari",
    description:
      "Parollar, phishing, zararli dasturlar, xavfsiz internet va ma’lumotlarni himoya qilish.",
    price: 850000,
    duration: "2 oy",
    level: "Boshlang‘ich",
    for_who: ["Barcha foydalanuvchilar", "Ofis va masofaviy ish"],
    features: ["Amaliy stsenariylar", "Zamonaviy tahdidlar", "Sertifikat"],
    icon: "shield",
    color: "#ec4899",
    is_active: true,
    sort_order: 7,
    created_at: "2026-01-01T00:00:00.000Z",
  },
};

export function mergeMissingCatalogCourses(courses: Course[]): Course[] {
  const map = new Map(courses.map((c) => [c.slug, c]));
  for (const [slug, row] of Object.entries(FALLBACK_SLUGS)) {
    if (!map.has(slug)) map.set(slug, row);
  }
  return [...map.values()].sort((a, b) => a.sort_order - b.sort_order);
}

/** Batafsil sahifa: DB da yo‘q bo‘lsa ham statik kurs */
export function getCourseFallbackBySlug(slug: string): Course | null {
  return FALLBACK_SLUGS[slug] ?? null;
}
