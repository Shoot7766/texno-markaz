import Link from "next/link";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { mergeMissingCatalogCourses } from "@/lib/marketing/course-fallbacks";
import { formatUzs } from "@/lib/format";
import type { Course, Group } from "@/lib/types";

export const metadata = {
  title: "Kurslar",
  description: "Kompyuter savodxonligi, grafik dizayn, web dasturlash, AI asoslari.",
};

export default async function KurslarPage() {
  let courses: Course[] = [];
  let groups: Pick<Group, "course_id" | "schedule" | "schedule_days" | "schedule_time" | "is_active">[] = [];
  try {
    const supabase = createPublicSupabaseClient();
    const [{ data: courseData }, { data: groupData }] = await Promise.all([
      supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("groups")
        .select("course_id, schedule, schedule_days, schedule_time, is_active")
        .eq("is_active", true),
    ]);
    courses = mergeMissingCatalogCourses((courseData ?? []) as Course[]);
    groups = (groupData ?? []) as Pick<
      Group,
      "course_id" | "schedule" | "schedule_days" | "schedule_time" | "is_active"
    >[];
  } catch {
    courses = mergeMissingCatalogCourses([]);
  }
  const scheduleByCourseId = new Map<string, string>();
  groups.forEach((g) => {
    if (!g.course_id) return;
    const days = (g.schedule_days ?? []).join(", ");
    const line = days
      ? `${days}${g.schedule_time ? ` · ${g.schedule_time}` : ""}`
      : (g.schedule ?? "");
    if (!line) return;
    const prev = scheduleByCourseId.get(g.course_id);
    scheduleByCourseId.set(g.course_id, prev ? `${prev}; ${line}` : line);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Kurslar</h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        Har bir yo‘nalish amaliy mashg‘ulotlar va mentor qo‘llab-quvvatlash bilan.
      </p>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {courses.map((c) => (
          <article
            key={c.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-[#00D1FF]/25"
            style={{ borderLeftWidth: 4, borderLeftColor: c.color ?? "#00D1FF" }}
          >
            {scheduleByCourseId.get(c.id) && (
              <p className="mb-2 text-xs font-medium text-emerald-300">
                Dars kunlari: {scheduleByCourseId.get(c.id)}
              </p>
            )}
            <h2 className="text-xl font-semibold text-white">{c.name}</h2>
            <p className="mt-3 text-slate-400">{c.description}</p>
            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Narx</dt>
                <dd className="font-semibold text-[#00D1FF]">{formatUzs(Number(c.price))}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Davomiylik</dt>
                <dd className="font-semibold text-white">{c.duration}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Kimlar uchun</dt>
                <dd className="mt-1 text-slate-300">
                  {(c.for_who ?? []).length ? (c.for_who ?? []).join(" · ") : "—"}
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/kurslar/${c.slug}`}
                className="inline-flex rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-[#00D1FF]/40"
              >
                Batafsil
              </Link>
              <Link
                href="/ariza?free=1"
                className="inline-flex rounded-full bg-gradient-to-r from-[#00D1FF] to-[#6C63FF] px-5 py-2.5 text-sm font-semibold text-[#0B0F1A] hover:brightness-110"
              >
                Ariza qoldirish
              </Link>
            </div>
          </article>
        ))}
      </div>
      {courses.length === 0 && (
        <p className="mt-8 text-slate-500">Supabase migratsiyasini ishga tushiring.</p>
      )}
    </div>
  );
}
