import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/admin/login-form";
import { BrandLogo } from "@/components/marketing/brand-logo";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.is_admin) {
      redirect("/admin");
    }
  }

  const { data: settings } = await supabase
    .from("settings")
    .select("logo_url, center_name")
    .limit(1)
    .maybeSingle();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-[#0B0F1A]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,209,255,0.12),transparent)]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(108,99,255,0.12),transparent)]" />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#12182a]/90 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        <div className="mb-6 flex justify-center">
          <LinkBrand
            logoUrl={settings?.logo_url}
            centerName={settings?.center_name ?? "Texno Markaz"}
          />
        </div>
        <h1 className="text-center text-xl font-bold text-white">Admin kirish</h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Faqat tasdiqlangan administratorlar uchun.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

function LinkBrand({
  logoUrl,
  centerName,
}: {
  logoUrl?: string | null;
  centerName: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <BrandLogo logoUrl={logoUrl} centerName={centerName} size="lg" priority />
    </div>
  );
}
