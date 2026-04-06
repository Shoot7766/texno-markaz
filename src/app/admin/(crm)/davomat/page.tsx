import { createClient } from "@/lib/supabase/server";
import { AttendancePanel } from "@/components/admin/attendance-panel";
import type { Group, Student } from "@/lib/types";

export default async function DavomatPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("id, first_name, last_name, group_id, status")
    .eq("status", "active")
    .order("last_name");
  const { data: groups } = await supabase.from("groups").select("id, name").eq("is_active", true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Davomat</h1>
        <p className="text-sm text-slate-500">Kunlik belgilash va tezkor status.</p>
      </div>
      <AttendancePanel
        students={(students ?? []) as Pick<Student, "id" | "first_name" | "last_name" | "group_id" | "status">[]}
        groups={(groups ?? []) as Pick<Group, "id" | "name">[]}
      />
    </div>
  );
}
