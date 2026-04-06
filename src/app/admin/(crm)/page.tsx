import type { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { AlertTriangle, Bell, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [visitorsRes, leadsRes, studentsRes] = await Promise.all([
    supabase.from("visitors").select("visitor_id, package_slug, course_slug, submitted_lead"),
    supabase.from("leads").select("id, course_or_package, created_at"),
    supabase.from("students").select("*"),
  ]);

  const visits = visitorsRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const students = studentsRes.data ?? [];

  const uniqueVisitors = new Set(visits.map((v) => v.visitor_id)).size;
  const totalVisits = visits.length;
  const leadsCount = leads.length;
  const visitorsConverted = new Set(
    visits.filter((v) => v.submitted_lead).map((v) => v.visitor_id)
  ).size;
  const conversion =
    uniqueVisitors > 0
      ? Math.round((visitorsConverted / uniqueVisitors) * 1000) / 10
      : 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  const leadsToday = leads.filter((l) => l.created_at?.startsWith(todayStr)).length;

  const pkgCounts: Record<string, number> = {};
  visits.forEach((v) => {
    if (v.package_slug) {
      pkgCounts[v.package_slug] = (pkgCounts[v.package_slug] ?? 0) + 1;
    }
  });
  const topPackageSlug = Object.entries(pkgCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const courseViewCounts: Record<string, number> = {};
  visits.forEach((v: { course_slug?: string | null }) => {
    if (v.course_slug) {
      courseViewCounts[v.course_slug] = (courseViewCounts[v.course_slug] ?? 0) + 1;
    }
  });
  const topCourseSlug = Object.entries(courseViewCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const leadCourseCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const k = l.course_or_package ?? "";
    leadCourseCounts[k] = (leadCourseCounts[k] ?? 0) + 1;
  });
  const topLeadCourse = Object.entries(leadCourseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const activeStudents = students.filter((s) => s.status === "active").length;
  const debtors = students.filter((s) => {
    const due = Number(s.total_amount) - Number(s.discount) - Number(s.paid_amount);
    return due > 0;
  }).length;

  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const endingSoon = students.filter((s) => {
    if (!s.end_date || s.status !== "active") return false;
    const end = new Date(s.end_date).getTime();
    return end - now.getTime() < weekMs && end - now.getTime() > 0;
  });

  const attendanceRows = await supabase
    .from("attendance")
    .select("status, student_id")
    .gte("attendance_date", new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));

  const att = attendanceRows.data ?? [];
  const keldi = att.filter((a) => a.status === "keldi").length;
  const attendancePct = att.length ? Math.round((keldi / att.length) * 1000) / 10 : 0;

  const chartLeadsByDay = buildLast7Days(leads);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Boshqaruv paneli</h1>
        <p className="text-sm text-slate-500">Umumiy ko‘rsatkichlar va tezkor ogohlantirishlar.</p>
      </div>

      {(endingSoon.length > 0 || debtors > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          {endingSoon.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <Bell className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Kurs tugashi yaqin</p>
                <p className="mt-1 text-amber-900/90">
                  {endingSoon.length} o‘quvchi: 7 kun ichida tugash sanasi.
                </p>
                <Link href="/admin/oquvchilar" className="mt-2 inline-block text-amber-800 underline">
                  Ro‘yxatga o‘tish
                </Link>
              </div>
            </div>
          )}
          {debtors > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Qarzdorlar</p>
                <p className="mt-1">{debtors} o‘quvchida to‘liq to‘lov kutilmoqda.</p>
                <Link href="/admin/tollov" className="mt-2 inline-block text-red-800 underline">
                  To‘lovlarga o‘tish
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Jami tashrif (yozuv)" value={String(totalVisits)} />
        <StatCard title="Noyob tashrif" value={String(uniqueVisitors)} />
        <StatCard title="Arizalar" value={String(leadsCount)} />
        <StatCard
          title="Konversiya (tashrif → ariza) %"
          value={`${conversion}%`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard title="Bugungi arizalar" value={String(leadsToday)} />
        <StatCard title="Faol o‘quvchilar" value={String(activeStudents)} />
        <StatCard title="Davomat (oy) %" value={`${attendancePct}%`} />
        <StatCard title="Qarzdorlar" value={String(debtors)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Eng ko‘p tanlangan (ariza matni)</h2>
          <p className="mt-2 text-lg font-medium text-blue-600">{topLeadCourse}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Eng ko‘p ko‘rilgan paket (slug)</h2>
          <p className="mt-2 text-lg font-medium text-violet-600">{topPackageSlug}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Eng ko‘p ko‘rilgan kurs sahifasi (slug)</h2>
          <p className="mt-2 text-lg font-medium text-emerald-700">{topCourseSlug}</p>
        </div>
      </div>

      <DashboardCharts leadsByDay={chartLeadsByDay} />

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Tezkor havolalar</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/admin/arizalar" className="text-blue-600 hover:underline">
            Arizalar
          </Link>
          <Link href="/admin/oquvchilar" className="text-blue-600 hover:underline">
            O‘quvchilar
          </Link>
          <Link href="/api/admin/export/leads" className="text-blue-600 hover:underline">
            Arizalar CSV
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function buildLast7Days(leads: { created_at?: string }[]) {
  const days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = leads.filter((l) => l.created_at?.startsWith(key)).length;
    days.push({ date: key.slice(5), count });
  }
  return days;
}
