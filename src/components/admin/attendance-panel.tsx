"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Group, Student } from "@/lib/types";
import { upsertAttendance } from "@/lib/actions/crm";
import { Loader2, CheckCircle2, XCircle, Clock, Users, ChevronDown } from "lucide-react";

type Props = {
  students: Pick<Student, "id" | "first_name" | "last_name" | "group_id" | "status">[];
  groups: Pick<Group, "id" | "name">[];
};

export function AttendancePanel({ students, groups }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [marked, setMarked] = useState<Record<string, "keldi" | "kelmadi" | "kechikdi">>({});

  const activeStudents = students.filter((s) => s.status === "active");
  const displayStudents = selectedGroup
    ? activeStudents.filter((s) => s.group_id === selectedGroup)
    : activeStudents;

  async function mark(
    studentId: string,
    groupId: string | null,
    status: "keldi" | "kelmadi" | "kechikdi"
  ) {
    setBusy(studentId + status);
    try {
      await upsertAttendance(studentId, groupId, date, status);
      setMarked((prev) => ({ ...prev, [studentId]: status }));
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function markAll(status: "keldi" | "kelmadi") {
    setBusy("all");
    try {
      for (const s of displayStudents) {
        await upsertAttendance(s.id, s.group_id ?? null, date, status);
        setMarked((prev) => ({ ...prev, [s.id]: status }));
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  const keldiCount = Object.values(marked).filter((v) => v === "keldi").length;
  const kelmadCount = Object.values(marked).filter((v) => v === "kelmadi").length;

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          📅 Sana:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Users className="h-4 w-4 text-slate-400" />
          Guruh:
          <div className="relative">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 px-3 py-2 pr-8 text-sm"
            >
              <option value="">Barchasi</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </label>

        {/* Quick mark-all buttons */}
        <div className="flex gap-2 ml-auto">
          <button
            type="button"
            disabled={busy !== null || displayStudents.length === 0}
            onClick={() => markAll("keldi")}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy === "all" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Hammasi keldi
          </button>
          <button
            type="button"
            disabled={busy !== null || displayStudents.length === 0}
            onClick={() => markAll("kelmadi")}
            className="flex items-center gap-1.5 rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300 disabled:opacity-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            Hammasi kelmadi
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {Object.keys(marked).length > 0 && (
        <div className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
          <span className="font-medium text-emerald-600">✅ Keldi: {keldiCount}</span>
          <span className="font-medium text-slate-500">❌ Kelmadi: {kelmadCount}</span>
          <span className="text-slate-400">Jami: {displayStudents.length}</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">O'quvchi</th>
              <th className="px-4 py-3">Guruh</th>
              <th className="px-4 py-3">Holat</th>
              <th className="px-4 py-3">Belgilash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayStudents.map((s, idx) => {
              const gname = groups.find((g) => g.id === s.group_id)?.name ?? "—";
              const currentMark = marked[s.id];
              return (
                <tr
                  key={s.id}
                  className={`transition-colors ${
                    currentMark === "keldi"
                      ? "bg-emerald-50/60"
                      : currentMark === "kelmadi"
                      ? "bg-red-50/40"
                      : currentMark === "kechikdi"
                      ? "bg-amber-50/40"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {s.first_name} {s.last_name}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{gname}</td>
                  <td className="px-4 py-3">
                    {currentMark ? (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        currentMark === "keldi"
                          ? "bg-emerald-100 text-emerald-800"
                          : currentMark === "kechikdi"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {currentMark === "keldi" ? "✅" : currentMark === "kechikdi" ? "⏰" : "❌"} {currentMark}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(["keldi", "kelmadi", "kechikdi"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          disabled={busy !== null}
                          onClick={() => mark(s.id, s.group_id ?? null, st)}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                            currentMark === st
                              ? st === "keldi"
                                ? "bg-emerald-600 text-white"
                                : st === "kechikdi"
                                ? "bg-amber-500 text-white"
                                : "bg-red-600 text-white"
                              : st === "keldi"
                              ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                              : st === "kechikdi"
                              ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                              : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                          }`}
                        >
                          {busy === s.id + st ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : st === "keldi" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : st === "kechikdi" ? (
                            <Clock className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {displayStudents.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">Faol o'quvchi yo'q</p>
        )}
      </div>
    </div>
  );
}
