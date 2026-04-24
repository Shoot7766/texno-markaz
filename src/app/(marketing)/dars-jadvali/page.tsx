import Link from "next/link";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { Group } from "@/lib/types";

type PublicGroup = Pick<
  Group,
  "id" | "name" | "course_id" | "schedule" | "schedule_days" | "schedule_time" | "teacher" | "is_active"
> & {
  courses?: { name: string | null; slug: string | null } | null;
};

type PublicStudent = {
  group_id: string;
  student_id: string;
  student_name: string;
};

const weekDays = ["Du", "Se", "Chor", "Pay", "Juma", "Shan", "Yak"];

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

  const groups = (groupsData ?? []) as PublicGroup[];
  const students = (studentsData ?? []) as PublicStudent[];
  const studentsByGroup = students.reduce(
    (acc, s) => {
      acc[s.group_id] = (acc[s.group_id] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const groupsByDay: Record<string, PublicGroup[]> = Object.fromEntries(weekDays.map((d) => [d, []]));
  groups.forEach((g) => {
    const days = g.schedule_days?.length ? g.schedule_days : [];
    if (days.length === 0) {
      groupsByDay.Du.push(g);
      return;
    }
    days.forEach((d) => {
      if (groupsByDay[d]) groupsByDay[d].push(g);
    });
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Dars jadvali</h1>
      <p className="mt-2 text-slate-400">
        Haftalik jadval. Guruh kartasiga kirib yo‘nalish va o‘quvchilar ro‘yxatini ko‘rishingiz mumkin.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-7">
        {weekDays.map((day) => (
          <section key={day} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <h2 className="rounded-lg bg-white/5 px-2 py-1 text-center text-xs font-semibold uppercase text-[#00D1FF]">
              {day}
            </h2>
            <div className="mt-3 space-y-3">
              {(groupsByDay[day] ?? []).map((g) => (
                <Link
                  key={`${day}-${g.id}`}
                  href={`/dars-jadvali/${g.id}`}
                  className="block rounded-xl border border-white/10 bg-[#0f1528] p-3 transition hover:border-[#00D1FF]/35"
                >
                  <p className="text-sm font-semibold text-white">{g.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{g.courses?.name ?? "Yo‘nalish belgilanmagan"}</p>
                  <p className="mt-2 text-xs text-emerald-300">
                    {g.schedule_time || g.schedule || "Vaqt kiritilmagan"}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">O‘quvchi: {studentsByGroup[g.id] ?? 0}</p>
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
  );
}

