"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGroup } from "@/lib/actions/crm";
import { formatDate } from "@/lib/format";
import type { Course, Group } from "@/lib/types";

type Props = {
  groups: Group[];
  courses: Pick<Course, "id" | "name">[];
};

export function GroupsManager({ groups, courses }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    course_id: "",
    teacher: "",
    schedule: "",
    max_students: 20,
    start_date: "",
    end_date: "",
  });

  const courseName = (id: string | null) =>
    id ? (courses.find((c) => c.id === id)?.name ?? "—") : "—";

  async function onCreateGroup() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await createGroup({
        name: form.name.trim(),
        course_id: form.course_id || null,
        teacher: form.teacher.trim(),
        schedule: form.schedule.trim(),
        max_students: Number(form.max_students) || 20,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });
      setForm({
        name: "",
        course_id: "",
        teacher: "",
        schedule: "",
        max_students: 20,
        start_date: "",
        end_date: "",
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Yangi guruh va dars jadvali</h3>
        <p className="mt-1 text-xs text-slate-500">
          Misol: Du/Chor/Juma 10:00-12:00 yoki Se/Payshanba 15:00-17:00
        </p>
        <div className="mt-3 grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
          <input
            placeholder="Guruh nomi"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
          <select
            value={form.course_id}
            onChange={(e) => setForm((p) => ({ ...p, course_id: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="">Kurs tanlanmagan</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            placeholder="O‘qituvchi"
            value={form.teacher}
            onChange={(e) => setForm((p) => ({ ...p, teacher: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
          <input
            placeholder="Dars jadvali"
            value={form.schedule}
            onChange={(e) => setForm((p) => ({ ...p, schedule: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
          <input
            type="number"
            min={1}
            placeholder="Maksimal o‘quvchi"
            value={form.max_students}
            onChange={(e) => setForm((p) => ({ ...p, max_students: Number(e.target.value) }))}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
          <button
            type="button"
            onClick={onCreateGroup}
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saqlanmoqda..." : "Guruh yaratish"}
          </button>
        </div>
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
            {groups.map((g) => (
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
        {groups.length === 0 && <p className="px-4 py-8 text-center text-slate-500">Guruh yo‘q</p>}
      </div>
    </div>
  );
}
