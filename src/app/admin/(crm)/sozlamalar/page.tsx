import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/settings-form";
import type { PublicStats, Settings as SettingsRow } from "@/lib/types";

export default async function SozlamalarPage() {
  const supabase = await createClient();
  const [{ data: settings }, { data: stats }] = await Promise.all([
    supabase.from("settings").select("*").limit(1).maybeSingle(),
    supabase.from("public_stats").select("*").limit(1).maybeSingle(),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sozlamalar</h1>
        <p className="text-sm text-slate-500">Markaz, aloqa, SEO va bosh sahifa statistikasi.</p>
      </div>
      <SettingsForm
        settings={
          (settings ?? {
            center_name: "Texno Markaz",
            phone: "",
            telegram: "",
            instagram: "",
            address: "",
            logo_url: "",
            seo_title: "",
            seo_description: "",
          }) as SettingsRow
        }
        stats={{
          students_count: stats?.students_count ?? 0,
          graduated_count: stats?.graduated_count ?? 0,
          employed_count: stats?.employed_count ?? 0,
          applications_count: (stats as PublicStats | null)?.applications_count ?? 0,
          active_students_count: (stats as PublicStats | null)?.active_students_count ?? 0,
        }}
      />
    </div>
  );
}
