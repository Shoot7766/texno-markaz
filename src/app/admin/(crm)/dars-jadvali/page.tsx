import { createClient } from "@/lib/supabase/server";
import { ScheduleBoard } from "@/components/admin/schedule-board";
import type { Course, Group } from "@/lib/types";

export default async function DarsJadvaliPage() {
  const supabase = await createClient();
  const [{ data: groups }, { data: courses }, { data: students }] = await Promise.all([
    supabase.from("groups").select("*").order("name", { ascending: true }),
    supabase.from("courses").select("id, name").order("sort_order", { ascending: true }),
    supabase.from("students").select("id, group_id, first_name, last_name, phone, lesson_days, lesson_time").eq("status", "active"),
  ]);
  const studentsByGroup = (students ?? []).reduce(
    (acc, row) => {
      if (row.group_id) acc[row.group_id] = (acc[row.group_id] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dars jadvali</h1>
        <p className="text-sm text-slate-500">
          Guruhlar jadvalini kunlar bo‘yicha ko‘rish va shu yerning o‘zida tahrirlash.
        </p>
      </div>
      <ScheduleBoard
        groups={(groups ?? []) as Group[]}
        courses={(courses ?? []) as Pick<Course, "id" | "name">[]}
        students={(students ?? []) as any[]}
        studentsByGroup={studentsByGroup}
      />
    </div>
  );
}

