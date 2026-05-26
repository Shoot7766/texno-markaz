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
  
  // Fetch historical attendance records to populate the interactive class journal grid
  const { data: attendance } = await supabase
    .from("attendance")
    .select("student_id, group_id, attendance_date, status");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Davomat Jurnali 📅</h1>
        <p className="text-sm text-slate-500">O'quvchilarning kunlik davomatini jurnal ko'rinishida oson belgilang.</p>
      </div>
      <AttendancePanel
        students={(students ?? []) as Pick<Student, "id" | "first_name" | "last_name" | "group_id" | "status">[]}
        groups={(groups ?? []) as Pick<Group, "id" | "name">[]}
        initialAttendance={(attendance ?? []) as { student_id: string; group_id: string | null; attendance_date: string; status: "keldi" | "kelmadi" | "kechikdi" }[]}
      />
    </div>
  );
}

