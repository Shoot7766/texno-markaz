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

2. **Har tomonlama hisobotlar (QUERY_DATA) va Chiroyli Vizual formatlash:**
Foydalanuvchi sizdan hisobot yoki ro'yxat so'rasa (masalan: "Jami o'quvchilar soni qancha?", "Qarzlar ro'yxatini ber"), **hech qachon xomashyo (raw) markdown jadvallarini (\`|---|\`) ishlatmang!** Chunki ular Telegram ekranida juda qiyshiq, xunuk va o'qish qiyin bo'lib ko'rinadi (skrinshotlarda ko'rganingizdek).
Buning o'rniga, ro'yxat va hisobotlarni quyidagi **juda chiroyli, premium emoji-bullets va nuqtalar formatida** taqdim eting:
  * Masalan: 
    * 👤 **Azizbek Ikromov** · 📞 +998933670096 · 🎓 *Microsoft Office* (Faol)
    * 👤 **Said Abduvaliyev** · 📞 +998947195588 · 🎓 *Boshlang'ich* (Faol)
  * Har bir guruh yoki to'lov bo'limlarini sarlavhalar (\`##\`, \`###\`), ajratuvchi chiziqlar (\`──────────────────\`) va premium emojilar bilan vizual bezang.
  * Agar jadval shakli juda zarur bo'lsa, jadvalni **to'liq monospace kod bloki (\` \`\` \`) ichiga o'rab jo'nating**, shunda Telegram uni bir tekisda va chiroyli shriftda ko'rsatadi!

3. **Yetishmagan ma'lumotlarni so'rash:**
Yangi o'quvchi qo'shish yoki to'lov yozish amali buyurilganda, agar muhim ma'lumotlar (ism, telefon kabi) so'rovda etishmasa, "NEED_INFO" statusini qaytarib, foydalanuvchidan shirinlik bilan o'sha ma'lumotni so'rab oling.

4. **UUID va ID lar bilan ishlash qoidalari (O'TA MUHIM):**
  - **Hech qachon foydalanuvchidan (admindan) UUID yoki ID so'ramang!** Foydalanuvchilar UUID nimaligini bilishmaydi va ularda bu ma'lumot yo'q.
  - Agar foydalanuvchi biror amalni buyursa (masalan: "o'quvchi ma'lumotini tahrirla", "guruhni o'chir", "davomat qil"), foydalanuvchi albatta guruh nomi (masalan: "Kids-1"), o'quvchi ismi (masalan: "Shahboz") yoki ariza topshiruvchi ismini aytadi.
  - Siz berilgan ism, familiya yoki nomni yuqoridagi 'KURSLAR', 'GURUHLAR', 'TALABALAR', 'ARIZALAR' ro'yxatidan **o'zingiz izlab topishingiz** va tegishli 'id' (UUID) ni aniqlab, JSON parametriga o'sha 'id' ni yozib yuborishingiz shart.
  - Agar izlagan nomingiz bo'yicha bir nechta o'xshash nomlar topilsa (masalan, 2 ta "Asadbek" ismli o'quvchi bo'lsa), foydalanuvchiga UUID so'ramasdan, ism-familiyasi yoki guruhini aniqlashtirish uchun shirin qilib savol bering: "Qaysi Asadbekni nazarda tutyapsiz? Asadbek Ikromovmi yoki Asadbek Karimovmi?"
  - Agar loyiha yoki guruh umuman topilmasa, o'sha guruh/o'quvchi nomini qayta so'rang, lekin **hech qachon "UUID bering" deb yozmang!**

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

7. O'quvchi ma'lumotini yangilash:
{
  "action": "UPDATE_STUDENT",
  "params": {
    "student_id": "TALABA_UUID",
    "first_name": "Yangi ism" (optional),
    "last_name": "Yangi familiya" (optional),
    "phone": "+998..." (optional),
    "parent_phone": "+998..." (optional),
    "course_id": "UUID" (optional),
    "group_id": "UUID" (optional),
    "total_amount": 500000 (optional),
    "discount": 0 (optional),
    "payment_due_date": "YYYY-MM-DD" (optional),
    "status": "active"|"finished"|"paused" (optional),
    "comment": "Izoh" (optional)
  },
  "message": "O'quvchi ma'lumoti yangilandi!"
}

8. Arizani o'chirish:
{
  "action": "DELETE_LEAD",
  "params": {
    "lead_id": "LEAD_UUID"
  },
  "message": "Ariza o'chirildi!"
}

9. Guruh jadvalini yangilash:
{
  "action": "UPDATE_GROUP",
  "params": {
    "group_id": "GURUH_UUID",
    "schedule_days": ["Dush", "Chor", "Jum"] (optional),
    "schedule_time": "16:00" (optional),
    "teacher": "O'qituvchi ismi" (optional),
    "max_students": 15 (optional),
    "is_active": true (optional)
  },
  "message": "Guruh jadvali yangilandi!"
}

10. Davomat belgilash:
{
  "action": "MARK_ATTENDANCE",
  "params": {
    "group_id": "GURUH_UUID" (optional),
    "student_id": "TALABA_UUID" (optional, agar guruh bo'lmasa),
    "date": "YYYY-MM-DD",
    "status": "keldi"|"kelmadi"|"kechikdi",
    "mark_all": true (optional, guruh a'zolarini hammasini belgilash)
  },
  "message": "Davomat belgilandi!"
}

11. Guruhni o'chirish:
{
  "action": "DELETE_GROUP",
  "params": {
    "group_id": "GURUH_UUID"
  },
  "message": "Guruh muvaffaqiyatli o'chirildi!"
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

  } else if (aiAction.action === "UPDATE_STUDENT") {
    const p = aiAction.params;
    const patch: Record<string, unknown> = {};
    if (p.first_name !== undefined) patch.first_name = p.first_name;
    if (p.last_name !== undefined) patch.last_name = p.last_name;
    if (p.phone !== undefined) patch.phone = p.phone;
    if (p.parent_phone !== undefined) patch.parent_phone = p.parent_phone;
    if (p.course_id !== undefined) patch.course_id = p.course_id;
    if (p.group_id !== undefined) patch.group_id = p.group_id;
    if (p.total_amount !== undefined) patch.total_amount = Number(p.total_amount);
    if (p.discount !== undefined) patch.discount = Number(p.discount);
    if (p.payment_due_date !== undefined) patch.payment_due_date = p.payment_due_date;
    if (p.status !== undefined) patch.status = p.status;
    if (p.comment !== undefined) patch.comment = p.comment;
    if (Object.keys(patch).length > 0) {
      const { error } = await serviceClient.from("students").update(patch).eq("id", p.student_id);
      if (error) throw new Error(error.message);
      await serviceClient.from("activity_logs").insert({
        action: "student_update",
        entity_type: "student",
        entity_id: p.student_id,
        details: patch,
      });
    }

  } else if (aiAction.action === "DELETE_LEAD") {
    const p = aiAction.params;
    const { error } = await serviceClient.from("leads").delete().eq("id", p.lead_id);
    if (error) throw new Error(error.message);
    await serviceClient.from("activity_logs").insert({
      action: "lead_delete",
      entity_type: "lead",
      entity_id: p.lead_id,
      details: { lead_id: p.lead_id },
    });

  } else if (aiAction.action === "UPDATE_GROUP") {
    const p = aiAction.params;
    const patch: Record<string, unknown> = {};
    if (p.schedule_days !== undefined) patch.schedule_days = p.schedule_days;
    if (p.schedule_time !== undefined) patch.schedule_time = p.schedule_time;
    if (p.teacher !== undefined) patch.teacher = p.teacher;
    if (p.max_students !== undefined) patch.max_students = Number(p.max_students);
    if (p.is_active !== undefined) patch.is_active = p.is_active;
    if (p.schedule_days || p.schedule_time) {
      patch.schedule = `${(p.schedule_days || []).join("/")} ${p.schedule_time || ""}`;
    }
    if (Object.keys(patch).length > 0) {
      const { error } = await serviceClient.from("groups").update(patch).eq("id", p.group_id);
      if (error) throw new Error(error.message);
      await serviceClient.from("activity_logs").insert({
        action: "group_update",
        entity_type: "group",
        entity_id: p.group_id,
        details: patch,
      });
    }

  } else if (aiAction.action === "DELETE_GROUP") {
    const p = aiAction.params;
    const { error } = await serviceClient.from("groups").delete().eq("id", p.group_id);
    if (error) throw new Error(error.message);
    await serviceClient.from("activity_logs").insert({
      action: "group_delete",
      entity_type: "group",
      entity_id: p.group_id,
      details: { group_id: p.group_id },
    });

  } else if (aiAction.action === "MARK_ATTENDANCE") {
    const p = aiAction.params;
    const date = p.date || new Date().toISOString().slice(0, 10);
    if (p.mark_all && p.group_id) {
      // Guruhning barcha faol o'quvchilarini belgilash
      const { data: groupStudents } = await serviceClient
        .from("students")
        .select("id")
        .eq("group_id", p.group_id)
        .eq("status", "active");
      if (groupStudents) {
        for (const st of groupStudents) {
          await serviceClient.from("attendance").delete()
            .eq("student_id", st.id)
            .eq("attendance_date", date)
            .eq("group_id", p.group_id);
          await serviceClient.from("attendance").insert({
            student_id: st.id,
            group_id: p.group_id,
            attendance_date: date,
            status: p.status || "keldi",
          });
        }
      }
    } else if (p.student_id) {
      await serviceClient.from("attendance").delete()
        .eq("student_id", p.student_id)
        .eq("attendance_date", date);
      await serviceClient.from("attendance").insert({
        student_id: p.student_id,
        group_id: p.group_id || null,
        attendance_date: date,
        status: p.status || "keldi",
      });
    }
  }

  return aiAction;
}
