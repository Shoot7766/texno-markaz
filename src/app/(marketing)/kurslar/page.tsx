import Link from "next/link";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { mergeMissingCatalogCourses } from "@/lib/marketing/course-fallbacks";
import { formatTimeDisplay } from "@/lib/format-time";
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
      ? `${days}${formatTimeDisplay(g.schedule_time) ? ` · ${formatTimeDisplay(g.schedule_time)}` : ""}`
      : (g.schedule ?? "");
    if (!line) return;
    const prev = scheduleByCourseId.get(g.course_id);
    scheduleByCourseId.set(g.course_id, prev ? `${prev}; ${line}` : line);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      
      {/* Title */}
      <h1 className="text-3xl font-black font-mono uppercase tracking-wider text-white flex items-center gap-2.5">
        <span className="h-3 w-3 bg-[#39ff14] rounded-full animate-pulse" />
        Kurslar Arxivi
      </h1>
      <p className="mt-3 max-w-2xl font-mono text-xs text-slate-500 leading-relaxed">
        // FAOL O&apos;QUV KURS MODELLARI VA DIAGNOSTIK ALOQA TIZIMLARI.
        Har bir yo‘nalish amaliy sandbox simulyatorlari, real vaqtda ishlaydigan xakerlik laboratoriyasi va kiber-mentor qo‘llab-quvvatlashi bilan jihozlangan.
      </p>

      {/* Grid List */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {courses.map((c) => (
          <article
            key={c.id}
            className="cyber-card flex flex-col p-8 group font-mono"
            style={{ borderLeftWidth: 4, borderLeftColor: c.color ?? "#39ff14" }}
          >
            {/* Cyber Brackets */}
            <div className="absolute top-0 right-0 h-2.5 w-2.5 border-t border-r border-[#39ff14]/30 group-hover:border-[#39ff14]" />
            <div className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-[#39ff14]/30 group-hover:border-[#39ff14]" />

            {scheduleByCourseId.get(c.id) && (
              <p className="mb-2 text-xs font-mono font-bold text-[#00D1FF] uppercase tracking-wider">
                &gt;_ Dars kunlari: {scheduleByCourseId.get(c.id)}
              </p>
            )}
            <h2 className="text-xl font-mono font-bold text-white group-hover:text-[#39ff14] transition">{c.name}</h2>
            <p className="mt-3 text-xs font-mono text-slate-400 leading-relaxed">{c.description}</p>
            
            <dl className="mt-6 grid gap-3 text-xs font-mono sm:grid-cols-2">
              <div>
                <dt className="text-slate-500 uppercase font-black">Narxi</dt>
                <dd className="font-bold text-[#39ff14] mt-1">{formatUzs(Number(c.price))}</dd>
              </div>
              <div>
                <dt className="text-slate-500 uppercase font-black">Davomiyligi</dt>
                <dd className="font-bold text-white mt-1">{c.duration}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500 uppercase font-black">Kimlar uchun</dt>
                <dd className="mt-1 font-bold text-slate-300 leading-relaxed">
                  {(c.for_who ?? []).length ? (c.for_who ?? []).join(" · ") : "—"}
                </dd>
              </div>
            </dl>
            
            <div className="mt-8 flex flex-wrap gap-3 font-mono">
              <Link
                href={`/kurslar/${c.slug}`}
                className="inline-flex rounded-xl border border-[#39ff14]/30 bg-black/40 px-5 py-2.5 text-xs font-bold text-[#39ff14] uppercase tracking-wider transition hover:bg-[#39ff14]/10"
              >
                &gt;_ Batafsil
              </Link>
              <Link
                href="/ariza?free=1"
                className="inline-flex rounded-xl bg-[#39ff14] px-5 py-2.5 text-xs font-black text-black uppercase tracking-wider transition hover:brightness-110 shadow-lg shadow-[#39ff14]/20"
              >
                Yozilish
              </Link>
            </div>
          </article>
        ))}
      </div>
      
      {courses.length === 0 && (
        <p className="mt-8 text-xs font-mono text-slate-500">// Ma&apos;lumotlar bazasiga ulanish kutilmoqda...</p>
      )}
    </div>
  );
}
