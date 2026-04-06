import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { ArizaForm } from "@/components/marketing/ariza-form";
import type { Course, Package } from "@/lib/types";

export const metadata = {
  title: "Ariza",
  description: "Kurs yoki paketga yozilish uchun ariza qoldiring.",
};

type Props = {
  searchParams: Promise<{ free?: string }>;
};

export default async function ArizaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const isFree = sp.free === "1" || sp.free === "true";

  let options: string[] = [
    "Kompyuter savodxonligi",
    "Grafik dizayn",
    "Web dasturlash",
    "AI asoslari",
    "Kompyuter + Dizayn",
    "Dizayn + AI",
    "Web + AI",
    "Full IT Start",
  ];

  try {
    const supabase = createPublicSupabaseClient();
    const [c, p] = await Promise.all([
      supabase.from("courses").select("name").eq("is_active", true),
      supabase.from("packages").select("name").eq("is_active", true),
    ]);
    const names = [
      ...((c.data ?? []) as Pick<Course, "name">[]).map((x) => x.name),
      ...((p.data ?? []) as Pick<Package, "name">[]).map((x) => x.name),
    ];
    if (names.length) options = [...new Set(names)];
  } catch {
    /* default options */
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">
        {isFree ? "Bepul darsga yozilish" : "Ariza qoldirish"}
      </h1>
      <p className="mt-3 max-w-xl text-slate-400">
        Maydonlarni to‘ldiring. Ma’lumotlaringiz xavfsiz saqlanadi; faqat markaz mutaxassislari
        ko‘radi.
      </p>
      <div className="mt-10 animate-fade-in">
        <ArizaForm key={isFree ? "free" : "std"} options={options} isFreeLesson={isFree} />
      </div>
    </div>
  );
}
