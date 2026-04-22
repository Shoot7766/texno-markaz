import { createClient } from "@/lib/supabase/server";
import type { Course, Group } from "@/lib/types";
import { GroupsManager } from "@/components/admin/groups-manager";

export default async function GuruhlarPage() {
  const supabase = await createClient();
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .order("name", { ascending: true });
  const { data: courses } = await supabase.from("courses").select("id, name");
  const rows = (groups ?? []) as Group[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Guruhlar</h1>
        <p className="text-sm text-slate-500">Guruh yaratish va dars jadvalini boshqarish.</p>
      </div>
      <GroupsManager
        groups={rows}
        courses={(courses ?? []) as Pick<Course, "id" | "name">[]}
      />
    </div>
  );
}
