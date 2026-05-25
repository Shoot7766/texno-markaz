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
  const googleSttKey = process.env.GOOGLE_STT_API_KEY;
  const aiKey = process.env.GEMINI_API_KEY;

  // ── 1. Google Cloud Speech-to-Text (uz-UZ, eng aniq) ──────────────────────
  if (googleSttKey) {
    const bytes = new Uint8Array(audioBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Audio = btoa(binary);

    const sttRes = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${googleSttKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            encoding: "OGG_OPUS",
            sampleRateHertz: 48000,
            languageCode: "uz-UZ",
            alternativeLanguageCodes: ["ru-RU"],
            model: "latest_long",
            enableAutomaticPunctuation: true,
            useEnhanced: true,
          },
          audio: { content: base64Audio },
        }),
      }
    );

    if (!sttRes.ok) {
      const errBody = await sttRes.text();
      throw new Error(`Google STT xatosi (${sttRes.status}): ${errBody}`);
    }

    const sttData = await sttRes.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transcript = (sttData.results ?? []).map((r: any) => r.alternatives?.[0]?.transcript ?? "").join(" ").trim();
    if (transcript) return transcript;
    throw new Error("Google STT: ovozdan matn ajratilmadi. Aniqroq gapiring.");
  }

  // ── 2. OpenAI Whisper (agar sk- key bo'lsa) ───────────────────────────────
  if (aiKey?.trim().startsWith("sk-")) {
    const formData = new FormData();
    const fileObj = new File([audioBuffer], "voice.ogg", { type: "audio/ogg" });
    formData.append("file", fileObj);
    formData.append("model", "whisper-1");
    formData.append("language", "uz");

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}` },
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
  }

  // ── 3. Google Gemini (fallback) ────────────────────────────────────────────
  if (!aiKey) throw new Error("Hech qanday STT API key sozlanmagan. GOOGLE_STT_API_KEY yoki GEMINI_API_KEY kerak.");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(aiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const bytes2 = new Uint8Array(audioBuffer);
  let binary2 = "";
  for (let i = 0; i < bytes2.byteLength; i++) {
    binary2 += String.fromCharCode(bytes2[i]);
  }
  const base64Audio2 = btoa(binary2);

  const result = await model.generateContent([
    { inlineData: { mimeType: "audio/ogg", data: base64Audio2 } },
    "Bu ovozli xabar O'zbek tilida. Uni aniq transkripsiya qiling. Transkripsiyadan boshqa hech narsa yozmang. Sheva yoki ruscha so'zlar bo'lsa ham o'zbek harflarida yozing.",
  ]);

  const geminiText = result.response.text().trim();
  if (!geminiText) throw new Error("Gemini bo'sh transkripsiya qaytardi");
  return geminiText;
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
