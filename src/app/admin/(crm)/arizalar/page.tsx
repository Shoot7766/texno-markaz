import { createClient } from "@/lib/supabase/server";
import { LeadsTable } from "@/components/admin/leads-table";
import type { Course, Group, Lead, Package } from "@/lib/types";

export default async function ArizalarPage() {
  const supabase = await createClient();
  const [leadsRes, coursesRes, packagesRes, groupsRes] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("courses").select("id, name").order("name"),
    supabase.from("packages").select("id, name").order("name"),
    supabase.from("groups").select("id, name").eq("is_active", true).order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Arizalar</h1>
        <p className="text-sm text-slate-500">Status, izoh va o‘quvchiga aylantirish.</p>
      </div>
      <LeadsTable
        initialLeads={(leadsRes.data ?? []) as Lead[]}
        courses={(coursesRes.data ?? []) as Pick<Course, "id" | "name">[]}
        packages={(packagesRes.data ?? []) as Pick<Package, "id" | "name">[]}
        groups={(groupsRes.data ?? []) as Pick<Group, "id" | "name">[]}
      />
    </div>
  );
}
