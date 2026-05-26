"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Group, Student } from "@/lib/types";
import { upsertAttendance } from "@/lib/actions/crm";
import { Loader2, Users, ChevronDown, Calendar, Plus, Check, X, AlertCircle } from "lucide-react";

type Props = {
  students: Pick<Student, "id" | "first_name" | "last_name" | "group_id" | "status">[];
  groups: Pick<Group, "id" | "name">[];
  initialAttendance: { student_id: string; group_id: string | null; attendance_date: string; status: "keldi" | "kelmadi" | "kechikdi" }[];
};

export function AttendancePanel({ students, groups, initialAttendance }: Props) {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState<string>(groups[0]?.id || "");
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [busyCell, setBusyCell] = useState<string | null>(null);

  // Initialize date columns with the last 7 calendar days ending today
  const [dates, setDates] = useState<string[]>(() => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d.toISOString().slice(0, 10));
    }
    return arr;
  });

  // Client-side attendance map loaded from initial database records
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "keldi" | "kelmadi" | "kechikdi">>(() => {
    const map: Record<string, "keldi" | "kelmadi" | "kechikdi"> = {};
    initialAttendance.forEach((item) => {
      map[`${item.student_id}_${item.attendance_date}`] = item.status;
    });
    return map;
  });

  // Filter students based on selected group
  const activeStudents = students.filter((s) => s.status === "active");
  const displayStudents = selectedGroup
    ? activeStudents.filter((s) => s.group_id === selectedGroup)
    : activeStudents;

  // Add a new custom date column to the class journal
  function handleAddDate() {
    if (!customDate || dates.includes(customDate)) return;
    // Sort dates chronologically after adding
    setDates((prev) => [...prev, customDate].sort());
  }

  // Cycle attendance status: Empty -> Keldi (✅) -> Kelmadi (❌) -> Kechikdi (⏰) -> Empty
  async function handleCycleStatus(studentId: string, groupId: string | null, targetDate: string) {
    const key = `${studentId}_${targetDate}`;
    if (busyCell) return;

    const currentStatus = attendanceMap[key];
    let nextStatus: "keldi" | "kelmadi" | "kechikdi" | "" = "";

    if (!currentStatus) {
      nextStatus = "keldi";
    } else if (currentStatus === "keldi") {
      nextStatus = "kelmadi";
    } else if (currentStatus === "kelmadi") {
      nextStatus = "kechikdi";
    } else {
      nextStatus = "";
    }

    setBusyCell(key);

    // Optimistically update UI
    setAttendanceMap((prev) => {
      const updated = { ...prev };
      if (nextStatus) {
        updated[key] = nextStatus;
      } else {
        delete updated[key];
      }
      return updated;
    });

    try {
      await upsertAttendance(studentId, groupId, targetDate, nextStatus);
      router.refresh();
    } catch (err) {
      console.error("Attendance update failed:", err);
      // Revert optimistic update on failure
      setAttendanceMap((prev) => {
        const updated = { ...prev };
        if (currentStatus) {
          updated[key] = currentStatus;
        } else {
          delete updated[key];
        }
        return updated;
      });
    } finally {
      setBusyCell(null);
    }
  }

  // Bulk set all students for a specific date
  async function handleMarkAll(targetDate: string, status: "keldi" | "kelmadi") {
    if (busyCell || displayStudents.length === 0) return;
    setBusyCell(`all_${targetDate}`);

    try {
      for (const s of displayStudents) {
        const key = `${s.id}_${targetDate}`;
        setAttendanceMap((prev) => ({ ...prev, [key]: status }));
        await upsertAttendance(s.id, s.group_id ?? null, targetDate, status);
      }
      router.refresh();
    } catch (err) {
      console.error("Bulk mark failed:", err);
    } finally {
      setBusyCell(null);
    }
  }

  // Date formatter for headers
  const formatHeaderDate = (dateStr: string) => {
    try {
      const [, m, d] = dateStr.split("-");
      return `${d}/${m}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Control Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        
        {/* Left Side: Select Group */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users className="h-4.5 w-4.5 text-blue-600" />
            Guruhni tanlang:
            <div className="relative">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">Barcha o'quvchilar</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </label>
        </div>

        {/* Right Side: Add custom date column to journal */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <Calendar className="h-4 w-4 text-slate-500" />
            Sana qo'shish:
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="bg-transparent font-mono text-xs focus:outline-hidden text-slate-800 font-bold ml-1 cursor-pointer"
            />
          </div>
          <button
            type="button"
            onClick={handleAddDate}
            className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition cursor-pointer shadow-sm shadow-blue-500/10"
          >
            <Plus className="h-4 w-4" /> Ustun qo'shish
          </button>
        </div>

      </div>

      {/* Grid Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 px-1">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700">Belgilar:</span>
          <span className="flex items-center gap-1 font-medium"><span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">✅</span> Kelgan (+)</span>
          <span className="flex items-center gap-1 font-medium"><span className="flex h-5 w-5 items-center justify-center rounded bg-red-100 text-red-800 font-bold text-[10px]">❌</span> Kelmagan (-)</span>
          <span className="flex items-center gap-1 font-medium"><span className="flex h-5 w-5 items-center justify-center rounded bg-amber-100 text-amber-800 font-bold text-[10px]">⏰</span> Kechikkan (K)</span>
          <span className="flex items-center gap-1 font-medium"><span className="flex h-5 w-5 items-center justify-center rounded border border-dashed border-slate-300 text-slate-400 font-bold text-[10px] bg-slate-50">.</span> Belgilanmagan</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] bg-blue-50 text-blue-800 border border-blue-100 px-3 py-1 rounded-lg">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Katibani bosish orqali holatni o'zgartiring.</span>
        </div>
      </div>

      {/* Spreadsheet Grid Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          
          {/* Table Header */}
          <thead className="bg-slate-50">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-50 border-r border-slate-200 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 min-w-[200px]">
                F.I.Sh (O'quvchi)
              </th>
              {dates.map((d) => (
                <th key={d} className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-600 border-r border-slate-100 min-w-[90px]">
                  <div className="font-mono text-[11px] text-slate-800">{formatHeaderDate(d)}</div>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleMarkAll(d, "keldi")}
                      disabled={busyCell !== null}
                      title="Hamma keldi deb belgilash"
                      className="text-[9px] font-black text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-1 rounded transition disabled:opacity-30 cursor-pointer"
                    >
                      All+
                    </button>
                    <span className="text-slate-300 text-[9px]">|</span>
                    <button
                      onClick={() => handleMarkAll(d, "kelmadi")}
                      disabled={busyCell !== null}
                      title="Hamma kelmadi deb belgilash"
                      className="text-[9px] font-black text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-1 rounded transition disabled:opacity-30 cursor-pointer"
                    >
                      All-
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200 bg-white">
            {displayStudents.map((s) => {
              return (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Student Name row header (Sticky for horizontal scrolling) */}
                  <td className="sticky left-0 z-10 bg-white border-r border-slate-200 px-4 py-3 font-semibold text-slate-900 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    {s.first_name} {s.last_name}
                  </td>

                  {/* Attendance Date Cells */}
                  {dates.map((d) => {
                    const key = `${s.id}_${d}`;
                    const status = attendanceMap[key];
                    const isBusy = busyCell === key || busyCell === `all_${d}`;

                    let cellBg = "hover:bg-slate-100/50";
                    let iconContent = <span className="text-slate-300 font-mono">.</span>;

                    if (status === "keldi") {
                      cellBg = "bg-emerald-50/60 hover:bg-emerald-100/60";
                      iconContent = <span className="text-emerald-700 font-black text-xs">✅</span>;
                    } else if (status === "kelmadi") {
                      cellBg = "bg-red-50/60 hover:bg-red-100/60";
                      iconContent = <span className="text-red-700 font-black text-xs">❌</span>;
                    } else if (status === "kechikdi") {
                      cellBg = "bg-amber-50/60 hover:bg-amber-100/60";
                      iconContent = <span className="text-amber-700 font-black text-xs">⏰</span>;
                    }

                    return (
                      <td
                        key={d}
                        onClick={() => handleCycleStatus(s.id, s.group_id ?? null, d)}
                        className={`text-center border-r border-slate-100 cursor-pointer select-none transition-all duration-200 relative p-1.5 h-12 ${cellBg}`}
                      >
                        <div className="flex h-full w-full items-center justify-center">
                          {isBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          ) : (
                            iconContent
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

        </table>

        {displayStudents.length === 0 && (
          <div className="py-12 text-center text-slate-500 bg-slate-50">
            <Users className="mx-auto h-8 w-8 text-slate-400 opacity-60 mb-2" />
            <p className="text-sm font-semibold">Ushbu guruhda o'quvchilar mavjud emas.</p>
            <p className="text-xs text-slate-400 mt-1">Barcha guruhlarni tekshirib ko'ring yoki yangi o'quvchi qo'shing.</p>
          </div>
        )}
      </div>

    </div>
  );
}
