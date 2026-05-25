import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/admin/login-form";
import { BrandLogo } from "@/components/marketing/brand-logo";

const ALLOWED_ADMIN_EMAIL = "salomovshahboz02@gmail.com";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Agar admin allaqachon kirgan bo'lsa — panel'ga yo'naltir
  if (user && user.email?.toLowerCase() === ALLOWED_ADMIN_EMAIL.toLowerCase()) {
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
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-[#05070c]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(57,255,20,0.06),transparent)]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,209,255,0.06),transparent)]" />

      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(57,255,20,0.015)_2px,rgba(57,255,20,0.015)_4px)]" />

      {/* Card */}
      <div className="relative w-full max-w-sm space-y-6 rounded-2xl border border-[#39ff14]/15 bg-[#0a0f1c]/95 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#39ff14]/20 bg-[#39ff14]/10">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#39ff14]" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <BrandLogo
            logoUrl={settings?.logo_url}
            centerName={settings?.center_name ?? "Cyber Tech Academy"}
            size="lg"
            priority
          />
        </div>

        <div className="text-center">
          <h1 className="text-lg font-bold text-white">Xavfsiz Admin Kirish</h1>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            // AUTHORIZED PERSONNEL ONLY
          </p>
        </div>

        {/* Login form - Suspense for useSearchParams */}
        <Suspense fallback={
          <div className="h-32 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#39ff14]/30 border-t-[#39ff14]" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <p className="text-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          // CYBER TECH ACADEMY — SECURE PORTAL
        </p>
      </div>
    </div>
  );
}
