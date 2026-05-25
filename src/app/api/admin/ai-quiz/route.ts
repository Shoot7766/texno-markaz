import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES = [
  "Kompyuter savodxonligi",
  "Dasturlash",
  "Microsoft Office",
  "Sun'iy intellekt",
  "Robototexnika",
  "Kiberxavfsizlik",
];

export async function POST(req: NextRequest) {
  // ── Auth tekshiruvi ──────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin)
    return NextResponse.json({ error: "Faqat adminlar foydalana oladi" }, { status: 403 });

  // ── So'rov ma'lumotlari ───────────────────────────────────────────────────
  const { text, category, questionCount = 10, difficulty = "o'rta", language = "uz" } =
    await req.json();

  if (!text?.trim())
    return NextResponse.json({ error: "Matn kiritilmagan" }, { status: 400 });

  if (!CATEGORIES.includes(category))
    return NextResponse.json({ error: "Noto'g'ri kategoriya" }, { status: 400 });

  // ── Gemini & OpenAI API ──────────────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    return NextResponse.json({ error: "GEMINI_API_KEY yoki OpenAI kaliti sozlanmagan. .env faylga qo'shing." }, { status: 500 });

  const isOpenAI = apiKey.trim().startsWith("sk-");

  // Mavjud test sarlavhalarini olish (o'xshash testlar bo'lishini oldini olish uchun)
  const { data: existingQuizzes } = await supabase
    .from("ct_quizzes")
    .select("title")
    .eq("category", category);
  
  const existingTitles = existingQuizzes && existingQuizzes.length > 0 
    ? existingQuizzes.map(q => q.title).join(", ") 
    : "Hozircha testlar yo'q";

  const langInstruction = language === "uz"
    ? "Barcha savollar va javoblar O'ZBEK TILIDA bo'lishi shart."
    : language === "ru"
    ? "Все вопросы и ответы должны быть на РУССКОМ ЯЗЫКЕ."
    : "All questions and answers must be in ENGLISH.";

  const difficultyMap: Record<string, string> = {
    "oson": "Savollar boshlang'ich darajada, oddiy va tushunarli bo'lsin.",
    "o'rta": "Savollar o'rta qiyinlikda bo'lsin, biroz fikrlashni talab qilsin.",
    "qiyin": "Savollar murakkab, chuqur bilim talab qiladigan darajada bo'lsin.",
  };

  const prompt = `
Sen professional ta'lim mutaxassisi va test tuzuvchisan.
Berilgan matn asosida AYNAN ${questionCount} TA TEST SAVOLI tuzishing SHART va bu qat'iy talabdir!
Savollar soni kam ham, ko'p ham bo'lmasligi, aniq ${questionCount} ta bo'lishi kerak.

MUHIM REKOMENDATSIYA (O'xshash testlar bo'lishini oldini olish):
Ushbu kategoriya bo'yicha tizimda allaqachon quyidagi testlar mavjud: "${existingTitles}".
Yangi tuziladigan test sarlavhasi (title) ham, savollarining mazmuni ham yuqoridagi mavjud testlardan butunlay farq qilsin, ularni takrorlamasin va mutlaqo o'xshash bo'lmasin. Agar matn juda o'xshash bo'lsa ham, savollarni mutlaqo boshqa rakursdan va boshqacha savollar qilib yangidan tuzgin.

MUHIM TALABLAR:
1. ${langInstruction}
2. ${difficultyMap[difficulty] || difficultyMap["o'rta"]}
3. Har bir savolda aynan 4 ta variant bo'lsin (A, B, C, D).
4. Faqat BITTA to'g'ri javob bo'lsin.
5. Savollar matn mazmuning turli qismlarini qamrab olsin.
6. Tushuntirish (explanation) qisqacha va aniq bo'lsin (bo'sh bo'lishiga mutlaqo yo'l qo'yilmasin).
7. Savollar bir-biridan mustaqil bo'lsin.
8. JSON javobidagi "questions" massivi elementlari soni AYNAN ${questionCount} ta ekanligini qayta tekshir!

KATEGORIYA: ${category}

MATN:
---
${text.substring(0, 15000)}
---

JAVOBNI FAQAT QUYIDAGI JSON FORMATDA QAYTARGIN (boshqa matn qo'shma, faqat JSON):
{
  "title": "Test sarlavhasi (matn mavzusiga mos)",
  "questions": [
    {
      "questionText": "Savol matni",
      "options": ["A varianti", "B varianti", "C varianti", "D varianti"],
      "correctOption": 0,
      "explanation": "Nima uchun bu javob to'g'ri ekanligi"
    }
  ]
}

correctOption: 0=A, 1=B, 2=C, 3=D
`;

  try {
    let raw = "";

    if (isOpenAI) {
      // ── OpenAI API Ulanishi ─────────────────────────────────────────────────
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Sen professional ta'lim mutaxassisi va test tuzuvchisan. Sening vazifang foydalanuvchi so'ragan matndan AYNAN ${questionCount} ta test savolini to'liq JSON formatda qaytarishdir.`
            },
            {
              role: "user",
              content: prompt,
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 4096, // Kattaroq testlar (masalan 20-30 talik) kesilib qolmasligi uchun
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson.error?.message || `OpenAI xatosi: ${response.statusText}`;
        return NextResponse.json({ error: errMsg }, { status: 500 });
      }

      const resData = await response.json();
      raw = resData.choices[0]?.message?.content || "";
    } else {
      // ── Google Gemini API Ulanishi ──────────────────────────────────────────
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      raw = result.response.text();
    }

    // JSON ni ajratib olish (markdown code block bo'lishi mumkin)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
      return NextResponse.json({ error: "AI javobini tahlil qilib bo'lmadi. Qayta urining." }, { status: 500 });

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.questions || !Array.isArray(parsed.questions))
      return NextResponse.json({ error: "AI noto'g'ri format qaytardi." }, { status: 500 });

    // Agar qaytarilgan sarlavha bazadagi bilan 100% bir xil bo'lsa, nomini o'zgartiramiz (duplicate oldini olish)
    const { data: duplicate } = await supabase
      .from("ct_quizzes")
      .select("id")
      .eq("title", String(parsed.title || "").trim())
      .maybeSingle();
    if (duplicate) {
      parsed.title = `${String(parsed.title || "").trim()} (Yangi)`;
    }

    // Validatsiya va Variantlarni to'liq aralashtirish (90% A javob bo'lib qolmasligi uchun)
    const cleaned = parsed.questions
      .filter((q: any) =>
        q.questionText &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctOption === "number" &&
        q.explanation
      )
      .map((q: any) => {
        const questionText = String(q.questionText).trim();
        const originalOptions = q.options.map((o: any) => String(o).trim());
        const originalCorrect = Number(q.correctOption);
        const explanation = String(q.explanation).trim();

        // 1. To'g'ri javob matnini saqlab qolamiz
        const correctText = originalOptions[originalCorrect] || originalOptions[0];

        // 2. Variantlar ro'yxatini nusxalaymiz va aralashtiramiz (Fisher-Yates algoritmi)
        const shuffled = [...originalOptions];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // 3. Yangi aralashgan ro'yxatdan to'g'ri javobning yangi indeksini topamiz
        let newCorrectOption = shuffled.indexOf(correctText);
        if (newCorrectOption === -1) {
          newCorrectOption = 0;
        }

        return {
          questionText,
          options: shuffled,
          correctOption: newCorrectOption,
          explanation,
        };
      });

    return NextResponse.json({
      title: parsed.title || `${category} — AI test`,
      questions: cleaned,
      totalGenerated: cleaned.length,
    });

  } catch (err: any) {
    console.error("AI error:", err);
    
    let friendlyError = "AI xatoligi yuz berdi. Qayta urinib ko'ring.";
    const errMsg = String(err.message || "");
    
    if (errMsg.includes("429") || errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("limit")) {
      friendlyError = "Bepul so'rovlar limiti (Rate Limit) vaqtincha to'ldi. Iltimos, 15-20 soniya kutib, qayta urinib ko'ring.";
    } else if (errMsg.includes("API key not valid") || errMsg.toLowerCase().includes("api_key") || errMsg.includes("invalid key")) {
      friendlyError = "AI API kaliti noto'g'ri sozlangan yoki faol emas. .env faylini tekshiring.";
    } else if (err.message) {
      friendlyError = err.message;
    }

    return NextResponse.json(
      { error: friendlyError },
      { status: 500 }
    );
  }
}
