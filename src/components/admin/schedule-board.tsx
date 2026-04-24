"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateGroup } from "@/lib/actions/crm";
import type { Course, Group } from "@/lib/types";

type Props = {
  groups: Group[];
  courses: Pick<Course, "id" | "name">[];
};

const dayFilters = ["Barchasi", "Du", "Se", "Chor", "Pay", "Juma", "Shan", "Yak"];

export function ScheduleBoard({ groups, courses }: Props) {
  const router = useRouter();
  const [dayFilter, setDayFilter] = useState("Barchasi");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    schedule: "",
    teacher: "",
    start_date: "",
    end_date: "",
  });

  const filtered = useMemo(() => {
    if (dayFilter === "Barchasi") return groups;
    return groups.filter((g) => (g.schedule ?? "").toLowerCase().includes(dayFilter.toLowerCase()));
  }, [groups, dayFilter]);

  const courseName = (courseId: string | null) =>
    courseId ? (courses.find((c) => c.id === courseId)?.name ?? "—") : "—";

  function startEdit(group: Group) {
    setEditingId(group.id);
    setError(null);
    setForm({
      schedule: group.schedule ?? "",
      teacher: group.teacher ?? "",
      start_date: group.start_date ?? "",
      end_date: group.end_date ?? "",
    });
  }

  async function save(groupId: string) {
    setSaving(true);
    setError(null);
    try {
      await updateGroup(groupId, {
        schedule: form.schedule.trim(),
        teacher: form.teacher.trim(),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Jadvalni saqlab bo‘lmadi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-700">Kun bo‘yicha ko‘rish</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {dayFilters.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDayFilter(d)}
              className={`rounded-full px-3 py-1.5 text-xs ${
                dayFilter === d
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Guruh</th>
              <th className="px-4 py-3">Kurs</th>
              <th className="px-4 py-3">Jadval</th>
              <th className="px-4 py-3">O‘qituvchi</th>
              <th className="px-4 py-3">Boshlanish/Tugash</th>
              <th className="px-4 py-3">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((g) => (
              <tr key={g.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{g.name}</td>
                <td className="px-4 py-3">{courseName(g.course_id)}</td>
                <td className="px-4 py-3 text-slate-700">
                  {editingId === g.id ? (
                    <input
                      value={form.schedule}
                      onChange={(e) => setForm((p) => ({ ...p, schedule: e.target.value }))}
                      className="w-60 rounded border border-slate-200 px-2 py-1"
                      placeholder="Du/Chor/Juma 10:00-12:00"
                    />
                  ) : (
                    g.schedule || "—"
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {editingId === g.id ? (
                    <input
                      value={form.teacher}
                      onChange={(e) => setForm((p) => ({ ...p, teacher: e.target.value }))}
                      className="w-40 rounded border border-slate-200 px-2 py-1"
                    />
                  ) : (
                    g.teacher || "—"
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {editingId === g.id ? (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={form.start_date}
                        onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                        className="rounded border border-slate-200 px-2 py-1"
                      />
                      <input
                        type="date"
                        value={form.end_date}
                        onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                        className="rounded border border-slate-200 px-2 py-1"
                      />
                    </div>
                  ) : (
                    `${g.start_date ?? "—"} ${g.end_date ? `— ${g.end_date}` : ""}`
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === g.id ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => save(g.id)}
                        disabled={saving}
                        className="rounded bg-blue-600 px-2 py-1 text-xs text-white disabled:opacity-60"
                      >
                        Saqlash
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded border border-slate-200 px-2 py-1 text-xs"
                      >
                        Bekor
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(g)}
                      className="rounded border border-slate-200 px-2 py-1 text-xs"
                    >
                      Tahrirlash
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">Tanlangan filter bo‘yicha jadval topilmadi</p>
        )}
      </div>
    </div>
  );
}

