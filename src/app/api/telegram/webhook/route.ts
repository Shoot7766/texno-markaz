import { NextRequest, NextResponse } from "next/server";

/**
 * Kelajakda Telegram bot webhook uchun tayyor endpoint.
 * Hozircha 200 qaytaradi — bot sozlanganda shu URL ni ulang.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  await request.json().catch(() => ({}));
  return NextResponse.json({ ok: true });
}
