import { createClient } from "@/lib/supabase/server";
import { StudentsTable } from "@/components/admin/students-table";
import type { Course, Student } from "@/lib/types";

export default async function OquvchilarPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: courses } = await supabase.from("courses").select("id, name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">O‘quvchilar</h1>
        <p className="text-sm text-slate-500">CRUD, status va to‘lov holati.</p>
      </div>
      <StudentsTable
        initialStudents={(students ?? []) as Student[]}
        courses={(courses ?? []) as Pick<Course, "id" | "name">[]}
      />
    </div>
  );
}
