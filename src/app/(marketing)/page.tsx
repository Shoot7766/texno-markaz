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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,209,255,0.18),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(108,99,255,0.15),transparent)]" />

        <div className="relative mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl p-[1px] tm-hero-border">
            <div className="relative rounded-3xl bg-[#0d1324]/95 px-6 py-12 sm:px-10 sm:py-16 tm-ring-glow tm-glow">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#00D1FF]/10 blur-3xl animate-glow-pulse" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#6C63FF]/15 blur-3xl" />

              <p className="inline-flex items-center gap-2 rounded-full border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#00D1FF]">
                <Zap className="h-3.5 w-3.5" />
                Cheklangan joylar
              </p>

              <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
                <span className="bg-gradient-to-r from-[#00D1FF] via-white to-[#6C63FF] bg-clip-text text-transparent">
                  Birinchi dars — BEPUL!
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
                IT va kompyuter yo‘nalishlarida ilk darsingizni bepul boshlang. Mentorlar, zamonaviy dasturlar va
                amaliy mashg‘ulotlar — xavfsiz sinov, keyin qaror.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-slate-300">
                  <Clock className="h-4 w-4 text-[#6C63FF]" />
                  Joylar soni cheklangan
                </span>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/ariza?free=1"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00D1FF] to-[#6C63FF] px-8 py-4 text-base font-bold text-[#0B0F1A] shadow-xl shadow-cyan-500/25 transition hover:brightness-110"
                >
                  Bepul darsga yozilish
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/kurslar"
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-200 backdrop-blur transition hover:border-[#00D1FF]/40 hover:bg-white/10"
                >
                  Kurslarni ko‘rish
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qisqa yo‘nalishlar */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-[#6C63FF]">
          Mashhur yo‘nalishlar
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {FEATURED_SLUGS.map(({ slug, label, Icon }) => {
            const c = courseBySlug[slug];
            const href = c ? `/kurslar/${slug}` : "/ariza";
            return (
              <Link
                key={slug}
                href={href}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#00D1FF]/35 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#00D1FF]/20 to-[#6C63FF]/20 text-[#00D1FF] transition group-hover:from-[#00D1FF]/30 group-hover:to-[#6C63FF]/30">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 font-semibold text-white">{c?.name ?? label}</p>
                <p className="mt-1 text-xs text-slate-500">Batafsil →</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-white">Nega biz?</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Amaliy darslar",
              desc: "Har dars — mashg‘ulot va vazifalar, real vaziyatlar.",
              icon: Cpu,
            },
            {
              title: "Ishga yordam",
              desc: "Rezyume, portfolio va suhbatga tayyorlash.",
              icon: Briefcase,
            },
            {
              title: "AI bilan o‘qitish",
              desc: "Zamonaviy vositalar va avtomatlashtirish.",
              icon: Sparkles,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 tm-ring-glow transition hover:border-[#00D1FF]/25"
            >
              <item.icon className="h-8 w-8 text-[#00D1FF]" />
              <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#080d18]/80 py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-white">Raqamlarda</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-500">
            Admin panel orqali yangilanadi (Sozlamalar → Bosh sahifa statistikasi).
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            <div className="text-center">
              <FileText className="mx-auto h-8 w-8 text-[#00D1FF]" />
              <p className="mt-3 text-2xl font-bold tabular-nums text-white sm:text-3xl">
                {stats?.applications_count ?? "—"}
              </p>
              <p className="text-xs text-slate-500 sm:text-sm">Arizalar</p>
            </div>
            <div className="text-center">
              <Users className="mx-auto h-8 w-8 text-[#6C63FF]" />
              <p className="mt-3 text-2xl font-bold tabular-nums text-white sm:text-3xl">
                {stats?.active_students_count ?? "—"}
              </p>
              <p className="text-xs text-slate-500 sm:text-sm">Faol o‘quvchilar</p>
            </div>
            <div className="text-center">
              <UserCircle className="mx-auto h-8 w-8 text-[#00D1FF]" />
              <p className="mt-3 text-2xl font-bold tabular-nums text-white sm:text-3xl">
                {stats?.students_count ?? "—"}
              </p>
              <p className="text-xs text-slate-500 sm:text-sm">Jami o‘quvchilar</p>
            </div>
            <div className="text-center">
              <GraduationCap className="mx-auto h-8 w-8 text-emerald-400" />
              <p className="mt-3 text-2xl font-bold tabular-nums text-white sm:text-3xl">
                {stats?.graduated_count ?? "—"}
              </p>
              <p className="text-xs text-slate-500 sm:text-sm">Bitirganlar</p>
            </div>
            <div className="text-center">
              <Briefcase className="mx-auto h-8 w-8 text-violet-400" />
              <p className="mt-3 text-2xl font-bold tabular-nums text-white sm:text-3xl">
                {stats?.employed_count ?? "—"}
              </p>
              <p className="text-xs text-slate-500 sm:text-sm">Ishga joylashganlar</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">0 dan IT kasb o‘rgan</h2>
            <p className="mt-1 text-sm text-slate-500">Tanlangan kurslar</p>
          </div>
          <Link href="/kurslar" className="text-sm font-medium text-[#00D1FF] transition hover:text-[#6C63FF]">
            Barchasi
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.length === 0 ? (
            <p className="col-span-full text-sm text-slate-500">
              Ma&apos;lumotlar bazasiga ulaning — kurslar shu yerda chiqadi.
            </p>
          ) : (
            courses.slice(0, 6).map((c) => (
              <article
                key={c.id}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#00D1FF]/30"
                style={{ borderTopWidth: 3, borderTopColor: c.color ?? "#00D1FF" }}
              >
                <h3 className="font-semibold text-white">
                  <Link href={`/kurslar/${c.slug}`} className="transition hover:text-[#00D1FF]">
                    {c.name}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-400">{c.description}</p>
                <p className="mt-4 text-sm font-semibold text-[#00D1FF]">{formatUzs(Number(c.price))}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
                  <Link href={`/kurslar/${c.slug}`} className="text-slate-400 hover:text-white">
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
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Dars jadvali</h2>
            <p className="mt-1 text-sm text-slate-500">
              Guruhlar jadvalini kunlar bo‘yicha ko‘rish (faqat ko‘rish rejimi).
            </p>
          </div>
          <Link href="/dars-jadvali" className="text-sm font-medium text-[#00D1FF] transition hover:text-[#6C63FF]">
            To‘liq jadval
          </Link>
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="grid gap-3 lg:grid-cols-7">
          {WEEKDAY_SHORT_UZ.map((day) => (
            <section key={day} className="rounded-xl border border-white/10 bg-[#0f1528]/70 p-2.5">
              <h3 className="rounded-md bg-white/5 px-2 py-1 text-center text-[11px] font-semibold uppercase text-[#00D1FF]">
                {day}
              </h3>
              <div className="mt-3 space-y-2">
                {(groupsByDay[day] ?? []).map((g) => {
                  const course = courses.find((c) => c.id === g.course_id);
                  const scheduleLine = getTimeForDay(g.schedule_time, day) || g.schedule || "Vaqt kiritilmagan";
                  return (
                    <div
                      key={`${day}-${g.id}`}
                      className="rounded-lg border border-white/10 bg-[#111a30] p-2"
                    >
                      <p className="text-xs font-semibold text-white">{g.name}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {course?.name ?? "Yo‘nalish belgilanmagan"}
                      </p>
                      <p className="mt-1 text-[11px] text-emerald-300">{scheduleLine}</p>
                    </div>
                  );
                })}
                {(groupsByDay[day] ?? []).length === 0 && (
                  <p className="rounded-lg border border-dashed border-white/10 px-2 py-4 text-center text-xs text-slate-500">
                    Dars yo‘q
                  </p>
                )}
              </div>
            </section>
          ))}
          </div>
        </div>

        {groupsWithoutDays.length > 0 && (
          <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
            <h3 className="text-sm font-semibold text-amber-200/90">Kunlar belgilanmagan</h3>
            <p className="mt-1 text-xs text-slate-400">
              Bu guruhlar hafta ustunlarida emas — jadvalni matn yoki admin panel orqali har hafta moslashtirasiz.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {groupsWithoutDays.map((g) => {
                const course = courses.find((c) => c.id === g.course_id);
                const scheduleLine = formatTimeDisplay(g.schedule_time) || g.schedule || "Vaqt kiritilmagan";
                return (
                  <div
                    key={g.id}
                    className="rounded-lg border border-white/10 bg-[#111a30] p-2"
                  >
                    <p className="text-xs font-semibold text-white">{g.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {course?.name ?? "Yo‘nalish belgilanmagan"}
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-300">{scheduleLine}</p>
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
