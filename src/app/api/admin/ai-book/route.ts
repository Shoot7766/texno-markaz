import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    if (!profile?.is_admin) return NextResponse.json({ error: "Faqat adminlar foydalana oladi" }, { status: 403 });

    // 2. Request body
    const { text } = await req.json();
    if (!text || text.trim().length < 100) {
      return NextResponse.json({ error: "Matn kamida 100 belgi bo'lishi kerak" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY sozlanmagan" }, { status: 500 });

    const isOpenAI = apiKey.trim().startsWith("sk-");
    let raw = "";

    const prompt = `
Siz professional ta'limiy AI mutaxassisi va tarjimonisiz.
Quyida foydalanuvchi tomonidan yuklangan kitob/darslik matni berilgan.
Sizning vazifangiz:
1. Ushbu matnni to'liq tahlil qiling, o'qing va tushunib oling.
2. Agar matn inglizcha, ruscha yoki boshqa tilda bo'lsa, uni O'T KIRGIN VA BADIY JIHATDAN MUKAMMAL O'ZBEK TILIGA tarjima qiling.
3. Ushbu kitobni quyidagi JSON formatida qaytaring (hech qanday qo'shimcha matnsiz, faqat toza JSON):
{
  "title": "Kitobning o'zbekcha tarjima qilingan sarlavhasi",
  "author": "Kitob muallifi (agar matnda topilmasa, 'Noma'lum muallif' yoki ehtimoliy manba nomi)",
  "pages": 150, // kitob sahifalar sonini taxmin qiling
  "category": "Kiberxavfsizlik" // "Kiberxavfsizlik", "Dasturlash", "Linux", "Tarmoq xavfsizligi", "Ma'lumotlar bazasi", "Sun'iy intellekt" toifalaridan mos keladigan bittasi,
  "summary": "Kitob haqida qisqacha o'zbekcha mazmun (summary) (o'quvchi bu kitobdan nimani o'rganadi, 2-3 ta gap)",
  "chapters": [
    {
      "title": "1-Bob: [Mavzu nomi o'zbekcha]",
      "content": "[Ushbu bobga tegishli to'liq batafsil tarjima qilingan o'quv matni. Kamida 200 ta so'zdan iborat o'quvchi uchun boy, tushunarli kontent bo'lsin]"
    }
  ]
}

QAYD:
- Faqat toza JSON qaytaring. Har bir bob ("chapters") matni boy, mazmunli va foydali bo'lsin.
- Matndagi barcha mantiqiy boblar va mavzularni to'liq ajratib oling. Matn hajmiga qarab, kitobni barcha tegishli boblarga (masalan: 1-Bob, 2-Bob, 3-Bob, 4-Bob, 5-Bob va h.k.) to'liq va mukammal ajrating. Sun'iy ravishda boblar sonini cheklamang, matndagi har bir muhim bo'lim va mavzuni alohida to'liq bob sifatida shakllantiring.

KITOB MATNI:
---
${text.substring(0, 45000)}
---
`;

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
              content: "Siz ta'limiy AI mutaxassisiz. Kitob matnini o'rganib, o'zbek tiliga tarjima qiling va ko'rsatilgan JSON shaklda to'liq qaytaring."
            },
            {
              role: "user",
              content: prompt,
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `OpenAI API Error: ${response.statusText}`);
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
      return NextResponse.json({ error: "AI javobini JSON formatida o'qib bo'lmadi" }, { status: 500 });
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);

  } catch (err: any) {
    console.error("AI Book error:", err);
    return NextResponse.json({ error: err.message || "AI xatoligi yuz berdi" }, { status: 500 });
  }
}
