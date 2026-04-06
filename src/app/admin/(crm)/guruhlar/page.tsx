import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { Course, Group } from "@/lib/types";

export default async function GuruhlarPage() {
  const supabase = await createClient();
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .order("name", { ascending: true });
  const { data: courses } = await supabase.from("courses").select("id, name");
  const courseList = (courses ?? []) as Pick<Course, "id" | "name">[];

  const courseName = (id: string | null) =>
    id ? (courseList.find((c) => c.id === id)?.name ?? "—") : "—";

  const rows = (groups ?? []) as Group[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Guruhlar</h1>
        <p className="text-sm text-slate-500">
          Guruhlarni yangilash uchun Supabase jadvalidan foydalaning yoki keyingi versiyada CRUD
          qo‘shiladi.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nomi</th>
              <th className="px-4 py-3">Kurs</th>
              <th className="px-4 py-3">O‘qituvchi</th>
              <th className="px-4 py-3">Jadval</th>
              <th className="px-4 py-3">Muddat</th>
              <th className="px-4 py-3">Holat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((g) => (
              <tr key={g.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{g.name}</td>
                <td className="px-4 py-3">{courseName(g.course_id)}</td>
                <td className="px-4 py-3 text-slate-600">{g.teacher || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{g.schedule || "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {g.start_date ? formatDate(g.start_date) : "—"}
                  {g.end_date ? ` — ${formatDate(g.end_date)}` : ""}
                </td>
                <td className="px-4 py-3">
                  {g.is_active ? (
                    <span className="text-emerald-700">Faol</span>
                  ) : (
                    <span className="text-slate-400">Nofaol</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">Guruh yo‘q</p>
        )}
      </div>
    </div>
  );
}
