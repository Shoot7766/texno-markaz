import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";

// Yagona ruxsat etilgan admin email
const ALLOWED_ADMIN_EMAIL = "salomovshahboz02@gmail.com";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Kirish tekshiruvi
  if (!user) {
    redirect("/admin/login");
  }

  // 2. Email whitelist tekshiruvi — eng muhim qatlam
  if (user.email?.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
    // Boshqa emaildan kirganlarni darhol chiqarib yuborish
    await supabase.auth.signOut();
    redirect("/admin/login?error=not_allowed");
  }

  // 3. DB profilida is_admin tekshiruvi
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/admin/login?error=not_allowed");
  }

  return <AdminShell>{children}</AdminShell>;
}
