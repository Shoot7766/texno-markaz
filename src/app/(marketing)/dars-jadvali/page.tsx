import Link from "next/link";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { pickNestedCourse, type NestedCourseField } from "@/lib/marketing/nested-course";
import { partitionGroupsByWeekDays, WEEKDAY_SHORT_UZ } from "@/lib/marketing/week-schedule";
import type { Group } from "@/lib/types";

type PublicGroup = Pick<
  Group,
  "id" | "name" | "course_id" | "schedule" | "schedule_days" | "schedule_time" | "teacher" | "is_active"
> & {
  courses?: NestedCourseField;
};

type PublicStudent = {
  group_id: string;
  student_id: string;
  student_name: string;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dars jadvali",
  description: "Haftalik dars jadvali, guruhlar va o‘quvchilar ro‘yxati.",
};

export default async function DarsJadvaliPage() {
  const supabase = createPublicSupabaseClient();
  const [{ data: groupsData }, { data: studentsData }] = await Promise.all([
    supabase
      .from("groups")
      .select("id, name, course_id, schedule, schedule_days, schedule_time, teacher, is_active, courses(name, slug)")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase.rpc("get_public_group_students", { p_group_id: null }),
  ]);

  const groups = (groupsData ?? []) as unknown as PublicGroup[];
  const students = (studentsData ?? []) as PublicStudent[];
  const studentsByGroup = students.reduce(
    (acc, s) => {
      acc[s.group_id] = (acc[s.group_id] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const { byDay: groupsByDay, unscheduled: groupsWithoutDays } = partitionGroupsByWeekDays(groups);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Dars jadvali</h1>
      <p className="mt-2 text-slate-400">
        Hafta kunlari belgilangan guruhlar ustunlarda. Kunlarni o‘zingiz tanlamasangiz yoki faqat matn yozsangiz,
        guruhlar pastdagi blokda bir marta ko‘rinadi — har hafta jadvalni admin panelda yangilashingiz mumkin.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        <strong className="font-medium text-slate-400">O‘quvchi soni nima uchun 0?</strong> Son faqat shu guruhga
        admin panelda biriktirilgan, holati «faol» bo‘lgan o‘quvchilarni sanaydi. Agar o‘quvchi «Guruhsiz» yoki
        boshqa guruhda bo‘lsa, bu yerda 0 ko‘rinadi —{" "}
        <span className="text-slate-400">Admin → O‘quvchilar → Tahrirlash → Guruhni tanlang.</span>
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <div className="grid gap-3 lg:grid-cols-7">
        {WEEKDAY_SHORT_UZ.map((day) => (
          <section key={day} className="rounded-xl border border-white/10 bg-[#0f1528]/70 p-2.5">
            <h2 className="rounded-md bg-white/5 px-2 py-1 text-center text-[11px] font-semibold uppercase text-[#00D1FF]">
              {day}
            </h2>
            <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-500">Darslar</p>
            <div className="mt-2 space-y-2">
              {(groupsByDay[day] ?? []).map((g) => (
                <Link
                  key={`${day}-${g.id}`}
                  href={`/dars-jadvali/${g.id}`}
                  className="block rounded-lg border border-white/10 bg-[#111a30] p-2 transition hover:border-[#00D1FF]/35"
                >
                  <p className="text-xs font-semibold text-white">{g.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Yo‘nalish: {pickNestedCourse(g.courses)?.name ?? "Belgilanmagan"}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-300">
                    {g.schedule_time || g.schedule || "Vaqt kiritilmagan"}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">O‘quvchi soni: {studentsByGroup[g.id] ?? 0}</p>
                </Link>
              ))}
              {(groupsByDay[day] ?? []).length === 0 && (
                <p className="rounded-lg border border-dashed border-white/10 px-3 py-5 text-center text-xs text-slate-500">
                  Dars yo‘q
                </p>
              )}
            </div>
          </section>
        ))}
        </div>
      </div>

      {groupsWithoutDays.length > 0 && (
        <section className="mt-10 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
          <h2 className="text-sm font-semibold text-amber-200/90">Kunlar belgilanmagan</h2>
          <p className="mt-1 text-xs text-slate-400">
            Bu guruhlar hafta ustunlariga qo‘yilmagan — jadval matni yoki admin paneldagi yozuv bo‘yicha har hafta
            moslashtirasiz.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {groupsWithoutDays.map((g) => (
              <Link
                key={g.id}
                href={`/dars-jadvali/${g.id}`}
                className="block rounded-lg border border-white/10 bg-[#111a30] p-3 transition hover:border-[#00D1FF]/35"
              >
                <p className="text-xs font-semibold text-white">{g.name}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Yo‘nalish: {pickNestedCourse(g.courses)?.name ?? "Belgilanmagan"}
                </p>
                <p className="mt-1 text-[11px] text-emerald-300">
                  {g.schedule_time || g.schedule || "Vaqt / jadval kiritilmagan"}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">O‘quvchi soni: {studentsByGroup[g.id] ?? 0}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

