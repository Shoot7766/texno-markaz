import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Bot,
  Cpu,
  GraduationCap,
  LayoutGrid,
  Shield,
  Sparkles,
  Users,
  UserCircle,
  Zap,
  Clock,
  FileText,
  Code2,
} from "lucide-react";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { mergeMissingCatalogCourses } from "@/lib/marketing/course-fallbacks";
import { partitionGroupsByWeekDays, WEEKDAY_SHORT_UZ } from "@/lib/marketing/week-schedule";
import { getTimeForDay, formatTimeDisplay } from "@/lib/format-time";
import { formatUzs } from "@/lib/format";
import type { Course, Group, Package, PublicStats } from "@/lib/types";

export const dynamic = "force-dynamic";

const FEATURED_SLUGS: { slug: string; label: string; Icon: typeof Cpu }[] = [
  { slug: "kompyuter-savodxonligi", label: "Kompyuter savodxonligi", Icon: Cpu },
  { slug: "web-dasturlash", label: "Dasturlash", Icon: Code2 },
  { slug: "microsoft-office", label: "Office", Icon: LayoutGrid },
  { slug: "ai-asoslari", label: "AI", Icon: Sparkles },
  { slug: "robototexnika", label: "Robototexnika", Icon: Bot },
  { slug: "kiberxavfsizlik-asoslari", label: "Kiberxavfsizlik", Icon: Shield },
];

