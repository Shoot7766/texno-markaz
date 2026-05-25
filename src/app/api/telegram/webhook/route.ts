import { NextRequest, NextResponse } from "next/server";
import { processCrmAgentPrompt } from "@/lib/crm-agent-helper";

// Telegram API yordamchilari
async function sendTelegramMessage(chatId: string, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
      }),
    });

    if (!res.ok) {
      // Telegram Markdown parselash xatosi bo'lsa, oddiy matn shaklida qayta yuborish
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
        }),
      });
    }
  } catch (err) {
    console.error("sendTelegramMessage error:", err);
  }
}

async function sendTelegramChatAction(chatId: string, action: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        action: action,
      }),
    });
  } catch (err) {
    console.error("sendTelegramChatAction error:", err);
  }
}

// Ovozni matnga aylantirish — OpenAI Whisper yoki Gemini (key turiga qarab)
async function transcribeAudio(audioBuffer: ArrayBuffer): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY sozlanmagan");

  const isOpenAI = apiKey.trim().startsWith("sk-");

  if (isOpenAI) {
    // ── OpenAI Whisper STT ───────────────────────────────────────────────────
    const formData = new FormData();
    const fileObj = new File([audioBuffer], "voice.ogg", { type: "audio/ogg" });
    formData.append("file", fileObj);
    formData.append("model", "whisper-1");

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (!whisperRes.ok) {
      const errBody = await whisperRes.text();
      throw new Error(`Whisper xatosi (${whisperRes.status}): ${errBody}`);
    }

    const data = await whisperRes.json();
    const text = data.text ?? "";
    if (!text.trim()) throw new Error("Whisper bo'sh javob qaytardi");
    return text.trim();
  } else {
    // ── Google Gemini 2.0 Flash audio transkripsiya ──────────────────────────
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // ArrayBuffer ni base64 ga aylantirish
    const bytes = new Uint8Array(audioBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Audio = btoa(binary);

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "audio/ogg",
          data: base64Audio,
        },
      },
      "Ushbu ovozli xabarni o'zbek tilida aniq transkripsiya qiling. Faqat transkripsiya matnini qaytaring, boshqa hech narsa yozmang.",
    ]);

    const text = result.response.text().trim();
    if (!text) throw new Error("Gemini bo'sh transkripsiya qaytardi");
    return text;
  }
}

export async function POST(request: NextRequest) {
  // Webhook xavfsizligini tekshirish
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const update = await request.json().catch(() => null);
    if (!update || !update.message) {
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    const senderChatId = String(message.chat.id);

    // 1. Faqat ruxsat berilgan admin chat_id'sini tekshirish (whitelist)
    const allowedChatId = process.env.TELEGRAM_CHAT_ID;
    if (allowedChatId && senderChatId !== allowedChatId) {
      await sendTelegramMessage(
        senderChatId,
        "❌ *Kirish taqiqlangan!* Siz ushbu CRM tizimining Bosh AI Boshqaruvchisi botiga ma'mur emassiz."
      );
      return NextResponse.json({ ok: true });
    }

    let promptText = "";

    // 2. Ovozli xabar aniqlangan holat
    if (message.voice) {
      await sendTelegramChatAction(senderChatId, "record_voice");

      const fileId = message.voice.file_id;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      if (!botToken) {
        await sendTelegramMessage(senderChatId, "⚠️ Serverda Telegram token sozlanmagan.");
        return NextResponse.json({ ok: true });
      }

      // a) Fayl manzilini olish
      const fileInfoRes = await fetch(
        `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
      );
      const fileInfo = await fileInfoRes.json();
      const filePath = fileInfo.result?.file_path;

      if (!filePath) {
        await sendTelegramMessage(senderChatId, "⚠️ Ovozli xabarni yuklab olishda muammo yuz berdi.");
        return NextResponse.json({ ok: true });
      }

      // b) Ovozli (.ogg) faylni yuklash
      const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
      const voiceFileRes = await fetch(fileUrl);
      const voiceBuffer = await voiceFileRes.arrayBuffer();

      // c) Gemini API orqali transkripsiya
      try {
        promptText = await transcribeAudio(voiceBuffer);

        if (promptText.trim()) {
          await sendTelegramMessage(
            senderChatId,
            `🎤 *Ovozingizni eshitdim:*\n_"${promptText}"_`
          );
        } else {
          await sendTelegramMessage(
            senderChatId,
            "⚠️ Ovozli xabardan matn ajratib olinmadi. Aniqroq gapiring va qayta yuboring."
          );
          return NextResponse.json({ ok: true });
        }
      } catch (transcribeErr: any) {
        await sendTelegramMessage(
          senderChatId,
          `⚠️ *Transkripsiya xatosi:*\n${transcribeErr.message || "Noma'lum xato"}`
        );
        return NextResponse.json({ ok: true });
      }
    } else if (message.text) {
      promptText = message.text;
    }

    if (!promptText.trim()) {
      return NextResponse.json({ ok: true });
    }

    // 3. Matnli yoki ovozli buyruqni AI CRM Manager orqali bajarish
    await sendTelegramChatAction(senderChatId, "typing");

    try {
      const aiAction = await processCrmAgentPrompt(promptText);

      // Natijani Telegram bot orqali adminga chiroyli javob yuborish
      const responseMessage = `🤖 *AI CRM Boshqaruvchi:*\n\n${aiAction.message}`;
      await sendTelegramMessage(senderChatId, responseMessage);
    } catch (err: any) {
      await sendTelegramMessage(senderChatId, `❌ *Amal bajarilmadi:*\n${err.message || err}`);
    }

    return NextResponse.json({ ok: true });
  } catch (globalErr: any) {
    console.error("Telegram webhook error:", globalErr);
    return NextResponse.json({ ok: true });
  }
}
