"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

const ALLOWED_EMAIL = "salomovshahboz02@gmail.com";

// Google SVG icon
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginForm() {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const searchParams            = useSearchParams();

  // URL'dagi error param'larni tekshirish
  const urlError = searchParams.get("error");
  const urlEmail = searchParams.get("email");

  const getUrlErrorMessage = () => {
    if (urlError === "not_allowed")
      return `"${urlEmail || "Bu email"}" admin ro'yxatida yo'q. Faqat ${ALLOWED_EMAIL} kirishi mumkin.`;
    if (urlError === "auth_failed")
      return "Google orqali autentifikatsiya muvaffaqiyatsiz bo'ldi. Qayta urinib ko'ring.";
    if (urlError === "no_code")
      return "Kirish kodi topilmadi. Qayta urinib ko'ring.";
    return null;
  };

  const displayError = error || getUrlErrorMessage();

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
    }
    // Muvaffaqiyatli bo'lsa Google sahifasiga yo'naltiriladi
  }

  return (
    <div className="space-y-5">
      {/* Xato xabari */}
      {displayError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {displayError}
        </div>
      )}

      {/* Google OAuth tugmasi */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="
          group flex w-full items-center justify-center gap-3
          rounded-xl border border-white/10 bg-white/5
          px-4 py-3.5
          text-sm font-semibold text-white
          transition-all duration-300
          hover:border-white/25 hover:bg-white/10 hover:shadow-lg hover:shadow-black/20
          disabled:cursor-not-allowed disabled:opacity-50
          active:scale-[0.98]
        "
        id="google-login-btn"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        ) : (
          <GoogleIcon />
        )}
        <span>{loading ? "Yo'naltirilmoqda..." : "Google bilan kirish"}</span>
      </button>

      <p className="text-center text-[11px] text-slate-600">
        Faqat tasdiqlangan hisob qabul qilinadi.
      </p>
    </div>
  );
}
