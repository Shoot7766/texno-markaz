"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateGroup } from "@/lib/actions/crm";
import { partitionGroupsByWeekDays, WEEKDAY_SHORT_UZ } from "@/lib/marketing/week-schedule";
import type { Course, Group } from "@/lib/types";

type Props = {
  groups: Group[];
  courses: Pick<Course, "id" | "name">[];
  studentsByGroup: Record<string, number>;
};

export function ScheduleBoard({ groups, courses, studentsByGroup }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    course_id: "",
    schedule: "",
    schedule_days: [] as string[],
    schedule_time: "",
    teacher: "",
    max_students: 20,
    is_active: true,
  });

  const { byDay: calendar, unscheduled: calendarUnscheduled } = useMemo(
    () => partitionGroupsByWeekDays(groups),
    [groups]
  );

  function startEdit(group: Group) {
    setEditingId(group.id);
    setError(null);
    setForm({
      name: group.name,
      course_id: group.course_id ?? "",
      schedule: group.schedule ?? "",
      schedule_days: group.schedule_days ?? [],
      schedule_time: group.schedule_time ?? "",
      teacher: group.teacher ?? "",
      max_students: group.max_students,
      is_active: group.is_active,
    });
  }

  async function save(groupId: string) {
    setSaving(true);
    setError(null);
    try {
      await updateGroup(groupId, {
        name: form.name.trim(),
        course_id: form.course_id || null,
        schedule: form.schedule.trim() || `${form.schedule_days.join("/")} ${form.schedule_time}`.trim(),
        schedule_days: form.schedule_days,
        schedule_time: form.schedule_time.trim(),
        teacher: form.teacher.trim(),
        max_students: form.max_students,
        is_active: form.is_active,
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
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-7">
        {WEEKDAY_SHORT_UZ.map((day) => (
          <div key={day} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="text-xs font-semibold uppercase text-slate-600">{day}</p>
            <div className="mt-2 space-y-2">
              {(calendar[day] ?? []).map((g) => (
                <button
                  key={`${day}-${g.id}`}
                  type="button"
                  onClick={() => startEdit(g)}
                  className="w-full rounded border border-slate-200 bg-white p-2 text-left hover:border-blue-300"
                >
                  <p className="text-xs font-semibold text-slate-800">{g.name}</p>
                  <p className="text-xs text-slate-500">{g.schedule_time || g.schedule || "Vaqt kiritilmagan"}</p>
                  <p className="text-[11px] text-slate-400">O‘quvchi: {studentsByGroup[g.id] ?? 0}</p>
                </button>
              ))}
              {(calendar[day] ?? []).length === 0 && (
                <p className="text-xs text-slate-400">Dars yo‘q</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {calendarUnscheduled.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-amber-900">Kunlar belgilanmagan</p>
          <p className="mt-1 text-xs text-amber-800/90">
            Hafta kunlarini tanlamasangiz, guruh shu yerda turadi — jadval matnini yoki kunlarni keyinroq
            yangilashingiz mumkin.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {calendarUnscheduled.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => startEdit(g)}
                className="rounded border border-amber-200 bg-white px-3 py-2 text-left hover:border-amber-400"
              >
                <p className="text-xs font-semibold text-slate-800">{g.name}</p>
                <p className="text-xs text-slate-500">{g.schedule_time || g.schedule || "Vaqt kiritilmagan"}</p>
                <p className="text-[11px] text-slate-400">O‘quvchi: {studentsByGroup[g.id] ?? 0}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {editingId && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Dars jadvalini to‘liq tahrirlash</h3>
          <div className="mt-3 grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="rounded border border-slate-200 px-3 py-2"
              placeholder="Guruh nomi"
            />
            <select
              value={form.course_id}
              onChange={(e) => setForm((p) => ({ ...p, course_id: e.target.value }))}
              className="rounded border border-slate-200 px-3 py-2"
            >
              <option value="">Kurs tanlanmagan</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              value={form.teacher}
              onChange={(e) => setForm((p) => ({ ...p, teacher: e.target.value }))}
              className="rounded border border-slate-200 px-3 py-2"
              placeholder="O‘qituvchi"
            />
            <input
              value={form.schedule_time}
              onChange={(e) => setForm((p) => ({ ...p, schedule_time: e.target.value }))}
              className="rounded border border-slate-200 px-3 py-2"
              placeholder="Vaqt (10:00-12:00)"
            />
            <input
              value={form.schedule}
              onChange={(e) => setForm((p) => ({ ...p, schedule: e.target.value }))}
              className="rounded border border-slate-200 px-3 py-2"
              placeholder="Jadval matni (ixtiyoriy)"
            />
            <input
              type="number"
              min={1}
              value={form.max_students}
              onChange={(e) => setForm((p) => ({ ...p, max_students: Number(e.target.value) || 1 }))}
              className="rounded border border-slate-200 px-3 py-2"
              placeholder="Maksimal o‘quvchi"
            />
            <label className="flex items-center gap-2 rounded border border-slate-200 px-3 py-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
              />
              Faol guruh
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {WEEKDAY_SHORT_UZ.map((day) => {
              const active = form.schedule_days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      schedule_days: active
                        ? p.schedule_days.filter((d) => d !== day)
                        : [...p.schedule_days, day],
                    }))
                  }
                  className={`rounded-full px-3 py-1.5 text-xs ${
                    active ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-700"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => save(editingId)}
              disabled={saving}
              className="rounded bg-blue-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
            >
              Saqlash
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded border border-slate-200 px-3 py-2 text-xs"
            >
              Bekor
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

