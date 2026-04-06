"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Package } from "@/lib/types";
import { savePackage } from "@/lib/actions/crm";
import { formatUzs } from "@/lib/format";
import { Loader2 } from "lucide-react";

export function PackagesAdminTable({ packages }: { packages: Package[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function save(id: string, patch: Record<string, unknown>) {
    setBusy(id);
    try {
      await savePackage(id, patch);
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
            <th className="px-4 py-3">Bonus</th>
            <th className="px-4 py-3">Tavsiya</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {packages.map((p) => (
            <PackageRow key={p.id} p={p} busy={busy === p.id} onSave={save} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PackageRow({
  p,
  busy,
  onSave,
}: {
  p: Package;
  busy: boolean;
  onSave: (id: string, patch: Record<string, unknown>) => void;
}) {
  const [price, setPrice] = useState(Number(p.price));
  const [bonus, setBonus] = useState(p.bonus);
  const [rec, setRec] = useState(p.is_recommended);
  const [active, setActive] = useState(p.is_active);

  return (
    <tr>
      <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
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
          value={bonus}
          onChange={(e) => setBonus(e.target.value)}
          className="w-40 rounded border border-slate-200 px-2 py-1 text-xs"
        />
      </td>
      <td className="px-4 py-3">
        <input type="checkbox" checked={rec} onChange={(e) => setRec(e.target.checked)} />
      </td>
      <td className="px-4 py-3">
        <label className="mr-2 text-xs text-slate-500">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />{" "}
          faol
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            onSave(p.id, {
              price,
              bonus,
              is_recommended: rec,
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
