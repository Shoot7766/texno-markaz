import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServiceClient } from "@/lib/supabase/admin";

export async function processCrmAgentPrompt(userPrompt: string): Promise<any> {
  const serviceClient = createServiceClient();

  // 1. Database Metadata yig'ish (LLM uchun context)
  const { data: courses } = await serviceClient.from("courses").select("id, name, price");
  const { data: groups } = await serviceClient.from("groups").select("id, name, course_id, teacher");
  const { data: students } = await serviceClient.from("students").select("id, first_name, last_name, phone, parent_phone, course_id, group_id, status, paid_amount, total_amount, discount, payment_due_date, comment");
  const { data: leads } = await serviceClient.from("leads").select("id, first_name, last_name, phone, status");
  const { data: payments } = await serviceClient.from("payments").select("id, student_id, amount, method, paid_at, note");
  const { data: attendance } = await serviceClient.from("attendance").select("id, student_id, group_id, attendance_date, status");

  const crmContext = {
    courses: courses ?? [],
    groups: groups ?? [],
    students: students ?? [],
    leads: leads ?? [],
    payments: payments ?? [],
    attendance: attendance ?? [],
  };

  // 2. API Keyni yuklash
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY sozlanmagan");
  }

  const isOpenAI = apiKey.trim().startsWith("sk-");
  let llmResponse = "";

  const systemInstructions = `
Siz Texno Markaz CRM tizimining **Bosh AI Boshqaruvchisisiz (AI CRM Manager)**. Sizga admin panelini to'liq nazorat qilish va boshqarish ishonib topshirilgan.
Admin foydalanuvchi sizga buyruq beradi. Siz ushbu buyruqni tushunib, tegishli amal (action) va parametrlarini aniqlashingiz, hamda faqat JSON javob qaytarishingiz shart.

Tizimdagi mavjud to'liq ma'lumotlar (UUID lar va bog'lanishlarni tekshirish uchun foydalaning):
---
KURSLAR:
${JSON.stringify(crmContext.courses)}

GURUHLAR:
${JSON.stringify(crmContext.groups)}

TALABALAR (ism, familiya, tel, ota-ona teli, kurs, guruh, status, to'lovlar):
${JSON.stringify(crmContext.students)}

ARIZALAR (leads):
${JSON.stringify(crmContext.leads)}

OXIRGI TO'LOVLAR HISOBLARI (payments):
${JSON.stringify(crmContext.payments)}

DAVOMAT LOGLARI (attendance):
${JSON.stringify(crmContext.attendance)}
---

Sizning Boshqaruvchi sifatidagi prinsiplaringiz va vazifalaringiz:

1. **Proaktiv tekshiruv va Eslatmalar (SYSTEM_SCAN):**
Agar foydalanuvchi sizga "[SYSTEM_SCAN]" (tizimni tekshiruvdan o'tkazish) deb buyruq bersa, butun bazani tahlil qiling va adminga shirin, do'stona va proaktiv munosabatda quyidagi checklistni tuzib bering:
  - **Overdue Qarzlar:** To'lov muddati (payment_due_date) o'tgan yoki qarzdorligi bor o'quvchilarni aniqlab eslatib turing.
  - **Etishmayotgan ma'lumotlar:** Telefon raqami yo'q, ota-ona telefoni bo'sh bo'lgan yoki guruhsiz (group_id: null) qolgan o'quvchilarni topib, "shularning ma'lumotlarini to'ldiraylikmi?" deb so'rang.
  - **Davomat nazorati:** Bugun (${new Date().toISOString().slice(0, 10)}) uchun guruhlarda davomat belgilangan-belgilanmaganligini tekshirib so'rang.
  - **Yangi Arizalar:** Hali ko'rib chiqilmagan arizalarni eslatib turing.

2. **Har tomonlama hisobotlar (QUERY_DATA):**
Foydalanuvchi sizdan hisobot so'rasa (masalan: "Qarzlar ro'yxatini ber", "Kurslar daromadi qancha?"), hech qanday o'zgarish qilmasdan "QUERY_DATA" qaytaring va "message" qismida so'ralgan ma'lumotni chiroyli va mukammal jadval yoki ro'yxat ko'rinishida (markdown formatida, o'zbek tilida) shakllantiring.

3. **Yetishmagan ma'lumotlarni so'rash:**
Yangi o'quvchi qo'shish yoki to'lov yozish amali buyurilganda, agar muhim ma'lumotlar (ism, telefon kabi) so'rovda etishmasa, "NEED_INFO" statusini qaytarib, foydalanuvchidan shirinlik bilan o'sha ma'lumotni so'rab oling.

Siz aniqlashi mumkin bo'lgan ACTION'lar va ularning JSON formatlari:

1. Talaba (o'quvchi) qo'shish:
{
  "action": "CREATE_STUDENT",
  "params": {
    "first_name": "Ism",
    "last_name": "Familiya",
    "phone": "+998...",
    "parent_phone": "+998...",
    "course_id": "KURSNING_UUID",
    "group_id": "GURUH_UUID" (yoki null),
    "start_date": "YYYY-MM-DD",
    "total_amount": 500000,
    "discount": 0,
    "payment_due_date": "YYYY-MM-DD" (optional),
    "lesson_days": ["Dush", "Chor", "Jum"],
    "lesson_time": "{\\"Dush\\":\\"16:00\\",\\"Chor\\":\\"16:00\\",\\"Jum\\":\\"16:00\\"}",
    "comment": "Izoh..."
  },
  "message": "Farrux Murodov muvaffaqiyatli qo'shildi!"
}

2. Guruh yaratish:
{
  "action": "CREATE_GROUP",
  "params": {
    "name": "Guruh nomi",
    "course_id": "KURSNING_UUID",
    "teacher": "O'qituvchi ismi",
    "schedule": "Dush/Chor/Jum 16:00",
    "schedule_days": ["Dush", "Chor", "Jum"],
    "schedule_time": "16:00",
    "max_students": 15,
    "start_date": "YYYY-MM-DD"
  },
  "message": "Yangi guruh yaratildi!"
}

3. To'lov qo'shish:
{
  "action": "ADD_PAYMENT",
  "params": {
    "student_id": "TALABA_UUID",
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

6. Tahliliy yoki Axborot so'rash / Tizim tahlili (SYSTEM_SCAN):
{
  "action": "QUERY_DATA",
  "message": "Markdown formatida chiroyli hisobot, javob yoki kunlik checklist..."
}

Agar ma'lumot yetarli bo'lmasa yoki tushunarsiz so'rov bo'lsa:
{
  "action": "NEED_INFO",
  "message": "Iltimos, talaba ismini yoki telefon raqamini aniqlashtirib bering."
}

Muhim qoidalar:
- Faqatgina to'g'ridan-to'g'ri JSON formatidagi ob'ektni qaytaring, hech qanday boshqa so'z, tushuntirish yoki markdown blocklari (\`\`\`json kabi) qo'shmang!
- Telefon raqamlarini tozalang va kerak bo'lsa +998 prefiksini qo'shing.
- Sana ko'rsatilmagan bo'lsa, bugungi sanani (${new Date().toISOString().slice(0, 10)}) ishlating.
`;

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

  const aiAction = JSON.parse(llmResponse.trim());

  // 3. Actionlarni to'g'ridan-to'g'ri serviceClient (Service Role) orqali bajarish
  if (aiAction.action === "CREATE_STUDENT") {
    const p = aiAction.params;
    const { data: student, error } = await serviceClient
      .from("students")
      .insert({
        first_name: p.first_name,
        last_name: p.last_name,
        phone: p.phone,
        parent_phone: p.parent_phone || "",
        course_id: p.course_id,
        group_id: p.group_id || null,
        start_date: p.start_date || new Date().toISOString().slice(0, 10),
        end_date: null,
        status: "active",
        total_amount: Number(p.total_amount || 0),
        paid_amount: 0,
        discount: Number(p.discount || 0),
        payment_status: "qarz",
        payment_due_date: p.payment_due_date || null,
        lesson_time: typeof p.lesson_time === "string" ? p.lesson_time : JSON.stringify(p.lesson_time || {}),
        lesson_days: p.lesson_days || ["Dush", "Chor", "Jum"],
        comment: p.comment || "",
      })
      .select("id")
      .single();

    if (error || !student) throw new Error(error?.message ?? "O‘quvchi qo‘shilmadi");
    
    // Log activity
    await serviceClient.from("activity_logs").insert({
      action: "student_create_manual",
      entity_type: "student",
      entity_id: student.id,
      details: { course_id: p.course_id, group_id: p.group_id },
    });

  } else if (aiAction.action === "CREATE_GROUP") {
    const p = aiAction.params;
    const { data: group, error } = await serviceClient
      .from("groups")
      .insert({
        name: p.name,
        course_id: p.course_id,
        teacher: p.teacher || "—",
        schedule: p.schedule || `${p.schedule_days?.join("/")} ${p.schedule_time}`,
        schedule_days: p.schedule_days || ["Dush", "Chor", "Jum"],
        schedule_time: p.schedule_time || "16:00",
        max_students: Number(p.max_students || 15),
        start_date: p.start_date || null,
        end_date: null,
        is_active: true,
      })
      .select("id")
      .single();

    if (error || !group) throw new Error(error?.message ?? "Guruh yaratilmadi");

    await serviceClient.from("activity_logs").insert({
      action: "group_create",
      entity_type: "group",
      entity_id: group.id,
      details: { name: p.name, schedule: p.schedule },
    });

  } else if (aiAction.action === "ADD_PAYMENT") {
    const p = aiAction.params;
    await serviceClient.from("payments").insert({
      student_id: p.student_id,
      amount: Number(p.amount),
      method: p.method || "naqd",
      note: p.note || "AI Agent to'lovi",
      paid_at: p.paid_at || new Date().toISOString().slice(0, 10),
    });

    await serviceClient.from("activity_logs").insert({
      action: "payment_add",
      entity_type: "payment",
      entity_id: null,
      details: { student_id: p.student_id, amount: Number(p.amount) },
    });

  } else if (aiAction.action === "UPDATE_STUDENT_STATUS") {
    const p = aiAction.params;
    await serviceClient.from("students").update({ status: p.status }).eq("id", p.student_id);

    await serviceClient.from("activity_logs").insert({
      action: "student_update",
      entity_type: "student",
      entity_id: p.student_id,
      details: { status: p.status },
    });

  } else if (aiAction.action === "UPDATE_LEAD_STATUS") {
    const p = aiAction.params;
    await serviceClient.from("leads").update({ status: p.status }).eq("id", p.lead_id);

    await serviceClient.from("activity_logs").insert({
      action: "lead_status",
      entity_type: "lead",
      entity_id: p.lead_id,
      details: { status: p.status, admin_note: p.admin_note },
    });
  }

  return aiAction;
}
