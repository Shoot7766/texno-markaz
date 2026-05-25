import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Faqat shu email admin bo'la oladi
const ALLOWED_ADMIN_EMAIL = "salomovshahboz02@gmail.com";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=no_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
  }

  const email = data.user.email ?? "";

  // ── Faqat ruxsat etilgan email kirishi mumkin ──────────────────────────────
  if (email.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/admin/login?error=not_allowed`
    );
  }

  // ── Profil is_admin=true ekanligini ta'minlash ────────────────────────────
  await supabase
    .from("profiles")
    .upsert({ id: data.user.id, is_admin: true }, { onConflict: "id" });

  return NextResponse.redirect(`${origin}${next}`);
}
