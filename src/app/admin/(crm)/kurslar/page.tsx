import { createClient } from "@/lib/supabase/server";
import { CoursesAdminTable } from "@/components/admin/courses-admin-table";
import type { Course } from "@/lib/types";

export default async function AdminKurslarPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("*").order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kurslar boshqaruvi</h1>
        <p className="text-sm text-slate-500">Narx, tavsif va tartib.</p>
      </div>
      <CoursesAdminTable courses={(data ?? []) as Course[]} />
    </div>
  );
}
