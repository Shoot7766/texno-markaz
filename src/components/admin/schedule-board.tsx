"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateGroup, updateStudent } from "@/lib/actions/crm";
import { partitionGroupsByWeekDays, WEEKDAY_SHORT_UZ } from "@/lib/marketing/week-schedule";
import { parseTimeMap, formatTimeDisplay, getTimeForDay } from "@/lib/format-time";
import type { Course, Group } from "@/lib/types";

type Props = {
  groups: Group[];
  courses: Pick<Course, "id" | "name">[];
  students: any[];
  studentsByGroup: Record<string, number>;
};

export function ScheduleBoard({ groups, courses, students, studentsByGroup }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"groups" | "students">("groups");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    course_id: "",
    schedule: "",
    schedule_days: [] as string[],
    schedule_times: {} as Record<string, string>,
    teacher: "",
    max_students: 20,
    is_active: true,
  });
  const [studentForm, setStudentForm] = useState({
    lesson_times: {} as Record<string, string>,
    lesson_days: [] as string[],
  });

  const { byDay: calendar, unscheduled: calendarUnscheduled } = useMemo(
    () => partitionGroupsByWeekDays(activeTab === "groups" ? groups : students),
    [groups, students, activeTab]
  );

  function startEdit(group: Group) {
    setEditingId(group.id);
    setError(null);
    setForm({
      name: group.name,
      course_id: group.course_id ?? "",
      schedule: group.schedule ?? "",
      schedule_days: group.schedule_days ?? [],
      schedule_times: parseTimeMap(group.schedule_time),
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
        schedule: form.schedule.trim() || `${form.schedule_days.join("/")} ${formatTimeDisplay(JSON.stringify(form.schedule_times))}`.trim(),
        schedule_days: form.schedule_days,
        schedule_time: JSON.stringify(form.schedule_times),
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

  function startEditStudent(st: any) {
    setEditingStudentId(st.id);
    setError(null);
    setStudentForm({
      lesson_times: parseTimeMap(st.lesson_time),
      lesson_days: st.lesson_days ?? [],
    });
  }

  async function saveStudent(stId: string) {
    setSaving(true);
    setError(null);
    try {
      await updateStudent(stId, {
        lesson_time: JSON.stringify(studentForm.lesson_times),
        lesson_days: studentForm.lesson_days,
      });
      setEditingStudentId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Jadvalni saqlab bo‘lmadi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("groups")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === "groups" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-slate-600 hover:text-slate-900"}`}
        >
          Guruhlar jadvali
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === "students" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-slate-600 hover:text-slate-900"}`}
        >
          Yakka o'quvchilar
        </button>
      </div>
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-7">
        {WEEKDAY_SHORT_UZ.map((day) => (
          <div key={day} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="text-xs font-semibold uppercase text-slate-600">{day}</p>
            <div className="mt-2 space-y-2">
              {(calendar[day] ?? []).map((g) => (
                <button
                  key={`${day}-${g.id}`}
                  type="button"
                  onClick={() => activeTab === "groups" ? startEdit(g as Group) : startEditStudent(g)}
                  className="w-full rounded border border-slate-200 bg-white p-2 text-left hover:border-blue-300"
                >
                  <p className="text-xs font-semibold text-slate-800">
                    {activeTab === "groups" ? (g as Group).name : `${(g as any).first_name} ${(g as any).last_name}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {activeTab === "groups"
                      ? (getTimeForDay((g as Group).schedule_time, day) || (g as Group).schedule || "Vaqt kiritilmagan")
                      : (getTimeForDay((g as any).lesson_time, day) || "Vaqt kiritilmagan")}
                  </p>
                  {activeTab === "groups" && (
                    <p className="text-[11px] text-slate-400">O‘quvchi: {studentsByGroup[g.id] ?? 0}</p>
                  )}
                  {activeTab === "students" && (
                    <p className="text-[11px] text-slate-400">{(g as any).phone}</p>
                  )}
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
                onClick={() => activeTab === "groups" ? startEdit(g as Group) : startEditStudent(g)}
                className="rounded border border-amber-200 bg-white px-3 py-2 text-left hover:border-amber-400"
              >
                <p className="text-xs font-semibold text-slate-800">
                  {activeTab === "groups" ? (g as Group).name : `${(g as any).first_name} ${(g as any).last_name}`}
                </p>
                <p className="text-xs text-slate-500">
                  {activeTab === "groups"
                    ? (formatTimeDisplay((g as Group).schedule_time) || (g as Group).schedule || "Vaqt kiritilmagan")
                    : (formatTimeDisplay((g as any).lesson_time) || "Vaqt kiritilmagan")}
                </p>
                {activeTab === "groups" && (
                  <p className="text-[11px] text-slate-400">O‘quvchi: {studentsByGroup[g.id] ?? 0}</p>
                )}
                {activeTab === "students" && (
                  <p className="text-[11px] text-slate-400">{(g as any).phone}</p>
                )}
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
                    setForm((p) => {
                      const newDays = active ? p.schedule_days.filter((d) => d !== day) : [...p.schedule_days, day];
                      const newTimes = { ...p.schedule_times };
                      if (!active && !newTimes[day]) newTimes[day] = "";
                      return { ...p, schedule_days: newDays, schedule_times: newTimes };
                    })
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
          {form.schedule_days.length > 0 && (
            <div className="mt-3 grid gap-2 grid-cols-2 md:grid-cols-3">
              {form.schedule_days.map((day) => (
                <div key={day} className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500">{day}:</span>
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

      {editingStudentId && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">O'quvchi dars vaqtini tahrirlash</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {WEEKDAY_SHORT_UZ.map((day) => {
              const active = studentForm.lesson_days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() =>
                    setStudentForm((p) => {
                      const newDays = active ? p.lesson_days.filter((d) => d !== day) : [...p.lesson_days, day];
                      const newTimes = { ...p.lesson_times };
                      if (!active && !newTimes[day]) newTimes[day] = "";
                      return { ...p, lesson_days: newDays, lesson_times: newTimes };
                    })
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
          {studentForm.lesson_days.length > 0 && (
            <div className="mt-3 grid gap-2 grid-cols-2 md:grid-cols-3">
              {studentForm.lesson_days.map((day) => (
                <div key={day} className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500">{day}:</span>
                  <input
                    placeholder="16:00"
                    value={studentForm.lesson_times[day] || ""}
                    onChange={(e) =>
                      setStudentForm((p) => ({
                        ...p,
                        lesson_times: { ...p.lesson_times, [day]: e.target.value },
                      }))
                    }
                    className="rounded border border-slate-200 px-2 py-1.5 text-xs"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => saveStudent(editingStudentId)}
              disabled={saving}
              className="rounded bg-blue-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
            >
              Saqlash
            </button>
            <button
              type="button"
              onClick={() => setEditingStudentId(null)}
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

