import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { getCourseFallbackBySlug } from "@/lib/marketing/course-fallbacks";
import { formatTimeDisplay } from "@/lib/format-time";
import { formatUzs } from "@/lib/format";
import type { Course, Group } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const supabase = createPublicSupabaseClient();
    const { data } = await supabase
      .from("courses")
      .select("name, description")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    const fb = getCourseFallbackBySlug(slug);
    const name = data?.name ?? fb?.name;
    const desc = data?.description ?? fb?.description;
    if (!name) return { title: "Kurs" };
    return {
      title: name,
      description: (desc ?? "").slice(0, 160),
    };
  } catch {
    return { title: "Kurs" };
  }
}

export default async function KursDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();
  const { data: row } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  const c = (row as Course | null) ?? getCourseFallbackBySlug(slug);
  if (!c) notFound();
  const { data: groupRows } = await supabase
    .from("groups")
    .select("id, name, schedule, schedule_days, schedule_time, teacher")
    .eq("course_id", c.id)
    .eq("is_active", true)
    .order("name", { ascending: true });
  const groups = (groupRows ?? []) as Pick<
    Group,
    "id" | "name" | "schedule" | "schedule_days" | "schedule_time" | "teacher"
  >[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      
      {/* Breadcrumbs */}
      <nav className="text-xs font-mono uppercase tracking-wider text-slate-500">
        <Link href="/kurslar" className="text-[#39ff14] hover:underline">
          &gt;_ Kurslar
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">{c.name}</span>
      </nav>

      {/* Main Terminal detail node */}
      <article
        className="cyber-card mt-8 p-8 font-mono group"
        style={{ borderTopWidth: 4, borderTopColor: c.color ?? "#39ff14" }}
      >
        {/* Cyber corner brackets */}
        <div className="absolute top-0 right-0 h-3 w-3 border-t border-r border-[#39ff14]/30 group-hover:border-[#39ff14]" />
        <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-[#39ff14]/30 group-hover:border-[#39ff14]" />

        <h1 className="text-2xl font-black text-white group-hover:text-[#39ff14] transition uppercase tracking-wide">
          {c.name}
        </h1>
        <p className="mt-4 text-xs font-mono text-slate-400 leading-relaxed font-light">
          // DESCRIPTION: {c.description}
        </p>

        <dl className="mt-8 grid gap-6 text-xs sm:grid-cols-2">
          <div className="border-b border-white/5 pb-4">
            <dt className="text-slate-500 uppercase font-black">Narxi</dt>
            <dd className="mt-1.5 text-lg font-black text-[#39ff14]">
              {formatUzs(Number(c.price))}
            </dd>
          </div>
          <div className="border-b border-white/5 pb-4">
            <dt className="text-slate-500 uppercase font-black">Davomiyligi</dt>
            <dd className="mt-1.5 text-lg font-black text-white">{c.duration}</dd>
          </div>
          {c.level ? (
            <div className="border-b border-white/5 pb-4">
              <dt className="text-slate-500 uppercase font-black">Darajasi</dt>
              <dd className="mt-1.5 font-bold text-slate-300">{c.level}</dd>
            </div>
          ) : null}
          <div className="border-b border-white/5 pb-4 sm:col-span-2">
            <dt className="text-slate-500 uppercase font-black">Kimlar uchun</dt>
            <dd className="mt-1.5 font-bold text-slate-300 leading-relaxed">
              {(c.for_who ?? []).length ? (c.for_who ?? []).join(" · ") : "—"}
            </dd>
          </div>
          {(c.features ?? []).length > 0 && (
            <div className="border-b border-white/5 pb-4 sm:col-span-2">
              <dt className="text-slate-500 uppercase font-black">Afzalliklari & Texnologiyalar</dt>
              <dd className="mt-2">
                <ul className="list-inside list-disc space-y-1.5 text-slate-400 font-light leading-relaxed">
                  {(c.features ?? []).map((f) => (
                    <li key={f} className="marker:text-[#39ff14]">{f}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          {groups.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-slate-500 uppercase font-black">Mavjud guruhlar & Jadval</dt>
              <dd className="mt-3 space-y-3 text-slate-300">
                {groups.map((g) => (
                  <div key={g.id} className="rounded-xl border border-white/5 bg-black/60 px-4 py-3 hover:border-[#39ff14]/30 transition duration-300 relative">
                    <div className="text-xs font-black text-white">{g.name}</div>
                    <div className="text-[10px] text-[#00D1FF] font-bold mt-1.5">
                      &gt;_ {(g.schedule_days ?? []).length
                        ? `${(g.schedule_days ?? []).join(", ")}${formatTimeDisplay(g.schedule_time) ? ` · ${formatTimeDisplay(g.schedule_time)}` : ""}`
                        : (g.schedule ?? "Jadval kiritilmagan")}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {g.teacher ? `O‘qituvchi: ${g.teacher}` : "O‘qituvchi belgilanmagan"}
                    </div>
                  </div>
                ))}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/ariza?free=1"
            className="inline-flex rounded-xl bg-[#39ff14] px-6 py-3 text-xs font-black text-black uppercase tracking-wider transition hover:brightness-110 shadow-lg shadow-[#39ff14]/20"
          >
            Bepul darsga yozilish
          </Link>
          <Link
            href="/ariza"
            className="inline-flex rounded-xl border border-[#39ff14]/30 bg-black/40 px-6 py-3 text-xs font-bold text-[#39ff14] uppercase tracking-wider transition hover:bg-[#39ff14]/10"
          >
            Ariza qoldirish
          </Link>
        </div>
      </article>
    </div>
  );
}
