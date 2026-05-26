import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServiceClient } from "@/lib/supabase/admin";

const CATEGORIES = [
  "Kiberxavfsizlik",
  "Dasturlash",
  "Kompyuter savodxonligi",
  "Sun'iy intellekt",
  "Microsoft Office",
  "Robototexnika",
];

export async function GET(req: NextRequest) {
  // 1. Security validation to prevent unauthorized trigger billing
  const authHeader = req.headers.get("Authorization");
  const urlSecret = req.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET || "cyber_tech_cron_secret_123";

  if (urlSecret !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();

    // 2. Select a random category
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    // 3. Fetch existing quizzes in this category to prevent duplicate titles/themes
    const { data: existingQuizzes } = await supabase
      .from("ct_quizzes")
      .select("title")
      .eq("category", category);

    const existingTitles = existingQuizzes && existingQuizzes.length > 0 
      ? existingQuizzes.map(q => q.title).join(", ") 
      : "Hozircha testlar yo'q";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY sozlanmagan" }, { status: 500 });
    }

    const isOpenAI = apiKey.trim().startsWith("sk-");
    let raw = "";

    const prompt = `
Siz professional ta'lim mutaxassisi va IT test tuzuvchisiz.
Ushbu kategoriya bo'yicha AYNAN 20 TA TEST SAVOLI tuzishingiz SHART va bu qat'iy talabdir!
Savollar soni kam ham, ko'p ham bo'lmasligi, aniq 20 ta bo'lishi kerak.

KATEGORIYA: ${category}

Tizimda allaqachon ushbu kategoriya bo'yicha quyidagi testlar sarlavhalari mavjud: "${existingTitles}".
Yangi tuziladigan test sarlavhasi (title) ham, savollarining mazmuni ham yuqoridagi mavjud testlardan butunlay farq qilsin, ularni takrorlamasin va mutlaqo o'xshash bo'lmasin. Kategoriya bo'yicha yangi va qiziqarli IT mavzularni tanlab, test tuzing.

MUHIM TALABLAR:
1. Barcha savollar va javoblar O'ZBEK TILIDA bo'lishi shart.
2. Savollar o'rta va qiyin qiyinlikda bo'lsin, biroz fikrlashni talab qilsin.
3. Har bir savolda aynan 4 ta variant bo'lsin (A, B, C, D).
4. Faqat BITTA to'g'ri javob bo'lsin.
5. Tushuntirish (explanation) qisqacha va aniq bo'lsin (bo'sh bo'lishiga mutlaqo yo'l qo'yilmasin).
6. JSON javobidagi "questions" massivi elementlari soni AYNAN 20 ta ekanligini qayta tekshir!

JAVOBNI FAQAT QUYIDAGI JSON FORMATDA QAYTARGIN (boshqa matn qo'shma, faqat JSON):
{
  "title": "Yangi test sarlavhasi (mavzuga oid mukammal sarlavha)",
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

    // 4. Dual model support (Gemini & OpenAI fallback routing)
    if (isOpenAI) {
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
              content: "Siz ta'limiy IT mutaxassisiz. Kategoriya bo'yicha to'liq 20 talik test tuzib, JSON shaklda qaytaring."
            },
            {
              role: "user",
              content: prompt,
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.8,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI Error: ${response.statusText}`);
      }

      const resData = await response.json();
      raw = resData.choices[0]?.message?.content || "";
    } else {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      raw = result.response.text();
    }

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI javobini JSON formatida o'qib bo'lmadi");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error("AI savollarni noto'g'ri formatda qaytardi");
    }

    // 5. Create new Quiz row in ct_quizzes
    const { data: quizData, error: quizErr } = await supabase
      .from("ct_quizzes")
      .insert({
        title: String(parsed.title || `${category} - AI test`).trim(),
        category: category,
        time_limit: 120, // 2 minutes per quiz
      })
      .select()
      .single();

    if (quizErr) throw new Error(quizErr.message);

    // 6. Clean and insert the 20 questions into ct_questions
    const toInsert = parsed.questions
      .filter((q: any) => q.questionText && Array.isArray(q.options) && q.options.length === 4)
      .map((q: any) => {
        const correctOpt = typeof q.correctOption === "number" ? q.correctOption : 0;
        return {
          quiz_id: quizData.id,
          question_text: String(q.questionText).trim(),
          options: q.options.map((o: any) => String(o).trim()),
          correct_option: correctOpt,
          explanation: String(q.explanation || "To'g'ri javob").trim(),
        };
      });

    const { error: qsErr } = await supabase.from("ct_questions").insert(toInsert);
    if (qsErr) throw new Error(qsErr.message);

    return NextResponse.json({
      success: true,
      category,
      quizTitle: parsed.title || `${category} - AI test`,
      questionsAdded: toInsert.length,
    });

  } catch (err: any) {
    console.error("Cron generator error:", err);
    return NextResponse.json({ error: err.message || "Tizim xatoligi yuz berdi" }, { status: 500 });
  }
}
