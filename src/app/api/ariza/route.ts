import { NextRequest, NextResponse } from "next/server";
import { arizaSchema } from "@/lib/validators/ariza";
import { createServiceClient } from "@/lib/supabase/admin";
import { sendTelegramNotification } from "@/lib/telegram";

function normalizePhone(raw: string): string {
  const s = raw.replace(/\s/g, "");
  if (s.startsWith("+998")) return s;
  if (s.startsWith("998") && s.length >= 12) return `+${s}`;
  if (/^[0-9]{9}$/.test(s)) return `+998${s}`;
  return s;
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = arizaSchema.safeParse({
      ...json,
      phone: json.phone ? normalizePhone(String(json.phone)) : "",
    });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    if (data.website && data.website.length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const supabase = createServiceClient();

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: dup } = await supabase
      .from("leads")
      .select("id")
      .eq("phone", data.phone)
      .gte("created_at", since)
      .limit(1);

    if (dup && dup.length > 0) {
      return NextResponse.json(
        { ok: false, error: "Bu telefon bilan so‘nggi 24 soatda ariza bor" },
        { status: 429 }
      );
    }

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        age: data.age,
        course_or_package: data.course_or_package,
        preferred_time: data.preferred_time ?? "",
        source: data.source,
        comment: data.comment ?? "",
        status: "yangi",
        visitor_id: data.visitor_id ?? null,
      })
      .select("id")
      .single();

    if (error || !lead) {
      console.error("lead insert", error);
      return NextResponse.json({ ok: false, error: "Saqlashda xato" }, { status: 500 });
    }

    if (data.visitor_id) {
      await supabase
        .from("visitors")
        .update({ submitted_lead: true })
        .eq("visitor_id", data.visitor_id);
    }

    const text = [
      "<b>Yangi ariza</b>",
      `${data.first_name} ${data.last_name}`,
      data.phone,
      `Kurs/paket: ${data.course_or_package}`,
      `Manba: ${data.source}`,
    ].join("\n");
    await sendTelegramNotification(text);

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "Server xatosi — .env da SERVICE_ROLE tekshiring" },
      { status: 500 }
    );
  }
}
