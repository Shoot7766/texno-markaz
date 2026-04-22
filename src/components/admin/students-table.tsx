"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Course, Group, Student, StudentStatus } from "@/lib/types";
import { createManualStudent, updateStudent } from "@/lib/actions/crm";
import { formatDate, formatUzs } from "@/lib/format";
import { Loader2, Search } from "lucide-react";

type Props = {
  initialStudents: Student[];
  courses: Pick<Course, "id" | "name">[];
  groups: Pick<Group, "id" | "name" | "course_id">[];
};

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
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    parent_phone: "",
    course_id: courses[0]?.id ?? "",
    group_id: "",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: "",
    total_amount: 0,
    discount: 0,
    comment: "",
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
      return;
    }
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
        end_date: form.end_date || null,
        total_amount: Number(form.total_amount),
        discount: Number(form.discount),
        comment: form.comment.trim(),
      });
      setForm((prev) => ({
        ...prev,
        first_name: "",
        last_name: "",
        phone: "",
        parent_phone: "",
        group_id: "",
        end_date: "",
        total_amount: 0,
        discount: 0,
        comment: "",
      }));
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const courseName = (id: string) => courses.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Qo‘lda o‘quvchi qo‘shish</h3>
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
            onChange={(e) => setForm((p) => ({ ...p, course_id: e.target.value, group_id: "" }))}
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
          <input
            type="number"
            placeholder="Umumiy summa"
            value={form.total_amount}
            onChange={(e) => setForm((p) => ({ ...p, total_amount: Number(e.target.value) }))}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
          <input
            type="number"
            placeholder="Chegirma"
            value={form.discount}
            onChange={(e) => setForm((p) => ({ ...p, discount: Number(e.target.value) }))}
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
