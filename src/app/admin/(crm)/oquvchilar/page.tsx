import { createClient } from "@/lib/supabase/server";
import { StudentsTable } from "@/components/admin/students-table";
import type { Course, Group, Student } from "@/lib/types";

export default async function OquvchilarPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: courses } = await supabase.from("courses").select("id, name, price");
  const { data: groups } = await supabase.from("groups").select("id, name, course_id");
  
  const { data: attendanceLogs } = await supabase
    .from("activity_logs")
    .select("details")
    .eq("action", "attendance_mark")
    .order("created_at", { ascending: true });

  const studentDateStatus = (attendanceLogs ?? []).reduce((acc, curr) => {
    const details = curr.details as { student_id?: string; status?: string; date?: string } | null;
    if (details?.student_id && details?.date && details?.status) {
      if (!acc[details.student_id]) acc[details.student_id] = {};
      // Eng oxirgi statusni saqlab qolamiz (o'zgartirilgan bo'lsa hisobga olinadi)
      acc[details.student_id][details.date] = details.status;
    }
    return acc;
  }, {} as Record<string, Record<string, string>>);

  const studentAttendedCounts = Object.entries(studentDateStatus).reduce((acc, [studentId, dates]) => {
    acc[studentId] = Object.values(dates).filter((status) => status === "keldi").length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">O‘quvchilar</h1>
        <p className="text-sm text-slate-500">CRUD, status va to‘lov holati, hamda kelgan darslar soni.</p>
      </div>
      <StudentsTable
        initialStudents={(students ?? []) as Student[]}
        courses={(courses ?? []) as Pick<Course, "id" | "name" | "price">[]}
        groups={(groups ?? []) as Pick<Group, "id" | "name" | "course_id">[]}
        attendedCounts={studentAttendedCounts}
      />
    </div>
  );
}
