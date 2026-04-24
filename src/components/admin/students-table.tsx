"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Course, Group, Student, StudentStatus } from "@/lib/types";
import { createManualStudent, updateStudent } from "@/lib/actions/crm";
import { formatDate, formatUzs } from "@/lib/format";
import { Loader2, Search } from "lucide-react";

type Props = {
  initialStudents: Student[];
  courses: Pick<Course, "id" | "name" | "price">[];
  groups: Pick<Group, "id" | "name" | "course_id">[];
};

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {children}
    </div>
  );
}

const statuses: { value: StudentStatus; label: string }[] = [
  { value: "active", label: "Faol" },
  { value: "finished", label: "Tugagan" },
  { value: "paused", label: "Pauza" },
];

export function StudentsTable({ initialStudents, courses, groups }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    parent_phone: "",
    course_id: courses[0]?.id ?? "",
    group_id: "",
    start_date: new Date().toISOString().slice(0, 10),
    total_amount: Number(courses[0]?.price ?? 0),
    discount: 0,
    payment_due_date: "",
    lesson_time: "",
    comment: "",
  });
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    parent_phone: "",
    course_id: "",
    group_id: "",
    start_date: "",
    total_amount: 0,
    discount: 0,
    payment_due_date: "",
    lesson_time: "",
    comment: "",
    status: "active" as StudentStatus,
  });

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

  async function onCreateStudent() {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.phone.trim() || !form.course_id) {
      setFormError("Ism, familiya, telefon va kursni kiriting.");
      return;
    }
    if (!form.start_date) {
      setFormError("Boshlanish sanasini kiriting.");
      return;
    }
    setFormError(null);
    setFormSuccess(null);
    setSaving(true);
    try {
      await createManualStudent({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        parent_phone: form.parent_phone.trim(),
        course_id: form.course_id,
        group_id: form.group_id || null,
        start_date: form.start_date,
        total_amount: Number(form.total_amount),
        discount: Number(form.discount),
        payment_due_date: form.payment_due_date || null,
        lesson_time: form.lesson_time.trim(),
        comment: form.comment.trim(),
      });
      setForm((prev) => ({
        ...prev,
        first_name: "",
        last_name: "",
        phone: "",
        parent_phone: "",
        group_id: "",
        total_amount: Number(courses[0]?.price ?? 0),
        discount: 0,
        payment_due_date: "",
        lesson_time: "",
        comment: "",
      }));
      setFormSuccess("O‘quvchi muvaffaqiyatli qo‘shildi.");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "O‘quvchini qo‘shib bo‘lmadi.");
    } finally {
      setSaving(false);
    }
  }

  const courseName = (id: string) => courses.find((c) => c.id === id)?.name ?? "—";
  const coursePrice = (courseId: string) => Number(courses.find((c) => c.id === courseId)?.price ?? 0);

  function openEdit(st: Student) {
    setEditError(null);
    setEditId(st.id);
    setEditForm({
      first_name: st.first_name,
      last_name: st.last_name,
      phone: st.phone,
      parent_phone: st.parent_phone ?? "",
      course_id: st.course_id,
      group_id: st.group_id ?? "",
      start_date: st.start_date,
      total_amount: Number(st.total_amount),
      discount: Number(st.discount),
      payment_due_date: st.payment_due_date ?? "",
      lesson_time: st.lesson_time ?? "",
      comment: st.comment ?? "",
      status: st.status,
    });
  }

  async function onSaveEdit() {
    if (!editId) return;
    setEditSaving(true);
    setEditError(null);
    try {
      await updateStudent(editId, {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        phone: editForm.phone.trim(),
        parent_phone: editForm.parent_phone.trim(),
        course_id: editForm.course_id,
        group_id: editForm.group_id || null,
        start_date: editForm.start_date,
        total_amount: Number(editForm.total_amount),
        discount: Number(editForm.discount),
        payment_due_date: editForm.payment_due_date || null,
        lesson_time: editForm.lesson_time.trim(),
        comment: editForm.comment.trim(),
        status: editForm.status,
      });
      setEditId(null);
      router.refresh();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "O‘quvchi ma’lumoti saqlanmadi.");
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Qo‘lda o‘quvchi qo‘shish</h3>
        {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}
        {formSuccess && <p className="mt-2 text-xs text-emerald-700">{formSuccess}</p>}
        <div className="mt-3 grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
          <input
            placeholder="Ism"
            value={form.first_name}
            onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
          <input
            placeholder="Familiya"
            value={form.last_name}
            onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
          <input
            placeholder="Telefon"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
          <input
            placeholder="Ota-ona telefoni"
            value={form.parent_phone}
            onChange={(e) => setForm((p) => ({ ...p, parent_phone: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
          <select
            value={form.course_id}
            onChange={(e) => {
              const id = e.target.value;
              setForm((p) => ({ ...p, course_id: id, group_id: "", total_amount: coursePrice(id) }));
            }}
            className="rounded-lg border border-slate-200 px-3 py-2"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={form.group_id}
            onChange={(e) => setForm((p) => ({ ...p, group_id: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="">Guruhsiz</option>
            {groups
              .filter((g) => g.course_id === form.course_id)
              .map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
          </select>
          <FormField label="Dars boshlanishi">
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </FormField>
          <FormField label="To‘lov sanasi">
            <input
              type="date"
              value={form.payment_due_date}
              onChange={(e) => setForm((p) => ({ ...p, payment_due_date: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </FormField>
          <FormField label="Umumiy summa (kurs narxi)">
            <input
              type="number"
              value={form.total_amount}
              onChange={(e) => setForm((p) => ({ ...p, total_amount: Number(e.target.value) }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </FormField>
          <FormField label="Chegirma">
            <input
              type="number"
              value={form.discount}
              onChange={(e) => setForm((p) => ({ ...p, discount: Number(e.target.value) }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </FormField>
          <input
            placeholder="Dars vaqti (masalan 10:00-12:00)"
            value={form.lesson_time}
            onChange={(e) => setForm((p) => ({ ...p, lesson_time: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
          <input
            placeholder="Izoh"
            value={form.comment}
            onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 lg:col-span-2"
          />
          <button
            type="button"
            onClick={onCreateStudent}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saqlanmoqda..." : "O‘quvchini qo‘shish"}
          </button>
        </div>
      </div>

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
              <th className="px-4 py-3">To‘lov sanasi</th>
              <th className="px-4 py-3">Birinchi dars</th>
              <th className="px-4 py-3">Dars vaqti</th>
              <th className="px-4 py-3">Summa / to‘langan</th>
              <th className="px-4 py-3">Amal</th>
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
                  <td className="px-4 py-3 text-xs text-slate-600">{st.payment_due_date || "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {formatDate(st.first_lesson_date ?? st.start_date)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{st.lesson_time?.trim() || "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-700">
                    <div>{formatUzs(Number(st.total_amount))}</div>
                    <div className="text-slate-500">
                      To‘langan: {formatUzs(Number(st.paid_amount))}
                      {due > 0 && (
                        <span className="text-red-600"> · Qarz: {formatUzs(due)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openEdit(st)}
                      className="rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                    >
                      Tahrirlash
                    </button>
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

      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">O‘quvchi ma’lumotini tahrirlash</h3>
            {editError && <p className="mt-2 text-sm text-red-600">{editError}</p>}
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <input
                placeholder="Ism"
                value={editForm.first_name}
                onChange={(e) => setEditForm((p) => ({ ...p, first_name: e.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <input
                placeholder="Familiya"
                value={editForm.last_name}
                onChange={(e) => setEditForm((p) => ({ ...p, last_name: e.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <input
                placeholder="Telefon"
                value={editForm.phone}
                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <input
                placeholder="Ota-ona telefoni"
                value={editForm.parent_phone}
                onChange={(e) => setEditForm((p) => ({ ...p, parent_phone: e.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <select
                value={editForm.course_id}
                onChange={(e) => {
                  const id = e.target.value;
                  setEditForm((p) => ({ ...p, course_id: id, group_id: "", total_amount: coursePrice(id) }));
                }}
                className="rounded-lg border border-slate-200 px-3 py-2"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={editForm.group_id}
                onChange={(e) => setEditForm((p) => ({ ...p, group_id: e.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
              >
                <option value="">Guruhsiz</option>
                {groups
                  .filter((g) => g.course_id === editForm.course_id)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </select>
              <FormField label="Dars boshlanishi">
                <input
                  type="date"
                  value={editForm.start_date}
                  onChange={(e) => setEditForm((p) => ({ ...p, start_date: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </FormField>
              <FormField label="To‘lov sanasi">
                <input
                  type="date"
                  value={editForm.payment_due_date}
                  onChange={(e) => setEditForm((p) => ({ ...p, payment_due_date: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </FormField>
              <FormField label="Umumiy summa (kurs narxi)">
                <input
                  type="number"
                  value={editForm.total_amount}
                  onChange={(e) => setEditForm((p) => ({ ...p, total_amount: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </FormField>
              <FormField label="Chegirma">
                <input
                  type="number"
                  value={editForm.discount}
                  onChange={(e) => setEditForm((p) => ({ ...p, discount: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </FormField>
              <input
                placeholder="Dars vaqti (10:00-12:00)"
                value={editForm.lesson_time}
                onChange={(e) => setEditForm((p) => ({ ...p, lesson_time: e.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as StudentStatus }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Izoh"
                value={editForm.comment}
                onChange={(e) => setEditForm((p) => ({ ...p, comment: e.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2 md:col-span-2"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditId(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
              >
                Bekor
              </button>
              <button
                type="button"
                onClick={onSaveEdit}
                disabled={editSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {editSaving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
