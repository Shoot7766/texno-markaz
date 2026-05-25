"use client";

import { useState } from "react";
import Link from "next/link";
import { pickNestedCourse } from "@/lib/marketing/nested-course";
import { WEEKDAY_SHORT_UZ } from "@/lib/marketing/week-schedule";
import { getTimeForDay, formatTimeDisplay } from "@/lib/format-time";

interface Props {
  groupsByDay: Record<string, any[]>;
  groupsWithoutDays: any[];
  studentsByGroup: Record<string, number>;
}

export function DarsJadvaliClient({
  groupsByDay,
  groupsWithoutDays,
  studentsByGroup,
}: Props) {
  // Default to today's day of week or first weekday
  const [activeTabDay, setActiveTabDay] = useState<string>(WEEKDAY_SHORT_UZ[0]);

  return (
    <div className="mt-8 space-y-6">
      
      {/* DESKTOP 7-COLUMN GRID VIEW (lg and up) */}
      <div className="hidden lg:block rounded-2xl border border-[#39ff14]/15 bg-black/60 p-4 backdrop-blur-xl">
        <div className="grid gap-3 grid-cols-7">
          {WEEKDAY_SHORT_UZ.map((day) => (
            <section key={day} className="rounded-xl border border-white/5 bg-[#05070c]/70 p-2.5 font-mono">
              <h2 className="rounded-md bg-[#39ff14]/10 border border-[#39ff14]/20 px-2 py-1 text-center text-[10px] font-mono font-black uppercase text-[#39ff14]">
                {day}
              </h2>
              <p className="mt-2 text-[9px] uppercase tracking-widest text-slate-500 font-black">&gt;_ DARSLAR</p>
              <div className="mt-2 space-y-2">
                {(groupsByDay[day] ?? []).map((g) => (
                  <Link
                    key={`${day}-${g.id}`}
                    href={`/dars-jadvali/${g.id}`}
                    className="block rounded-lg border border-white/5 bg-[#05070c]/90 p-2 relative group hover:border-[#39ff14]/40 transition duration-300"
                  >
                    {/* Cyber Brackets */}
                    <div className="absolute top-0 right-0 h-1.5 w-1.5 border-t border-r border-[#39ff14]/20 group-hover:border-[#39ff14]" />
                    <div className="absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l border-[#39ff14]/20 group-hover:border-[#39ff14]" />
                    
                    <p className="text-xs font-mono font-bold text-white leading-tight group-hover:text-[#39ff14] transition">{g.name}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500 font-mono truncate">
                      Yo‘nalish: {pickNestedCourse(g.courses)?.name ?? "Belgilanmagan"}
                    </p>
                    <p className="mt-1 text-[10px] text-[#00D1FF] font-mono font-bold">
                      {getTimeForDay(g.schedule_time, day) || g.schedule || "Vaqt kiritilmagan"}
                    </p>
                    <p className="mt-1 text-[9px] text-slate-500 font-mono uppercase tracking-wider font-bold">
                      o&apos;quvchilar: {studentsByGroup[g.id] ?? 0}
                    </p>
                  </Link>
                ))}
                {(groupsByDay[day] ?? []).length === 0 && (
                  <p className="rounded-lg border border-dashed border-white/5 px-2 py-4 text-center text-[10px] text-slate-600 font-mono uppercase">
                    Null node
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* MOBILE/TABLET RESPONSIVE TABS VIEW (smaller than lg) */}
      <div className="lg:hidden space-y-4">
        {/* Swipeable Tab bar */}
        <div className="flex gap-2 pb-2 overflow-x-auto border-b border-white/10 scrollbar-none">
          {WEEKDAY_SHORT_UZ.map((day) => {
            const isActive = activeTabDay === day;
            const lessonsCount = (groupsByDay[day] ?? []).length;
            return (
              <button
                key={day}
                onClick={() => setActiveTabDay(day)}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold border transition flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? "bg-[#39ff14]/10 border-[#39ff14] text-[#39ff14] shadow-lg shadow-[#39ff14]/5"
                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {day}
                {lessonsCount > 0 && (
                  <span className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] px-1 font-bold ${
                    isActive ? "bg-[#39ff14] text-black" : "bg-white/10 text-slate-400"
                  }`}>
                    {lessonsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Schedule List for the Active Tab */}
        <div className="space-y-3 animate-fade-in">
          {(groupsByDay[activeTabDay] ?? []).map((g) => (
            <Link
              key={g.id}
              href={`/dars-jadvali/${g.id}`}
              className="block rounded-2xl border border-white/5 bg-[#05070c]/90 p-4 font-mono hover:border-[#39ff14]/40 transition group relative"
            >
              {/* Brackets */}
              <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-[#39ff14]/20 group-hover:border-[#39ff14]" />
              <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-[#39ff14]/20 group-hover:border-[#39ff14]" />

              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white group-hover:text-[#39ff14] transition">{g.name}</p>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Yo‘nalish: {pickNestedCourse(g.courses)?.name ?? "Belgilanmagan"}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">o&apos;quvchilar: {studentsByGroup[g.id] ?? 0}</p>
                </div>
                
                <span className="rounded-lg bg-[#39ff14]/10 border border-[#39ff14]/20 px-2.5 py-1 text-[10px] font-mono font-bold text-[#39ff14]">
                  {getTimeForDay(g.schedule_time, activeTabDay) || g.schedule || "Vaqt yo'q"}
                </span>
              </div>
            </Link>
          ))}

          {(groupsByDay[activeTabDay] ?? []).length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/5 py-10 text-center text-slate-600 text-xs font-mono uppercase tracking-wider">
              Null node // Ushbu kunda darslar rejalashtirilmagan.
            </div>
          )}
        </div>
      </div>

      {/* Unscheduled groups fallback */}
      {groupsWithoutDays.length > 0 && (
        <section className="mt-8 rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-4 font-mono animate-fade-in">
          <h2 className="text-xs font-mono font-black uppercase tracking-wider text-amber-200/90 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            UNASSIGNED_KUNLAR_LIST
          </h2>
          <p className="mt-1 text-[10px] text-slate-500 leading-normal">
            // Bu guruhlar haftaning ma&apos;lum kunlariga bog&apos;lanmagan:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groupsWithoutDays.map((g) => (
              <Link
                key={g.id}
                href={`/dars-jadvali/${g.id}`}
                className="block rounded-xl border border-white/5 bg-[#05070c]/90 p-4 transition hover:border-amber-500/35 relative group font-mono"
              >
                <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-amber-500/20 group-hover:border-amber-500" />
                <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-amber-500/20 group-hover:border-amber-500" />

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-amber-400 transition">{g.name}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Yo‘nalish: {pickNestedCourse(g.courses)?.name ?? "Belgilanmagan"}
                    </p>
                    <p className="mt-1 text-[9px] text-slate-500 font-bold uppercase tracking-wider">o&apos;quvchilar: {studentsByGroup[g.id] ?? 0}</p>
                  </div>
                  <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[9px] font-black text-amber-400 font-mono">
                    {formatTimeDisplay(g.schedule_time) || g.schedule || "Vaqt yo'q"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
