"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Payment, Student } from "@/lib/types";
import { addPayment } from "@/lib/actions/crm";
import { formatUzs } from "@/lib/format";
import { Loader2 } from "lucide-react";

type Props = {
  payments: Payment[];
  students: Pick<Student, "id" | "first_name" | "last_name">[];
};

export function PaymentsPanel({ payments, students }: Props) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [amount, setAmount] = useState(500_000);
  const [method, setMethod] = useState<"naqd" | "karta" | "online">("naqd");
  const [note, setNote] = useState("");
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) return;
    setLoading(true);
    try {
      const iso = new Date(paidAt + "T12:00:00").toISOString();
      await addPayment(studentId, amount, method, note, iso);
      setNote("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const name = (id: string) => {
    const s = students.find((x) => x.id === id);
    return s ? `${s.first_name} ${s.last_name}` : id;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        onSubmit={onAdd}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="font-semibold text-slate-900">Yangi to‘lov</h2>
        <div className="mt-4 space-y-3 text-sm">
          <label className="block">
            O‘quvchi
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            Summa
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block">
            Usul
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as typeof method)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              <option value="naqd">Naqd</option>
              <option value="karta">Karta</option>
              <option value="online">Onlayn</option>
            </select>
          </label>
          <label className="block">
            Sana
            <input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block">
            Izoh
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading || !studentId}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Qo‘shish
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">So‘nggi to‘lovlar</h2>
        <ul className="mt-4 max-h-[480px] space-y-3 overflow-y-auto text-sm">
          {payments.map((p) => (
            <li
              key={p.id}
              className="flex flex-col border-b border-slate-100 pb-3 last:border-0"
            >
              <span className="font-medium text-slate-900">{formatUzs(Number(p.amount))}</span>
              <span className="text-slate-600">{name(p.student_id)}</span>
              <span className="text-xs text-slate-400">
                {p.method} · {new Date(p.paid_at).toLocaleString("uz-UZ")}
              </span>
            </li>
          ))}
          {payments.length === 0 && <li className="text-slate-500">To‘lov yo‘q</li>}
        </ul>
      </div>
    </div>
  );
}
