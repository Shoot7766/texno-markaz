"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Course, Student, StudentStatus } from "@/lib/types";
import { updateStudent } from "@/lib/actions/crm";
import { formatDate, formatUzs } from "@/lib/format";
import { Loader2, Search } from "lucide-react";

type Props = {
  initialStudents: Student[];
  courses: Pick<Course, "id" | "name">[];
};

const statuses: { value: StudentStatus; label: string }[] = [
  { value: "active", label: "Faol" },
  { value: "finished", label: "Tugagan" },
  { value: "paused", label: "Pauza" },
];

export function StudentsTable({ initialStudents, courses }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!q.trim()) return initialStudents;
    const s = q.toLowerCase();
    return initialStudents.filter((st) =>
      `${st.first_name} ${st.last_name} ${st.phone}`.toLowerCase().includes(s)
    );
  }, [initialStudents, q]);

  async function onStatus(id: string, status: StudentStatus) {
    setBusy(id);
    try {
      await updateStudent(id, { status });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  const courseName = (id: string) => courses.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Qidiruv..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">F.I.Sh</th>
              <th className="px-4 py-3">Telefon</th>
              <th className="px-4 py-3">Kurs</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">To‘lov</th>
              <th className="px-4 py-3">Summa / to‘langan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((st) => {
              const due =
                Number(st.total_amount) - Number(st.discount) - Number(st.paid_amount);
              return (
                <tr key={st.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {st.first_name} {st.last_name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{st.phone}</td>
                  <td className="px-4 py-3">{courseName(st.course_id)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={st.status}
                      disabled={busy === st.id}
                      onChange={(e) => onStatus(st.id, e.target.value as StudentStatus)}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                    >
                      {statuses.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    {busy === st.id && (
                      <Loader2 className="ml-2 inline h-4 w-4 animate-spin text-blue-600" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        st.payment_status === "tolangan"
                          ? "text-emerald-700"
                          : st.payment_status === "qisman"
                            ? "text-amber-700"
                            : "text-red-700"
                      }
                    >
                      {st.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700">
                    <div>{formatUzs(Number(st.total_amount))}</div>
                    <div className="text-slate-500">
                      To‘langan: {formatUzs(Number(st.paid_amount))}
                      {due > 0 && (
                        <span className="text-red-600"> · Qarz: {formatUzs(due)}</span>
                      )}
                    </div>
                    <div className="text-slate-400">
                      {formatDate(st.start_date)}
                      {st.end_date ? ` — ${formatDate(st.end_date)}` : ""}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">O‘quvchi yo‘q</p>
        )}
      </div>
    </div>
  );
}
