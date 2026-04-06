"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Group, Student } from "@/lib/types";
import { upsertAttendance } from "@/lib/actions/crm";
import { Loader2 } from "lucide-react";

type Props = {
  students: Pick<Student, "id" | "first_name" | "last_name" | "group_id" | "status">[];
  groups: Pick<Group, "id" | "name">[];
};

export function AttendancePanel({ students, groups }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState<string | null>(null);

  async function mark(
    studentId: string,
    groupId: string | null,
    status: "keldi" | "kelmadi" | "kechikdi"
  ) {
    setBusy(studentId + status);
    try {
      await upsertAttendance(studentId, groupId, date, status);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700">
          Sana
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="ml-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">O‘quvchi</th>
              <th className="px-4 py-3">Guruh</th>
              <th className="px-4 py-3">Tezkor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s) => {
              const gname = groups.find((g) => g.id === s.group_id)?.name ?? "—";
              return (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {s.first_name} {s.last_name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{gname}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(["keldi", "kelmadi", "kechikdi"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          disabled={busy !== null}
                          onClick={() => mark(s.id, s.group_id ?? null, st)}
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            st === "keldi"
                              ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                              : st === "kechikdi"
                                ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                          }`}
                        >
                          {busy === s.id + st ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            st
                          )}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {students.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">Faol o‘quvchi yo‘q</p>
        )}
      </div>
    </div>
  );
}
