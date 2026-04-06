"use client";

import { useMemo, useState } from "react";
import type { Course, Group, Lead, LeadStatus, Package } from "@/lib/types";
import { useRouter } from "next/navigation";
import { convertLeadToStudent, updateLeadStatus } from "@/lib/actions/crm";
import { formatDate } from "@/lib/format";
import { Loader2, Search } from "lucide-react";

const statuses: { value: LeadStatus; label: string }[] = [
  { value: "yangi", label: "Yangi" },
  { value: "korib_chiqilmoqda", label: "Ko‘rib chiqilmoqda" },
  { value: "boglanildi", label: "Bog‘lanildi" },
  { value: "tasdiqlandi", label: "Tasdiqlandi" },
  { value: "rad_etildi", label: "Rad etildi" },
  { value: "oquvchiga_aylantirildi", label: "O‘quvchiga aylantirildi" },
];

type Props = {
  initialLeads: Lead[];
  courses: Pick<Course, "id" | "name">[];
  packages: Pick<Package, "id" | "name">[];
  groups: Pick<Group, "id" | "name">[];
};

export function LeadsTable({ initialLeads, courses, packages, groups }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [busy, setBusy] = useState<string | null>(null);
  const [convertId, setConvertId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    course_id: courses[0]?.id ?? "",
    package_id: "",
    group_id: "",
    parent_phone: "",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: "",
    total_amount: 1_500_000,
    discount: 0,
  });

  const filtered = useMemo(() => {
    return initialLeads.filter((l) => {
      if (statusFilter && l.status !== statusFilter) return false;
      if (!q.trim()) return true;
      const s = `${l.first_name} ${l.last_name} ${l.phone} ${l.course_or_package}`.toLowerCase();
      return s.includes(q.toLowerCase());
    });
  }, [initialLeads, q, statusFilter]);

  async function onStatus(id: string, status: LeadStatus) {
    setBusy(id);
    try {
      await updateLeadStatus(id, status, noteDraft[id] ?? "");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function onConvert(leadId: string) {
    if (!form.course_id) return;
    setBusy(leadId);
    try {
      await convertLeadToStudent(leadId, {
        course_id: form.course_id,
        package_id: form.package_id || null,
        group_id: form.group_id || null,
        parent_phone: form.parent_phone,
        start_date: form.start_date,
        end_date: form.end_date || null,
        total_amount: form.total_amount,
        discount: form.discount,
      });
      setConvertId(null);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Qidiruv: ism, telefon, kurs..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter((e.target.value || "") as LeadStatus | "")}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Barcha statuslar</option>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">F.I.O</th>
              <th className="px-4 py-3">Telefon</th>
              <th className="px-4 py-3">Kurs/paket</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sana</th>
              <th className="px-4 py-3">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {l.first_name} {l.last_name}
                </td>
                <td className="px-4 py-3 text-slate-600">{l.phone}</td>
                <td className="px-4 py-3 text-slate-700">{l.course_or_package}</td>
                <td className="px-4 py-3">
                  <select
                    value={l.status}
                    disabled={busy === l.id}
                    onChange={(e) => onStatus(l.id, e.target.value as LeadStatus)}
                    className="max-w-[10rem] rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                  >
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  {formatDate(l.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <textarea
                      placeholder="Admin izohi"
                      rows={2}
                      value={noteDraft[l.id] ?? l.admin_note ?? ""}
                      onChange={(e) =>
                        setNoteDraft((prev) => ({ ...prev, [l.id]: e.target.value }))
                      }
                      className="w-40 rounded border border-slate-200 px-2 py-1 text-xs lg:w-48"
                    />
                    <button
                      type="button"
                      disabled={busy === l.id || l.status === "oquvchiga_aylantirildi"}
                      onClick={() => {
                        setConvertId(l.id);
                        setForm((f) => ({ ...f, parent_phone: l.phone }));
                      }}
                      className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      O‘quvchiga aylantirish
                    </button>
                    {busy === l.id && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">Natija yo‘q</p>
        )}
      </div>

      {convertId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">O‘quvchi yaratish</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <label>
                Kurs
                <select
                  value={form.course_id}
                  onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Paket (ixtiyoriy)
                <select
                  value={form.package_id}
                  onChange={(e) => setForm((f) => ({ ...f, package_id: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="">—</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Guruh (ixtiyoriy)
                <select
                  value={form.group_id}
                  onChange={(e) => setForm((f) => ({ ...f, group_id: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="">—</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Ota-ona telefoni
                <input
                  value={form.parent_phone}
                  onChange={(e) => setForm((f) => ({ ...f, parent_phone: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label>
                  Boshlanish
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label>
                  Tugash
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label>
                  Umumiy summa
                  <input
                    type="number"
                    value={form.total_amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, total_amount: Number(e.target.value) }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label>
                  Chegirma
                  <input
                    type="number"
                    value={form.discount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, discount: Number(e.target.value) }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConvertId(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
              >
                Bekor
              </button>
              <button
                type="button"
                onClick={() => convertId && onConvert(convertId)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
