import { createClient } from "@/lib/supabase/server";
import { ScheduleBoard } from "@/components/admin/schedule-board";
import type { Course, Group } from "@/lib/types";

export default async function DarsJadvaliPage() {
  const supabase = await createClient();
  const [{ data: groups }, { data: courses }] = await Promise.all([
    supabase.from("groups").select("*").order("name", { ascending: true }),
    supabase.from("courses").select("id, name").order("sort_order", { ascending: true }),
  ]);

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
      />
    </div>
  );
}

