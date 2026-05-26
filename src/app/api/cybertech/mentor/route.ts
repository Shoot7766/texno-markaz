import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServiceClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Xabar kiritilmadi" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY sozlanmagan" }, { status: 500 });
    }

    const supabase = createServiceClient();
    
    // Fetch all books dynamically from the hidden courses record in Supabase
    const { data: dbCourse } = await supabase
      .from("courses")
      .select("description")
      .eq("slug", "cyber-tech-books-data")
      .maybeSingle();

    let booksContext = "";
    if (dbCourse?.description) {
      try {
        const books = JSON.parse(dbCourse.description);
        booksContext = books.map((b: any, idx: number) => {
          let bookText = `${idx + 1}. Kitob nomi: ${b.title}\nMuallif: ${b.author}\nKategoriya: ${b.category}\nQisqacha mazmuni: ${b.summary}\n`;
          if (Array.isArray(b.chapters)) {
            b.chapters.forEach((ch: any) => {
              bookText += `  - Bob: ${ch.title}\nTarkibi: ${ch.content.substring(0, 1000)}\n`;
            });
          }
          return bookText;
        }).join("\n---\n");
      } catch (e) {
        console.error("Failed to parse books JSON in AI Mentor context generation:", e);
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: `Siz "Cyber Tech" ta'lim platformasining "Kiber-Mentor" nomli sun'iy intellekt yo'riqchisisiz.
Sizning vazifangiz foydalanuvchining kiberxavfsizlik, dasturlash va boshqa IT sohalariga oid savollariga o'zbek tilida professional javob berishdir.

MUHIM BILIM MANBAI (Kutubxonamizdagi kitoblar):
Quyida platformadagi kutubxonaga yuklangan darsliklar va kitoblar berilgan. Agar foydalanuvchi shu kitoblar haqida so'rasa, yoki kitoblarni tarjima qilib berishni/tushuntirishni so'rasa, AYNAN ushbu kitob matnlaridan foydalanib o'zbek tilida mukammal javob bering, ulardagi bilimlarni tushuntiring, tarjima qiling va dars bering:
---
${booksContext}
---

Muloqot tillari: O'zbekcha (asosiy), Ruscha, Inglizcha.
Javoblaringiz qisqa, aniq, do'stona va amaliy misollar bilan boyitilgan bo'lsin.`
    });

    const chat = model.startChat({
      history: history.map((h: any) => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage(message);
    const replyText = result.response.text();

    return NextResponse.json({ reply: replyText });

  } catch (err: any) {
    console.error("AI Mentor Chat error:", err);
    return NextResponse.json({ error: err.message || "AI xatoligi yuz berdi" }, { status: 500 });
  }
}
