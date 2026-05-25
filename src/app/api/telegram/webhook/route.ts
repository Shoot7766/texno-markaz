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
        parse_mode: "Markdown"
      })
    });

    if (!res.ok) {
      // Telegram Markdown parselash xatosi bo'lsa, oddiy matn shaklida qayta yuborish
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text
        })
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
        action: action
      })
    });
  } catch (err) {
    console.error("sendTelegramChatAction error:", err);
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
      await sendTelegramMessage(senderChatId, "❌ *Kirish taqiqlangan!* Siz ushbu CRM tizimining Bosh AI Boshqaruvchisi botiga ma'mur emassiz.");
      return NextResponse.json({ ok: true });
    }

    let promptText = "";

    // 2. Ovozli xabar aniqlangan holat
    if (message.voice) {
      await sendTelegramChatAction(senderChatId, "record_voice");

      const fileId = message.voice.file_id;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!botToken || !apiKey) {
        await sendTelegramMessage(senderChatId, "⚠️ Serverda Telegram token yoki API Key sozlanmagan.");
        return NextResponse.json({ ok: true });
      }

      // a) Fayl manzilini olish
      const fileInfoRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
      const fileInfo = await fileInfoRes.json();
      const filePath = fileInfo.result?.file_path;

      if (filePath) {
        // b) Ovozli (.ogg) faylni yuklash
        const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
        const voiceFileRes = await fetch(fileUrl);
        const voiceBuffer = await voiceFileRes.arrayBuffer();

        // c) OpenAI Whisper API orqali matnga aylantirish (Transkripsiya)
        const formData = new FormData();
        const blob = new Blob([voiceBuffer], { type: "audio/ogg" });
        formData.append("file", blob, "voice.ogg");
        formData.append("model", "whisper-1");
        formData.append("language", "uz");

        const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`
          },
          body: formData
        });

        const transcriptionData = await whisperRes.json();
        promptText = transcriptionData.text || "";

        if (promptText.trim()) {
          await sendTelegramMessage(senderChatId, `🎤 *Eshityapman... Ovozli buyrug'ingiz:* \n_"${promptText}"_`);
        } else {
          await sendTelegramMessage(senderChatId, "⚠️ Ovozli xabarni matnga aylantira olmadim. Iltimos, balandroq va aniqroq gapiring.");
          return NextResponse.json({ ok: true });
        }
      } else {
        await sendTelegramMessage(senderChatId, "⚠️ Ovozli xabarni yuklab olishda muammo yuz berdi.");
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
      const responseMessage = `🤖 *AI CRM Boshqaruvchi:* \n\n${aiAction.message}`;
      await sendTelegramMessage(senderChatId, responseMessage);
    } catch (err: any) {
      await sendTelegramMessage(senderChatId, `❌ *Amal bajarilmadi:* \n${err.message || err}`);
    }

    return NextResponse.json({ ok: true });
  } catch (globalErr: any) {
    console.error("Telegram webhook error:", globalErr);
    return NextResponse.json({ ok: true });
  }
}
