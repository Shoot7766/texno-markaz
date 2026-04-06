import { createClient } from "@/lib/supabase/server";
import { PackagesAdminTable } from "@/components/admin/packages-admin-table";
import type { Package } from "@/lib/types";

export default async function AdminPaketlarPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("packages").select("*").order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paketlar boshqaruvi</h1>
        <p className="text-sm text-slate-500">Narx, bonus va tavsiya belgisi.</p>
      </div>
      <PackagesAdminTable packages={(data ?? []) as Package[]} />
    </div>
  );
}
