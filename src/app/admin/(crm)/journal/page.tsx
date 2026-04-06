import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { ActivityLog } from "@/lib/types";

export default async function JournalPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as ActivityLog[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Faollik jurnali</h1>
        <p className="text-sm text-slate-500">Admin harakatlari.</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Vaqt</th>
              <th className="px-4 py-3">Harakat</th>
              <th className="px-4 py-3">Ob&apos;ekt</th>
              <th className="px-4 py-3">Batafsil</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDate(r.created_at)}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{r.action}</td>
                <td className="px-4 py-3 text-slate-600">
                  {r.entity_type} {r.entity_id ? `· ${r.entity_id.slice(0, 8)}…` : ""}
                </td>
                <td className="max-w-md truncate px-4 py-3 text-xs text-slate-500">
                  {r.details ? JSON.stringify(r.details) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">Yozuvlar yo‘q</p>
        )}
      </div>
    </div>
  );
}
