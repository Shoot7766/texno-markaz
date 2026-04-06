"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Course } from "@/lib/types";
import { saveCourse } from "@/lib/actions/crm";
import { formatUzs } from "@/lib/format";
import { Loader2 } from "lucide-react";

export function CoursesAdminTable({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function save(id: string, patch: Record<string, unknown>) {
    setBusy(id);
    try {
      await saveCourse(id, patch);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Nomi</th>
            <th className="px-4 py-3">Narx</th>
            <th className="px-4 py-3">Davomiylik</th>
            <th className="px-4 py-3">Faol</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {courses.map((c) => (
            <CourseRow key={c.id} c={c} busy={busy === c.id} onSave={save} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CourseRow({
  c,
  busy,
  onSave,
}: {
  c: Course;
  busy: boolean;
  onSave: (id: string, patch: Record<string, unknown>) => void;
}) {
  const [price, setPrice] = useState(Number(c.price));
  const [duration, setDuration] = useState(c.duration);
  const [active, setActive] = useState(c.is_active);

  return (
    <tr>
      <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-28 rounded border border-slate-200 px-2 py-1 text-xs"
        />
        <div className="text-xs text-slate-400">{formatUzs(price)}</div>
      </td>
      <td className="px-4 py-3">
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-24 rounded border border-slate-200 px-2 py-1 text-xs"
        />
      </td>
      <td className="px-4 py-3">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            onSave(c.id, {
              price,
              duration,
              is_active: active,
            })
          }
          className="inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Saqlash
        </button>
      </td>
    </tr>
  );
}
