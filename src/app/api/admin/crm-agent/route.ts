import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processCrmAgentPrompt } from "@/lib/crm-agent-helper";

export async function POST(req: NextRequest) {
  // 1. Auth & Admin Authorization Tekshiruvi
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Faqat adminlar foydalana oladi" }, { status: 403 });
  }

  // 2. Promptni qabul qilish
  const { prompt: userPrompt } = await req.json();
  if (!userPrompt?.trim()) {
    return NextResponse.json({ error: "So'rov kiritilmagan" }, { status: 400 });
  }

  try {
    const aiAction = await processCrmAgentPrompt(userPrompt);
    return NextResponse.json(aiAction);
  } catch (err: any) {
    console.error("AI Agent error:", err);
    return NextResponse.json({ error: err.message || "AI Agent so'rovni bajara olmadi" }, { status: 500 });
  }
}
