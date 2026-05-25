import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { partitionGroupsByWeekDays } from "@/lib/marketing/week-schedule";
import type { Group } from "@/lib/types";
import { DarsJadvaliClient } from "./client-page";
import type { NestedCourseField } from "@/lib/marketing/nested-course";

type PublicGroup = Pick<
  Group,
  "id" | "name" | "course_id" | "schedule" | "schedule_days" | "schedule_time" | "teacher" | "is_active"
> & {
  courses?: NestedCourseField;
};

type PublicStudent = {
  group_id: string;
  student_id: string;
  student_name: string;
};

// Enable Next.js ISR keshlash - caches page for 10 minutes (600 seconds)
export const revalidate = 600;

export const metadata = {
  title: "Dars jadvali",
  description: "Haftalik dars jadvali, guruhlar va o‘quvchilar ro‘yxati.",
};

export default async function DarsJadvaliPage() {
  const supabase = createPublicSupabaseClient();
  const [{ data: groupsData }, { data: studentsData }] = await Promise.all([
    supabase
      .from("groups")
      .select("id, name, course_id, schedule, schedule_days, schedule_time, teacher, is_active, courses(name, slug)")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase.rpc("get_public_group_students", { p_group_id: null }),
  ]);

  const groups = (groupsData ?? []) as unknown as PublicGroup[];
  const students = (studentsData ?? []) as PublicStudent[];
  
  const studentsByGroup = students.reduce(
    (acc, s) => {
      acc[s.group_id] = (acc[s.group_id] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const { byDay: groupsByDay, unscheduled: groupsWithoutDays } = partitionGroupsByWeekDays(groups);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="font-mono">
        <h1 className="text-3xl font-black uppercase tracking-wider text-white flex items-center gap-2.5">
          <span className="h-3 w-3 bg-[#39ff14] rounded-full animate-pulse" />
          Dars Jadvali.LOG
        </h1>
        <p className="mt-3 max-w-3xl text-xs text-slate-500 leading-relaxed">
          // TERMINAL DIAGNOSTIK JADVAL TIZIMI.
          Guruhlar jadvali haftalik ko‘rinishda. Mobil qurilmalarda qulay ko&apos;rish uchun kunlar bo&apos;yicha tezkor tablar orqali saralangan.
        </p>
        <p className="mt-2 text-[10px] text-slate-600 uppercase tracking-wider">
          <span className="text-slate-400 font-bold">INFO // ACTIVE STUDENTS COUNTER:</span> Guruhlarga admin panelda biriktirilgan, holati faol bo‘lgan o‘quvchilarni sanaydi.
        </p>
      </div>

      {/* Render the high-performance Client Tabs Component */}
      <DarsJadvaliClient
        groupsByDay={groupsByDay}
        groupsWithoutDays={groupsWithoutDays}
        studentsByGroup={studentsByGroup}
      />
    </div>
  );
}
