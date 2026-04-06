import { createClient } from "@supabase/supabase-js";

/** Anon kalit — faqat RLS ruxsat bergan operatsiyalar (masalan visitors insert) */
export function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase ommaviy kalitlari yo‘q");
  }
  return createClient(url, key);
}