async function load() {
  try {
    const supabase = createPublicSupabaseClient();
    const [coursesRes, packagesRes, statsRes, groupsRes] = await Promise.all([
      supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("packages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(4),
      supabase.from("public_stats").select("*").limit(1).maybeSingle(),
      supabase
        .from("groups")
        .select("id, name, course_id, schedule, schedule_days, schedule_time, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true }),
    ]);
    const allCourses = mergeMissingCatalogCourses((coursesRes.data ?? []) as Course[]);
    return {
      courses: allCourses.slice(0, 8),
      packages: (packagesRes.data ?? []) as Package[],
      stats: (statsRes.data ?? null) as PublicStats | null,
      groups: (groupsRes.data ?? []) as Pick<
        Group,
        "id" | "name" | "course_id" | "schedule" | "schedule_days" | "schedule_time" | "is_active"
      >[],
      courseBySlug: Object.fromEntries(allCourses.map((c) => [c.slug, c])) as Record<string, Course>,
    };
  } catch {
    const fb = mergeMissingCatalogCourses([]);
    return {
      courses: fb.slice(0, 8),
      packages: [],
      stats: null,
      groups: [],
      courseBySlug: Object.fromEntries(fb.map((c) => [c.slug, c])) as Record<string, Course>,
    };
  }
}

export default async function HomePage() {
  const { courses, packages, stats, groups, courseBySlug } = await load();
  const { byDay: groupsByDay, unscheduled: groupsWithoutDays } = partitionGroupsByWeekDays(groups);

  return (
    <div className="overflow-hidden">
      {/* Asosiy: Bepul dars */}
      <section className="relative px-4 pb-12 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(57,255,20,0.06),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(0,209,255,0.05),transparent)]" />

        <div className="relative mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl p-[1px] tm-hero-border shadow-[0_0_40px_rgba(57,255,20,0.05)]">
            <div className="relative rounded-3xl bg-[#05070c]/90 px-6 py-12 sm:px-10 sm:py-16 border border-[#39ff14]/20 backdrop-blur-xl">
              
              {/* Digital scanner grids */}
              <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-[#39ff14]" />
              <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-[#39ff14]" />
              <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#39ff14]" />
              <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#39ff14]" />

              <p className="inline-flex items-center gap-2 rounded-full border border-[#39ff14]/30 bg-[#39ff14]/5 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                <Zap className="h-3.5 w-3.5 animate-pulse" />
                SYSTEM ACCESS // ACTIVE
              </p>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl font-mono uppercase">
                <span className="bg-gradient-to-r from-[#39ff14] via-white to-[#00D1FF] bg-clip-text text-transparent cyber-glitch-text">
                  Birinchi dars — BEPUL!
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-sm font-mono text-slate-400 sm:text-base leading-relaxed">
                // Kiberxavfsizlik va zamonaviy IT yo‘nalishlarida ilk darsingizni mutlaqo bepul boshlang. 
                Haqiqiy xakerlik sandbox simulyatorlari, professional o‘quv mentorlari va xavfsiz laboratoriya muhiti sizni kutmoqda.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 text-slate-300 font-mono">
                  <Clock className="h-4 w-4 text-[#00D1FF]" />
                  &gt;_ JOYLAR SONI CHEKLANGAN
                </span>
              </div>

              <div className="mt-10 flex flex-wrap gap-4 font-mono">
                <Link
                  href="/ariza?free=1"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#39ff14] px-8 py-4 text-sm font-black text-black uppercase tracking-wider transition hover:brightness-110 shadow-lg shadow-[#39ff14]/25"
                >
                  Bepul darsga kirish
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/kurslar"
                  className="inline-flex items-center rounded-xl border border-[#39ff14]/30 bg-black/40 px-6 py-4 text-sm font-bold text-[#39ff14] uppercase tracking-wider backdrop-blur transition hover:bg-[#39ff14]/10"
                >
                  &gt;_ Kurslar arxivi
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qisqa yo‘nalishlar */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="text-center text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#00D1FF] flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00D1FF] animate-ping" />
          Kiber Modullar Arxivi
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {FEATURED_SLUGS.map(({ slug, label, Icon }) => {
            const c = courseBySlug[slug];
            const href = c ? `/kurslar/${slug}` : "/ariza";
            return (
              <Link
                key={slug}
                href={href}
                className="group relative flex flex-col rounded-xl border border-white/5 bg-black/60 p-5 transition hover:border-[#39ff14]/40 hover:shadow-lg hover:shadow-[#39ff14]/5 font-mono"
              >
                <div className="absolute top-0 right-0 h-1.5 w-1.5 border-t border-r border-[#39ff14]/20 group-hover:border-[#39ff14]" />
                <div className="absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l border-[#39ff14]/20 group-hover:border-[#39ff14]" />
                
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#39ff14]/10 to-[#00D1FF]/10 border border-[#39ff14]/20 text-[#39ff14] transition group-hover:bg-[#39ff14]/20">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 font-bold text-white text-xs leading-snug group-hover:text-[#39ff14] transition">{c?.name ?? label}</p>
                <p className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">&gt;_ Yuklash...</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Nega biz Section */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="text-center text-xl font-mono font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#39ff14] animate-pulse" />
          Terminal Xarakteristikalari
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Amaliy Sandbox Laboratoriyasi",
              desc: "Har bir nazariy dars uchun in-browser xavfsiz sandbox muhiti, kod terminallari va amaliy vazifalar.",
              icon: Cpu,
            },
            {
              title: "Ishga Joylashish Protokoli",
              desc: "Bitiruvchilarni portfoliolarini tayyorlash, mock suhbatlardan o'tkazish va hamkor kompaniyalarga taqdim etish.",
              icon: Briefcase,
            },
            {
              title: "Sun'iy Intellekt Integratsiyasi",
              desc: "Darslarni o'zlashtirishda AI-kiber mentor tizimi bilan real vaqtda maslahatlashish va kod tahlili.",
              icon: Sparkles,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="relative rounded-2xl border border-white/5 bg-black/45 p-6 font-mono group hover:border-[#39ff14]/30 transition duration-300"
            >
              <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-[#39ff14]/20 group-hover:border-[#39ff14]" />
              <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-[#39ff14]/20 group-hover:border-[#39ff14]" />

              <item.icon className="h-8 w-8 text-[#00D1FF] group-hover:text-[#39ff14] transition duration-300" />
              <h3 className="mt-4 font-bold text-white text-sm uppercase tracking-wide">{item.title}</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Raqamlarda - diagnostics stats */}
      <section className="border-y border-[#39ff14]/15 bg-[#05070c]/90 py-14 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-xl font-mono font-bold uppercase tracking-wider text-white">
            Tizim Statistikasi & Data Paketlari
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-xs font-mono text-slate-500">
            [STATUS: UPDATED // DB SECURE CONNECTION ESTABLISHED]
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5 font-mono">
            <div className="text-center p-4 border border-white/5 bg-black/45 rounded-xl">
              <FileText className="mx-auto h-7 w-7 text-[#00D1FF]" />
              <p className="mt-3 text-xl font-black tabular-nums text-white sm:text-2xl tracking-wide">
                {stats?.applications_count ?? "0"}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Arizalar.LOG</p>
            </div>
            <div className="text-center p-4 border border-white/5 bg-black/45 rounded-xl">
              <Users className="mx-auto h-7 w-7 text-[#39ff14]" />
              <p className="mt-3 text-xl font-black tabular-nums text-[#39ff14] sm:text-2xl tracking-wide">
                {stats?.active_students_count ?? "0"}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Students.SYS</p>
            </div>
            <div className="text-center p-4 border border-white/5 bg-black/45 rounded-xl">
              <UserCircle className="mx-auto h-7 w-7 text-[#00D1FF]" />
              <p className="mt-3 text-xl font-black tabular-nums text-white sm:text-2xl tracking-wide">
                {stats?.students_count ?? "0"}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">TOTAL_USERS.DB</p>
            </div>
            <div className="text-center p-4 border border-white/5 bg-black/45 rounded-xl">
              <GraduationCap className="mx-auto h-7 w-7 text-emerald-400" />
              <p className="mt-3 text-xl font-black tabular-nums text-emerald-400 sm:text-2xl tracking-wide">
                {stats?.graduated_count ?? "0"}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">GRADUATED.BIN</p>
            </div>
            <div className="text-center p-4 border border-white/5 bg-black/45 rounded-xl">
              <Briefcase className="mx-auto h-7 w-7 text-violet-400" />
              <p className="mt-3 text-xl font-black tabular-nums text-violet-400 sm:text-2xl tracking-wide">
                {stats?.employed_count ?? "0"}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">EMPLOYED.DAT</p>
            </div>
          </div>
        </div>
      </section>

      {/* Kurslar Arxivi list */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#39ff14] animate-pulse" />
              0 dan IT kasb o‘rgan
            </h2>
            <p className="mt-1 text-xs font-mono text-slate-500">// FAOL O&apos;QUV KURS NODELARI</p>
          </div>
          <Link href="/kurslar" className="text-xs font-mono font-bold uppercase text-[#00D1FF] transition hover:text-[#39ff14]">
            &gt;_ Barcha modullar
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.length === 0 ? (
            <p className="col-span-full text-xs font-mono text-slate-500">
              // Ma&apos;lumotlar bazasiga ulaning kutilmoqda...
            </p>
          ) : (
            courses.slice(0, 6).map((c) => (
              <article
                key={c.id}
                className="cyber-card flex flex-col p-5 group font-mono"
                style={{ borderTopWidth: 3, borderTopColor: c.color ?? "#39ff14" }}
              >
                <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-[#39ff14]/30 group-hover:border-[#39ff14]" />
                <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-[#39ff14]/30 group-hover:border-[#39ff14]" />
                
                <h3 className="font-mono font-bold text-white group-hover:text-[#39ff14] transition">
                  <Link href={`/kurslar/${c.slug}`} className="transition">
                    {c.name}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-xs text-slate-400 font-mono leading-relaxed">{c.description}</p>
                <p className="mt-4 text-xs font-mono font-black text-[#39ff14] tracking-wider uppercase">
                  {formatUzs(Number(c.price))}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono font-bold">
                  <Link href={`/kurslar/${c.slug}`} className="text-slate-400 hover:text-white transition">
                    &gt;_ Batafsil
                  </Link>
                  <Link href="/ariza" className="text-[#00D1FF] hover:text-[#39ff14] transition">
                    &gt;_ Ariza
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Weekly Schedule Grid */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#39ff14] animate-pulse" />
              Dars jadvali
            </h2>
            <p className="mt-1 text-xs font-mono text-slate-500">
              // TERMINAL NODELARIDAGI HAFTALIK FAQAT KO&apos;RISH REJIMIDAGI JADVAL
            </p>
          </div>
          <Link href="/dars-jadvali" className="text-xs font-mono font-bold uppercase text-[#00D1FF] transition hover:text-[#39ff14]">
            &gt;_ To‘liq jadval.LOG
          </Link>
        </div>
        <div className="mt-6 rounded-2xl border border-[#39ff14]/15 bg-black/60 p-4 backdrop-blur-xl">
          <div className="grid gap-3 lg:grid-cols-7">
          {WEEKDAY_SHORT_UZ.map((day: string) => (
            <section key={day} className="rounded-xl border border-white/5 bg-[#05070c]/70 p-2.5 font-mono">
              <h3 className="rounded-md bg-[#39ff14]/10 border border-[#39ff14]/20 px-2 py-1 text-center text-[10px] font-mono font-black uppercase text-[#39ff14]">
                {day}
              </h3>
              <div className="mt-3 space-y-2">
                {(groupsByDay[day] ?? []).map((g: any) => {
                  const course = courses.find((c) => c.id === g.course_id);
                  const scheduleLine = getTimeForDay(g.schedule_time, day) || g.schedule || "Vaqt kiritilmagan";
                  return (
                    <div
                      key={`${day}-${g.id}`}
                      className="rounded-lg border border-white/5 bg-[#05070c]/90 p-2 relative group hover:border-[#39ff14]/30 transition duration-300"
                    >
                      <p className="text-xs font-mono font-bold text-white leading-tight">{g.name}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500 font-mono truncate">
                        {course?.name ?? "Yo‘nalish belgilanmagan"}
                      </p>
                      <p className="mt-1 text-[10px] text-[#00D1FF] font-mono font-bold">{scheduleLine}</p>
                    </div>
                  );
                })}
                {(groupsByDay[day] ?? []).length === 0 && (
                  <p className="rounded-lg border border-dashed border-white/5 px-2 py-4 text-center text-[10px] text-slate-600 font-mono uppercase">
                    Null node
                  </p>
                )}
              </div>
            </section>
          ))}
          </div>
        </div>

        {groupsWithoutDays.length > 0 && (
          <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-4 font-mono">
            <h3 className="text-xs font-mono font-black uppercase tracking-wider text-amber-200/90 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              UNASSIGNED_KUNLAR_LIST
            </h3>
            <p className="mt-1 text-[10px] text-slate-500 leading-normal">
              // Bu guruhlar hafta ustunlarida emas — jadvalni matn yoki admin panel orqali har hafta moslashtirasiz.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {groupsWithoutDays.map((g: any) => {
                const course = courses.find((c) => c.id === g.course_id);
                const scheduleLine = formatTimeDisplay(g.schedule_time) || g.schedule || "Vaqt kiritilmagan";
                return (
                  <div
                    key={g.id}
                    className="rounded-lg border border-white/5 bg-[#05070c]/90 p-2 relative hover:border-amber-500/35 transition"
                  >
                    <p className="text-xs font-semibold text-white leading-tight">{g.name}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {course?.name ?? "Yo‘nalish belgilanmagan"}
                    </p>
                    <p className="mt-1 text-[10px] text-amber-400">{scheduleLine}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="border-t border-white/10 bg-[#080d18]/50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Paketlar</h2>
            <Link href="/paketlar" className="text-sm font-medium text-[#00D1FF] hover:text-[#6C63FF]">
              Barchasi
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {packages.length === 0 ? (
              <p className="text-sm text-slate-500">Paketlar ro‘yxati DB dan yuklanadi.</p>
            ) : (
              packages.map((p) => (
                <article
                  key={p.id}
                  className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#6C63FF]/30"
                >
                  {p.is_recommended && (
                    <span className="absolute right-4 top-4 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
                      Tavsiya
                    </span>
                  )}
                  <h3 className="pr-24 font-semibold text-white">
                    <Link href={`/paketlar/${p.slug}`} className="hover:text-[#00D1FF]">
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">{p.description}</p>
                  <div className="mt-4 flex flex-wrap items-baseline gap-2">
                    <span className="text-lg font-bold text-[#00D1FF]">{formatUzs(Number(p.price))}</span>
                    {p.original_price > p.price && (
                      <span className="text-sm text-slate-600 line-through">
                        {formatUzs(Number(p.original_price))}
                      </span>
                    )}
                  </div>
                  {p.bonus ? <p className="mt-2 text-sm text-emerald-400/90">Bonus: {p.bonus}</p> : null}
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
                    <Link href={`/paketlar/${p.slug}`} className="text-slate-400 hover:text-white">
                      Batafsil
                    </Link>
                    <Link href="/ariza" className="text-[#6C63FF] hover:text-[#00D1FF]">
                      Ariza
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
