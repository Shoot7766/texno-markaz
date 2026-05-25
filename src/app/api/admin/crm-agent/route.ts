import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import {
  createManualStudent,
  createGroup,
  addPayment,
  updateStudent,
  updateLeadStatus,
} from "@/lib/actions/crm";

export async function POST(req: NextRequest) {
  // 1. Auth & Admin Authorization Tekshiruvi
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Faqat adminlar foydalana oladi" }, { status: 403 });
  }

  // 2. Promptni qabul qilish
  const { prompt: userPrompt } = await req.json();
  if (!userPrompt?.trim()) {
    return NextResponse.json({ error: "So'rov kiritilmagan" }, { status: 400 });
  }

  // 3. Database Metadata yig'ish (LLM uchun context)
  const { data: courses } = await supabase.from("courses").select("id, name, price");
  const { data: groups } = await supabase.from("groups").select("id, name, course_id, teacher");
  const { data: students } = await supabase.from("students").select("id, first_name, last_name, phone, course_id, group_id, status, paid_amount, total_amount, discount");
  const { data: leads } = await supabase.from("leads").select("id, first_name, last_name, phone, status");

  const crmContext = {
    courses: courses ?? [],
    groups: groups ?? [],
    students: students ?? [],
    leads: leads ?? [],
  };

  // 4. API Keyni yuklash (Gemini yoki OpenAI)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY sozlanmagan" }, { status: 500 });
  }

  const isOpenAI = apiKey.trim().startsWith("sk-");
  let llmResponse = "";

  const systemInstructions = `
Siz Texno Markaz CRM tizimining virtual yordamchisi (AI Agent) hisoblanasiz.
Admin foydalanuvchi sizga buyruq beradi. Siz ushbu buyruqni tushunib, tegishli amal (action) va uning parametrlarini aniqlashingiz va faqat JSON javob qaytarishingiz shart.

Tizimdagi mavjud ma'lumotlar (UUID lar bilan to'g'ri bog'lash uchun foydalaning):
---
KURSLAR:
${JSON.stringify(crmContext.courses)}

GURUHLAR:
${JSON.stringify(crmContext.groups)}

TALABALAR (ism, familiya, tel, guruh, kurs):
${JSON.stringify(crmContext.students)}

ARIZALAR (leads):
${JSON.stringify(crmContext.leads)}
---

Siz aniqlashi mumkin bo'lgan ACTION'lar va ularning JSON formatlari:

1. Talaba (o'quvchi) qo'shish:
Agar foydalanuvchi yangi o'quvchi qo'shmoqchi bo'lsa (masalan: "Dasturlashga yangi o'quvchi qo'sh: Sardor Qobilov, tel 991234567, guruh 1-guruh"):
Fayldan mos 'course_id' va 'group_id' ni toping. Agar mos kurs yoki guruh topilmasa, eng mos keladiganini yoki null deb tanlang.
{
  "action": "CREATE_STUDENT",
  "params": {
    "first_name": "Sardor",
    "last_name": "Qobilov",
    "phone": "+998991234567",
    "parent_phone": "+998...",
    "course_id": "KURSNING_UUID_MANZILI",
    "group_id": "GURUHNING_UUID_MANZILI" (yoki null),
    "start_date": "YYYY-MM-DD",
    "total_amount": 500000,
    "discount": 0,
    "payment_due_date": "YYYY-MM-DD" (optional),
    "lesson_days": ["Dush", "Chor", "Jum"],
    "lesson_time": "{\\"Dush\\":\\"16:00\\",\\"Chor\\":\\"16:00\\",\\"Jum\\":\\"16:00\\"}",
    "comment": "Izoh..."
  },
  "message": "Sardor Qobilov muvaffaqiyatli qo'shildi!"
}

2. Guruh yaratish:
{
  "action": "CREATE_GROUP",
  "params": {
    "name": "Guruh nomi",
    "course_id": "KURSNING_UUID_MANZILI",
    "teacher": "O'qituvchi ismi",
    "schedule": "Dush/Chor/Jum 16:00",
    "schedule_days": ["Dush", "Chor", "Jum"],
    "schedule_time": "16:00",
    "max_students": 15,
    "start_date": "YYYY-MM-DD"
  },
  "message": "Yangi guruh yaratildi!"
}

3. To'lov qo'shish (ism yoki tel orqali o'quvchini toping):
{
  "action": "ADD_PAYMENT",
  "params": {
    "student_id": "TALABA_UUID_MANZILI",
    "amount": 400000,
    "method": "naqd" | "karta" | "online",
    "note": "Izoh",
    "paid_at": "YYYY-MM-DD"
  },
  "message": "To'lov muvaffaqiyatli qo'shildi!"
}

4. Talaba statusini o'zgartirish:
{
  "action": "UPDATE_STUDENT_STATUS",
  "params": {
    "student_id": "TALABA_UUID",
    "status": "active" | "finished" | "paused"
  },
  "message": "Talaba statusi yangilandi!"
}

5. Ariza (lead) holatini yangilash:
{
  "action": "UPDATE_LEAD_STATUS",
  "params": {
    "lead_id": "LEAD_UUID",
    "status": "yozildi" | "rad_etildi" | "kutilmoqda",
    "admin_note": "Izoh..."
  },
  "message": "Ariza holati yangilandi!"
}

6. Tahliliy yoki Axborot so'rash (masalan: "Dasturlashda nechta o'quvchi bor?", "Qarzlar ro'yxatini chiqar", "Kimlar dars qoldirdi?"):
Agar foydalanuvchi faqat ma'lumot so'rasa, hech qanday o'zgarish qilmasdan "QUERY_DATA" qaytaring va "message" qismida so'ralgan ma'lumotni chiroyli va mukammal jadval yoki ro'yxat ko'rinishida (markdown formatida, o'zbek tilida) shakllantiring.
{
  "action": "QUERY_DATA",
  "message": "Markdown formatida chiroyli hisobot yoki javob..."
}

Agar ma'lumot yetarli bo'lmasa yoki tushunarsiz so'rov bo'lsa:
{
  "action": "NEED_INFO",
  "message": "Iltimos, talaba ismini va qo'shmoqchi bo'lgan guruh nomini aniqlashtirib bering."
}

Muhim qoidalar:
- Faqatgina to'g'ridan-to'g'ri JSON formatidagi ob'ektni qaytaring, hech qanday boshqa so'z, tushuntirish yoki markdown blocklari (\`\`\`json kabi) qo'shmang!
- Telefon raqamlarini tozalang va kerak bo'lsa +998 prefiksini qo'shing.
- Sana ko'rsatilmagan bo'lsa, bugungi sanani (${new Date().toISOString().slice(0, 10)}) ishlating.
`;

  try {
    if (isOpenAI) {
      // OpenAI GPT-4o-mini
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemInstructions },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });
      const data = await res.json();
      llmResponse = data.choices?.[0]?.message?.content || "";
    } else {
      // Google Gemini-2.0-flash
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent([
        systemInstructions,
        userPrompt
      ]);
      llmResponse = result.response.text();
    }

    // 5. JSON Parselash
    const aiAction = JSON.parse(llmResponse.trim());

    // 6. Actionlarni server-side CRM funksiyalari bilan bajarish
    if (aiAction.action === "CREATE_STUDENT") {
      const p = aiAction.params;
      await createManualStudent({
        first_name: p.first_name,
        last_name: p.last_name,
        phone: p.phone,
        parent_phone: p.parent_phone || "",
        course_id: p.course_id,
        group_id: p.group_id || null,
        start_date: p.start_date || new Date().toISOString().slice(0, 10),
        total_amount: Number(p.total_amount || 0),
        discount: Number(p.discount || 0),
        payment_due_date: p.payment_due_date || null,
        lesson_time: typeof p.lesson_time === "string" ? p.lesson_time : JSON.stringify(p.lesson_time || {}),
        lesson_days: p.lesson_days || ["Dush", "Chor", "Jum"],
        comment: p.comment || "",
      });
    } else if (aiAction.action === "CREATE_GROUP") {
      const p = aiAction.params;
      await createGroup({
        name: p.name,
        course_id: p.course_id,
        teacher: p.teacher || "—",
        schedule: p.schedule || `${p.schedule_days?.join("/")} ${p.schedule_time}`,
        schedule_days: p.schedule_days || ["Dush", "Chor", "Jum"],
        schedule_time: p.schedule_time || "16:00",
        max_students: Number(p.max_students || 15),
        start_date: p.start_date || null,
        end_date: null,
      });
    } else if (aiAction.action === "ADD_PAYMENT") {
      const p = aiAction.params;
      await addPayment(
        p.student_id,
        Number(p.amount),
        p.method || "naqd",
        p.note || "AI Agent to'lovi",
        p.paid_at || new Date().toISOString().slice(0, 10)
      );
    } else if (aiAction.action === "UPDATE_STUDENT_STATUS") {
      const p = aiAction.params;
      await updateStudent(p.student_id, { status: p.status });
    } else if (aiAction.action === "UPDATE_LEAD_STATUS") {
      const p = aiAction.params;
      await updateLeadStatus(p.lead_id, p.status, p.admin_note || "AI Agent o'zgartirdi");
    }

    return NextResponse.json(aiAction);
  } catch (err: any) {
    console.error("AI Agent error:", err);
    return NextResponse.json({ error: err.message || "AI Agent so'rovni bajara olmadi" }, { status: 500 });
  }
}
