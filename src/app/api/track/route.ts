import { NextRequest, NextResponse } from "next/server";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      visitor_id,
      page_path,
      referrer_path,
      package_slug,
      course_slug,
      utm_source,
      utm_medium,
      utm_campaign,
    } = body as Record<string, string | undefined>;

    if (!visitor_id || typeof visitor_id !== "string" || visitor_id.length > 80) {
      return NextResponse.json({ ok: false, error: "visitor_id" }, { status: 400 });
    }

    const supabase = createPublicSupabaseClient();
    const { error } = await supabase.from("visitors").insert({
      visitor_id,
      page_path: page_path?.slice(0, 500) ?? "/",
      referrer_path: referrer_path?.slice(0, 500) ?? "",
      package_slug: package_slug?.length ? package_slug.slice(0, 200) : null,
      course_slug: course_slug?.length ? course_slug.slice(0, 200) : null,
      utm_source: utm_source?.slice(0, 200) ?? "",
      utm_medium: utm_medium?.slice(0, 200) ?? "",
      utm_campaign: utm_campaign?.slice(0, 200) ?? "",
      submitted_lead: false,
    });

    if (error) {
      console.error("track insert", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
