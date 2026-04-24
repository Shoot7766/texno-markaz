import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { pickNestedCourse, type NestedCourseField } from "@/lib/marketing/nested-course";
import type { Group } from "@/lib/types";

type Props = { params: Promise<{ groupId: string }> };

type PublicGroup = Pick<
  Group,
  "id" | "name" | "schedule" | "schedule_days" | "schedule_time" | "teacher" | "is_active"
> & {
  courses?: NestedCourseField;
};

type PublicStudent = {
  group_id: string;
  student_id: string;
  student_name: string;
};

export default async function GroupScheduleDetailPage({ params }: Props) {
  const { groupId } = await params;
  const supabase = createPublicSupabaseClient();

  const [{ data: groupRow }, { data: studentsData }] = await Promise.all([
    supabase
      .from("groups")
      .select("id, name, schedule, schedule_days, schedule_time, teacher, is_active, courses(name, slug)")
      .eq("id", groupId)
      .eq("is_active", true)
      .maybeSingle(),
    supabase.rpc("get_public_group_students", { p_group_id: groupId }),
  ]);

  const group = (groupRow ?? null) as unknown as PublicGroup | null;
  if (!group) notFound();

  const students = (studentsData ?? []) as PublicStudent[];
  const scheduleText = group.schedule_days?.length
    ? `${group.schedule_days.join(", ")}${group.schedule_time ? ` · ${group.schedule_time}` : ""}`
    : (group.schedule ?? "Jadval kiritilmagan");

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <nav className="text-sm text-slate-500">
        <Link href="/dars-jadvali" className="text-[#00D1FF] hover:underline">
          Dars jadvali
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">{group.name}</span>
      </nav>

      <article className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h1 className="text-2xl font-bold text-white">{group.name}</h1>
        <p className="mt-2 text-sm text-slate-400">
          Yo‘nalish: {pickNestedCourse(group.courses)?.name ?? "Belgilanmagan"}
        </p>
        <p className="mt-1 text-sm text-emerald-300">Jadval: {scheduleText}</p>
        <p className="mt-1 text-sm text-slate-400">
          O‘qituvchi: {group.teacher || "Belgilanmagan"}
        </p>

        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#00D1FF]">O‘quvchilar</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {students.map((s) => (
              <div key={s.student_id} className="rounded-lg border border-white/10 bg-[#0f1528] px-3 py-2 text-sm text-slate-200">
                {s.student_name}
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-sm text-slate-500">Bu guruhga hozircha faol o‘quvchi biriktirilmagan.</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

