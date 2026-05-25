import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = "https://oghuyltmzzkaubmmezeb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9naHV5bHRtenprYXVibW1lemViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzQ3NTMsImV4cCI6MjA5MDYxMDc1M30.f9bUoJcV9GHX-ri_9RNmT30Wz952tmGT074gP8JOr2A";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
