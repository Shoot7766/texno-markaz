"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGroup, updateGroup } from "@/lib/actions/crm";
import { formatDate } from "@/lib/format";
import { parseTimeMap, formatTimeDisplay } from "@/lib/format-time";
import type { Course, Group } from "@/lib/types";

type Props = {
  groups: Group[];
  courses: Pick<Course, "id" | "name">[];
};
const weekDays = ["Du", "Se", "Chor", "Pay", "Juma", "Shan", "Yak"];

export function GroupsManager({ groups, courses }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    course_id: "",
    teacher: "",
    schedule: "",
    schedule_days: [] as string[],
    schedule_times: {} as Record<string, string>,
    max_students: 20,
    start_date: "",
    end_date: "",
  });

  const courseName = (id: string | null) =>
    id ? (courses.find((c) => c.id === id)?.name ?? "—") : "—";
  const editingGroup = groups.find((g) => g.id === editingId);
  const [editForm, setEditForm] = useState({
    name: "",
    course_id: "",
    teacher: "",
    schedule: "",
    schedule_days: [] as string[],
    schedule_times: {} as Record<string, string>,
    max_students: 20,
    start_date: "",
    end_date: "",
    is_active: true,
  });

  function startEdit(g: Group) {
    setEditingId(g.id);
    setError(null);
    setEditForm({
      name: g.name,
      course_id: g.course_id ?? "",
      teacher: g.teacher ?? "",
      schedule: g.schedule ?? "",
      schedule_days: g.schedule_days ?? [],
      schedule_times: parseTimeMap(g.schedule_time),
      max_students: g.max_students,
      start_date: g.start_date ?? "",
      end_date: g.end_date ?? "",
      is_active: g.is_active,
    });
  }

  async function onCreateGroup() {
    if (!form.name.trim()) return;
    setError(null);
    setSaving(true);
    try {
      await createGroup({
        name: form.name.trim(),
        course_id: form.course_id || null,
        teacher: form.teacher.trim(),
        schedule:
          form.schedule.trim() || `${form.schedule_days.join("/")} ${formatTimeDisplay(JSON.stringify(form.schedule_times))}`.trim(),
        schedule_days: form.schedule_days,
        schedule_time: JSON.stringify(form.schedule_times),
        max_students: Number(form.max_students) || 20,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });
      setForm({
        name: "",
        course_id: "",
        teacher: "",
        schedule: "",
        schedule_days: [],
        schedule_times: {},
        max_students: 20,
        start_date: "",
        end_date: "",
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Guruh yaratilmadi.");
    } finally {
      setSaving(false);
    }
  }

  async function onSaveEdit() {
    if (!editingId || !editingGroup) return;
    setSavingRowId(editingId);
    setError(null);
    try {
      await updateGroup(editingId, {
        name: editForm.name.trim(),
        course_id: editForm.course_id || null,
        teacher: editForm.teacher.trim(),
        schedule:
          editForm.schedule.trim() ||
          `${editForm.schedule_days.join("/")} ${formatTimeDisplay(JSON.stringify(editForm.schedule_times))}`.trim(),
        schedule_days: editForm.schedule_days,
        schedule_time: JSON.stringify(editForm.schedule_times),
        max_students: Number(editForm.max_students) || 20,
        start_date: editForm.start_date || null,
        end_date: editForm.end_date || null,
        is_active: editForm.is_active,
      });
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Guruh saqlanmadi.");
    } finally {
      setSavingRowId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Yangi guruh va dars jadvali</h3>
        <p className="mt-1 text-xs text-slate-500">
          Misol: Du/Chor/Juma 10:00-12:00. Kunlarni tanlamasangiz ham bo‘ladi — jadval matnini yozib, har hafta
          admin panelda yangilashingiz mumkin; saytda guruh «Kunlar belgilanmagan» blokida chiqadi.
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
          <div className="rounded-lg border border-slate-200 px-3 py-2 lg:col-span-2">
            <p className="mb-2 text-xs text-slate-500">Dars kunlari va vaqtlari</p>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => {
                const active = form.schedule_days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setForm((p) => {
                        const newDays = active ? p.schedule_days.filter((d) => d !== day) : [...p.schedule_days, day];
                        const newTimes = { ...p.schedule_times };
                        if (!active && !newTimes[day]) newTimes[day] = "";
                        return { ...p, schedule_days: newDays, schedule_times: newTimes };
                      })
                    }
                    className={`rounded-full px-3 py-1 text-xs ${
                      active ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-700"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {form.schedule_days.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {form.schedule_days.map((day) => (
                  <div key={day} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-600">{day} vaqti:</span>
                    <input
                      placeholder="16:00"
                      value={form.schedule_times[day] || ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          schedule_times: { ...p.schedule_times, [day]: e.target.value },
                        }))
                      }
                      className="rounded border border-slate-200 px-2 py-1.5 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
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
        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nomi</th>
              <th className="px-4 py-3">Kurs</th>
              <th className="px-4 py-3">O‘qituvchi</th>
              <th className="px-4 py-3">Jadval</th>
              <th className="px-4 py-3">Kun/soat</th>
              <th className="px-4 py-3">Muddat</th>
              <th className="px-4 py-3">Holat</th>
              <th className="px-4 py-3">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {groups.map((g) => (
              <tr key={g.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {editingId === g.id ? (
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-44 rounded border border-slate-200 px-2 py-1 text-sm"
                    />
                  ) : (
                    g.name
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === g.id ? (
                    <select
                      value={editForm.course_id}
                      onChange={(e) => setEditForm((p) => ({ ...p, course_id: e.target.value }))}
                      className="w-44 rounded border border-slate-200 px-2 py-1 text-sm"
                    >
                      <option value="">Kurs tanlanmagan</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    courseName(g.course_id)
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {editingId === g.id ? (
                    <input
                      value={editForm.teacher}
                      onChange={(e) => setEditForm((p) => ({ ...p, teacher: e.target.value }))}
                      className="w-40 rounded border border-slate-200 px-2 py-1 text-sm"
                    />
                  ) : (
                    g.teacher || "—"
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {editingId === g.id ? (
                    <input
                      value={editForm.schedule}
                      onChange={(e) => setEditForm((p) => ({ ...p, schedule: e.target.value }))}
                      className="w-52 rounded border border-slate-200 px-2 py-1 text-sm"
                    />
                  ) : (
                    g.schedule || "—"
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {editingId === g.id ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {weekDays.map((day) => {
                          const active = editForm.schedule_days.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() =>
                                setEditForm((p) => {
                                  const newDays = active ? p.schedule_days.filter((d) => d !== day) : [...p.schedule_days, day];
                                  const newTimes = { ...p.schedule_times };
                                  if (!active && !newTimes[day]) newTimes[day] = "";
                                  return { ...p, schedule_days: newDays, schedule_times: newTimes };
                                })
                              }
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                active
                                  ? "bg-emerald-600 text-white"
                                  : "border border-slate-200 text-slate-600"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                      {editForm.schedule_days.length > 0 && (
                        <div className="grid gap-2 grid-cols-2">
                          {editForm.schedule_days.map((day) => (
                            <div key={day} className="flex flex-col gap-1">
                              <span className="text-[10px] text-slate-500">{day}:</span>
                              <input
                                placeholder="16:00"
                                value={editForm.schedule_times[day] || ""}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    schedule_times: { ...p.schedule_times, [day]: e.target.value },
                                  }))
                                }
                                className="rounded border border-slate-200 px-2 py-1 text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {(g.schedule_days ?? []).join(", ") || "—"}
                      <br />
                      <span className="text-[11px] text-slate-500">{formatTimeDisplay(g.schedule_time)}</span>
                    </>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {editingId === g.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={editForm.start_date}
                        onChange={(e) => setEditForm((p) => ({ ...p, start_date: e.target.value }))}
                        className="rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                      <input
                        type="date"
                        value={editForm.end_date}
                        onChange={(e) => setEditForm((p) => ({ ...p, end_date: e.target.value }))}
                        className="rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                    </div>
                  ) : (
                    <>
                      {g.start_date ? formatDate(g.start_date) : "—"}
                      {g.end_date ? ` — ${formatDate(g.end_date)}` : ""}
                    </>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === g.id ? (
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={editForm.is_active}
                        onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.checked }))}
                      />
                      Faol
                    </label>
                  ) : g.is_active ? (
                    <span className="text-emerald-700">Faol</span>
                  ) : (
                    <span className="text-slate-400">Nofaol</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === g.id ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={onSaveEdit}
                        disabled={savingRowId === g.id}
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
                      className="rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                    >
                      Tahrirlash
                    </button>
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
