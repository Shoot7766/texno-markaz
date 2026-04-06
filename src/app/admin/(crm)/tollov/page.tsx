import { createClient } from "@/lib/supabase/server";
import { PaymentsPanel } from "@/components/admin/payments-panel";
import type { Payment, Student } from "@/lib/types";

export default async function TolovPage() {
  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .order("paid_at", { ascending: false })
    .limit(100);
  const { data: students } = await supabase.from("students").select("id, first_name, last_name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">To‘lovlar</h1>
        <p className="text-sm text-slate-500">Tarix, yangi to‘lov va qarzdorlik.</p>
      </div>
      <PaymentsPanel
        payments={(payments ?? []) as Payment[]}
        students={(students ?? []) as Pick<Student, "id" | "first_name" | "last_name">[]}
      />
    </div>
  );
}
