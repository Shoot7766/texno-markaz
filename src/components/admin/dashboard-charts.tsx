"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  leadsByDay: { date: string; count: number }[];
};

export function DashboardCharts({ leadsByDay }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900">So‘nggi 7 kun — arizalar</h2>
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={leadsByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-slate-600" />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Arizalar" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
