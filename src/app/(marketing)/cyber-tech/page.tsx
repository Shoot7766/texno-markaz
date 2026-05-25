"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Award,
  Terminal,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Play,
  CheckCircle,
  XCircle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Printer,
  Moon,
  Sun,
  BookOpenCheck,
  User,
  Clock,
  Lock,
  Unlock,
  BookMarked,
  Trophy,
  HelpCircle,
  Menu,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Share2,
  Send,
  MessageSquare,
  Users,
  AlertTriangle,
  Database,
} from "lucide-react";
import { createClient, createCleanPublicClient } from "@/lib/supabase/client";

// =========================================================
// 1. DATA SEEDING (6 IT Fields Curriculum Tracks & Quizzes)
// =========================================================

interface Lesson {
  id: string;
  title: string;
  shortDesc: string;
  duration: string;
  content: string;
  codeSnippet?: string;
  codeLanguage?: string;
  expectedOutput?: string;
  reviewQuestion: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
}

interface Track {
  id: string;
  title: string;
  slug: string;
  icon: any;
  color: string;
  glowColor: string;
  level: string;
  duration: string;
  lessons: Lesson[];
}

const TRACKS_DATA: Track[] = [
  {
    id: "comp_lit",
    title: "Kompyuter savodxonligi",
    slug: "computer-literacy",
    icon: Users,
    color: "#3b82f6",
    glowColor: "rgba(59, 130, 246, 0.4)",
    level: "Boshlang'ich",
    duration: "2 dars",
    lessons: [
      {
        id: "lit-1",
        title: "Operatsion tizimlar va fayllar",
        shortDesc: "Fayllar tizimi, klaviatura kombinatsiyalari va operatsion tizim prinsiplari.",
        duration: "10 daqiqa",
        content: `Kompyuter savodxonligining asosi - bu operatsion tizim (Windows, macOS yoki Linux) va fayllar tizimini yaxshi tushunishdir. Fayl - bu ma'lumotlarni saqlashning asosiy blokidir.

**Tezkor klaviatura kombinatsiyalari (Hotkeys):**
1. **Ctrl + C:** Tanlangan obyektdan nusxa olish (Copy).
2. **Ctrl + V:** Nusxani joylashtirish (Paste).
3. **Ctrl + Z:** Oxirgi amalni bekor qilish (Undo).
4. **Ctrl + Alt + Delete:** Vazifalar menejeri (Task Manager) ni ochish.`,
        codeSnippet: `# Windows CMD terminalida katalog ichidagi fayllarni ko'rish
dir

# Linux/macOS terminalida fayllarni ro'yxat shaklida ko'rish
ls -la`,
        codeLanguage: "bash",
        expectedOutput: `Volume in drive C is Windows\nDirectory of C:\\Users\\User\n\n2026-05-24  19:00    <DIR>          Desktop\n2026-05-24  19:00    <DIR>          Documents\n               0 File(s)              0 bytes`,
        reviewQuestion: {
          question: "Kompyuterda barcha faol dasturlarni boshqarish va osilib qolgan jarayonlarni o'chirish uchun qaysi tizim asbobidan foydalaniladi?",
          options: ["Kompyuter sozlamalari", "Vazifalar menejeri (Task Manager)", "Brauzer sozlamalari", "Fayllar qidiruvi"],
          correct: 1,
          explanation: "Task Manager (Vazifalar menejeri) real vaqtda protsessor va xotira yuklamasini ko'rsatib, jarayonlarni to'xtatish imkonini beradi.",
        },
      },
    ],
  },
  {
    id: "web_dev",
    title: "Zamonaviy Dasturlash",
    slug: "web-dev",
    icon: Terminal,
    color: "#6c63ff",
    glowColor: "rgba(108, 99, 255, 0.4)",
    level: "Boshlang'ich",
    duration: "2 dars",
    lessons: [
      {
        id: "web-1",
        title: "HTML5 va Semantik Veb",
        shortDesc: "Semantik teglar, SEO optimizatsiyasi va sahifa strukturasi.",
        duration: "12 daqiqa",
        content: `Zamonaviy HTML5 standartlari sahifada qanday ma'lumot borligini qidiruv tizimlari (Google botlari) ham aniq tushunishi uchun **semantik teglarni** taqdim etadi.

Semantik teglardan to'g'ri foydalanish saytning SEO (Search Engine Optimization) reytingini sezilarli darajada oshiradi.

- *Nosemantik:* \`<div class="header">\`, \`<div class="menu">\`
- *Semantik:* \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, \`<footer>\``,
        codeSnippet: `<!-- Semantik HTML5 Strukturasi -->
<header>
  <h1>Cyber Tech Portal</h1>
  <nav>
    <a href="/cyber-tech">Asosiy</a>
  </nav>
</header>
<main>
  <article>
    <h2>HTML5 darsi</h2>
    <p>Semantik elementlar haqida batafsil ma'lumot...</p>
  </article>
</main>`,
        codeLanguage: "html",
        expectedOutput: `[RENDERED HTML5 SEMANTIC TREE]:\n- HEADER\n  - H1: Cyber Tech Portal\n  - NAV\n- MAIN\n  - ARTICLE\n    - H2: HTML5 darsi`,
        reviewQuestion: {
          question: "Qaysi teg sahifadagi eng asosiy navigatsiya havolalarini joylashtirish uchun mo'ljallangan?",
          options: ["<section>", "<nav>", "<div>", "<aside>"],
          correct: 1,
          explanation: "<nav> tegi veb-sahifadagi asosiy navigatsiya havolalarini guruhlash uchun xizmat qiladi.",
        },
      },
    ],
  },
  {
    id: "office_apps",
    title: "Microsoft Office",
    slug: "microsoft-office",
    icon: BookMarked,
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.4)",
    level: "Boshlang'ich",
    duration: "2 dars",
    lessons: [
      {
        id: "off-1",
        title: "Excel formulalari va ma'lumotlar tahlili",
        shortDesc: "SUM, AVERAGE, VLOOKUP va IF formulalari bilan ishlash.",
        duration: "15 daqiqa",
        content: `Microsoft Excel - bu jadvallar va ma'lumotlar bilan ishlashning eng kuchli qurolidir. U yordamida yirik ma'lumotlarni hisoblash, saralash va tahlil qilish mumkin.

**Asosiy formulalar:**
1. **=SUM(A1:A10):** Belgilangan oraliqdagi barcha sonlar yig'indisini hisoblaydi.
2. **=AVERAGE(A1:A10):** Sonlarning o'rtacha arifmetik qiymatini topadi.
3. **=IF(A1>=60, "O'tdi", "Yiqildi"):** Ma'lum shart bajarilishiga qarab har xil natija qaytaradi.`,
        codeSnippet: `# Excel VLOOKUP formulasi prototipi (C++ da simulyatsiyasi)
VLOOKUP(izlanayotgan_qiymat, jadval_oraligi, ustun_indeksi, aniq_moslik)`,
        codeLanguage: "cpp",
        expectedOutput: `Excel Formula Parser: VLOOKUP("Olimov", A1:D100, 3, FALSE)\nResult: Olimov topildi. Lavozimi: Mentor. Maoshi: 8,500,000 UZS`,
        reviewQuestion: {
          question: "Excelda katakdagi qiymat 50 dan katta bo'lsa 'Katta', aks holda 'Kichik' matnini chiqaruvchi to'g'ri formula qaysi?",
          options: [
            '=IF(A1>50; "Katta"; "Kichik")',
            '=SUM(A1>50; "Katta"; "Kichik")',
            '=COUNT(A1>50; "Katta")',
            '=AVERAGE(A1>50; "Kichik")'
          ],
          correct: 0,
          explanation: "IF formulasi: =IF(shart, to'g'ri_bo'lsa, noto'g'ri_bo'lsa) ko'rinishida yoziladi.",
        },
      },
    ],
  },
  {
    id: "python_ai",
    title: "Sun'iy intellekt",
    slug: "ai-basics",
    icon: Sparkles,
    color: "#00d1ff",
    glowColor: "rgba(0, 209, 255, 0.4)",
    level: "O'rta",
    duration: "2 dars",
    lessons: [
      {
        id: "py-1",
        title: "Python asoslari va Neyron tarmoqlar",
        shortDesc: "Python sintaksisi, o'zgaruvchilar va sun'iy neyronlar prototipi.",
        duration: "18 daqiqa",
        content: `**Python** - bugungi kunda dunyodagi eng mashhur va o'rganishga oson dasturlash tillaridan biri.
**Mashinali o'rganish (Machine Learning)** - bu kompyuterga aniq dasturlanmagan holda ma'lumotlardan o'rganish imkonini beradigan soha.
**Neyron tarmoqlar** esa inson miyasidagi neyronlar ish faoliyatiga taqlid qiluvchi matematik modellardir.`,
        codeSnippet: `# Python neyronining chiziqli yig'indisini hisoblash
import numpy as np

kirish = np.array([1, 0.5])
ogirlik = np.array([0.8, -0.4])

# Chiqish = kirish * ogirlik
chiqish = np.dot(kirish, ogirlik)
print(f"Neyron chiqish qiymati: {chiqish}")`,
        codeLanguage: "python",
        expectedOutput: `Neyron chiqish qiymati: 0.6`,
        reviewQuestion: {
          question: "Neyron tarmoqlarda olingan chiziqli yig'indini ma'lum bir oraliqqa (masalan, 0 va 1 orasiga) keltirish uchun nima ishlatiladi?",
          options: ["Sikl operatorlari", "Aktivatsiya funksiyasi (Sigmoid)", "Tasodifiy sonlar generatori", "Bo'lish operatori"],
          correct: 1,
          explanation: "Aktivatsiya funksiyalari (Sigmoid, ReLU, Tanh) chiqish qiymatini kerakli chegaraga keltirish uchun xizmat qiladi.",
        },
      },
    ],
  },
  {
    id: "robotics",
    title: "Robototexnika",
    slug: "robotics-iot",
    icon: Zap,
    color: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.4)",
    level: "O'rta",
    duration: "2 dars",
    lessons: [
      {
        id: "rob-1",
        title: "Arduino asoslari va Mikrosxemalar",
        shortDesc: "ATmega328 mikrokontrollerlari, datchiklar va svetodiodlar.",
        duration: "15 daqiqa",
        content: `Robototexnika - bu elektronika, dasturlash va mexanikani o'zida birlashtirgan sohadir. Robot atrof-muhitni his qilishi uchun unga **sensorlar** (datchiklar) kerak.

**Svetodiodni o'chib-yonish kodi (Blink):**
Har bir Arduino kodida 2 ta majburiy funksiya bo'lishi shart:
1. \`setup()\`: Dastur boshlanganda faqat bir marta ishlaydi.
2. \`loop()\`: Setup funksiyasidan so'ng cheksiz takrorlanib ishlaydigan asosiy qism.`,
        codeSnippet: `void setup() {
  pinMode(13, OUTPUT); // 13-pinni chiqish qildik
}

void loop() {
  digitalWrite(13, HIGH); // Chiroqni yoqish
  delay(1000);            // 1 soniya kutish
  digitalWrite(13, LOW);  // Chiroqni o'chirish
  delay(1000);            // 1 soniya kutish
}`,
        codeLanguage: "cpp",
        expectedOutput: `Arduino IDE compiler success.\nLoading hex file to Atmega328...\n[SUCCESS] LED Blink script is running on Pin 13.`,
        reviewQuestion: {
          question: "Arduino kodida cheksiz takrorlanib ishlaydigan va asosiy kod joylashadigan funksiya qaysi?",
          options: ["setup()", "init()", "loop()", "main()"],
          correct: 2,
          explanation: "loop() funksiyasi setup() dan keyin cheksiz takrorlanib ishlaydi.",
        },
      },
    ],
  },
  {
    id: "cybersecurity",
    title: "Kiberxavfsizlik asoslari",
    slug: "cyber-security",
    icon: Trophy,
    color: "#ec4899",
    glowColor: "rgba(236, 72, 153, 0.4)",
    level: "O'rta",
    duration: "2 dars",
    lessons: [
      {
        id: "cyber-1",
        title: "Xavfsizlik madaniyati va Phishing",
        shortDesc: "Parollar xavfsizligi, phishing va ikki bosqichli autentifikatsiya.",
        duration: "15 daqiqa",
        content: `Kiberxavfsizlik dunyosida eng zaif nuqta ko'pincha foydalanuvchi hisoblanadi. Shuning uchun ham **Phishing (fishing)** hujumlari juda keng tarqalgan.

Phishing hujumida xakerlar sizga soxta xat yoki xabarlar yuborib, sizni soxta veb-sahifaga kirishga va maxfiy ma'lumotlaringizni (login, parol, karta) kiritishga majbur qiladi.

**Himoya choralari:**
1. **Ikki bosqichli autentifikatsiya (2FA)**.
2. **Havolalarni tekshirish** (\`payme.uz\` o'rniga \`payme-security.com\`).
3. **Parollar gigiyenasi** (12 belgili murakkab parollar).`,
        codeSnippet: `# Linux terminalida kuchli parol generatsiya qilish (16 belgili)
openssl rand -base64 16`,
        codeLanguage: "bash",
        expectedOutput: `Jb9K4x$aP9zQwL2!`,
        reviewQuestion: {
          question: "Soxta veb-sahifalar yordamida foydalanuvchining login va parollarini o'g'irlash hujumi qanday nomlanadi?",
          options: ["Adware", "Phishing", "DDoS", "Ransomware"],
          correct: 1,
          explanation: "Phishing (fishing) - bu aldov yo'li bilan foydalanuvchilarning maxfiy ma'lumotlarini o'g'irlash hujumi.",
        },
      },
    ],
  },
];

// =========================================================
// 1.5 DYNAMIC ADAPTIVE QUIZ GENERATOR (1000+ Questions Bank)
// =========================================================
export interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export function generateAdaptiveQuiz(category: string, size = 15): { id: string; title: string; category: string; timeLimit: number; questions: Question[] } {
  const portsList = [
    { p: 21, service: "FTP", desc: "fayllarni uzatish bayonnomasi" },
    { p: 22, service: "SSH", desc: "xavfsiz masofaviy ulanish terminali" },
    { p: 23, service: "Telnet", desc: "shifrlanmagan masofaviy boshqaruv terminali" },
    { p: 25, service: "SMTP", desc: "elektron pochta yuborish bayonnomasi" },
    { p: 53, service: "DNS", desc: "domen nomlarini IP manzilga bog'lovchi tizim" },
    { p: 80, service: "HTTP", desc: "oddiy shifrlanmagan veb-sahifa trafigi" },
    { p: 110, service: "POP3", desc: "elektron pochtani qabul qilish protokoli" },
    { p: 143, service: "IMAP", desc: "elektron pochtani serverda saqlab sinxronlash" },
    { p: 443, service: "HTTPS", desc: "shifrlangan xavfsiz veb-sahifa trafigi (SSL/TLS)" },
    { p: 3306, service: "MySQL", desc: "MySQL ma'lumotlar bazasining standart porti" },
    { p: 5432, service: "PostgreSQL", desc: "PostgreSQL ma'lumotlar bazasining standart porti" },
    { p: 8080, service: "HTTP-Alternative", desc: "muqobil yoki test veb-server porti" }
  ];

  const linuxCommands = [
    { cmd: "ls", desc: "katalogdagi fayllar va jildlar ro'yxatini ko'rsatish" },
    { cmd: "cd", desc: "faol katalogni (jildni) o'zgartirish" },
    { cmd: "pwd", desc: "joriy ishchi katalogning to'liq manzilini chop etish" },
    { cmd: "mkdir", desc: "yangi jild (katalog) yaratish" },
    { cmd: "rm -rf", desc: "fayl yoki jildni butunlay va qaytarib bo'lmas darajada o'chirish" },
    { cmd: "chmod", desc: "fayl yoki jildga kirish huquqlarini (permissions) o'zgartirish" },
    { cmd: "chown", desc: "fayl yoki jildning egasini (owner) o'zgartirish" },
    { cmd: "grep", desc: "fayl ichidan berilgan matn yoki qolipni qidirib topish" },
    { cmd: "cat", desc: "fayl ichidagi barcha tarkibni ekranga chiqarish" },
    { cmd: "ssh", desc: "masofaviy serverga xavfsiz shifrlangan kanal orqali ulanish" }
  ];

  const sqlKeywords = [
    { kw: "SELECT", desc: "ma'lumotlar bazasidan kerakli yozuvlarni tanlab olish" },
    { kw: "INSERT", desc: "ma'lumotlar bazasiga yangi yozuv qo'shish" },
    { kw: "UPDATE", desc: "ma'lumotlar bazasidagi mavjud yozuvlarni tahrirlash" },
    { kw: "DELETE", desc: "ma'lumotlar bazasidan yozuvlarni o'chirish" },
    { kw: "DROP TABLE", desc: "ma'lumotlar bazasidagi butun boshli jadvalni yo'q qilish" },
    { kw: "UNION SELECT", desc: "ikkita yoki undan ortiq SQL so'rovi natijalarini birlashtirish" }
  ];

  const webVulns = [
    { v: "SQL Injection", desc: "tashqi foydalanuvchi ma'lumotlarini SQL so'roviga birlashtirib, bazani o'g'irlash yoki boshqarish" },
    { v: "Cross-Site Scripting (XSS)", desc: "veb-sahifa ichiga zararli JavaScript kodini joylashtirib, foydalanuvchilar brauzerida ishga tushirish" },
    { v: "CSRF (Cross-Site Request Forgery)", desc: "foydalanuvchi bilmagan holda uning nomidan avtorizatsiyadan o'tgan so'rovlarni jo'natish" },
    { v: "DDoS", desc: "serverga bir vaqtning o'zida millionlab soxta so'rovlar yuborib, tizimni butunlay ishdan chiqarish" },
    { v: "Phishing (Fishing)", desc: "soxta sahifalar yordamida aldov yo'li bilan foydalanuvchi login va parollarini qo'lga kiritish" }
  ];

  const cryptoAlgos = [
    { c: "Caesar (Sezar shifri)", desc: "harflarni alifboda ma'lum qadamga (shift) surish orqali shifrlash (simmetrik)" },
    { c: "AES (Advanced Encryption Standard)", desc: "butun dunyoda standart deb qabul qilingan, o'ta yuqori xavfsizlikka ega simmetrik shifr" },
    { c: "RSA", desc: "ochiq (public) va yopiq (private) kalitlar juftligidan foydalanadigan asimmetrik shifrlash algoritmi" },
    { c: "Base64", desc: "ma'lumotlarni tarmoq orqali xavfsiz uzatish uchun ASCII matn ko'rinishiga o'tkazuvchi kodlash tizimi (shifr emas)" },
    { c: "MD5 / SHA-256", desc: "ma'lumotlarning butunligini tekshirish uchun ishlatiladigan, teskariga o'girib bo'lmaydigan xesh funksiyalar" }
  ];

  const ipNetworks = [
    { ip: "10.0.0.1", cls: "A sinfi", mask: "255.0.0.0", range: "yirik korporativ ichki tarmoqlar" },
    { ip: "172.16.0.1", cls: "B sinfi", mask: "255.255.0.0", range: "o'rta hajmdagi tashkilot tarmoqlari" },
    { ip: "192.168.1.1", cls: "C sinfi", mask: "255.255.255.0", range: "kichik uy yoki ofis ichki tarmoqlari" },
    { ip: "127.0.0.1", cls: "Loopback (Localhost)", mask: "255.0.0.0", range: "kompyuterning o'z-o'ziga ulanish sinov manzili" },
    { ip: "224.0.0.1", cls: "D sinfi (Multicast)", mask: "noma'lum", range: "guruhli tarmoq trafigini uzatish manzillari" }
  ];

  const windowsShortcuts = [
    { sc: "Ctrl + C", act: "tanlangan fayl yoki matndan nusxa olish (Copy)" },
    { sc: "Ctrl + V", act: "nusxalangan fayl yoki matnni joylashtirish (Paste)" },
    { sc: "Ctrl + X", act: "tanlangan ob'ektni qirqib olish (Cut)" },
    { sc: "Ctrl + Z", act: "oxirgi bajarilgan amalni bekor qilish (Undo)" },
    { sc: "Win + D", act: "barcha faol oynalarni yashirib, ish stolini ko'rsatish" },
    { sc: "Ctrl + Shift + Esc", act: "Vazifalar menejerini (Task Manager) to'g'ridan-to'g'ri ishga tushirish" },
    { sc: "Win + L", act: "operatsion tizim faol seansini tezkor qulflash (Lock screen)" }
  ];

  const questionsPool: Question[] = [];

  // Generate dynamic questions based on templates
  // 1. Port questions (12 variants)
  portsList.forEach(item => {
    questionsPool.push({
      question: `Tarmoq arxitekturasi va bayonnomalarida ${item.p}-port standart ravishda qaysi xizmatga/protokolga tegishli?`,
      options: [item.service, "DNS (Domen nomlari tizimi)", "SMTP (E-pochta)", "Telnet (Terminal)"],
      correct: 0,
      explanation: `${item.p}-port tarmoqda standart holda ${item.service} (${item.desc}) bayonnomasi tomonidan band qilinadi.`
    });
  });

  // 2. Linux command questions (10 variants)
  linuxCommands.forEach(item => {
    questionsPool.push({
      question: `Linux terminalida '${item.cmd}' buyrug'ining asosiy vazifasi nima?`,
      options: [item.desc, "Tizimni avtomatik qayta ishga tushirish", "Fayllarni arxivlash", "Internet tezligini o'lchash"],
      correct: 0,
      explanation: `Linux terminalida '${item.cmd}' buyrug'i ${item.desc} uchun xizmat qiladi.`
    });
  });

  // 3. SQL keyword questions (6 variants)
  sqlKeywords.forEach(item => {
    questionsPool.push({
      question: `SQL ma'lumotlar bazasida '${item.kw}' buyrug'ining asosiy maqsadi nima?`,
      options: [item.desc, "Yangi foydalanuvchilar yaratish", "Baza ulanishini uzish", "Dasturni o'chirish"],
      correct: 0,
      explanation: `SQL so'rovlar tilida '${item.kw}' kalit so'zi ${item.desc} amalini bajaradi.`
    });
  });

  // 4. Web vulnerability questions (5 variants)
  webVulns.forEach(item => {
    questionsPool.push({
      question: `Kiberxavfsizlikda '${item.v}' xavfsizlik zaifligi qanday amalga oshiriladi?`,
      options: [item.desc, "Operatsion tizimni yangilash orqali", "Tarmoq routerini o'chirib qo'yish orqali", "Parolni qo'lda terib topish orqali"],
      correct: 0,
      explanation: `'${item.v}' veb-xavfsizlik zaifligi asosan ${item.desc} tufayli vujudga keladi va jiddiy xavf tug'diradi.`
    });
  });

  // 5. Cryptography questions (5 variants)
  cryptoAlgos.forEach(item => {
    questionsPool.push({
      question: `Kriptografiya va axborot xavfsizligida '${item.c}' nima va u qanday ishlaydi?`,
      options: [item.desc, "Faqat Windows operatsion tizimini himoyalovchi dastur", "Tarmoq ulanishlarini to'xtatuvchi firewall turi", "Faqat video fayllarni siquvchi algoritm"],
      correct: 0,
      explanation: `'${item.c}' shifrlash sohasida ${item.desc} sifatida keng qo'llaniladi.`
    });
  });

  // 6. IP networks questions (5 variants)
  ipNetworks.forEach(item => {
    questionsPool.push({
      question: `Tarmoq sozlamalarida '${item.ip}' IP manzili qaysi sinfga (Class) yoki toifaga kiradi?`,
      options: [item.cls, "Faqat tashqi internet IP manzili", "E-pochta xizmat ko'rsatish manzili", "Router ichki operatsion tizim manzili"],
      correct: 0,
      explanation: `'${item.ip}' IP manzili tarmoq standartlariga ko'ra ${item.cls} toifasiga kirib, ${item.range} uchun mo'ljallangan.`
    });
  });

  // 7. Windows shortcuts questions (7 variants)
  windowsShortcuts.forEach(item => {
    questionsPool.push({
      question: `Windows operatsion tizimida klaviaturadagi '${item.sc}' kombinatsiyasi qanday vazifani bajaradi?`,
      options: [item.act, "Butun kompyuter xotirasini o'chirish", "Internet sahifani chop etish", "Dasturni butunlay yopish"],
      correct: 0,
      explanation: `Operatsion tizimda '${item.sc}' tezkor kombinatsiyasi ${item.act} uchun xizmat qiladi.`
    });
  });

  // Filter based on category if requested
  let filtered = questionsPool;
  if (category === "networks") {
    filtered = questionsPool.filter(q => q.question.includes("Tarmoq") || q.question.includes("IP"));
  } else if (category === "linux") {
    filtered = questionsPool.filter(q => q.question.includes("Linux"));
  } else if (category === "web") {
    filtered = questionsPool.filter(q => q.question.includes("SQL") || q.question.includes("veb") || q.question.includes("XSS"));
  } else if (category === "os") {
    filtered = questionsPool.filter(q => q.question.includes("Windows") || q.question.includes("katalog"));
  }

  // Shuffle options in questions to make it 100% dynamic
  const shuffledQuestions = filtered.map(q => {
    const originalCorrectOption = q.options[q.correct];
    // Shuffle options
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOptions.indexOf(originalCorrectOption);
    return {
      ...q,
      options: shuffledOptions,
      correct: newCorrectIndex
    };
  });

  // Select random elements to populate the quiz matching size
  const finalQuestions = shuffledQuestions.sort(() => Math.random() - 0.5).slice(0, size);

  return {
    id: `adaptive-${category}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: `Cheksiz Kiber-Mashg'ulot (${category === "networks" ? "Tarmoqlar" : category === "linux" ? "Linux CLI" : category === "web" ? "Veb & Bazalar" : category === "os" ? "Tizim Asoslari" : "Barchasi"})`,
    category: "Cheksiz Mashg'ulot",
    timeLimit: size * 10, // 10 seconds per question
    questions: finalQuestions
  };
}

// Seeded Offline Quizzes
const QUIZZES_DATA = [
  {
    id: "quiz-comp",
    title: "Kompyuter savodxonligi testi",
    category: "Kompyuter savodxonligi",
    timeLimit: 120,
    questions: [
      {
        question: "Kompyuterda barcha faol dasturlarni boshqarish va osilib qolgan jarayonlarni o'chirish uchun qaysi tizim asbobidan foydalaniladi?",
        options: [
          "Kompyuter boshqaruv paneli (Control Panel)",
          "Vazifalar menejeri (Task Manager)",
          "Tizim brauzeri sozlamalari",
          "Fayllarni qidirish paneli"
        ],
        correct: 1,
        explanation: "Task Manager (Vazifalar menejeri) real vaqtda operativ xotira va protsessor yuklamasini ko'rsatib, osilib qolgan jarayonlarni to'xtatish (End Task) imkonini beradi.",
      },
      {
        question: "Operatsion tizimning asosiy yadrosi (Kernel) qanday vazifani bajaradi?",
        options: [
          "Faqat internet brauzerni ishga tushirish",
          "Kompyuter apparat qismi (Hardware) va dasturlar orasidagi aloqani boshqarish",
          "Fayllarni avtomatik arxivlash va siqish",
          "Kompyuter ekranidagi ranglarni o'zgartirish"
        ],
        correct: 1,
        explanation: "Yadro (Kernel) - operatsion tizimning markaziy qismi bo'lib, xotira, protsessor va tashqi qurilmalar bilan dasturlar o'rtasidagi aloqani boshqaradi.",
      },
      {
        question: "Klaviaturadagi 'Ctrl + Shift + Esc' kombinatsiyasining vazifasi nima?",
        options: [
          "Kompyuterni o'chirish",
          "Vazifalar menejerini (Task Manager) to'g'ridan-to'g'ri ochish",
          "Hujjatdan nusxa olish",
          "Barcha oynalarni yashirish (Minimize)"
        ],
        correct: 1,
        explanation: "Ctrl + Shift + Esc tugmalar kombinatsiyasi Windows tizimida Vazifalar menejerini to'g'ridan-to'g'ri ochish uchun eng tezkor yo'ldir.",
      }
    ],
  },
  {
    id: "quiz-office",
    title: "Microsoft Office va Excel testi",
    category: "Microsoft Office",
    timeLimit: 120,
    questions: [
      {
        question: "Excelda katakdagi qiymat 50 dan katta bo'lsa 'Katta', aks holda 'Kichik' matnini chiqaruvchi to'g'ri formula qaysi?",
        options: [
          '=IF(A1>50; "Katta"; "Kichik")',
          '=SUM(A1>50; "Katta"; "Kichik")',
          '=COUNT(A1>50; "Katta")',
          '=AVERAGE(A1>50; "Kichik")'
        ],
        correct: 0,
        explanation: "Excelda shartli tekshiruv IF formulasi yordamida amalga oshiriladi: =IF(shart; to'g'ri_bo'lsa; noto'g'ri_bo'lsa).",
      },
      {
        question: "Excelda VLOOKUP (ВПР) funksiyasi qanday vazifani bajaradi?",
        options: [
          "Kataklardagi sonlarni avtomatik qo'shadi",
          "Jadvalning birinchi ustunidan ma'lum qiymatni izlab, mos keladigan boshqa ustun qiymatini qaytaradi",
          "Jadvaldagi yozuvlarni alifbo tartibida saralaydi",
          "Katakka yangi diagramma qo'shadi"
        ],
        correct: 1,
        explanation: "VLOOKUP (ВПР) funksiyasi jadvalning vertikal ustunlari bo'ylab ma'lumot izlash va mos keluvchi qator ma'lumotlarini olish uchun ishlatiladi.",
      },
      {
        question: "Excelda mutloq havola (Absolute Reference) yaratish uchun katak nomiga qaysi belgi qo'shiladi?",
        options: ["%", "#", "$", "&"],
        correct: 2,
        explanation: "Formulani boshqa kataklarga nusxalashda katak manzilini qulflab qo'yish (mutloq havola qilish) uchun $ belgisi (masalan, $A$1) ishlatiladi.",
      }
    ],
  },
  {
    id: "quiz-web",
    title: "Dasturlash (Web Dev) testi",
    category: "Dasturlash",
    timeLimit: 120,
    questions: [
      {
        question: "HTML5-da semantik teglarning eng asosiy foydasi nima?",
        options: [
          "Ranglarni chiroyli ko'rsatish",
          "SEO (Qidiruv tizimi optimizatsiyasi) va kod o'qilishini yaxshilash",
          "Internet tezligini oshirish",
          "Kompyuterni viruslardan himoya qilish",
        ],
        correct: 1,
        explanation: "Semantik teglar (<header>, <main>, <article>) qidiruv tizimlariga sahifadagi ma'lumotlar nimaligini tushuntirib, SEO ko'rsatkichlarini ko'taradi.",
      },
      {
        question: "CSS-da 'Box Model' (Blok modeli) tarkibiga quyidagilardan qaysilari kiradi?",
        options: [
          "Faqat color va background-color",
          "Content, padding, border va margin",
          "Faqat width va height",
          "Font-size, line-height va letter-spacing"
        ],
        correct: 1,
        explanation: "CSS Box Model har bir blokli elementni to'rtta qavatdan iborat deb qaraydi: kontent (content), ichki masofa (padding), chegara (border) va tashqi masofa (margin).",
      },
      {
        question: "JavaScriptda asinxron operatsiyalarni (Promise) boshqarish uchun qaysi kalit so'zlardan foydalaniladi?",
        options: [
          "var, let, const",
          "async va await",
          "try, catch, throw",
          "import va export"
        ],
        correct: 1,
        explanation: "JavaScriptda asinxron kodlarni chiroyli va o'qishli yozish uchun 'async' va 'await' kalit so'zlaridan keng foydalaniladi.",
      },
      {
        question: "Veb-saytlarda 'Responsive Design' (Moslashuvchan dizayn) yaratishda CSS-ning qaysi texnologiyasi asosiy hisoblanadi?",
        options: [
          "CSS Animation",
          "Media Queries (@media)",
          "CSS Variables",
          "Flex-wrap xususiyati"
        ],
        correct: 1,
        explanation: "Media Queries (@media) yordamida ekranning kengligiga qarab har xil CSS uslublarini qo'llash va moslashuvchan dizayn yaratish mumkin.",
      },
      {
        question: "HTTP va HTTPS protokollari orasidagi asosiy farq nima?",
        options: [
          "HTTPS protokolida ma'lumotlar SSL/TLS orqali shifrlanadi va xavfsiz uzatiladi",
          "HTTP protokoli tezroq ishlaydi",
          "HTTPS faqat mobil telefonlarda ishlatiladi",
          "Ular orasida hech qanday farq yo'q"
        ],
        correct: 0,
        explanation: "HTTPS protokoli HTTP-ning xavfsiz versiyasi bo'lib, ma'lumotlarni xakerlardan himoya qilish uchun SSL/TLS shifrlashidan foydalanadi.",
      }
    ],
  },
  {
    id: "quiz-python",
    title: "Sun'iy Intellekt & Python testi",
    category: "Sun'iy intellekt",
    timeLimit: 120,
    questions: [
      {
        question: "Pythonda ro'yxat (list) oxiriga yangi element qo'shish metodini tanlang.",
        options: ["push()", "add()", "append()", "insert()"],
        correct: 2,
        explanation: "Ro'yxatning oxiridan yangi element qo'shish uchun '.append()' ishlatiladi.",
      },
      {
        question: "Neyron tarmoqlarda aktivatsiya funksiyasining vazifasi nima?",
        options: [
          "Kod tezligini oshirish",
          "Chiziqli bo'lmagan bog'liqliklarni (non-linearity) o'rnatish",
          "Parollarni shifrlash",
          "Dasturni majburiy to'xtatish"
        ],
        correct: 1,
        explanation: "Aktivatsiya funksiyalari (masalan, ReLU yoki Sigmoid) neyron tarmoqqa chiziqli bo'lmagan xususiyatlarni kiritib, murakkab masalalarni yechish imkonini beradi.",
      },
      {
        question: "Mashinali o'rganishda (Machine Learning) ma'lumotlar bazasini qanday ikki qismga bo'lish odatiy hisoblanadi?",
        options: [
          "Input va Output",
          "Training (o'rgatuvchi) va Testing (tekshiruvchi) to'plamlar",
          "Xavfsiz va xavfli ma'lumotlar",
          "Matnli va raqamli ma'lumotlar"
        ],
        correct: 1,
        explanation: "Modelni o'rgatish uchun ma'lumotlar to'plamining katta qismi Train qilinadi va uning sifatini xolis tekshirish uchun qolgan qismi Test to'plami sifatida ajratiladi.",
      },
      {
        question: "Pythonda 'List Comprehension' sintaksisining maqsadi nima?",
        options: [
          "Ro'yxat elementlarini o'chirish",
          "Bitta qatorda tezkor va qulay ro'yxat (List) yaratish",
          "Ro'yxatni saralash",
          "Ro'yxatni tuple ma'lumot turiga o'tkazish"
        ],
        correct: 1,
        explanation: "List Comprehension - bu Pythonda mavjud ro'yxat yoki iterator asosida bitta qator kod yordamida yangi ro'yxat yaratishning ixcham sintaksisidir.",
      },
      {
        question: "Neyron tarmoqlarda 'Overfitting' (O'ta moslashish) muammosi nima va u qanday namoyon bo'ladi?",
        options: [
          "Model o'quv ma'lumotlarini juda yaxshi yodlab oladi, ammo yangi ma'lumotlarda juda yomon natija ko'rsatadi",
          "Model juda sekin o'rganadi",
          "Model xotiradan juda ko'p joy egallaydi",
          "Tarmoq barcha neyronlarni o'chirib qo'yadi"
        ],
        correct: 0,
        explanation: "Overfitting model o'quv ma'lumotlaridagi shovqin va xususiyatlarni haddan quang mukammal yodlab olib, notanish test ma'lumotlarida adashganda yuz beradi.",
      }
    ],
  },
  {
    id: "quiz-robotics",
    title: "Robototexnika va IoT testi",
    category: "Robototexnika",
    timeLimit: 120,
    questions: [
      {
        question: "Arduino mikrokontrollerida 'setup()' funksiyasining vazifasi nima?",
        options: [
          "Dastur ishga tushganda cheksiz marta takrorlanadi",
          "Faqat bir marta ishga tushib, pinlar rejimini va dastlabki parametrlarni sozlaydi",
          "Svetodiod chiroqlarini o'chiradi",
          "Dasturdagi xatoliklarni avtomatik tuzatadi"
        ],
        correct: 1,
        explanation: "setup() funksiyasi Arduino yoqilganda faqat bir marta ishlaydi va pinlarni kirish/chiqish rejimiga sozlash uchun qo'llaniladi.",
      },
      {
        question: "Mikrosxemalarda 'analogRead()' va 'digitalRead()' funksiyalarining asosiy farqi nima?",
        options: [
          "digitalRead faqat 0 va 1 (ha/yo'q) qiymatlarini o'qiydi, analogRead esa 0 dan 1023 gacha oraliqdagi uzluksiz kuchlanish qiymatini o'qiydi",
          "analogRead tezroq ishlaydi",
          "digitalRead faqat motorlarni boshqaradi",
          "Ularning hech qanday farqi yo'q"
        ],
        correct: 0,
        explanation: "Raqamli (digital) kirishlar faqat ikkita holatni (HIGH/LOW), analog kirishlar esa o'zgaruvchan qiymatlarni (masalan, harorat yoki yorug'lik datchigi ma'lumotlarini) o'qiydi.",
      },
      {
        question: "IoT (Internet of Things - Narsalar interneti) tushunchasining asosiy maqsadi nima?",
        options: [
          "Faqat yangi kompyuterlar sotib olish",
          "Turli jismoniy qurilmalarni internet tarmog'iga ulab, ularni masofadan boshqarish va o'zaro ma'lumot almashishini ta'minlash",
          "Katta o'yin serverlarini yaratish",
          "Wi-Fi tezligini sun'iy ravishda oshirish"
        ],
        correct: 1,
        explanation: "Narsalar interneti (IoT) - maishiy texnika, datchiklar, avtomobillar kabi turli ob'ektlarni internetga ulab, ularni aqlli boshqarish texnologiyasidir.",
      }
    ],
  },
  {
    id: "quiz-cyber",
    title: "Kiberxavfsizlik va Tarmoq xavfsizligi testi",
    category: "Kiberxavfsizlik",
    timeLimit: 120,
    questions: [
      {
        question: "Phishing (fishing) hujumining asosiy maqsadi nima?",
        options: [
          "Foydalanuvchining kompyuterini jismonan sindirish",
          "Soxta sahifalar yoki xabarlar yordamida shaxsiy login, parol va karta ma'lumotlarini o'g'irlash",
          "Internet tezligini sekinlashtirish",
          "Fayllarni avtomatik arxivlash va siqish",
        ],
        correct: 1,
        explanation: "Phishing - soxta saytlar orqali foydalanuvchining maxfiy shaxsiy ma'lumotlarini aldov yo'li bilan o'g'irlash hujumidir.",
      },
      {
        question: "Quyidagilardan qaysi biri eng ishonchli kiber-parol hisoblanadi?",
        options: [
          "admin12345", 
          "SeningIsming99", 
          "C¥b3r_T3ch_2026!", 
          "qwerty"
        ],
        correct: 2,
        explanation: "Kuchli parol kamida 12 belgidan iborat bo'lib, katta va kichik harflar, raqamlar hamda maxsus belgilarni o'z ichiga olishi kerak.",
      },
      {
        question: "Simmetrik va Asimmetrik shifrlash orasidagi asosiy farq nima?",
        options: [
          "Simmetrik shifrlashda shifrlash va kalitni ochish uchun bitta kalitdan, asimmetrikda esa ochiq (public) va yopiq (private) kalitlar juftligidan foydalaniladi",
          "Asimmetrik shifrlash ancha sekinroq ishlaydi",
          "Simmetrik shifrlash faqat Linuxda ishlaydi",
          "Farqi yo'q"
        ],
        correct: 0,
        explanation: "Simmetrik shifrlash (masalan, AES) bitta umumiy maxfiy kalitdan foydalanadi. Asimmetrik shifrlash esa (masalan, RSA) ikkita bog'liq kalitdan foydalanadi: biri shifrlaydi, ikkinchisi ochadi.",
      },
      {
        question: "DDoS (Distributed Denial of Service) hujumining maqsadi nima?",
        options: [
          "Parollarni lug'at yordamida buzish (Brute-force)",
          "Serverga bir vaqtning o'zida millionlab soxta so'rovlar yuborib, uni ishdan chiqarish va qonuniy foydalanuvchilarga xizmat ko'rsatishni to'xtatish",
          "Ma'lumotlar bazasini o'g'irlash",
          "Kompyuterdagi fayllarni shifrlab, tovon puli talab qilish"
        ],
        correct: 1,
        explanation: "DDoS hujumida xakerlar tarmoqdagi ko'plab zombi-kompyuterlar (botnet) yordamida maqsadli serverga yuklama berib, uni osiltirib qo'yishadi.",
      },
      {
        question: "Kiberxavfsizlikda 'Firewall' (Tarmoq ekrani) qanday vazifani bajaradi?",
        options: [
          "Kompyuterni qizib ketishdan saqlaydi",
          "Belgilangan qoidalar asosida kiruvchi va chiquvchi tarmoq trafigini kuzatib boradi va bloklaydi",
          "Internet provayderlarni almashtiradi",
          "Faqat parollarni generatsiya qiladi"
        ],
        correct: 1,
        explanation: "Firewall (Tarmoq ekrani) - bu xavfsiz ichki tarmoq va xavfli tashqi tarmoqlar o'rtasida to'siq bo'lib, shubhali trafikni to'xtatuvchi dastur yoki qurilmadir.",
      }
    ],
  },
];

// Offline Books
const BOOKS_DATA = [
  {
    id: "book-cyber",
    title: "Kiberxavfsizlik: Xakerlik sirlari va Himoya",
    author: "Cyber Tech Academy",
    pages: 145,
    category: "Kiberxavfsizlik",
    coverColor: "from-pink-600 to-purple-800",
    summary: "Xavfsiz internet, ijtimoiy muhandislik, portlar va Linux audit tizimlari haqida mukammal qo'llanma.",
    chapters: [
      {
        title: "1-Bob: Ijtimoiy muhandislik xavfi va turlari",
        content: `Ijtimoiy muhandislik (Social Engineering) - bu inson ruhiyatini aldash, psixologik manipulyatsiya qilish orqali maxfiy ma'lumotlarni o'g'irlash yoki tizimga ruxsatsiz kirish huquqini qo'lga kiritish san'atidir. Texnologik himoya tizimlari qanchalik mukammal bo'lmasin, eng zaif nuqta har doim inson omili (human factor) bo'lib qolaveradi.

Hujumchilar asosan quyidagi psixologik instinktlar orqali harakat qilishadi:
1. Mansabdorlik (Authority): Adminga, bank rahbariga yoki huquq-tartibot xodimiga o'xshab gapirish.
2. Shoshilinchlik (Urgency): "Hisobingiz 10 daqiqada bloklanadi!" kabi vahimali xabarlar yuborish.
3. Qo'rquv va Vahima (Fear): Xavfsizlik zaifligi yoki jazo choralari bilan qo'rqitish.
4. Ochko'zlik (Greed): "Siz 10,000,000 so'm yutib oldingiz!" kabi soxta aksiyalar taklif qilish.

Asosiy ijtimoiy muhandislik turlari:
- Phishing (Fishing): Ommaviy ravishda soxta elektron xatlar yoki SMS xabarlar yuborish. Hujumchi foydalanuvchini soxta veb-sahifaga yo'naltiradi.
- Spear Phishing: Maqsadli fishing. Bunda ma'lum bir shaxs yoki kompaniya xodimi haqida ma'lumot to'planib, faqat unga moslashtirilgan xat yuboriladi.
- Vishing (Ovozli fishing): Telefon qo'ng'iroqlari orqali ma'lumot yig'ish yoki bank kartasidagi mablag'ni o'g'irlash.
- Baiting (Yem qo'yish): Kompyuter atrofiga ustiga "Maxfiy ish haqlar" deb yozilgan virusli Fleshka (USB) tashlab ketish. Qiziquvchan xodim uni kompyuterga suqqanda virus faollashadi.

Ijtimoiy muhandislikdan himoyalanish uchun hech qachon shubhali havolalarga kirmang, bank kartangizning PIN-kodi va SMS orqali keladigan 5 xonali tasdiqlash kodini hech kimga aytmang. Rasmiy tashkilotlar bunday ma'lumotlarni hech qachon telefon orqali so'ramaydi!`,
      },
      {
        title: "2-Bob: Tarmoq protokollari xavfsizligi va MitM",
        content: `Internet va ichki tarmoqlarda ma'lumotlar paketlar oqimi shaklida uzatiladi. Muloqot protokollari qoidalar to'plami hisoblanadi. Agar tarmoq trafigi shifrlanmagan bo'lsa, xaker uni osongina o'g'irlashi mumkin.

Klassik HTTP protokoli shifrlanmagan bo'lib, bajaran ma'lumotlarni (shu jumladan parollar va xarid kartalarini) ochiq matn (Plaintext) ko'rinishida uzatadi. Xaker ichki tarmoqda (masalan, umumiy Wi-Fi nuqtasida) o'tirib, Wireshark kabi dasturlar yordamida ushbu trafigni ushlab olishi (Sniffing) va o'qishi mumkin. Ushbu hujum Man-in-the-Middle (MitM - O'rtadagi odam) hujumi deyiladi.

MitM hujumi turlari:
1. ARP Spoofing: Ichki tarmoqda tarmoq kartalari (MAC manzillar) va IP manzillar o'rtasidagi bog'lanishni buzish orqali barcha trafigni o'z kompyuteriga yo'naltirish.
2. DNS Spoofing (DNS Poisoning): Saytlarning IP manzillarini saqlaydigan keshni zaharli ma'lumotlar bilan to'ldirish. Natijada foydalanuvchi google.com deb yozsa ham, xakerning soxta serveriga yo'naltiriladi.

HTTPS protokoli HTTP-ga qaraganda xavfsiz hisoblanadi. U ma'lumotlarni SSL/TLS protokoli yordamida shifrlab uzatadi. Shifrlash asimmetrik va simmetrik algoritmlarga asoslangan bo'lib, xaker tarmoq trafigini ushlab olgan taqdirda ham uni kalitsiz o'qiy olmaydi. Shuning uchun brauzeringizda har doim "qulflangan qulf" belgisiga va HTTPS prefiksiga e'tibor bering.`,
      },
    ],
  },
  {
    id: "book-python",
    title: "Python Dasturlash Asoslari",
    author: "Cyber Tech Dasturchilari",
    pages: 180,
    category: "Dasturlash",
    coverColor: "from-cyan-600 to-blue-800",
    summary: "Dasturlash mantiqi, o'zgaruvchilar, sikllar, funksiyalar va OOP prinsiplarining chuqur tahlili.",
    chapters: [
      {
        title: "1-Bob: Python sintaksisi va o'zgaruvchilar",
        content: `Python bugungi kunda dunyodagi eng mashhur va o'rganish oson dasturlash tillaridan biridir. Uning sintaksisi soddaligi va ingliz tiliga yaqinligi bilan ajralib turadi. Boshqa dasturlash tillaridan farqli ravishda, Python-da kod bloklarini guruhlash uchun jingalak qavslar ({}) o'rniga faqat bo'sh joylar (Indentation - Tab yoki 4 ta space) majburiy hisoblanadi.

O'zgaruvchilar yaratish uchun maxsus tip (masalan, int, float, string) ko'rsatish shart emas. Python o'zi dynamic typing tizimi yordamida qiymatga qarab tipni aniqlaydi:
x = 5         # Integer (Butun son)
y = 3.14      # Float (O'nli son)
name = "Ali"  # String (Matn)

Mantiqiy amallar va shartlar 'if-elif-else' yordamida bajariladi.
Misol:
score = 85
if score >= 90:
    print("A'lo")
elif score >= 80:
    print("Yaxshi")
else:
    print("Qoniqarsiz")

Python-da ma'lumotlar to'plami bilan ishlash uchun List (ro'yxatlar), Tuple (o'zgarmas ro'yxat), Set (takrorlanmas to'plam) va Dictionary (kalit-qiymatli lug'atlar) keng qo'llaniladi. Lug'atlar (dict) JSON formatiga juda o'xshash bo'lib, kiberxavfsizlik va API dasturlashda juda muhim o'rin tutadi.`,
      },
      {
        title: "2-Bob: Funksiyalar, kutubxonalar va OOP",
        content: `Kodni qayta-qayta yozmaslik va tizimli dasturlash uchun funksiyalardan foydalaniladi. Python-da funksiya 'def' kalit so'zi orqali yaratiladi va qiymat qaytarish uchun 'return' buyrug'idan foydalanadi:

def salomlash(ism):
    return f"Salom, {ism}!"

print(salomlash("Jasur")) # Salom, Jasur!

Python-ning kuchi uning ulkan kutubxonalarida yotadi. Tayyor paketlarni o'rnatish uchun 'pip' paket menejeridan foydalaniladi:
'pip install requests' - veb so'rovlar yuborish uchun.
Dasturga kutubxonani import qilish uchun 'import' operatori ishlatiladi:
import os
import sys

Obyektga yo'naltirilgan dasturlash (OOP) - yirik dasturlarni modulli shaklda qurish konsepsiyasidir. U sinflar (Class) va obyektlar (Object) tushunchasiga asoslanadi. OOP ning 4 ta asosiy ustuni mavjud:
1. Encapsulation (Inkapsulyatsiya): Ma'lumotlar va metodlarni bir sinf ichida himoyalab saqlash.
2. Inheritance (Merosxo'rlik): Bir sinf xususiyatlarini boshqa yangi sinfga o'tkazish.
3. Polymorphism (Polimorfizm): Bir xil nomli metodlarning turli sinflarda turlicha ishlashi.
4. Abstraction (Abstraksiya): Murakkab ichki tizimni yashirib, faqat interfeysni ko'rsatish.`,
      },
    ],
  },
  {
    id: "book-linux",
    title: "Linux Operatsion Tizimi va Terminal",
    author: "Kiber-Adminlar Jamoasi",
    pages: 220,
    category: "Linux",
    coverColor: "from-green-600 to-emerald-900",
    summary: "Linux operatsion tizimi arxitekturasi, kataloglar tuzilishi va terminal buyruqlari bilan ishlash.",
    chapters: [
      {
        title: "1-Bob: Linux fayl tizimi ierarxiyasi",
        content: `Linux operatsion tizimi Windows tizimidan tubdan farq qiladi. Unda disklarga bo'linish (C:, D: disklari) yo'q. Barcha qurilmalar, disklar va fayllar yagona ierarxik daraxt tuzilishiga ega bo'lib, eng yuqori katalog '/' (Root directory - ildiz) hisoblanadi.

Linux fayl tizimining eng muhim kataloglari:
- /bin: Tizim uchun zarur bo'lgan asosiy foydalanuvchi buyruqlari va dasturlari (masalan, ls, cd, cp).
- /sbin: Tizim administratoriga tegishli maxsus tizim buyruqlari (masalan, iptables, fdisk).
- /etc: Tizimdagi barcha xizmatlar va dasturlarning konfiguratsiya (sozlash) fayllari saqlanadigan joy.
- /var: Dinamik ravishda o'zgaruvchan ma'lumotlar, log fayllari, ma'lumotlar bazasi va kesh saqlanadigan katalog.
- /home: Foydalanuvchilarning shaxsiy hujjatlari saqlanadigan jildlar (masalan, /home/user1/).
- /root: Tizimning mutloq egasi - root (Superuser) shaxsiy uyi.
- /tmp: Vaqtinchalik fayllar saqlanadigan joy. Kompyuter o'chib-yonganda tozalanadi.

Linuxda "hamma narsa fayl" (everything is a file) prinsipi amal qiladi. Hatto tarmoq kartasi, sichqoncha, klaviatura va protsessor ham '/dev' katalogi ostida maxsus qurilma-fayli ko'rinishida taqdim etiladi.`,
      },
      {
        title: "2-Bob: Terminalda navigatsiya va buyruqlar",
        content: `Linux terminali (Command Line Interface - CLI) - bu operatsion tizim bilan bevosita va tezkor muloqot qilish asbobidir. 

Kataloglar aro navigatsiya qilish va fayllar bilan ishlash uchun asosiy terminal buyruqlari:
- 'pwd': Joriy turgan jildning to'liq manzilini ko'rsatish (Print Working Directory).
- 'ls': Joriy jild ichidagi fayl va papkalar ro'yxatini chiqarish.
  - 'ls -a': Yashirin (nuqta bilan boshlangan) fayllarni ham ko'rsatish.
  - 'ls -lh': Fayl o'lchamlarini odam o'qishi oson formatda (KB, MB) to'liq ko'rsatish.
- 'cd [katalog]': Ko'rsatilgan katalogga kirish.
  - 'cd ..': Bitta yuqori darajadagi papkaga qaytish.
  - 'cd ~': Shaxsiy uy katalogiga (home) qaytish.
- 'mkdir [papka_nomi]': Yangi papka (jild) yaratish.
- 'rm [fayl]': Faylni o'chirish.
  - 'rm -rf [papka]': Papkani ichidagi barcha fayllari bilan birga majburiy o'chirish.
- 'cp [manba] [maqsad]': Fayldan nusxa olish.
- 'mv [manba] [maqsad]': Faylni ko'chirish yoki nomini o'zgartirish.
- 'cat [fayl]': Fayl ichidagi matnni terminalda to'liq ko'rsatish.
- 'grep [so'z] [fayl]': Fayl ichidan kerakli so'z yoki satrni izlab topish va ajratish.
- 'chmod': Faylga kirish ruxsatlarini (o'qish, yozish, ishga tushirish) o'zgartirish. Masalan, 'chmod +x script.sh' skriptni ishga tushuvchi (executable) qiladi.`,
      },
    ],
  },
  {
    id: "book-networks",
    title: "Tarmoq Asoslari va IP Manzillash",
    author: "Tarmoq Injenerlari",
    pages: 210,
    category: "Tarmoqlar",
    coverColor: "from-yellow-600 to-amber-900",
    summary: "OSI modeli, TCP/IP stek, IP manzillash (IPv4/IPv6) va subnetting asoslarining batafsil tahlili.",
    chapters: [
      {
        title: "1-Bob: OSI modeli va TCP/IP tushunchasi",
        content: `Tarmoq arxitekturasini tushunish uchun dunyo standarti hisoblangan 7 qatlamli OSI (Open Systems Interconnection) modelini bilish shart. Har bir qatlam ma'lumot uzatishning alohida bosqichiga javob beradi:

1. Fizik qatlam (Physical Layer): Elektr signallari, tarmoq kabellari va qurilmalari (Hub, repeater).
2. Kanal qatlam (Data Link Layer): Ma'lumotlarni MAC manzillar yordamida uzatish (Switch).
3. Tarmoq qatlam (Network Layer): IP manzillar yordamida paketlarni yo'naltirish (Router).
4. Transport qatlam (Transport Layer): Ma'lumot uzatish ishonchliligi (TCP portlar va UDP).
5. Seans qatlam (Session Layer): Ikki kompyuter ulanish seansini boshqarish.
6. Taqdimot qatlam (Presentation Layer): Ma'lumotlarni shifrlash, siqish va formatlash.
7. Ilova qatlam (Application Layer): Foydalanuvchi dasturlari va brauzerlar (HTTP, FTP, SMTP).

TCP/IP modeli esa amaliyotda ishlatiladigan 4 ta qatlamli model bo'lib, internet aynan shu asosda ishlaydi:
- Network Access (Kanal va Fizik)
- Internet (Tarmoq)
- Transport (Transport)
- Application (Ilova, Taqdimot, Seans)`,
      },
      {
        title: "2-Bob: IPv4, IPv6 va Subnetting",
        content: `Har bir tarmoqdagi kompyuter yoki qurilma o'zining noyob raqamli manziliga - IP (Internet Protocol) manziliga ega bo'lishi kerak.

IPv4 manzillar 32-bit uzunlikda bo'lib, nuqtalar bilan ajratilgan to'rtta oklatdan iborat (masalan, 192.168.1.1). Maksimal qiymati 255.255.255.255 bo'likka chiqishi mumkin. Dunyo bo'ylab IPv4 manzillar tugab borayotganligi sababli, yangi 128-bitli IPv6 manzillar tizimi joriy qilingan bo'lib, u sakkiz guruhli o'n oltilik (hexadecimal) tizimda yoziladi (masalan, 2001:db8::ff00:42:8329).

IP manzillar uchta asosiy sinfga bo'linadi:
- Class A: 1.0.0.0 dan 126.255.255.255 gacha (yirik tarmoqlar)
- Class B: 128.0.0.0 dan 191.255.255.255 gacha (o'rta tarmoqlar)
- Class C: 192.0.0.0 dan 223.255.255.255 gacha (kichik mahalliy tarmoqlar)

Subnetting - bitta yirik IP tarmog'ini kichikroq tarmoqlarga bo'lish jarayonidir. Bu tarmoq trafigini kamaytiradi, boshqaruvni osonlashtiradi va xavfsizlikni kuchaytiradi. Subnet mask (tarmoq osti maskasi) IP manzilning qaysi qismi tarmoq identifikatori va qaysi qismi host ekanligini ko'rsatadi (masalan, 255.255.255.0 yoki /24 CIDR ko'rinishida).`,
      },
    ],
  },
  {
    id: "book-web-sec",
    title: "Web Ilovalar Xavfsizligi va Kamchiliklar",
    author: "Bug Bounty Ovchilari",
    pages: 195,
    category: "Kiberxavfsizlik",
    coverColor: "from-purple-600 to-indigo-900",
    summary: "Veb saytlardagi zaifliklarni aniqlash, OWASP Top 10 standarti va xavfsizlik kamchiliklarini bartaraf etish.",
    chapters: [
      {
        title: "1-Bob: Veb arxitekturasi va HTTP protokoli",
        content: `Veb-ilovalarning xavfsizligini ta'minlash uchun avvalo ularning qanday ishlashini bilishimiz zarur. Standart veb-tizim ikki qismdan iborat: Client-side (mijoz tomoni - brauzer, HTML, CSS, JavaScript) va Server-side (server tomoni - ma'lumotlar bazasi, backend kod, API ulanishlar).

Mijoz va server o'rtasidagi muloqot HTTP (HyperText Transfer Protocol) so'rovlari va javoblari yordamida amalga oshiriladi.
HTTP so'rovi quyidagi metodlardan iborat:
- GET: Serverdan ma'lumotlarni yuklab olish. Parametrlar URL manzilda ochiq ko'rinadi (masalan, ?id=5).
- POST: Serverga ma'lumot yuklash yoki ro'yxatdan o'tish formasi. Ma'lumotlar so'rov tanasida (body) yashirin ketadi.
- PUT/PATCH: Serverdagi ma'lumotni yangilash.
- DELETE: Serverdagi ma'lumotni o'chirish.

Server javobi esa holat kodlari (Status Codes) orqali qaytadi:
- 200 OK: Muvaffaqiyatli bajarildi.
- 301/302: Boshqa URLga yo'naltirish (Redirect).
- 403 Forbidden: Tizimga ruxsat yo'q.
- 404 Not Found: Sahifa topilmadi.
- 500 Internal Server Error: Server kodida xatolik.`,
      },
      {
        title: "2-Bob: Cross-Site Scripting (XSS) va uning turlari",
        content: `Cross-Site Scripting (XSS) - kiberxavfsizlikda eng ko'p tarqalgan veb-zaifliklardan biridir. U server foydalanuvchilar yuborgan ma'lumotlarni yetarlicha filtrlamay brauzerga qaytarganda yuz beradi. Natijada hujumchi sayt ichiga zararli JavaScript kodini joylashtiradi va bu kod saytga kirgan boshqa jabrlanuvchilar brauzerida ishga tushadi.

XSS zaifligining 3 ta asosiy turi mavjud:
1. Stored XSS (Saqlangan XSS): Eng xavfli turi. Zararli JS kodi serverdagi ma'lumotlar bazasida doimiy saqlanib qoladi (masalan, izohlar bo'limida). Saytning ushbu sahifasiga kirgan har bir odam brauzerida kod avtomatik ishlaydi.
2. Reflected XSS (Aks etgan XSS): Zararli kod havola (URL) ichida yuboriladi. Hujumchi qurbonga maxsus havolani bosishga majbur qiladi va brauzer orqali kod faollashadi.
3. DOM-based XSS: Hujum saytning backend qismiga tegmasdan, bevosita brauzerdagi JavaScript (Document Object Model) tuzilishini manipulyatsiya qilish orqali amalga oshiriladi.

XSS ning oqibatlari juda og'ir bo'lishi mumkin. Xaker jabrlanuvchining seans cookie-fayllarini o'g'irlashi (Session Hijacking), soxta login oynalarini ko'rsatishi yoki foydalanuvchi nomidan amallarni bajarishi mumkin.
Klassik sinov payload:
<script>alert(document.cookie)</script>

Himoya choralari: Dasturchi foydalanuvchi kiritgan har bir ma'lumotni tozalashi (Sanitisation), maxsus belgilarni (&lt;, &gt;) HTML-entity ko'rinishiga o'tkazishi (Output Encoding) va brauzerda maxsus "HttpOnly" cookie sozlamalarini faollashtirishi shart!`,
      },
    ],
  },
  {
    id: "book-sql",
    title: "SQL Ma'lumotlar Bazasi va SQL Injection",
    author: "Database Administrators",
    pages: 185,
    category: "Ma'lumotlar Bazasi",
    coverColor: "from-red-600 to-rose-900",
    summary: "SQL tili buyruqlari, relyatsion jadvallar arxitekturasi va SQL Injection zaifligining chuqur tahlili.",
    chapters: [
      {
        title: "1-Bob: SQL tili va relyatsion jadvallar",
        content: `Relyatsion ma'lumotlar bazasi (Relational Database) - bu ma'lumotlarni bir-biri bilan bog'langan o'zaro jadvallar ko'rinishida saqlash tizimidir. SQL (Structured Query Language) esa ushbu bazalarni boshqarish tilidir.

Asosiy relyatsion SQL buyruqlari:
- SELECT: Bazadan kerakli ma'lumotlarni tanlab olish.
  SELECT name, email FROM users WHERE age > 18;
- INSERT: Yangi qator (ma'lumot) qo'shish.
  INSERT INTO users (name, email) VALUES ('Jasur', 'jasur@gmail.com');
- UPDATE: Mavjud ma'lumotlarni tahrirlash.
  UPDATE users SET password = 'new_password' WHERE id = 5;
- DELETE: Ma'lumotlarni o'chirish.
  DELETE FROM users WHERE id = 5;

Jadvallar orasidagi munosabatlar Primary Key (Noyob kalit - jadvaldagi har bir qatorni aniqlovchi) va Foreign Key (Tashqi kalit - boshqa jadval bilan bog'lovchi) orqali o'rnatiladi. Bir nechta jadvallardagi ma'lumotlarni bitta so'rovda birlashtirish uchun JOIN (INNER JOIN, LEFT JOIN, RIGHT JOIN) operatorlaridan foydalaniladi.`,
      },
      {
        title: "2-Bob: SQL Injection (SQLi) zaifligi va himoya",
        content: `SQL Injection (SQLi) - bu ma'lumotlar bazasi so'rovlarini manipulyatsiya qilishga qaratilgan eng xavfli kiberxavfsizlik zaifligidir. Hujumchi saytdagi kiritish maydoniga (masalan, login oynasiga) maxsus SQL sintaksis belgilarini (tirnoq, chiziqchalar) kiritish orqali server yuborayotgan so'rovni buzadi va o'ziga kerakli so'rovni bajarishga erishadi.

Klassik login bypass payload:
admin' OR 1=1 --

Ushbu payload yuborilganda serverdagi SQL so'rovi quyidagicha o'zgaradi:
SELECT * FROM users WHERE username = 'admin' OR 1=1 --' AND password = '...';
Bu yerda:
- ' OR 1=1' sharti har doim to'g'ri (TRUE) bo'ladi.
- '--' belgisi keyingi parolni tekshirish qismini izoh (comment) ga aylantirib, bekor qiladi. Natijada xaker parolsiz tizimga admin sifatida kiradi!

SQL Injection turlari:
1. In-band SQLi (UNION-based): Hujumchi UNION operatori yordamida boshqa maxfiy jadvallardagi ma'lumotlarni to'g'ridan-to'g'ri o'z ekranida chiqaradi.
2. Blind SQLi (Yashirin): Ekran yoki xatoliklarda ma'lumot ko'rinmaydi. Lekin hujumchi True/False shartlari yoki vaqt kechikishlari (Time-based: pg_sleep(5)) orqali ma'lumotlarni belgi-belgi qilib o'g'irlaydi.

Himoya usullari:
Dasturchilar hech qachon foydalanuvchi ma'lumotini SQL so'roviga to'g'ridan-to'g'ri qo'shmasligi kerak! Parametrlangan so'rovlar (Prepared Statements) yoki zamonaviy ORM tizimlaridan foydalanish SQL Injection zaifligini 100% bartaraf etadi.`,
      },
    ],
  },
  {
    id: "book-crypto",
    title: "Kriptografiya Tarixi va Algoritmlar",
    author: "Shifr Ustasi",
    pages: 190,
    category: "Matematika",
    coverColor: "from-blue-600 to-indigo-900",
    summary: "Qadimgi shifrlardan tortib, zamonaviy simmetrik, asimmetrik shifrlash va xesh funksiyalar.",
    chapters: [
      {
        title: "1-Bob: Klassik shifrlash va Enigma",
        content: `Kriptografiya (grekchadan "kryptos" - maxfiy, "graphein" - yozish) ma'lumotlarni begona shaxslar o'qiy olmaydigan ko'rinishga keltirish ilmidir. Ma'lumot shifrlanmagan holatda Plaintext (ochiq matn), shifrlangandan so'ng esa Ciphertext (shifr-matn) deyiladi.

Klassik kriptografiyaga misollar:
- Sezar shifri: Alifbodagi har bir harf ma'lum qadamga suriladi. Masalan, 3 qadamli surishda A harfi D ga o'zgaradi.
- ROT13: Alifboni 13 ta harfga surish (Sezarning 13-qadamli varianti).
- Vigenere shifri: Shifrlash uchun har bir harfga alohida kalit so'z harflari qo'llaniladi.

Ikkinchi jahon urushida nemis harbiylari tomonidan ishlatilgan "Enigma" mexanik shifrlash mashinasi kriptografiya tarixida burilish yasadi. Enigma har kuni kalitlarni o'zgartirgan va uni qo'lda buzish imkonsiz bo'lgan. Buyuk britaniyalik matematik Alan Turing birinchi kiber-hisoblash mashinasi (Bombe) ni yaratib, Enigmani buzishga muvaffaq bo'ldi va bu bugungi kompyuter fanlarining boshlanishi edi.`,
      },
      {
        title: "2-Bob: Zamonaviy AES, RSA va Xesh funksiyalar",
        content: `Bugungi raqamli dunyoda shifrlash ikki toifaga bo'linadi: Simmetrik va Asimmetrik.

1. Simmetrik shifrlash: Ma'lumotlarni shifrlash va ularni qayta ochish (decrypt) uchun yagona yashirin kalit ishlatiladi. Tez ishlaydi va katta hajmdagi fayllarni shifrlashda qo'llaniladi. Eng mashhur algoritmi: AES (Advanced Encryption Standard).
2. Asimmetrik shifrlash: Muloqot ishtirokchilarida ikkita kalit bo'ladi - Public key (ochiq kalit - hammaga beriladi, shifrlash uchun) va Private key (yashirin kalit - faqat egasida saqlanadi, shifrni ochish uchun). Eng keng tarqalgan asimmetrik algoritmi: RSA.

Xesh funksiyalar (Hashing):
Shifrlashdan farqli o'laroq, xesh funksiyalar bir tomonlama (One-way) ishlaydi. Ya'ni, xesh qiymatni qaytadan ochiq matnga aylantirish imkonsiz. U ixtiyoriy hajmdagi ma'lumotni aniq o'lchamdagi noyob satrga o'zgartiradi. 
Asosiy xesh algoritmlari: MD5, SHA-1, SHA-256. 
Xavfsizlik tizimlarida foydalanuvchi parollari ma'lumotlar bazasida hech qachon ochiq saqlanmaydi, faqat ularning xesh qiymatlari (masalan, bcrypt orqali) saqlanadi. Foydalanuvchi tizimga kirganda kiritgan paroli qayta xeshlanib, bazadagi xesh bilan solishtiriladi.`,
      },
    ],
  },
  {
    id: "book-py-hack",
    title: "Python orqali Xakerlik Skriptlarini Yozish",
    author: "Qora Shlyapali Xaker",
    pages: 210,
    category: "Dasturlash",
    coverColor: "from-teal-600 to-cyan-900",
    summary: "Port scannerlar, brute-force vositalari, tarmoq snifferlari va Python yordamida exploitlarni avtomatlashtirish.",
    chapters: [
      {
        title: "1-Bob: Socket dasturlash va Port Scanner yozish",
        content: `Python tili kiberxavfsizlik xodimlari va xakerlar uchun asosiy qurol hisoblanadi. Uning yordamida tarmoq monitoringi, zaifliklarni skanerlash va exploitlarni avtomatlashtirish skriptlari juda tez yoziladi.

Tarmoq ulanishlarini past darajada boshqarish uchun Python-ning 'socket' kutubxonasi ishlatiladi. Socket yordamida biz tarmoqdagi istalgan kompyuter va portga TCP/IP ulanishlarini yuborishimiz va ochiq/yopiqligini tekshirishimiz mumkin.

Quyida Python dasturlash tilida yozilgan sodda Port Scanner skripti keltirilgan:
\`\`\`python
import socket
import sys

target_host = "10.10.23.45"
ports_to_scan = [21, 22, 80, 443, 4444]

print(f"[*] Skanerlash boshlanmoqda: {target_host}")
for port in ports_to_scan:
    # Socket obyektini yaratish: AF_INET (IPv4), SOCK_STREAM (TCP)
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(1.0) # 1 soniya kutish vaqti
    
    # Port ochiqligini tekshirish
    result = s.connect_ex((target_host, port))
    if result == 0:
        print(f"[+] Port {port} OCHIQ (OPEN)")
    else:
        print(f"[-] Port {port} yopiq")
    s.close()
\`\`\`
Ushbu skript har bir portga TCP SYN paketini yuborib, ulanish muvaffaqiyatli amalga oshganini tekshiradi (connect_ex funksiyasi 0 qaytarsa, ulanish muvaffaqiyatli bo'lladi).`,
      },
      {
        title: "2-Bob: HTTP so'rovlarni avtomatlashtirish",
        content: `Veb-ilovalar xavfsizligini tekshirishda HTTP so'rovlarini avtomatlashtirish muhim o'rin tutadi. Python-ning 'requests' kutubxonasi orqali biz murakkab HTTP GET va POST so'rovlarini bir necha satr kod bilan amalga oshira olamiz.

Masalan, ma'lum bir saytning login formasiga parollarni avtomatik terib ko'ruvchi (Brute-force) skript yozishimiz mumkin:
\`\`\`python
import requests

url = "http://target-site.com/login"
username = "admin"
password_list = ["123456", "password", "admin123", "secret"]

for pwd in password_list:
    # POST so'rov ma'lumotlari (payload)
    data = {
        "user": username,
        "pass": pwd
    }
    
    # So'rov yuborish
    response = requests.post(url, data=data)
    
    # Muvaffaqiyatli kirishni tekshirish
    if "Xush kelibsiz" in response.text:
        print(f"[+] Parol topildi! Username: {username}, Password: {pwd}")
        break
    else:
        print(f"[-] Noto'g'ri urinish: {pwd}")
\`\`\`
Ushbu skript har bir parolni ro'yxatdan olib, POST so'rovi tanasi orqali serverga yuboradi va server qaytargan HTML matni ichidan muvaffaqiyatli kirish belgisini ("Xush kelibsiz") qidiradi.`,
      },
    ],
  },
  {
    id: "book-computer-basics",
    title: "Kompyuter Savodxonligi Asoslari",
    author: "Texno O'qituvchilar",
    pages: 120,
    category: "Kompyuter",
    coverColor: "from-orange-600 to-red-800",
    summary: "Kompyuter apparat qismlari, protsessorlar, operativ xotiralar va operatsion tizimlar solishtiruvi.",
    chapters: [
      {
        title: "1-Bob: Kompyuter jihozlari arxitekturasi",
        content: `Kompyuter apparat ta'minoti (Hardware) - bu kompyuterning jismoniy qismlari va elektron qurilmalari yig'indisidir. Kompyuterning asosiy arxitekturasi fon Neyman tamoyiliga asoslangan va quyidagi bloklardan iborat:

1. Protsessor (CPU - Central Processing Unit): Kompyuterning miyasi bo'lib, barcha matematik va mantiqiy amallarni bajaradi. Uning tezligi gigagers (GHz) va yadrolari soni bilan o'lchanadi.
2. Operativ Xotira (RAM - Random Access Memory): Vaqtinchalik tezkor xotira. Kompyuter faol ishlatayotgan dasturlar va jarayonlar RAMda saqlanadi. Tok o'chganda ma'lumotlar butunlay o'chib ketadi.
3. Doimiy Xotira (HDD/SSD): Ma'lumotlarni doimiy saqlash qurilmasi. Zamonaviy SSD (Solid State Drive) disklar eski mexanik HDD (Hard Disk Drive) larga qaraganda o'n barobar tezroq ishlaydi.
4. Ona Plata (Motherboard): Barcha apparatlarni (protsessor, RAM, videokarta) birlashtiruvchi va ular o'rtasida aloqani ta'minlovchi asosiy plata.
5. Videokarta (GPU - Graphics Processing Unit): Ekranga tasvir chiqarish, 3D modellashtirish va sun'iy intellekt hisob-kitoblariga javob beruvchi yordamchi hisoblash qurilmasi.`,
      },
      {
        title: "2-Bob: Operatsion tizimlar va vazifalari",
        content: `Operatsion tizim (OS) - bu kompyuter apparat qismi bilan foydalanuvchi dasturlarini bog'lovchi poydevor dasturiy ta'minotdir. OS bo'lmasa, kompyuter shunchaki temir yig'indisi bo'lib qoladi.

Dunyodagi uchta asosiy operatsion tizimlar oilasi:
- Microsoft Windows: Eng ommabop shaxsiy kompyuterlar tizimi. Foydalanish juda oson, o'yinlar va dasturlar juda ko'p. Lekin ochiq manbali emas va viruslarga nisbatan zaif.
- macOS: Apple kompaniyasi kompyuterlari uchun maxsus Unix asosidagi tizim. Juda barqaror, vizual chiroyli va grafik dizaynerlar uchun qulay.
- Linux: Ochiq manbali, bepul va xavfsiz tizim. Dunyodagi barcha serverlarning 90% dan ortig'i aynan Linuxda ishlaydi. Android tizimi ham Linux yadrosiga asoslangan.`,
      },
    ],
  },
  {
    id: "book-word-hacks",
    title: "Microsoft Word Matn Muharriri va Sirlari",
    author: "Office Ekspertlar",
    pages: 130,
    category: "Kompyuter",
    coverColor: "from-blue-600 to-indigo-800",
    summary: "MS Word matn muharririda professional hujjatlar yaratish, formatlash va uslublar paneli sirlari.",
    chapters: [
      {
        title: "1-Bob: Hujjatlarni professional formatlash sirlari",
        content: `Microsoft Word - dunyodagi eng mashhur matn yaratish va tahrirlash dasturidir. Hujjatlar bilan ishlaganda professional ko'rinish va tartibni ta'minlash uchun quyidagi sirlarni bilish kerak:

1. 'Styles' (Uslublar) paneli: Hujjat sarlavhalariga Heading 1, Heading 2 uslublarini berish shart. Bu hujjat tuzilishini tizimlashtiradi va keyinchalik birgina tugma bilan avtomatik Mundarija (Table of Contents) yaratishga yordam beradi.
2. Page Breaks (Sahifa uzilishi): Yangi bobni boshlash uchun klaviaturadagi **Ctrl + Enter** tugmasini bosing. Bo'sh joylar (Enter) bosib yangi sahifaga o'tish noto'g'ri, chunki hujjatning yuqori qismiga matn qo'shilganda pastdagi barcha matnlar surilib ketadi.
3. Section Breaks (Bo'lim uzilishlari): Hujjatning turli sahifalariga har xil hoshiya berish yoki ba'zi sahifalarini gorizontal (landscape) shaklga keltirish uchun Page Layout bo'limidan 'Section Breaks' dan foydalaniladi.
4. SmartArt va Jadvallar: Murakkab ro'yxatlarni vizual chiroyli ko'rsatish uchun tayyor sxemalardan (SmartArt) foydalanish ish sifatini sezilarli darajada oshiradi.`,
      },
    ],
  },
  {
    id: "book-excel-master",
    title: "Microsoft Excel: Tahlil va Formulalar",
    author: "Data Tahlilchilar",
    pages: 160,
    category: "Kompyuter",
    coverColor: "from-emerald-600 to-green-800",
    summary: "Excel formulalari, VLOOKUP, Pivot jadvallar va murakkab ma'lumotlarni tahlil qilish qo'llanmasi.",
    chapters: [
      {
        title: "1-Bob: Murakkab formulalar va kataklarni qulflash",
        content: `Microsoft Excel - bu jadvallar, moliya va ma'lumotlar tahlili uchun eng kuchli vositadir. Unda barcha hisob-kitoblar katakchalar koordinatalari orqali amalga oshiriladi.

Asosiy formulalar:
- =SUM(A1:A10) - Yig'indi hisoblash.
- =AVERAGE(B1:B20) - O'rtacha qiymat chiqarish.
- =IF(C1>=60, "O'tdi", "Yiqildi") - Shartli tekshirish.

Katakchalarni qulflash (Absolute Referencing):
Formulani boshqa kataklarga nusxalaganda, katak manzillari o'zgaradi (nisbiy havola). Agar biz formula tarkibidagi ma'lum bir katak manzilini qotirib qo'ymoqchi bo'lsak, dollar '**$**' belgisidan foydalanamiz (mutloq havola).
Masalan:
=A1 * $B$1
Formulani pastga tortganingizda A1 o'zgarib A2, A3 bo'ladi, lekin $B$1 o'zgarmasdan, qulflanib turaveradi.

Pivot Tables (Konsolidatsiyalangan jadvallar):
Katta hajmdagi minglab qatorli ma'lumotlarni bir necha soniyada guruhlash, filtrlash va vizual hisobot shakliga keltirish uchun eng qulay vosita bu - Pivot Table (Svodnaya tablitsa) hisoblanadi. Uni Insert (Vstavka) bo'limidan yaratish mumkin.`,
      },
    ],
  },
  {
    id: "book-wifi-sec",
    title: "Wi-Fi Tarmoqlari va Ularning Zaifliklari",
    author: "Wireless Pentester",
    pages: 145,
    category: "Kiberxavfsizlik",
    coverColor: "from-indigo-600 to-pink-900",
    summary: "Simsiz tarmoq shifrlari (WPA2/WPA3), Wi-Fi router xavfsizligi va qo'shnilardan himoyalanish.",
    chapters: [
      {
        title: "1-Bob: Simsiz shifrlash protokollari zaifliklari",
        content: `Simsiz Wi-Fi tarmoqlari ma'lumotlarni radio to'lqinlar orqali havoga tarqatgani sababli, ularning xavfsizligi o'ta muhim. Agar shifrlash yo'lga qo'yilmasa, tarmoq atrofidagi har qanday odam trafigni o'g'irlay oladi.

Wi-Fi shifrlash protokollari tarixi:
1. WEP (Wired Equivalent Privacy): Eng birinchi, juda zaif shifr. Undagi matematik xatolik sababli, xakerlar bir necha daqiqada aircrack-ng vositasi bilan uning parolini buza olishadi. Mutloq ishlatish taqiqlanadi!
2. WPA (Wi-Fi Protected Access): Vaqtinchalik yechim sifatida yaratilgan, hozirda eskirgan.
3. WPA2: Bugungi kunda dunyodagi eng keng tarqalgan xavfsizlik standarti. U AES shifrlashiga asoslangan. Lekin unda ham Handshake (ulanuvchi va router o'rtasidagi kelishuv paketlari) ushlab olinib, parolni lug'at orqali terib ko'rish (Brute-force) zaifligi mavjud.
4. WPA3: Eng so'nggi xavfsiz protokol. Unda lug'at orqali parollarni terib ko'rish (offline dictionary attack) va handshake o'g'irlash hujumlariga qarshi mukammal himoya o'rnatilgan.

Simsiz tarmoqni himoyalash choralari:
Routeringiz konfiguratsiya sahifasiga kirib, **WPS** (Wi-Fi Protected Setup) funksiyasini mutloq o'chirib qo'ying (chunki WPS PIN kodlari juda tez buziladi), parolni esa kamida 12 ta harf va sonlardan iborat murakkab qiling.`,
      },
    ],
  },
  {
    id: "book-social-eng",
    title: "Ijtimoiy Muhandislik va Phishing Hujumlari",
    author: "Kiber Phishing",
    pages: 135,
    category: "Kiberxavfsizlik",
    coverColor: "from-red-700 to-red-950",
    summary: "Inson ruhiyati manipulyatsiyasi, phishing sahifalari arxitekturasi va fishing hujumlaridan himoya strategiyasi.",
    chapters: [
      {
        title: "1-Bob: Phishing (Fishing) turlari va tuzilishi",
        content: `Electronic Phishing (Fishing) - kiber-jinoyatchilikning eng keng tarqalgan turi bo'lib, soxta xatlar, veb-sahifalar yoki ijtimoiy tarmoqlar orqali foydalanuvchining shaxsiy ma'lumotlarini (login, parol, karta raqamlari) qo'lga kiritishga qaratilgan hujumdir.

Hujumchilar odatda quyidagi usullardan foydalanadi:
- Domain Spoofing: Haqiqiy sayt nomiga juda o'xshash bo'lgan soxta domen sotib olish. Masalan, telegram.org o'rniga te1egram.org yoki instagram.com o'rniga 1nstagram.com.
- Clone Phishing: Haqiqiy kompaniyaning avvalgi rasmiy elektron xatini nusxalab, faqat uning ichidagi havolani virusli havolaga almashtirish.
- Spear Phishing: Maqsadli fishing. Kompaniyadagi aniq bir tizim administratorining ism-familiyasi, qiziqishlarini o'rganib, faqat uning o'ziga qaratilgan elektron soxta xat yuborish.
- Smishing: SMS xabarlar orqali fishing (masalan, soxta "Sizga pul o'tkazildi, olish uchun kiring" havolalari).

Fishingdan himoyalanishning eng oltin qoidasi: Havolaga kirishdan oldin brauzer manzillar satridagi domen nomini harflab tekshiring. Agar u rasmiy domen bo'lmasa, hech qachon login yoki parolingizni kiritmang!`,
      },
    ],
  },
  {
    id: "book-owasp-top10",
    title: "OWASP Top 10 Veb Zaifliklari standarti",
    author: "AppSec Engineers",
    pages: 175,
    category: "Kiberxavfsizlik",
    coverColor: "from-purple-700 to-purple-950",
    summary: "Veb ilovalardagi eng xavfli 10 ta xavfsizlik kamchiliklari va ulardan himoyalanish bo'yicha OWASP xalqaro standarti.",
    chapters: [
      {
        title: "1-Bob: OWASP standarti tushunchasi",
        content: `OWASP (Open Web Application Security Project) - bu veb-ilovalarning xavfsizligini oshirish ustida ishlaydigan xalqaro notijorat tashkilotdir. Uning eng mashhur loyihasi - **OWASP Top 10** reytingi bo'lib, u dunyo miqyosidagi kiber-xavflar va zaifliklarni tahlil qilib, eng xavfli 10 ta xavfsizlik kamchiliklari ro'yxatini taqdim etadi.

Eng so'nggi OWASP Top 10 standartiga kiritilgan muhim zaifliklar toifalari:
1. Broken Access Control (Kirish huquqlarining buzilishi): Foydalanuvchi tizimda o'ziga tegishli bo'lmagan boshqa foydalanuvchilarning yoki adminning sahifalarini o'qishi yoki boshqarishi mumkin bo'lgan holat.
2. Cryptographic Failures (Kriptografik xatoliklar): Maxfiy ma'lumotlarning (parollar, kartalar) shifrlanmay ochiq saqlanishi yoki zaif shifrlash algoritmlaridan foydalanish.
3. Injection: SQL Injection, Command Injection va LDAP Injection kabi zaifliklar. Bunda zararli buyruqlar serverga yuborilib, ijro ettiriladi.
4. Insecure Design (Xavfsiz bo'lmagan dizayn): Dastur tuzilayotganda kiberxavfsizlik me'morchiligi boshidan to'g'ri loyihalashtirilmaganligi oqibatida yuzaga keladigan tizimli xatolar.`,
      },
    ],
  },
  {
    id: "book-kali-linux",
    title: "Kali Linux va Penetratsion Testlar",
    author: "Oq Shlyapali Xaker",
    pages: 250,
    category: "Linux",
    coverColor: "from-sky-700 to-blue-950",
    summary: "Kali Linux operatsion tizimi, undagi kiber-qurollar (Nmap, Metasploit, Hydra) va penetratsion testlar o'tkazish.",
    chapters: [
      {
        title: "1-Bob: Kali Linux muhiti va kiber-qurollar",
        content: `Kali Linux - bu kiberxavfsizlik mutaxassislari, axborot xavfsizligi auditorlari va penetratsion test o'tkazuvchilar (Pentesterlar) uchun maxsus ishlab chiqilgan Debian oilasiga mansub operatsion tizimdir. Uni OffSec (Offensive Security) kompaniyasi rivojlantiradi.

Kali Linux tizimida kiberxavfsizlik sinovlarini o'tkazish uchun 600 dan ortiq tayyor kiber-qurollar va asboblar valyutalangan holda o'rnatilgan bo'ladi. Ular quyidagi toifalarga bo'linadi:
- Tarmoq skanerlari: Tarmoq tuzilishini va ochiq portlarni aniqlash uchun (eng asosiysi - Nmap).
- Veb-zaiflik skanerlari: Nikto, OWASP ZAP, Burp Suite (so'rovlarni ushlab tahlil qiluvchi proxy).
- Parollarni buzuvchi (Brute-force) qurollar: Hydra (tarmoq xizmatlari parolini terish), John the Ripper / Hashcat (xesh parollarni buzish).
- Simli va simsiz tarmoqlar auditi: aircrack-ng vositalar majmuasi.
- Ekspluatatsiya vositalari: Metasploit Framework (tayyor exploitlar yordamida tizimga kirish vositasi).

Kali Linux operatsion tizimidan faqat qonuniy ravishda, ya'ni tizim egasining yozma ruxsati bilan o'tkaziladigan penetratsion testlarda (Pentesting) foydalanish lozim! Aks holda har qanday ruxsatsiz buzib kirish harakatlari qonunan jinoiy javobgarlikka tortiladi!`,
      },
    ],
  },
];

// pre-seeded CTF challenges
const CTF_CHALLENGES = [
  {
    id: "ctf-1",
    title: "Sezar shifrini yechish (Kriptografiya)",
    description: "Xakerlar matnni Caesar shifri bilan shifrlashdi (harflar 1 ta siljigan). Shifrlangan kalit so'z: 'DBSB'. Haqiqiy bayroq (Flag) so'zini toping va kiriting. Yoki Shifr Terminalida 'caesar -d DBSB 1' buyrug'ini ishga tushiring!",
    points: 100,
    hint: "D harfidan 1 ta orqaga qaytsangiz qaysi harf keladi?",
    placeholder: "Masalan: CYBER",
    correctFlag: "CYBER",
  },
  {
    id: "ctf-2",
    title: "SQL Injection zaifligini buzish",
    description: "Ma'lumotlar bazasi so'rovi: SELECT * FROM users WHERE username = 'admin' AND password = '...'. Parolsiz, faqat username orqali kirish uchun qaysi klassik SQL Injection payloadini yozish kerak? Yoki SQL Injection Sandboksini muvaffaqiyatli aylanib o'tib bayroqni oling!",
    points: 150,
    hint: "Klassik mantiqiy to'g'ri shart: ' OR 1=1 --",
    placeholder: "Masalan: ' OR 1=1 --",
    correctFlag: "' OR 1=1 --",
  },
  {
    id: "ctf-3",
    title: "Vulnerability Nmap Port Scanner",
    description: "Tarmoqdagi zaif server portini aniqlab, orqa eshik (backdoor) orqali kiring va yashirin flagni qo'lga kiriting. Skanerlashda topilgan flagni kiriting.",
    points: 200,
    hint: "Nmap port skanerlash sandboksiga o'ting, 10.10.23.45 serverini skanerlang va backdoor portidan foydalanib exploit qiling.",
    placeholder: "THM{nmap_port_backdoor_exploit_2026}",
    correctFlag: "THM{nmap_port_backdoor_exploit_2026}",
  },
];

export interface ThmRoom {
  id: string;
  title: string;
  difficulty: string;
  xp: number;
  tutorial: string;
  flag: string;
  hint: string;
}

export interface ThmModule {
  id: string;
  title: string;
  desc: string;
  rooms: ThmRoom[];
}

export const THM_MODULES: ThmModule[] = [
  {
    id: "thm-mod-basics",
    title: "1. Introduction to Computing (Kompyuter Asoslari)",
    desc: "Kompyuter apparat qismlari, operatsion tizim, Word va Excel dasturlarining amaliy asoslari.",
    rooms: [
      {
        id: "thm-room-1",
        title: "Room 1: Windows OS & Task Manager",
        difficulty: "Boshlang'ich",
        xp: 50,
        tutorial: `### Windows OS & Task Manager
Operatsion tizim - bu apparat va dasturiy ta'minotlarni bog'lovchi poydevordir. 
Windows operatsion tizimida barcha faol dasturlarni boshqarish va qotib qolgan jarayonlarni yopish uchun **Vazifalar menejeri (Task Manager)** ishlatiladi.
Uni tezkor ochish uchun klaviaturadagi **Ctrl + Shift + Esc** kombinatsiyasidan foydalaniladi.

**Sizning vazifangiz:**
1. Task Manager-ni ochish uchun qaysi klaviatura kombinatsiyasi bosilishini aniqlang.
2. Flagni kiriting: \`THM{win_task_manager}\``,
        flag: "THM{win_task_manager}",
        hint: "Klaviaturadagi Ctrl, Shift va Esc tugmalarini birgalikda bosish kombinatsiyasi."
      },
      {
        id: "thm-room-2",
        title: "Room 2: MS Word Formatting Hacks",
        difficulty: "Boshlang'ich",
        xp: 50,
        tutorial: `### MS Word Formatting Hacks
Microsoft Word dasturida matnlarni to'g'ri formatlash uchun **Uslublar (Styles)** panelidan foydalanish zarur.
Bu hujjat tuzilishini to'g'ri saqlab, avtomatik ravishda Mundarija (Table of Contents) yaratishga yordam beradi.

**Sizning vazifangiz:**
1. Word-da hujjatga chiroyli tartib beruvchi panel nomini toping.
2. Flagni kiriting: \`THM{word_styles_master}\``,
        flag: "THM{word_styles_master}",
        hint: "Hujjatga professional ko'rinish va sarlavhalar beruvchi Styles paneli."
      },
      {
        id: "thm-room-3",
        title: "Room 3: MS Excel & Formula Basics",
        difficulty: "Boshlang'ich",
        xp: 50,
        tutorial: `### MS Excel & Formula Basics
Excel formulalari har doim '=' belgisi bilan boshlanadi.
Katakchalarga nisbiy va mutloq murojaat qilishda **$** (dollar) belgisidan foydalaniladi (masalan, $A$1).
Bu formula boshqa kataklarga nusxalanganida manzil o'zgarmay, qotib turishini ta'minlaydi.

**Sizning vazifangiz:**
1. Excelda absolute cell referencing uchun qaysi maxsus belgidan foydalaniladi?
2. Flagni kiriting: \`THM{excel_absolute_ref_value}\``,
        flag: "THM{excel_absolute_ref_value}",
        hint: "Klaviaturadagi Shift + 4 yordamida yoziladigan Dollar ($) belgisi."
      },
      {
        id: "thm-room-4",
        title: "Room 4: Flag Hunt in Windows Registry",
        difficulty: "O'rta",
        xp: 50,
        tutorial: `### Windows Registry Flag Hunt
Windows Registry - bu operatsion tizim sozlamalarini saqlaydigan yirik ma'lumotlar omboridir.
U yerda tizim apparatlari sozlamalari **HKEY_LOCAL_MACHINE** (HKLM) bo'limida saqlanadi.

**Sizning vazifangiz:**
1. Windows-da tizim sozlamalari va drayverlar uchun asosiy registry hive-sini toping.
2. Flagni kiriting: \`THM{registry_hive_key}\``,
        flag: "THM{registry_hive_key}",
        hint: "Windows Registry ichidagi eng muhim HKEY_LOCAL_MACHINE yoki qisqa qilib HKLM kaliti."
      }
    ]
  },
  {
    id: "thm-mod-linux",
    title: "2. Linux & Terminal Fundamentals",
    desc: "Linux fayl tizimi, kirish ruxsatlari, matn manipulyatsiyasi va Bash buyruqlari.",
    rooms: [
      {
        id: "thm-room-5",
        title: "Room 5: Linux Filesystem & Navigation",
        difficulty: "Boshlang'ich",
        xp: 50,
        tutorial: `### Linux Filesystem & Navigation
Linux operatsion tizimida Windows-dan farqli o'laroq, disklarga bo'linish (C:, D:) yo'q.
Barcha fayllar va jildlar eng yuqori darajadagi **'/' (root)** katalogi ichida daraxtsimon tuzilishda joylashadi.

**Sizning vazifangiz:**
1. Linux fayl tizimining eng yuqori root katalogi qaysi belgi bilan belgilanadi?
2. Flagni kiriting: \`THM{linux_root_directory}\``,
        flag: "THM{linux_root_directory}",
        hint: "Faqatgina bitta slash (/) belgisi."
      },
      {
        id: "thm-room-6",
        title: "Room 6: Permissions & Ownership",
        difficulty: "O'rta",
        xp: 50,
        tutorial: `### Linux Permissions & Ownership
Linuxda fayl huquqlari uch toifaga bo'linadi: o'qish (r), yozish (w), va bajarish (x).
Faylni dastur yoki skript sifatida ishga tushirish (bajarish) ruxsatini qo'shish uchun **chmod +x [fayl]** buyrug'idan foydalaniladi.

**Sizning vazifangiz:**
1. Linux terminalida faylga execute (ishga tushirish) ruxsatini qo'shish uchun qaysi kalit ishlatiladi?
2. Flagni kiriting: \`THM{chmod_execute_permission}\``,
        flag: "THM{chmod_execute_permission}",
        hint: "Chmod buyrug'iga +x qo'shimchasini yozish orqali xavfsiz ishga tushirish."
      },
      {
        id: "thm-room-7",
        title: "Room 7: Text Manipulation Terminal",
        difficulty: "O'rta",
        xp: 50,
        tutorial: `### Text Manipulation Terminal
Linux terminalida katta hajmdagi log fayllar ichidan kerakli satrlarni yoki so'zlarni filtrlash uchun **grep** buyrug'i ishlatiladi.
Masalan: \`cat auth.log | grep \"failed\"\` - muvaffaqiyatsiz ulanishlarni filtrlash.

**Sizning vazifangiz:**
1. Linux terminalida qatorlarni filtrlash va qidirish uchun ishlatiladigan buyruq nomini toping.
2. Flagni kiriting: \`THM{grep_search_command}\``,
        flag: "THM{grep_search_command}",
        hint: "Ripgrep yoki oddiy grep buyrug'i."
      },
      {
        id: "thm-room-8",
        title: "Room 8: Shell Scripting Flag Hunt",
        difficulty: "Qiyin",
        xp: 50,
        tutorial: `### Shell Scripting Flag Hunt
Bash skriptlarini terminalda yozayotganda, skriptning birinchi qatoriga qaysi shell distributividan foydalanishni ko'rsatuvchi shebang sarlavhasi yoziladi.
Masalan, standart Bash shell uchun: **#!/bin/bash** deb boshlanishi kerak.

**Sizning vazifangiz:**
1. Bash skriptlarining eng birinchi qatorida ishlatiladigan shebang yozuvini aniqlang.
2. Flagni kiriting: \`THM{bash_shebang_header}\``,
        flag: "THM{bash_shebang_header}",
        hint: "Darvoqe, #!/bin/bash ko'rinishidagi standart shebang."
      }
    ]
  },
  {
    id: "thm-mod-networks",
    title: "3. Network Exploitation Basics",
    desc: "Tarmoq bayonnomalari, OSI modeli, Nmap port skanerlash va Wireshark tahlili.",
    rooms: [
      {
        id: "thm-room-9",
        title: "Room 9: OSI Model & TCP Handshake",
        difficulty: "Boshlang'ich",
        xp: 50,
        tutorial: `### OSI Model & TCP Handshake
OSI (Open Systems Interconnection) modeli tarmoqdagi muloqotni tartibga soluvchi 7 ta qatlamdan iborat.
Tarmoqdagi jismoniy simlar, kabellar va ulagichlar **1-qatlam (Fizik qatlam / Physical Layer)** hisoblanadi.

**Sizning vazifangiz:**
1. Tarmoq kabellari va fizik qurilmalar OSI modelining nechanchi qatlamiga to'g'ri kelishini toping.
2. Flagni kiriting: \`THM{osi_physical_layer}\``,
        flag: "THM{osi_physical_layer}",
        hint: "Layer 1 yoki Fizik qatlam deb nomlanadi."
      },
      {
        id: "thm-room-10",
        title: "Room 10: Port Scanning & Nmap",
        difficulty: "O'rta",
        xp: 50,
        tutorial: `### Port Scanning & Nmap
Nmap - bu tarmoqdagi ochiq portlarni va xizmatlarni skanerlovchi kiber-quroldir.
Eng mashhur skanerlash usullaridan biri **Stealth Scan (yashirin skanerlash)** bo'lib, u terminalda **-sS** bayrog'i orqali amalga oshiriladi.

**Sizning vazifangiz:**
1. Nmap-da TCP SYN yashirin skanerlashni amalga oshiruvchi bayroqni toping.
2. Flagni kiriting: \`THM{nmap_scan_stealth}\``,
        flag: "THM{nmap_scan_stealth}",
        hint: "Nmap terminalida -sS buyrug'ini qo'llash."
      },
      {
        id: "thm-room-11",
        title: "Room 11: Wireshark Packet Analysis",
        difficulty: "O'rta",
        xp: 50,
        tutorial: `### Wireshark Packet Analysis
Wireshark tarmoq trafigini tahlil qiluvchi va paketlarni ushlab oluvchi dasturdir.
Dasturning tarmoq ulanishidan yozib olingan paketlar fayli **.pcap** yoki **.pcapng** kengaytmasida saqlanadi.

**Sizning vazifangiz:**
1. Tarmoqdagi ushlangan paketlar saqlanadigan standart fayl kengaytmasini toping.
2. Flagni kiriting: \`THM{wireshark_pcap_captured}\``,
        flag: "THM{wireshark_pcap_captured}",
        hint: "Flesh yoki paket oqimi saqlanadigan pcap fayli."
      },
      {
        id: "thm-room-12",
        title: "Room 12: DNS Spoofing Flag Hunt",
        difficulty: "Qiyin",
        xp: 50,
        tutorial: `### DNS Spoofing Flag Hunt
DNS Spoofing (yoki DNS Poisoning) - bu tarmoq so'rovlarini aldash orqali foydalanuvchini soxta IP manzillarga yo'naltiruvchi hujumdir.
Bunda kiber-hujumchi keshni zaharli (poison) ma'lumotlar bilan to'ldiradi.

**Sizning vazifangiz:**
1. DNS tizimini aldash hujumi qanday ataladi?
2. Flagni kiriting: \`THM{dns_poisoning_attack}\``,
        flag: "THM{dns_poisoning_attack}",
        hint: "DNS cache poisoning yoki DNS poisoning hujumi."
      }
    ]
  },
  {
    id: "thm-mod-web",
    title: "4. Web Application Vulnerabilities",
    desc: "HTTP protokoli sirlari, SQL in'eksiya ekspluatatsiyasi, XSS zaifliklari va final laboratoriya.",
    rooms: [
      {
        id: "thm-room-13",
        title: "Room 13: HTTP Protocol & Headers",
        difficulty: "Boshlang'ich",
        xp: 50,
        tutorial: `### HTTP Protocol & Headers
Veb-saytlarga ma'lumot jo'natayotganda (masalan, login yoki ro'yxatdan o'tish formasi) HTTP bayonnomasining **POST** metodidan foydalaniladi.
Bu ma'lumotlarni so'rov tanasi (body) ichida yashirin tarzda xavfsiz uzatadi.

**Sizning vazifangiz:**
1. Saytga ma'lumotlarni uzatuvchi asosiy HTTP so'rov metodini toping.
2. Flagni kiriting: \`THM{http_post_method}\``,
        flag: "THM{http_post_method}",
        hint: "GET metodidan farqli ravishda POST metodi ma'lumot jo'natadi."
      },
      {
        id: "thm-room-14",
        title: "Room 14: SQL Injection Exploits",
        difficulty: "O'rta",
        xp: 50,
        tutorial: `### SQL Injection Exploits
SQL Injection (SQLi) - kiberxavfsizlikda eng keng tarqalgan, ma'lumotlar bazasini buzish zaifligidir.
Avtorizatsiya yoki login formasini aylanib o'tish uchun ishlatiladigan klassik SQL payload: **' OR 1=1 --** hisoblanadi.

**Sizning vazifangiz:**
1. Sayt login oynasini buzish uchun ishlatiladigan eng mashhur SQL payloadni kiriting.
2. Flagni kiriting: \`THM{sqli_bypass_payload}\``,
        flag: "THM{sqli_bypass_payload}",
        hint: "Tirnoq belgisi va har doim rost bo'lgan formula: ' OR 1=1 --"
      },
      {
        id: "thm-room-15",
        title: "Room 15: Cross-Site Scripting (XSS)",
        difficulty: "O'rta",
        xp: 50,
        tutorial: `### Cross-Site Scripting (XSS)
XSS zaifligini amalda tekshirish uchun kiberxavfsizlik xodimlari asosan brauzerda ogohlantirish oynasini chaqiruvchi JavaScript skriptidan foydalanishasi.
Klassik payload: **<script>alert(1)</script>** orqali alert modalini ishga tushirish.

**Sizning vazifangiz:**
1. Brauzerda alert oynasini chaqiruvchi oddiy JavaScript payloadni yozing.
2. Flagni kiriting: \`THM{xss_alert_script}\``,
        flag: "THM{xss_alert_script}",
        hint: "<script>alert(1)</script> ko'rinishidagi standart alert buyrug'i."
      },
      {
        id: "thm-room-16",
        title: "Room 16: Final Cert Capstone Lab",
        difficulty: "Qiyin",
        xp: 100,
        tutorial: `### Final Cert Capstone Lab
Tabriklaymiz! Siz Cyber Tech akademiyasida barcha 4 ta modulni va 15 ta kiber-xonani muvaffaqiyatli o'rganib chiqdingiz.
Endi ushbu yakuniy bosqichni topshirib, kiberxavfsizlik akademiyasining **Eng Oliy Bitiruvchi Kiber-Diplomiga** erishing!

**Sizning vazifangiz:**
1. Bizning kiber-akademiyamiz nomini aniqlang.
2. Flagni kiriting: \`THM{cyber_graduate_2026}\``,
        flag: "THM{cyber_graduate_2026}",
        hint: "Tasdiqlash kodi: THM{cyber_graduate_2026}"
      }
    ]
  }
];

// ─── Binary Rain Canvas Component ─────────────────────────────────────────────
function BinaryRainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      cols = Math.floor(canvas.width / fontSize);
      // Reset drops on resize to avoid out-of-bounds
      drops.length = 0;
      for (let i = 0; i < cols; i++) drops.push(Math.floor(Math.random() * -60));
    };

    const fontSize = 14;
    let cols = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];
    for (let i = 0; i < cols; i++) drops.push(Math.floor(Math.random() * -60));

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const draw = () => {
      // Translucent fill for trail/fade effect
      ctx.fillStyle = "rgba(5, 7, 12, 0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px 'Fira Code', 'Courier New', monospace`;

      for (let i = 0; i < cols; i++) {
        const char = Math.random() > 0.5 ? "1" : "0";
        const y = drops[i] * fontSize;
        // Vary opacity to create depth
        const alpha = 0.25 + Math.random() * 0.55;
        ctx.fillStyle = `rgba(57, 255, 20, ${alpha})`;
        ctx.fillText(char, i * fontSize, y);

        // Reset column when it goes past canvas bottom (random chance)
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.20] z-0 rounded-3xl"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
// ──────────────────────────────────────────────────────────────────────────────

export default function UltimateCyberTechPage() {

  
  // ==========================================
  // 2. STATE VARIABLES & CONTEXT
  // ==========================================
  const [activeTab, setActiveTab] = useState<"dashboard" | "roadmap" | "darslar" | "kitoblar" | "testlar" | "ctf" | "leaderboard" | "profile">("dashboard");
  const [selectedRoadmapNode, setSelectedRoadmapNode] = useState<number>(0);
  const [currentTheme, setCurrentTheme] = useState<"blue" | "green" | "pink">("blue");
  const [dbRankings, setDbRankings] = useState<any[]>([]);
  const [dbRankingsLoading, setDbRankingsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [menuMounted, setMenuMounted] = useState(false);

  // TryHackMe Hacking Roadmap states
  const [activeThmModule, setActiveThmModule] = useState<number>(0);
  const [activeThmRoom, setActiveThmRoom] = useState<ThmRoom | null>(null);
  const [thmCompletedRooms, setThmCompletedRooms] = useState<string[]>([]);
  const [thmFlagInput, setThmFlagInput] = useState("");
  const [thmFeedback, setThmFeedback] = useState<"success" | "error" | null>(null);
  const [showThmHint, setShowThmHint] = useState(false);

  // Authenticated states
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [gmailError, setGmailError] = useState(false);
  const [dbConnectionError, setDbConnectionError] = useState(false);
  const [dbErrorMsg, setDbErrorMsg] = useState<string | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Sound Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Tracks / Lessons states
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonReviewAnswer, setLessonReviewAnswer] = useState<number | null>(null);
  const [showLessonReviewFeedback, setShowLessonReviewFeedback] = useState(false);
  const [unlockedLessons, setUnlockedLessons] = useState<string[]>(["lit-1", "web-1", "off-1", "py-1", "rob-1", "cyber-1"]);

  // Sandbox Code Runner
  const [sandboxCode, setSandboxCode] = useState("");
  const [sandboxOutput, setSandboxOutput] = useState<string[]>([]);
  const [sandboxRunning, setSandboxRunning] = useState(false);

  // Library / E-Books
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeBook, setActiveBook] = useState<any>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [readerTheme, setReaderTheme] = useState<"dark" | "light" | "sepia">("dark");
  const [readerFontSize, setReaderFontSize] = useState<"sm" | "md" | "lg" | "xl">("md");
  const [readerZoom, setReaderZoom] = useState(100);
  const [bookBookmarks, setBookBookmarks] = useState<Record<string, number>>({});
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSummarizing, setAiSummarizing] = useState(false);

  // Quizzes / Tests
  const [dynamicQuizzes, setDynamicQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTimer, setQuizTimer] = useState(120);
  const [quizFinished, setQuizFinished] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, number>>({});
  const [studentName, setStudentName] = useState("");
  const [certGenerated, setCertGenerated] = useState(false);
  const [selectedQuizCategory, setSelectedQuizCategory] = useState<string>("Kompyuter savodxonligi");

  // CTF Arena
  const [ctfAnswers, setCtfAnswers] = useState<Record<string, string>>({});
  const [solvedCtfs, setSolvedCtfs] = useState<string[]>([]);
  const [ctfFeedback, setCtfFeedback] = useState<Record<string, "success" | "error" | null>>({});

  // Interactive Sandbox Hacking Games states
  const [ctfSubTab, setCtfSubTab] = useState<"theory" | "sqli" | "cipher" | "nmap">("theory");
  
  // SQL Injection Sandbox states
  const [sqlUsername, setSqlUsername] = useState("");
  const [sqlPassword, setSqlPassword] = useState("");
  const [sqlConsoleLogs, setSqlConsoleLogs] = useState<string[]>([]);
  const [sqlBypassed, setSqlBypassed] = useState(false);
  const [sqlDatabaseDumped, setSqlDatabaseDumped] = useState(false);
  
  // Cipher Decryption Console states
  const [cipherCommandInput, setCipherCommandInput] = useState("");
  const [cipherConsoleLogs, setCipherConsoleLogs] = useState<string[]>([
    "Terminal tizimi muvaffaqiyatli ishga tushirildi.",
    "Yordam uchun 'help' buyrug'ini kiriting.",
    "Kutish rejimi..."
  ]);
  const [cipherAnswerInput, setCipherAnswerInput] = useState("");
  const [cipherActiveChallenge, setCipherActiveChallenge] = useState<number>(0);
  
  // Vulnerability Nmap Port Scanner states
  const [nmapTargetIp, setNmapTargetIp] = useState("");
  const [nmapScanning, setNmapScanning] = useState(false);
  const [nmapLogs, setNmapLogs] = useState<string[]>([]);
  const [nmapExploited, setNmapExploited] = useState(false);
  const [nmapExploitProgress, setNmapExploitProgress] = useState(false);

  // Leaderboard points
  const [userPoints, setUserPoints] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  // AI Mentor Chatbot
  const [mentorOpen, setMentorOpen] = useState(false);
  const [mentorMessages, setMentorMessages] = useState<Array<{ sender: "user" | "mentor"; text: string }>>([
    { sender: "mentor", text: "Salom! Men Kiber-Mentor yordamchiman. O'rganayotgan darslaringiz bo'yicha savollaringiz bormi?" }
  ]);
  const [mentorInput, setMentorInput] = useState("");

  // ==========================================
  // 3. SOUND SYNTHESIS via AudioContext (0-byte retro 8-bit sound effects)
  // ==========================================
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSynthesizedTone = (freqs: number[], duration: number, type: OscillatorType = "sine", delayBetween = 0) => {
    if (!soundEnabled) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      freqs.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = type;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + duration);
        }, idx * delayBetween * 1000);
      });
    } catch (e) {
      console.log("Audio play error:", e);
    }
  };

  const playClickSound = () => playSynthesizedTone([400, 200], 0.08, "triangle", 0.03);
  const playChimeSound = () => playSynthesizedTone([523, 659, 784, 1046], 0.15, "sine", 0.08);
  const playBuzzSound = () => playSynthesizedTone([150, 100], 0.35, "sawtooth", 0.05);
  const playTrophySound = () => playSynthesizedTone([587, 784, 987, 1174, 1568], 0.2, "sine", 0.06);

  // ==========================================
  // 4. LOAD & SYNC SYSTEM (Local Storage & Supabase Sync)
  // ==========================================

  // Trigger cascading menu entry animation
  useEffect(() => {
    const t = setTimeout(() => setMenuMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Check auth state on mount
  useEffect(() => {
    const supabase = createClient();
    
    async function checkUser() {
      try {
        const { data: { user: activeUser } } = await supabase.auth.getUser();
        if (activeUser && !activeUser.email?.endsWith("@gmail.com")) {
          await supabase.auth.signOut();
          setUser(null);
          setGmailError(true);
        } else {
          setUser(activeUser);
          if (activeUser) {
            // Sync databases progress
            await syncWithDatabase(activeUser.id);
          }
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setAuthLoading(false);
      }
    }

    checkUser();

    // Listen to Auth State changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const activeUser = session?.user || null;
      if (activeUser && !activeUser.email?.endsWith("@gmail.com")) {
        await supabase.auth.signOut();
        setUser(null);
        setGmailError(true);
      } else {
        setUser(activeUser);
        if (activeUser) {
          await syncWithDatabase(activeUser.id);
        } else {
          // Logged out
          setCertGenerated(false);
        }
      }
    });

    // Load initial local storage data
    try {
      const savedUnlocked = localStorage.getItem("ct_unlocked_lessons");
      if (savedUnlocked) setUnlockedLessons(JSON.parse(savedUnlocked));

      const savedQuizzes = localStorage.getItem("ct_completed_quizzes");
      if (savedQuizzes) setCompletedQuizzes(JSON.parse(savedQuizzes));

      const savedBookmarks = localStorage.getItem("ct_book_bookmarks");
      if (savedBookmarks) setBookBookmarks(JSON.parse(savedBookmarks));

      const savedName = localStorage.getItem("ct_student_name");
      if (savedName) setStudentName(savedName);

      const savedCtfs = localStorage.getItem("ct_solved_ctfs");
      if (savedCtfs) setSolvedCtfs(JSON.parse(savedCtfs));

      const savedBadges = localStorage.getItem("ct_unlocked_badges");
      if (savedBadges) setUnlockedBadges(JSON.parse(savedBadges));

      const savedPoints = localStorage.getItem("ct_user_points");
      if (savedPoints) setUserPoints(Number(savedPoints));

      const savedThmRooms = localStorage.getItem("thm_completed_rooms");
      if (savedThmRooms) setThmCompletedRooms(JSON.parse(savedThmRooms));

      // Synchronize theme & audio volume
      const savedTheme = localStorage.getItem("ct_current_theme");
      if (savedTheme === "green" || savedTheme === "pink" || savedTheme === "blue") {
        setCurrentTheme(savedTheme);
      }
      const savedMuted = localStorage.getItem("ct_sound_muted");
      if (savedMuted === "true") {
        setSoundEnabled(false);
      } else if (savedMuted === "false") {
        setSoundEnabled(true);
      }
    } catch (e) {
      console.log("Local storage read skipped");
    }

    // Inter-component settings sync listener
    const handleStorageChange = () => {
      try {
        const savedTheme = localStorage.getItem("ct_current_theme");
        if (savedTheme === "green" || savedTheme === "pink" || savedTheme === "blue") {
          setCurrentTheme(savedTheme);
        }
        const savedMuted = localStorage.getItem("ct_sound_muted");
        if (savedMuted === "true") {
          setSoundEnabled(false);
        } else if (savedMuted === "false") {
          setSoundEnabled(true);
        }
      } catch (err) {}
    };
    window.addEventListener("storage", handleStorageChange);

    // Load dynamic DB quizzes
    loadDatabaseQuizzes();

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Fetch dynamic quizzes
  async function loadDatabaseQuizzes() {
    try {
      const supabase = createCleanPublicClient();
      const { data, error } = await supabase.from("ct_quizzes").select("*, ct_questions(*)");
      if (!error && data) {
        console.log("Supabase dynamic quizzes successfully loaded:", data.length);
        setDynamicQuizzes(data);
        setDbConnectionError(false);
        setDbErrorMsg(null);
      } else {
        if (error) {
          console.error("Supabase query error loading quizzes:", error);
          setDbErrorMsg(error.message || JSON.stringify(error));
        }
        if (error && (error.code === "PGRST205" || error.message.includes("cache"))) {
          setDbConnectionError(true);
        }
      }
    } catch (err: any) {
      console.error("Database connection exception in client-side loading:", err);
      setDbErrorMsg(err.message || String(err));
      console.log("Database quizzes offline");
    }
  }

  // Database synchronizer
  async function syncWithDatabase(userId: string) {
    try {
      const supabase = createClient();
      // Load current local states
      const localUnlocked = JSON.parse(localStorage.getItem("ct_unlocked_lessons") || '[]');
      const localQuizzes = JSON.parse(localStorage.getItem("ct_completed_quizzes") || '{}');
      const localBookmarks = JSON.parse(localStorage.getItem("ct_book_bookmarks") || '{}');
      const localBadges = JSON.parse(localStorage.getItem("ct_unlocked_badges") || '[]');
      const localName = localStorage.getItem("ct_student_name") || "";
      const localPoints = Number(localStorage.getItem("ct_user_points") || "0");

      // Check DB row
      const { data, error } = await supabase
        .from("ct_user_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Row exists -> Merge both local and DB progress, prioritizing higher completion
        const mergedUnlocked = Array.from(new Set([...localUnlocked, ...data.unlocked_lessons, "lit-1", "web-1"]));
        const mergedQuizzes = { ...data.completed_quizzes, ...localQuizzes };
        const mergedBookmarks = { ...data.book_bookmarks, ...localBookmarks };
        const mergedBadges = Array.from(new Set([...localBadges, ...data.unlocked_badges]));
        const mergedName = localName || data.student_name || "";
        const mergedPoints = Math.max(localPoints, data.leaderboard_points);

        // Update states
        setUnlockedLessons(mergedUnlocked);
        setCompletedQuizzes(mergedQuizzes);
        setBookBookmarks(mergedBookmarks);
        setUnlockedBadges(mergedBadges);
        setStudentName(mergedName);
        setUserPoints(mergedPoints);

        // Write merged back to LocalStorage
        localStorage.setItem("ct_unlocked_lessons", JSON.stringify(mergedUnlocked));
        localStorage.setItem("ct_completed_quizzes", JSON.stringify(mergedQuizzes));
        localStorage.setItem("ct_book_bookmarks", JSON.stringify(mergedBookmarks));
        localStorage.setItem("ct_unlocked_badges", JSON.stringify(mergedBadges));
        localStorage.setItem("ct_student_name", mergedName);
        localStorage.setItem("ct_user_points", String(mergedPoints));

        // Save merged back to DB
        await supabase
          .from("ct_user_progress")
          .update({
            completed_quizzes: mergedQuizzes,
            unlocked_lessons: mergedUnlocked,
            book_bookmarks: mergedBookmarks,
            unlocked_badges: mergedBadges,
            student_name: mergedName,
            leaderboard_points: mergedPoints,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId);
      } else {
        // No row -> Insert new progress row
        await supabase
          .from("ct_user_progress")
          .insert({
            user_id: userId,
            completed_quizzes: localQuizzes,
            unlocked_lessons: localUnlocked.length ? localUnlocked : ["lit-1", "web-1"],
            book_bookmarks: localBookmarks,
            unlocked_badges: localBadges,
            student_name: localName,
            leaderboard_points: localPoints
          });
      }

      // Sync Leaderboard entry
      const { data: { user: meta } } = await supabase.auth.getUser();
      if (meta) {
        const finalName = localName || meta.user_metadata?.full_name || "CT Talabasi";
        const avatar = meta.user_metadata?.avatar_url || "";
        await supabase
          .from("ct_leaderboard")
          .upsert({
            user_id: userId,
            student_name: finalName,
            avatar_url: avatar,
            points: localPoints,
            updated_at: new Date().toISOString()
          });
      }

    } catch (e) {
      console.error("Database sync failed", e);
    }
  }

  // Push updates to cloud dynamically
  const pushUpdateToCloud = async (
    unlocked = unlockedLessons,
    quizzes = completedQuizzes,
    bookmarks = bookBookmarks,
    badges = unlockedBadges,
    name = studentName,
    points = userPoints
  ) => {
    try {
      localStorage.setItem("ct_unlocked_lessons", JSON.stringify(unlocked));
      localStorage.setItem("ct_completed_quizzes", JSON.stringify(quizzes));
      localStorage.setItem("ct_book_bookmarks", JSON.stringify(bookmarks));
      localStorage.setItem("ct_unlocked_badges", JSON.stringify(badges));
      localStorage.setItem("ct_student_name", name);
      localStorage.setItem("ct_user_points", String(points));

      if (user) {
        const supabase = createClient();
        await supabase
          .from("ct_user_progress")
          .update({
            completed_quizzes: quizzes,
            unlocked_lessons: unlocked,
            book_bookmarks: bookmarks,
            unlocked_badges: badges,
            student_name: name,
            leaderboard_points: points,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);

        await supabase
          .from("ct_leaderboard")
          .upsert({
            user_id: user.id,
            student_name: name || user.user_metadata?.full_name || "CT Talabasi",
            points: points,
            updated_at: new Date().toISOString()
          });
      }
    } catch (e) {
      console.log("Local updated, offline write queued.");
    }
  };

  // Google Login action
  const handleGoogleLogin = async () => {
    playClickSound();
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/cyber-tech`
        }
      });
    } catch (e) {
      console.error("Google Auth trigger failed", e);
    }
  };

  const handleLogout = async () => {
    playClickSound();
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  const handleCopySql = () => {
    playClickSound();
    navigator.clipboard.writeText(MIGRATION_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  // Quiz actions
  const handleStartQuiz = (quiz: any) => {
    playClickSound();
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizTimer(quiz.timeLimit);
    setQuizFinished(false);
    setCertGenerated(false);
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionIndex(idx);
  };

  const handleAnswerSubmit = () => {
    if (selectedOptionIndex === null || isAnswerSubmitted || !activeQuiz) return;
    setIsAnswerSubmitted(true);
    
    const isCorrect = selectedOptionIndex === activeQuiz.questions[currentQuestionIndex].correct;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
    } else {
      const finalScorePercent = Math.round((quizScore / activeQuiz.questions.length) * 100);
      const currentBest = completedQuizzes[activeQuiz.id] || 0;
      if (finalScorePercent > currentBest) {
        const updated = { ...completedQuizzes, [activeQuiz.id]: finalScorePercent };
        setCompletedQuizzes(updated);
        pushUpdateToCloud(unlockedLessons, updated);
      }
      handleFinishQuiz(finalScorePercent);
    }
  };

  const handleSaveStudentName = (name: string) => {
    setStudentName(name);
    localStorage.setItem("ct_student_name", name);
    setCertGenerated(true);
    pushUpdateToCloud(unlockedLessons, completedQuizzes, bookBookmarks, unlockedBadges, name);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  // ==========================================
  // 5. PREMIUM FEATURE WORKFLOWS
  // ==========================================

  // Live Code Editor Simulyatsiyasi
  const handleRunCode = () => {
    if (!selectedLesson?.codeSnippet) return;
    playClickSound();
    setSandboxRunning(true);
    setSandboxOutput(["[INFO] Sandbox o'rnatilmoqda...", "[INFO] Virtual muhit yaratildi."]);

    setTimeout(() => {
      setSandboxOutput((prev) => [...prev, `[EXEC] Dastur ishga tushirildi: index.${selectedLesson.codeLanguage === "javascript" ? "js" : "py"}`]);
    }, 800);

    setTimeout(() => {
      setSandboxOutput((prev) => [
        ...prev,
        "[OUTPUT] -----------------------",
        selectedLesson.expectedOutput || "Dastur muvaffaqiyatli bajarildi.",
        "--------------------------------",
        "[SUCCESS] Jarayon yakunlandi. Kod 0 bilan tugadi."
      ]);
      setSandboxRunning(false);
      
      // Award 20 points for running code!
      const bonusPts = userPoints + 20;
      setUserPoints(bonusPts);
      pushUpdateToCloud(unlockedLessons, completedQuizzes, bookBookmarks, unlockedBadges, studentName, bonusPts);
    }, 1800);
  };

  // Achievements logic
  const handleUnlockBadge = (badgeId: string) => {
    if (unlockedBadges.includes(badgeId)) return;
    const updated = [...unlockedBadges, badgeId];
    setUnlockedBadges(updated);
    playTrophySound();
    // Award 50 points for badge
    const bonusPts = userPoints + 50;
    setUserPoints(bonusPts);
    pushUpdateToCloud(unlockedLessons, completedQuizzes, bookBookmarks, updated, studentName, bonusPts);
  };

  // AI Summarizer logic
  const handleSummarizeBook = () => {
    if (!activeBook) return;
    playClickSound();
    setAiSummarizing(true);
    setAiSummary(null);
    
    setTimeout(() => {
      setAiSummary(
        `[Kiber-AI Konspekt: ${activeBook.chapters[activeChapterIndex].title}]\n` +
        `• 1. Ijtimoiy muhandislik hujumlarining asosi - joziba, shoshilinchlik va qo'rquv hissini boshqarishdir.\n` +
        `• 2. Ko'p hollarda tizimlar emas, balki xavfsizlik madaniyatidan uzoq odamlar birinchi bo'lib buziladi.\n` +
        `• 3. 2FA (Ikki bosqichli kod) xakerlarni 99% holatda parolingiz o'g'irlanganda ham bloklaydi.\n` +
        `• 4. Bank SMS kodlari hech qachon operator tomonidan telefonda so'ralmaydi.\n` +
        `• 5. Tarmoqlararo VPN ma'lumotlar paketlarini yo'lda ushlab olib o'qilishidan butunlay himoyalaydi.`
      );
      setAiSummarizing(false);
      
      // Unlock Active Reader Badge if read 2 chapters
      const readBooksCount = Object.keys(bookBookmarks).length;
      if (readBooksCount >= 1) {
        handleUnlockBadge("faol_kitobxon");
      }
    }, 2000);
  };

  // CTF Answer submitter
  const handleSubmitCtf = (ctfId: string, correctFlag: string) => {
    playClickSound();
    const inputFlag = (ctfAnswers[ctfId] || "").trim().toUpperCase();
    
    if (inputFlag === correctFlag.toUpperCase()) {
      playChimeSound();
      setCtfFeedback((prev) => ({ ...prev, [ctfId]: "success" }));
      if (!solvedCtfs.includes(ctfId)) {
        const updatedCtfs = [...solvedCtfs, ctfId];
        setSolvedCtfs(updatedCtfs);
        localStorage.setItem("ct_solved_ctfs", JSON.stringify(updatedCtfs));
        
        // Award CTF Points
        const challenge = CTF_CHALLENGES.find(c => c.id === ctfId);
        const added = challenge ? challenge.points : 100;
        const total = userPoints + added;
        setUserPoints(total);
        
        // Handle Badges
        const currentBadges = [...unlockedBadges];
        if (!currentBadges.includes("ctf_buzgunchi")) {
          currentBadges.push("ctf_buzgunchi");
          setUnlockedBadges(currentBadges);
        }

        pushUpdateToCloud(unlockedLessons, completedQuizzes, bookBookmarks, currentBadges, studentName, total);
      }
    } else {
      playBuzzSound();
      setCtfFeedback((prev) => ({ ...prev, [ctfId]: "error" }));
    }
  };

  // AI Mentor Chatbot engine
  const handleSendMentorMessage = () => {
    if (!mentorInput.trim()) return;
    playClickSound();
    const userText = mentorInput.trim();
    const updatedMsgs = [...mentorMessages, { sender: "user" as const, text: userText }];
    setMentorMessages(updatedMsgs);
    setMentorInput("");

    // Simulated parsing logic
    setTimeout(() => {
      let reply = "Bu juda ajoyib savol! Ammo men faqat kiberxavfsizlik, dasturlash, va IT texnologiyalariga oid savollarga javob bera olaman.";
      const lower = userText.toLowerCase();

      if (lower.includes("phishing") || lower.includes("fishing")) {
        reply = "Phishing (fishing) - bu xakerlar tomonidan soxta sayt yoki SMS'lar orqali parollaringizni o'g'irlash usulidir. Doim havolaning yozilishini tekshiring!";
      } else if (lower.includes("python")) {
        reply = "Python - dunyodagi eng oson va kuchli dasturlash tillaridan biri. Unda sun'iy intellekt, neyron tarmoqlar va veb-saytlar yaratsa bo'ladi. Masalan: `print('Salom')` kodi ekranga Salom so'zini chiqaradi.";
      } else if (lower.includes("neyron") || lower.includes("ai") || lower.includes("intellekt")) {
        reply = "Sun'iy neyronlar inson miyasi kabi ishlaydi. Kirish ma'lumotlarini og'irlik koeffitsiyentiga ko'paytirib, Sigmoid kabi aktivatsiya funksiyalari orqali natija beradi.";
      } else if (lower.includes("arduino") || lower.includes("robot")) {
        reply = "Robototexnikada Arduino eng mashhur mikrokontroller hisoblanadi. U sensorlardan (masalan, ultrasonik masofa datchigi) ma'lumot olib, loop() ichida harakatlarni takrorlaydi.";
      } else if (lower.includes("excel") || lower.includes("office")) {
        reply = "Microsoft Excelda formulalar doim '=' belgisi bilan boshlanadi. Masalan, =IF(A1>=60, 'O'tdi', 'Yiqildi') formulasi shartli hisob-kitoblarni amalga oshiradi.";
      }

      setMentorMessages((prev) => [...prev, { sender: "mentor", text: reply }]);
      playSynthesizedTone([800, 1000], 0.1, "sine", 0.04);
    }, 1200);
  };

  // Lesson Select Action
  const handleSelectLesson = (lesson: Lesson) => {
    playClickSound();
    setSelectedLesson(lesson);
    setSandboxCode(lesson.codeSnippet || "");
    setSandboxOutput([]);
    setLessonReviewAnswer(null);
    setShowLessonReviewFeedback(false);
  };

  const handleLessonReviewSubmit = () => {
    if (lessonReviewAnswer === null || !selectedLesson) return;
    setShowLessonReviewFeedback(true);
    
    // If correct, unlock subsequent lesson
    if (lessonReviewAnswer === selectedLesson.reviewQuestion.correct) {
      playChimeSound();
      const track = TRACKS_DATA.find((t) => t.lessons.some((l) => l.id === selectedLesson.id));
      if (track) {
        const currentIdx = track.lessons.findIndex((l) => l.id === selectedLesson.id);
        if (currentIdx !== -1 && currentIdx < track.lessons.length - 1) {
          const nextLessonId = track.lessons[currentIdx + 1].id;
          if (!unlockedLessons.includes(nextLessonId)) {
            const updated = [...unlockedLessons, nextLessonId];
            setUnlockedLessons(updated);
            pushUpdateToCloud(updated);
          }
        }
      }
    } else {
      playBuzzSound();
    }
  };

  // Quiz Finish handler
  const handleFinishQuiz = (scorePercent: number) => {
    setQuizFinished(true);
    if (scorePercent >= 80) {
      playChimeSound();
      const currentBadges = [...unlockedBadges];
      let bonus = userPoints + 150;

      if (activeQuiz.id.startsWith("adaptive-")) {
        if (!currentBadges.includes("kiber_jangchi")) {
          currentBadges.push("kiber_jangchi");
        }
        bonus = userPoints + 50;
      } else {
        // Handle unlocking related badges
        if (activeQuiz.id === "quiz-cyber" && !currentBadges.includes("kiber_qalqon")) {
          currentBadges.push("kiber_qalqon");
        }
        if (activeQuiz.id === "quiz-python" && !currentBadges.includes("ai_pioneri")) {
          currentBadges.push("ai_pioneri");
        }
        if (activeQuiz.id === "quiz-web" && !currentBadges.includes("frontend_kodchi")) {
          currentBadges.push("frontend_kodchi");
        }

        // Check if unlocked 4 quizzes
        const finishedQuizzes = Object.keys(completedQuizzes).length;
        if (finishedQuizzes >= 2 && !currentBadges.includes("kiber_bitiruvchi")) {
          currentBadges.push("kiber_bitiruvchi");
        }
      }

      setUnlockedBadges(currentBadges);
      setUserPoints(bonus);
      pushUpdateToCloud(unlockedLessons, completedQuizzes, bookBookmarks, currentBadges, studentName, bonus);
    } else {
      playBuzzSound();
    }
  };

  // TryHackMe Flag Submitter
  const handleSubmitThmFlag = (room: ThmRoom) => {
    playClickSound();
    if (thmFlagInput.trim().toUpperCase() === room.flag.toUpperCase()) {
      setThmFeedback("success");
      playChimeSound();
      if (!thmCompletedRooms.includes(room.id)) {
        const updated = [...thmCompletedRooms, room.id];
        setThmCompletedRooms(updated);
        localStorage.setItem("thm_completed_rooms", JSON.stringify(updated));
        
        // Award room points
        const newPoints = userPoints + room.xp;
        setUserPoints(newPoints);
        
        // Unlocked new badge for Room 16 completion!
        const currentBadges = [...unlockedBadges];
        if (room.id === "thm-room-16" && !currentBadges.includes("cyber_graduate")) {
          currentBadges.push("cyber_graduate");
          setUnlockedBadges(currentBadges);
        }
        
        pushUpdateToCloud(unlockedLessons, completedQuizzes, bookBookmarks, currentBadges, studentName, newPoints);
      }
      setThmFlagInput("");
      setShowThmHint(false);
    } else {
      setThmFeedback("error");
      playBuzzSound();
    }
  };

  // Book Reader actions
  const handleOpenBook = (book: any) => {
    playClickSound();
    setActiveBook(book);
    const savedChapter = bookBookmarks[book.id] || 0;
    setActiveChapterIndex(savedChapter);
    setAiSummary(null);
    setActiveTab("kitoblar");
  };

  const handleBookChapterChange = (newIdx: number) => {
    if (!activeBook) return;
    playClickSound();
    setActiveChapterIndex(newIdx);
    setAiSummary(null);
    const updated = { ...bookBookmarks, [activeBook.id]: newIdx };
    setBookBookmarks(updated);
    pushUpdateToCloud(unlockedLessons, completedQuizzes, updated);
  };

  // ==========================================
  // 6. COMPLEX COMPUTED DATA (Leaderboard, Book search)
  // ==========================================
  
  // Dynamic list of quizzes merging static and dynamic ones
  const allQuizzes = useMemo(() => {
    const dynamicIds = dynamicQuizzes.map((q) => q.id);
    const filteredOffline = QUIZZES_DATA.filter((q) => !dynamicIds.includes(q.id));
    return [...dynamicQuizzes.map(q => ({
      id: q.id,
      title: q.title,
      category: q.category,
      timeLimit: q.time_limit,
      questions: q.ct_questions?.map((qs: any) => ({
        question: qs.question_text,
        options: qs.options,
        correct: qs.correct_option,
        explanation: qs.explanation
      })) || []
    })), ...filteredOffline];
  }, [dynamicQuizzes]);

  // Filtered quizzes by active category tab
  const filteredQuizzes = useMemo(() => {
    return allQuizzes.filter(q => {
      if (!q.category) return false;
      return q.category.trim().toLowerCase() === selectedQuizCategory.trim().toLowerCase();
    });
  }, [allQuizzes, selectedQuizCategory]);

  // Roadmap node status calculator
  const getNodeStatus = (index: number) => {
    const isNodeCompleted = (nodeIdx: number) => {
      if (nodeIdx === 0) {
        return unlockedLessons.includes("lit-1") && (userPoints >= 10);
      }
      if (nodeIdx === 1) {
        return completedQuizzes["quiz-comp"] >= 80;
      }
      if (nodeIdx === 2) {
        return unlockedLessons.includes("off-1") && (completedQuizzes["quiz-comp"] >= 80);
      }
      if (nodeIdx === 3) {
        return completedQuizzes["quiz-office"] >= 80;
      }
      return false;
    };

    const isThisCompleted = isNodeCompleted(index);
    if (isThisCompleted) return "completed";

    // Active check: it's active if all prior nodes are completed
    let allPriorCompleted = true;
    for (let i = 0; i < index; i++) {
      if (!isNodeCompleted(i)) {
        allPriorCompleted = false;
        break;
      }
    }

    if (allPriorCompleted) return "active";
    return "locked";
  };

  const handleOpenBookFromRoadmap = (bookId: string) => {
    const book = BOOKS_DATA.find((b) => b.id === bookId);
    if (book) {
      handleOpenBook(book);
    }
  };

  const handleActionFromRoadmap = (target: { type: "lesson" | "quiz" | "ctf"; id: string; tab: "darslar" | "testlar" | "ctf" }) => {
    playClickSound();
    if (target.type === "quiz") {
      const quiz = allQuizzes.find((q) => q.id === target.id);
      if (quiz) {
        handleStartQuiz(quiz);
        setActiveTab("testlar");
      }
    } else if (target.type === "ctf") {
      setActiveTab("ctf");
    } else if (target.type === "lesson") {
      const track = TRACKS_DATA.find((t) => t.lessons.some((l) => l.id === target.id));
      const lesson = track?.lessons.find((l) => l.id === target.id);
      if (track && lesson) {
        setSelectedTrack(track);
        handleSelectLesson(lesson);
        setActiveTab("darslar");
      }
    }
  };

  // Theme shifting CSS variables and style maps
  const themeColors = useMemo(() => {
    if (currentTheme === "green") {
      return {
        text: "text-[#39ff14]",
        border: "border-[#39ff14]/30",
        bg: "bg-[#39ff14]/10",
        gradient: "from-[#39ff14]/20 to-[#00D1FF]/20",
        solid: "#39ff14"
      };
    }
    if (currentTheme === "pink") {
      return {
        text: "text-pink-400",
        border: "border-pink-500/30",
        bg: "bg-pink-500/10",
        gradient: "from-pink-500/20 to-purple-500/20",
        solid: "#ec4899"
      };
    }
    // Default "blue" → full hacker neon matrix
    return {
      text: "text-[#39ff14]",
      border: "border-[#39ff14]/30",
      bg: "bg-[#39ff14]/10",
      gradient: "from-[#39ff14]/20 to-[#00D1FF]/20",
      solid: "#39ff14"
    };
  }, [currentTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (currentTheme === "blue") {
      root.style.setProperty("--tm-primary", "#00d1ff");
      root.style.setProperty("--tm-accent", "#6c63ff");
      root.style.setProperty("--tm-border", "rgba(0, 209, 255, 0.15)");
    } else if (currentTheme === "green") {
      root.style.setProperty("--tm-primary", "#10b981");
      root.style.setProperty("--tm-accent", "#059669");
      root.style.setProperty("--tm-border", "rgba(16, 185, 129, 0.15)");
    } else if (currentTheme === "pink") {
      root.style.setProperty("--tm-primary", "#ec4899");
      root.style.setProperty("--tm-accent", "#8b5cf6");
      root.style.setProperty("--tm-border", "rgba(236, 72, 153, 0.15)");
    }
  }, [currentTheme]);

  // Fetch real database rankings from Supabase ct_leaderboard
  const fetchDbRankings = async () => {
    try {
      setDbRankingsLoading(true);
      const supabase = createCleanPublicClient();
      const { data, error } = await supabase
        .from("ct_leaderboard")
        .select("*")
        .order("points", { ascending: false });
      
      if (!error && data) {
        setDbRankings(data);
        setDbConnectionError(false);
      } else if (error && (error.code === "PGRST205" || error.message.includes("cache"))) {
        setDbConnectionError(true);
      }
    } catch (e) {
      console.log("Failed to fetch database rankings:", e);
    } finally {
      setDbRankingsLoading(false);
    }
  };

  useEffect(() => {
    fetchDbRankings();
  }, [user]);

  useEffect(() => {
    if (activeTab === "leaderboard") {
      fetchDbRankings();
    }
  }, [activeTab, userPoints, studentName, user]);

  useEffect(() => {
    if (activeTab === "roadmap" && !activeThmRoom && THM_MODULES.length > 0) {
      const allRooms = THM_MODULES.flatMap(m => m.rooms);
      const nextRoom = allRooms.find(r => !thmCompletedRooms.includes(r.id)) || allRooms[0];
      setActiveThmRoom(nextRoom);
    }
  }, [activeTab, activeThmRoom, thmCompletedRooms]);

  // Rankings derived exclusively from Google-logged-in dynamic database entries
  const rankings = useMemo(() => {
    const mapped = dbRankings.map((item) => ({
      name: item.student_name,
      points: item.points,
      avatar: item.avatar_url || "",
      isActive: user && item.user_id === user.id
    }));
    
    // Sort in descending order (points)
    return mapped.sort((a, b) => b.points - a.points);
  }, [dbRankings, user]);

  // Book filtering
  const filteredBooks = useMemo(() => {
    return BOOKS_DATA.filter((b) => {
      const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === "All" || b.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  // Badge list descriptions
  const BADGES = [
    { id: "kiber_qalqon", label: "Kiber Qalqon", icon: "🛡️", desc: "Kiberxavfsizlik testidan 80%+ olish" },
    { id: "ai_pioneri", label: "AI Pioneri", icon: "🐍", desc: "Sun'iy intellekt testidan 80%+ olish" },
    { id: "frontend_kodchi", label: "Frontend Kodchi", icon: "💻", desc: "Web dev testidan 80%+ olish" },
    { id: "faol_kitobxon", label: "Faol Kitobxon", icon: "📚", desc: "Kutubxonada 1 dan ortiq bob o'qish" },
    { id: "ctf_buzgunchi", label: "CTF Buzg'unchisi", icon: "⚔️", desc: "Kiber topshiriqlarni (CTF) yechish" },
    { id: "kiber_bitiruvchi", label: "Kiber Bitiruvchi", icon: "🎖️", desc: "Barcha testlarni muvaffaqiyatli topshirish" },
    { id: "kiber_jangchi", label: "Cheksiz Kiber-Jangchi", icon: "⚔️", desc: "Cheksiz moslashuvchan mashg'ulot testidan 80%+ olish" }
  ];

  // Active book progress resolver for resume widget
  const activeBookProgress = useMemo(() => {
    const bookKeys = Object.keys(bookBookmarks);
    if (bookKeys.length === 0) return null;
    const lastBookId = bookKeys[bookKeys.length - 1];
    const book = BOOKS_DATA.find((b) => b.id === lastBookId);
    if (!book) return null;
    const activeChapter = bookBookmarks[lastBookId];
    return {
      book,
      chapterIndex: activeChapter,
      chapterTitle: book.chapters[activeChapter]?.title || "Mavzu",
      pct: Math.round(((activeChapter + 1) / book.chapters.length) * 100)
    };
  }, [bookBookmarks]);

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-200">
      
      {/* Sound Controller Float */}
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-3 py-1.5 backdrop-blur shadow-xl">
        <button
          onClick={() => { const next = !soundEnabled; setSoundEnabled(next); localStorage.setItem("ct_sound_muted", String(!next)); window.dispatchEvent(new Event("storage")); }}
          className="text-slate-300 hover:text-white"
          title={soundEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
        >
          {soundEnabled ? <Volume2 className="h-4.5 w-4.5 text-[#00D1FF]" /> : <VolumeX className="h-4.5 w-4.5 text-slate-500" />}
        </button>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{soundEnabled ? "FX ON" : "MUTED"}</span>
      </div>

      {/* Hero Welcome Info Header */}
      <div className="relative border-b border-[#00d1ff]/15 bg-gradient-to-r from-[#0b0f1a] via-[#0b152e] to-[#0b0f1a] py-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_50%_-10%,rgba(0,209,255,0.14),transparent)]" />
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-pink-400">
              <Zap className="h-3.5 w-3.5 text-[#00D1FF] animate-pulse" /> Cyber Tech Academy Ultimate
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-[#00D1FF] via-white to-[#6C63FF] bg-clip-text text-transparent">
                Cyber Academy
              </span>
            </h1>
            <p className="mt-2 text-slate-400 text-xs sm:text-sm max-w-xl">
              6 ta zamonaviy yo&apos;nalishda darslar, real vaqtda ishlaydigan kod terminali, 8-bitli o&apos;yin ovozlari,
              haftalik CTF xakerlik o&apos;yinlari va bulutli Gmail sinxronizatsiyasi.
            </p>
          </div>

          {/* User auth panel status */}
          <div className="shrink-0">
            {authLoading ? (
              <div className="text-xs text-slate-500 font-mono">Xavfsiz profil tekshirilmoqda...</div>
            ) : user ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="h-10 w-10 rounded-full border border-[#00D1FF]" />
                ) : (
                  <div className="h-10 w-10 bg-gradient-to-br from-[#00D1FF] to-[#6C63FF] rounded-full flex items-center justify-center font-bold text-black">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left font-mono">
                  <p className="text-xs font-bold text-white truncate max-w-[120px]">{studentName || user.user_metadata?.full_name || "Talaba"}</p>
                  <p className="text-[10px] text-emerald-400 font-bold">{userPoints} OCKO</p>
                  <button onClick={handleLogout} className="text-[9px] text-rose-400 hover:underline font-bold mt-1 block">Tizimdan chiqish</button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-5 py-3 text-xs font-bold shadow-lg shadow-white/5 hover:brightness-110 transition"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-4 w-4" alt="Google" />
                Gmail orqali kirish (Sinxronizatsiya)
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Grid View */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Navigation Sidebar — Premium Animated */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md tm-ring-glow">
              {/* Mobile toggle */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 lg:hidden">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: themeColors.solid, boxShadow: `0 0 8px ${themeColors.solid}` }} />
                  <span className="font-semibold text-white tracking-wide">Cyber Menu</span>
                </div>
                <button
                  onClick={() => { playClickSound(); setMobileMenuOpen(!mobileMenuOpen); }}
                  className="rounded-lg border p-2 text-slate-300 hover:bg-white/5 transition-all duration-300"
                  style={{
                    borderColor: mobileMenuOpen ? themeColors.solid : "rgba(255,255,255,0.1)",
                    boxShadow: mobileMenuOpen ? `0 0 10px ${themeColors.solid}33` : "none",
                  }}
                >
                  <Menu 
                    className="h-5 w-5 transition-transform duration-300" 
                    style={{
                      transform: mobileMenuOpen ? "rotate(90deg)" : "rotate(0deg)",
                      color: mobileMenuOpen ? themeColors.solid : undefined,
                    }}
                  />
                </button>
              </div>

              {/* Sidebar header label */}
              <div className="hidden lg:flex items-center gap-2 mb-3 px-1">
                <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${themeColors.solid}44, transparent)` }} />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-50" style={{ color: themeColors.solid }}>NAV</span>
              </div>

              {/* Nav Items */}
              <div
                className="space-y-1.5 overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: mobileMenuOpen ? "9999px" : undefined,
                  display: undefined,
                }}
                id="cyber-nav-items"
              >
                <div className="hidden lg:block space-y-1.5">
                  {([
                    { tab: "dashboard",   icon: Trophy,       label: "Dashboard" },
                    { tab: "roadmap",     icon: BookOpenCheck, label: "Kompyuter Yo\u02bcli" },
                    { tab: "darslar",     icon: Terminal,     label: "Darslar (6 ta)" },
                    { tab: "kitoblar",    icon: BookOpen,     label: "Kutubxona" },
                    { tab: "testlar",     icon: Award,        label: "Test Markazi" },
                    { tab: "ctf",         icon: Zap,          label: "CTF Arena" },
                    { tab: "leaderboard", icon: Trophy,       label: "Reyting" },
                    { tab: "profile",     icon: User,         label: "Profil" },
                  ] as { tab: "dashboard"|"roadmap"|"darslar"|"kitoblar"|"testlar"|"ctf"|"leaderboard"|"profile"; icon: any; label: string }[]).map(({ tab, icon: Icon, label }, idx) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => { playClickSound(); setActiveTab(tab); setMobileMenuOpen(false); }}
                        className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold cursor-pointer overflow-hidden
                          transition-all duration-500 ease-out border
                          ${isActive
                            ? "border-l-[3px] bg-white/[0.04] text-white"
                            : "border-transparent text-slate-400 hover:text-white"
                          }
                          ${isActive ? "active-cyber-menu" : ""}
                        `}
                        style={{
                          transitionDelay: menuMounted ? "0ms" : `${idx * 55}ms`,
                          transform: menuMounted ? "translateX(0) scale(1)" : "translateX(-18px) scale(0.95)",
                          opacity: menuMounted ? 1 : 0,
                          ...(isActive ? {
                            borderColor: themeColors.solid,
                            borderLeftColor: themeColors.solid,
                            boxShadow: `inset 0 0 20px ${themeColors.solid}08, 0 0 0 0.5px ${themeColors.solid}22`,
                            color: themeColors.solid,
                          } : {}),
                        }}
                      >
                        <span className="pointer-events-none absolute left-0 w-full h-[1.5px] opacity-0 group-hover:opacity-100 group-hover:animate-laser-sweep" style={{ background: `linear-gradient(to right, transparent, ${themeColors.solid}cc, transparent)` }} />
                        <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(ellipse 80% 60% at 20% 50%, ${themeColors.solid}0d, transparent)` }} />
                        <span className="cyber-corner cyber-corner-tl" style={{ color: themeColors.solid }} />
                        <span className="cyber-corner cyber-corner-tr" style={{ color: themeColors.solid }} />
                        <span className="cyber-corner cyber-corner-bl" style={{ color: themeColors.solid }} />
                        <span className="cyber-corner cyber-corner-br" style={{ color: themeColors.solid }} />
                        {isActive && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: themeColors.solid, boxShadow: `0 0 8px 2px ${themeColors.solid}` }} />}
                        <Icon className="relative z-10 h-4 w-4 shrink-0 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-6" style={{ color: isActive ? themeColors.solid : undefined }} />
                        <span className="relative z-10 flex-1 transition-transform duration-300 group-hover:translate-x-1">{label}</span>
                        {isActive && <span className="relative z-10 h-1.5 w-1.5 rounded-full animate-breathe shrink-0" style={{ backgroundColor: themeColors.solid, boxShadow: `0 0 6px ${themeColors.solid}` }} />}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile nav — premium sliding transition with staggered animations */}
                <div
                  className="lg:hidden space-y-1.5 transition-all duration-500 ease-out overflow-hidden"
                  style={{
                    maxHeight: mobileMenuOpen ? "500px" : "0px",
                    opacity: mobileMenuOpen ? 1 : 0,
                    marginTop: mobileMenuOpen ? "0.75rem" : "0px",
                  }}
                >
                  {([
                    { tab: "dashboard",   icon: Trophy,       label: "Dashboard" },
                    { tab: "roadmap",     icon: BookOpenCheck, label: "Kompyuter Yo\u02bcli" },
                    { tab: "darslar",     icon: Terminal,     label: "Darslar (6 ta)" },
                    { tab: "kitoblar",    icon: BookOpen,     label: "Kutubxona" },
                    { tab: "testlar",     icon: Award,        label: "Test Markazi" },
                    { tab: "ctf",         icon: Zap,          label: "CTF Arena" },
                    { tab: "leaderboard", icon: Trophy,       label: "Reyting" },
                    { tab: "profile",     icon: User,         label: "Profil" },
                  ] as const).map(({ tab, icon: Icon, label }, idx) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => { playClickSound(); setActiveTab(tab); setMobileMenuOpen(false); }}
                        className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold cursor-pointer overflow-hidden border transition-all
                          ${isActive
                            ? "border-l-[3px] bg-white/[0.04] text-white"
                            : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]"
                          }
                        `}
                        style={{
                          transitionDelay: mobileMenuOpen ? `${idx * 45}ms` : "0ms",
                          transform: mobileMenuOpen ? "translateX(0)" : "translateX(-15px)",
                          opacity: mobileMenuOpen ? 1 : 0,
                          transitionProperty: "transform, opacity, border, background-color, color, box-shadow",
                          transitionDuration: "400ms",
                          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                          ...(isActive ? {
                            borderColor: themeColors.solid,
                            borderLeftColor: themeColors.solid,
                            color: themeColors.solid,
                            boxShadow: `inset 0 0 12px ${themeColors.solid}08`,
                          } : {}),
                        }}
                      >
                        {/* Hover laser sweeps & responsive cyber corners */}
                        <span className="pointer-events-none absolute left-0 w-full h-[1.5px] opacity-0 group-hover:opacity-100 group-hover:animate-laser-sweep" style={{ background: `linear-gradient(to right, transparent, ${themeColors.solid}cc, transparent)` }} />
                        <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(ellipse 80% 60% at 20% 50%, ${themeColors.solid}0d, transparent)` }} />
                        <span className="cyber-corner cyber-corner-tl" style={{ color: themeColors.solid }} />
                        <span className="cyber-corner cyber-corner-tr" style={{ color: themeColors.solid }} />
                        <span className="cyber-corner cyber-corner-bl" style={{ color: themeColors.solid }} />
                        <span className="cyber-corner cyber-corner-br" style={{ color: themeColors.solid }} />

                        <Icon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" style={{ color: isActive ? themeColors.solid : undefined }} />
                        <span className="flex-1 transition-transform duration-300 group-hover:translate-x-1">{label}</span>
                        {isActive && <span className="h-1.5 w-1.5 rounded-full animate-breathe shrink-0" style={{ backgroundColor: themeColors.solid, boxShadow: `0 0 6px ${themeColors.solid}` }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom theme switcher accent */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] hidden lg:block">
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-30 text-center" style={{ color: themeColors.solid }}>— Mavzu —</p>
                <div className="flex justify-center gap-2 mt-2">
                  {(["blue", "green", "pink"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { playClickSound(); setCurrentTheme(t); localStorage.setItem("ct_current_theme", t); window.dispatchEvent(new Event("storage")); }}
                      className="h-5 w-5 rounded-full border-2 transition-all duration-300 hover:scale-125"
                      style={{
                        backgroundColor: t === "blue" ? "#00d1ff" : t === "green" ? "#10b981" : "#ec4899",
                        borderColor: currentTheme === t ? "white" : "transparent",
                        boxShadow: currentTheme === t ? `0 0 8px ${t === "blue" ? "#00d1ff" : t === "green" ? "#10b981" : "#ec4899"}` : "none",
                      }}
                      title={t.charAt(0).toUpperCase() + t.slice(1) + " mavzu"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Workspace Frame */}
          <div className="lg:col-span-9">
            
            {/* =======================================================
                TAB 1: WELCOME DASHBOARD (Stats, Achievements, Resume Reading)
                ======================================================= */}
            {activeTab === "dashboard" && (
              <div className="relative space-y-6 animate-fade-in">
                {/* ── BINARY RAIN CANVAS (0 & 1 falling animation background) ── */}
                <BinaryRainCanvas />

                {/* Hero header info */}
                <div className="relative overflow-hidden rounded-3xl border border-[#00d1ff]/20 bg-gradient-to-br from-[#0f172a]/95 to-[#0e1e38]/95 p-6 sm:p-8 tm-glow">
                  <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 bg-cyan-500/10 rounded-full blur-3xl animate-glow-pulse" />
                  <div className="relative">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#00D1FF]">O&apos;quv laboratoriyasi</span>
                    <h2 className="text-2xl font-black text-white mt-1">IT Kiber-Arenasiga Xush Kelibsiz!</h2>
                    <p className="mt-3 text-sm text-slate-300 max-w-xl">
                      Bizning platformada 6 ta yo&apos;nalish bo&apos;yicha darslarni bajaring, kiber-musobaqalarda 
                      qatnashib ochkolar to&apos;plang va boshqa o&apos;quvchilar bilan raqobatlashing.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button onClick={() => setActiveTab("darslar")} className="px-5 py-3 bg-gradient-to-r from-[#00D1FF] to-[#6C63FF] text-[#0B0F1A] font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 hover:brightness-110 transition flex items-center gap-1.5">
                        Kiber Darslar <ChevronRight className="h-4 w-4" />
                      </button>
                      <button onClick={() => setActiveTab("ctf")} className="px-5 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl transition">
                        CTF Arena &rarr;
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Ochkolaringiz</p>
                    <p className="text-3xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-[#00D1FF] bg-clip-text mt-1">{userPoints} PTS</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Yechilgan CTF</p>
                    <p className="text-3xl font-black text-white mt-1">{solvedCtfs.length} ta</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Yutuqlar nishoni</p>
                    <p className="text-3xl font-black text-[#6C63FF] mt-1">{unlockedBadges.length} ta</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Darslar ochildi</p>
                    <p className="text-3xl font-black text-emerald-400 mt-1">{unlockedLessons.length} ta</p>
                  </div>
                </div>

                {/* RESUME READING PANEL WIDGET */}
                {activeBookProgress && (
                  <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-r from-[#0d1024] to-[#1d123d] p-5 flex flex-col sm:flex-row items-center justify-between gap-6 animate-success-pop">
                    <div className="flex items-center gap-4 text-left">
                      {/* Miniature Cover */}
                      <div className={`h-16 w-12 rounded-lg bg-gradient-to-br ${activeBookProgress.book.coverColor} p-1 flex flex-col justify-between shrink-0 shadow-lg`}>
                        <span className="text-[4px] font-bold text-white">PRESS</span>
                        <span className="text-[5px] font-black text-white leading-tight line-clamp-2">{activeBookProgress.book.title}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-purple-400">Mutolaani davom ettirish</span>
                        <h4 className="font-bold text-white text-sm mt-0.5">{activeBookProgress.book.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 font-mono">{activeBookProgress.chapterTitle} • {activeBookProgress.pct}% o&apos;qildi</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleOpenBook(activeBookProgress.book)}
                      className="px-4 py-2 bg-[#6C63FF] text-white text-xs font-bold rounded-lg hover:brightness-110 transition shrink-0"
                    >
                      O&apos;qishda davom etish &rarr;
                    </button>
                  </div>
                )}

                {/* ACHIEVEMENTS & BADGES NEON CABINET */}
                <div>
                  <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" /> Kiber Yutuqlar va Nishonlar
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
                    {BADGES.map((b) => {
                      const isUnlocked = unlockedBadges.includes(b.id);
                      return (
                        <div 
                          key={b.id}
                          className={`rounded-2xl border p-4 text-center transition flex flex-col items-center justify-between ${
                            isUnlocked 
                              ? "border-emerald-500/30 bg-emerald-500/[0.04] shadow-lg shadow-emerald-500/5" 
                              : "border-white/5 bg-white/[0.01] opacity-40"
                          }`}
                          title={b.desc}
                        >
                          <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">{b.icon}</span>
                          <p className="text-[10px] font-bold mt-3 leading-snug truncate max-w-full text-white">{b.label}</p>
                          <span className={`text-[8px] font-mono mt-1 font-bold ${isUnlocked ? "text-emerald-400" : "text-slate-600"}`}>
                            {isUnlocked ? "OCHILDI" : "YOPILGAN"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* =======================================================
                TAB 1.5: INTERACTIVE CYBER ROADMAP FLOWCHART
                ======================================================= */}
            {activeTab === "roadmap" && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-[#0c0f1e]/90 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient from-cyan-500/10 to-transparent blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <BookOpenCheck className="h-5 w-5 animate-pulse" style={{ color: themeColors.solid }} /> TryHackMe Kiber-Yo&apos;nalishlar
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Kiberxavfsizlik va axborot texnologiyalari dunyosiga amaliy kiber-xonalar va laboratoriyalar orqali kirib boring.
                    </p>
                  </div>
                  
                  {/* Progress Stats Card */}
                  <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-xl p-3 shrink-0 relative z-10">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-950/20 text-emerald-400">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Umumiy progress</div>
                      <div className="text-sm font-black text-white font-mono">
                        {thmCompletedRooms.length} / 16 Xonalar ({Math.round((thmCompletedRooms.length / 16) * 100)}%)
                      </div>
                      {/* Mini progress bar */}
                      <div className="w-24 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                          style={{ width: `${(thmCompletedRooms.length / 16) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  
                  {/* Left Column: TryHackMe Module list & Rooms (lg:col-span-5) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-[#0c0f1e]/90 p-5 shadow-2xl space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
                        O&apos;quv Modullari ({THM_MODULES.length})
                      </h4>
                      
                      <div className="space-y-3">
                        {THM_MODULES.map((mod, modIdx) => {
                          const isExpanded = activeThmModule === modIdx;
                          const completedInModule = mod.rooms.filter(r => thmCompletedRooms.includes(r.id)).length;
                          const totalInModule = mod.rooms.length;
                          const percent = Math.round((completedInModule / totalInModule) * 100);
                          
                          return (
                            <div 
                              key={mod.id}
                              className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                                isExpanded 
                                  ? "bg-white/[0.02]" 
                                  : "bg-transparent hover:bg-white/[0.01]"
                              }`}
                              style={{ borderColor: isExpanded ? `${themeColors.solid}33` : "rgba(255,255,255,0.05)" }}
                            >
                              {/* Module Header */}
                              <div 
                                onClick={() => { playClickSound(); setActiveThmModule(modIdx); }}
                                className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                              >
                                <div className="flex-1 min-w-0">
                                  <h5 className={`text-xs font-bold truncate transition-colors ${isExpanded ? "text-white" : "text-slate-300"}`} style={isExpanded ? { color: themeColors.solid } : undefined}>
                                    {mod.title}
                                  </h5>
                                  <p className="text-[10px] text-slate-500 truncate mt-0.5 leading-normal">
                                    {mod.desc}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                    percent === 100 
                                      ? "bg-emerald-500/10 text-emerald-400" 
                                      : percent > 0 
                                      ? "bg-cyan-500/10 text-[#00D1FF]" 
                                      : "bg-slate-800 text-slate-500"
                                  }`}>
                                    {completedInModule}/{totalInModule}
                                  </span>
                                  <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} />
                                </div>
                              </div>
                              
                              {/* Module Rooms List */}
                              {isExpanded && (
                                <div className="border-t border-white/5 bg-black/30 p-2 space-y-1">
                                  {mod.rooms.map((room, roomIdx) => {
                                    // Lock/Unlock check
                                    const allRoomsList = THM_MODULES.flatMap(m => m.rooms);
                                    const globalIdx = allRoomsList.findIndex(r => r.id === room.id);
                                    const isUnlocked = globalIdx <= 0 || thmCompletedRooms.includes(allRoomsList[globalIdx - 1].id);
                                    
                                    const isCompleted = thmCompletedRooms.includes(room.id);
                                    const isActive = activeThmRoom?.id === room.id;
                                    
                                    let difficultyColor = "text-slate-400 bg-slate-800";
                                    if (room.difficulty === "Boshlang'ich") difficultyColor = "text-emerald-400 bg-emerald-950/30 border border-emerald-500/20";
                                    else if (room.difficulty === "O'rta") difficultyColor = "text-cyan-400 bg-cyan-950/30 border border-cyan-500/20";
                                    else if (room.difficulty === "Qiyin") difficultyColor = "text-rose-400 bg-rose-950/30 border border-rose-500/20";

                                    return (
                                      <div 
                                        key={room.id}
                                        onClick={() => {
                                          if (isUnlocked) {
                                            setActiveThmRoom(room);
                                            setThmFeedback(null);
                                            setThmFlagInput("");
                                            playClickSound();
                                          } else {
                                            playBuzzSound();
                                          }
                                        }}
                                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                                          !isUnlocked 
                                            ? "opacity-40 cursor-not-allowed bg-transparent border-transparent"
                                            : isActive
                                            ? "bg-white/[0.04] cursor-pointer"
                                            : "hover:bg-white/[0.02] cursor-pointer border-transparent"
                                        }`}
                                        style={isActive && isUnlocked ? { borderColor: `${themeColors.solid}44` } : undefined}
                                      >
                                        {/* Status icon indicator */}
                                        <div className="shrink-0">
                                          {isCompleted ? (
                                            <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                                          ) : !isUnlocked ? (
                                            <Lock className="h-4 w-4 text-slate-500" />
                                          ) : isActive ? (
                                            <span className="relative flex h-3.5 w-3.5">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: themeColors.solid }} />
                                              <span className="relative inline-flex rounded-full h-3.5 w-3.5" style={{ backgroundColor: themeColors.solid }} />
                                            </span>
                                          ) : (
                                            <div className="h-4.5 w-4.5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] text-slate-500 font-mono font-bold">
                                              {roomIdx + 1}
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between gap-2">
                                            <h6 className={`text-[11px] font-bold truncate ${
                                              !isUnlocked 
                                                ? "text-slate-600" 
                                                : isCompleted 
                                                ? "text-slate-400 line-through decoration-emerald-500/20" 
                                                : isActive 
                                                ? "text-white font-extrabold"
                                                : "text-slate-300"
                                            }`} style={isActive && isUnlocked ? { color: themeColors.solid } : undefined}>
                                              {room.title}
                                            </h6>
                                            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded font-mono ${difficultyColor}`}>
                                              {room.difficulty}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Immersive Room Detail Panel (lg:col-span-7) */}
                  <div className="lg:col-span-7">
                    {activeThmRoom ? (
                      (() => {
                        const room = activeThmRoom;
                        const isCompleted = thmCompletedRooms.includes(room.id);
                        
                        let cardGlowBorder = "border-slate-800 bg-[#0c0f1e]/90 shadow-2xl";
                        let bannerBg = "from-slate-900 to-slate-950";
                        
                        if (isCompleted) {
                          cardGlowBorder = "border-emerald-500/30 bg-[#0c151b] shadow-2xl shadow-emerald-500/5";
                          bannerBg = "from-emerald-950/40 via-transparent to-transparent";
                        } else {
                          cardGlowBorder = `border-${currentTheme === "green" ? "emerald" : currentTheme === "pink" ? "pink" : "cyan"}-500/20 bg-[#0c0f1e]/95 shadow-2xl shadow-cyan-500/5`;
                        }

                        // Helper to render simple markdown paragraphs/code
                        const renderTutorial = (text: string) => {
                          return text.split("\n\n").map((paragraph, pIdx) => {
                            if (paragraph.startsWith("###")) {
                              return (
                                <h4 key={pIdx} className="text-sm font-black text-white mt-4 mb-2 flex items-center gap-1.5 border-b border-white/5 pb-1">
                                  <Terminal className="h-4 w-4 text-slate-400" style={{ color: themeColors.solid }} />
                                  {paragraph.replace("###", "").trim()}
                                </h4>
                              );
                            }
                            if (paragraph.startsWith("**Sizning vazifangiz:**")) {
                              return (
                                <div key={pIdx} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 my-4 space-y-2">
                                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5" style={{ color: themeColors.solid }} /> Sizning Vazifangiz:
                                  </h5>
                                  <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-1">
                                    {paragraph.replace("**Sizning vazifangiz:**", "").trim().split("\n").map((line, lIdx) => (
                                      <div key={lIdx} className="flex items-start gap-2">
                                        <span className="text-slate-500 text-xs mt-0.5">•</span>
                                        <span>{line.replace(/^\d+\.\s*/, "").replace(/\\`/g, "`")}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            // Code blocks
                            if (paragraph.includes("```")) {
                              const match = paragraph.match(/```(.*?)\n([\s\S]*?)```/) || paragraph.match(/```([\s\S]*?)```/);
                              if (match) {
                                const code = match[2] || match[1];
                                return (
                                  <div key={pIdx} className="relative rounded-xl border border-white/5 bg-black/60 p-4 my-3 overflow-x-auto font-mono text-xs text-emerald-400 shadow-inner group">
                                    <span className="absolute right-2 top-2 text-[8px] font-bold text-slate-600 uppercase tracking-widest pointer-events-none group-hover:text-slate-500">terminal / output</span>
                                    <code>{code.trim()}</code>
                                  </div>
                                );
                              }
                            }
                            return (
                              <p key={pIdx} className="text-xs text-slate-300 leading-relaxed font-sans font-normal">
                                {paragraph.replace(/\*\*(.*?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1")}
                              </p>
                            );
                          });
                        };

                        return (
                          <div className={`rounded-2xl border p-5 sm:p-6 space-y-6 transition-all duration-300 ${cardGlowBorder} bg-gradient-to-b ${bannerBg}`}>
                            
                            {/* Room Header */}
                            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                              <div className="space-y-1.5">
                                <span className={`inline-block text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full ${
                                  isCompleted 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                    : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                }`}>
                                  {isCompleted ? "✅ Bajarildi" : "⚡ Faol Xona"}
                                </span>
                                <h3 className="text-base font-black text-white">{room.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{room.difficulty}</span>
                                  <span className="text-slate-700 text-xs">•</span>
                                  <span className="text-[10px] text-emerald-400 font-bold font-mono">+{room.xp} XP</span>
                                </div>
                              </div>
                              <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center bg-white/5 border border-white/10">
                                <Terminal className="h-5 w-5 text-slate-300" style={{ color: themeColors.solid }} />
                              </div>
                            </div>

                            {/* Tutorial content */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="h-4 w-4 text-slate-400" />
                                <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">O&apos;quv materiallari & Qo&apos;llanma</h4>
                              </div>
                              <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
                                {renderTutorial(room.tutorial)}
                              </div>
                            </div>

                            {/* Submit Section */}
                            <div className="space-y-4 pt-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5">
                                  <Award className="h-4 w-4 text-slate-400" />
                                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Topshiriq Tasdiqlash (Bayroq)</h4>
                                </div>
                                <button
                                  onClick={() => { playClickSound(); setShowThmHint(!showThmHint); }}
                                  className="text-[10px] font-bold text-amber-500 hover:underline flex items-center gap-1 shrink-0"
                                >
                                  <HelpCircle className="h-3.5 w-3.5" /> Maslahat (Hint) olish
                                </button>
                              </div>

                              {showThmHint && (
                                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-xs leading-relaxed animate-fade-in font-sans relative">
                                  <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-xl bg-amber-500" />
                                  <strong>Kiber-Maslahat:</strong> {room.hint}
                                </div>
                              )}

                              {isCompleted ? (
                                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center justify-center text-center gap-2 animate-scale-up">
                                  <CheckCircle className="h-8 w-8 text-emerald-400 animate-pulse" />
                                  <div className="text-xs font-black text-white uppercase tracking-wider font-mono">Kiber-Xona Muvaffaqiyatli Buzildi!</div>
                                  <p className="text-[10px] text-emerald-400 leading-normal max-w-sm">
                                    Siz bu topishiriqni muvaffaqiyatli topshirdingiz va kiber-hisobingizga <strong>+{room.xp} XP</strong> ball qo&apos;shildi. Keyingi kiber-xonaga o&apos;ting.
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="flex gap-2">
                                    <input 
                                      type="text" 
                                      value={thmFlagInput}
                                      onChange={(e) => setThmFlagInput(e.target.value)}
                                      onKeyDown={(e) => { if (e.key === "Enter") handleSubmitThmFlag(room); }}
                                      placeholder="THM{kiber_flag_kod}"
                                      className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition font-mono focus:border-cyan-500"
                                      style={{ focusBorderColor: themeColors.solid } as any}
                                      onFocus={(e) => e.currentTarget.style.borderColor = themeColors.solid}
                                      onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                                    />
                                    <button
                                      onClick={() => handleSubmitThmFlag(room)}
                                      className="px-5 rounded-xl font-bold text-xs text-[#0B0F1A] transition active:scale-95 duration-200 select-none flex items-center gap-1.5 shrink-0"
                                      style={{ background: themeColors.solid }}
                                    >
                                      Topshirish <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                  </div>

                                  {thmFeedback === "success" && (
                                    <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-fade-in font-mono">
                                      <CheckCircle className="h-4 w-4" /> Muvaffaqiyatli! +{room.xp} XP ball qo&apos;shildi.
                                    </div>
                                  )}
                                  {thmFeedback === "error" && (
                                    <div className="text-xs text-rose-400 font-bold flex items-center gap-1.5 animate-shake font-mono">
                                      <XCircle className="h-4 w-4" /> Noto&apos;g&apos;ri bayroq kodi! Qaytadan urinib ko&apos;ring.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })()
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-[#0c0f1e]/90 p-10 text-center flex flex-col items-center justify-center gap-4 h-full min-h-[300px]">
                        <div className="h-16 w-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5 animate-pulse">
                          <BookOpenCheck className="h-8 w-8 text-slate-500" style={{ color: themeColors.solid }} />
                        </div>
                        <h4 className="text-sm font-bold text-white">Xona Tanlanmagan</h4>
                        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                          Chap tomondagi o&apos;quv modullaridan faollashtirilgan kiber-xonani tanlang va uning materiallarini o&apos;rganishni boshlang.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* =======================================================
                TAB 2: RESTORED 6 YO'NALISH DARSLAR & CODE SANDBOX
                ======================================================= */}
            {activeTab === "darslar" && (
              <div className="space-y-6 animate-fade-in">
                
                {!selectedTrack ? (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-white">6 ta IT Yo&apos;nalish bo&apos;yicha Darslar</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Mutaxassislik modullarini bosib darslarni bajaring, savollarga to&apos;g&apos;ri javob bering va keyingi darslarni oching.
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {TRACKS_DATA.map((t) => {
                        const IconComp = t.icon;
                        return (
                          <div 
                            key={t.id}
                            onClick={() => setSelectedTrack(t)}
                            className="group cursor-pointer rounded-2xl border border-white/10 bg-[#0d1222]/80 p-5 hover:border-cyan-500/40 hover:shadow-lg transition"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-[#00D1FF] transition group-hover:bg-[#00D1FF]/10">
                              <IconComp className="h-5 w-5" style={{ color: t.color }} />
                            </div>
                            <h4 className="mt-4 font-bold text-sm text-white group-hover:text-[#00D1FF] transition">{t.title}</h4>
                            <p className="mt-1 text-slate-500 text-[10px] uppercase font-bold">{t.level} • {t.duration}</p>
                            <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                              {t.lessons[0].shortDesc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // Inside active track
                  <div className="space-y-6">
                    <button onClick={() => { playClickSound(); setSelectedTrack(null); setSelectedLesson(null); }} className="text-xs text-slate-400 hover:text-white">
                      &larr; Yo&apos;nalishlarga qaytish
                    </button>

                    <div className="flex flex-col gap-6 md:flex-row">
                      
                      {/* Lessons list sidebar */}
                      <div className="w-full md:w-1/3 space-y-3 shrink-0">
                        <div className="rounded-xl border border-white/10 bg-[#0c0f20] p-4">
                          <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-2">Yo&apos;nalish Modullari</h4>
                          <h3 className="font-extrabold text-sm text-[#00D1FF] mb-4">{selectedTrack.title}</h3>
                          <div className="space-y-2">
                            {selectedTrack.lessons.map((lesson, idx) => {
                              const isUnlocked = unlockedLessons.includes(lesson.id);
                              const isSelected = selectedLesson?.id === lesson.id;
                              return (
                                <button
                                  key={lesson.id}
                                  disabled={!isUnlocked}
                                  onClick={() => handleSelectLesson(lesson)}
                                  className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition ${
                                    isSelected
                                      ? "bg-[#00D1FF]/10 text-white border border-[#00D1FF]/30"
                                      : isUnlocked
                                      ? "bg-white/5 text-slate-300 hover:bg-white/10"
                                      : "bg-white/[0.01] text-slate-600 cursor-not-allowed"
                                  }`}
                                >
                                  <div>
                                    <p className="text-[10px] font-semibold">0{idx + 1}-dars</p>
                                    <p className={`text-xs font-bold line-clamp-1 ${!isUnlocked && "text-slate-600"}`}>{lesson.title}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Lesson Content Area & Live Code Simulator */}
                      <div className="flex-1 space-y-6">
                        {selectedLesson ? (
                          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 space-y-5">
                            
                            <div className="border-b border-white/10 pb-3">
                              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Dars Moduli</span>
                              <h3 className="text-xl font-bold text-white mt-1">{selectedLesson.title}</h3>
                            </div>

                            <div className="text-sm leading-relaxed text-slate-300 whitespace-pre-line space-y-3 font-sans">
                              {selectedLesson.content}
                            </div>

                            {/* DYNAMIC LIVE CODE RUNNER SIMULATOR */}
                            {selectedLesson.codeSnippet && (
                              <div className="rounded-xl border border-white/10 bg-black/60 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40">
                                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                                    <Terminal className="h-4 w-4 text-yellow-500" /> terminal.{selectedLesson.codeLanguage}
                                  </span>
                                  <button
                                    onClick={handleRunCode}
                                    disabled={sandboxRunning}
                                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black text-xs font-bold rounded flex items-center gap-1"
                                  >
                                    <Play className="h-3 w-3" /> Kodni Ishga Tushirish
                                  </button>
                                </div>

                                <div className="p-4 flex flex-col md:flex-row gap-4">
                                  {/* Editable code snippet */}
                                  <div className="flex-1 font-mono text-xs text-[#00D1FF] bg-black/30 p-3 rounded border border-white/5 outline-none whitespace-pre-wrap overflow-x-auto min-h-[120px]">
                                    {sandboxCode}
                                  </div>

                                  {/* Simulated Live Green Terminal Output */}
                                  <div className="w-full md:w-80 rounded border border-emerald-500/20 bg-black p-3 font-mono text-[10px] text-emerald-400 min-h-[120px] max-h-[180px] overflow-y-auto space-y-1 shadow-inner">
                                    <p className="text-slate-500">// Terminal simulyatori chiqishi:</p>
                                    {sandboxOutput.map((line, lIdx) => (
                                      <p key={lIdx} className="leading-snug">{line}</p>
                                    ))}
                                    {sandboxRunning && (
                                      <p className="animate-pulse text-yellow-400">Jarayon bajarilmoqda...</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Lesson review quiz */}
                            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.01] p-4 mt-6">
                              <h4 className="text-xs font-extrabold text-[#00D1FF] uppercase tracking-wider flex items-center gap-1.5">
                                <HelpCircle className="h-4 w-4" /> Mustahkamlash Savoli
                              </h4>
                              <p className="text-sm font-bold text-white mt-2">
                                {selectedLesson.reviewQuestion.question}
                              </p>

                              <div className="mt-3 space-y-2">
                                {selectedLesson.reviewQuestion.options.map((opt, oIdx) => (
                                  <button
                                    key={oIdx}
                                    onClick={() => {
                                      if (showLessonReviewFeedback) return;
                                      setLessonReviewAnswer(oIdx);
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-xs font-semibold transition ${
                                      lessonReviewAnswer === oIdx
                                        ? "bg-cyan-500/10 border-cyan-500 text-white"
                                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                                    }`}
                                  >
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-500 font-bold shrink-0">
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    {opt}
                                  </button>
                                ))}
                              </div>

                              {!showLessonReviewFeedback ? (
                                <button
                                  onClick={handleLessonReviewSubmit}
                                  disabled={lessonReviewAnswer === null}
                                  className="mt-4 px-4 py-2 bg-[#00D1FF] text-black font-bold text-xs rounded-lg hover:brightness-110 disabled:opacity-50 transition"
                                >
                                  Tasdiqlash
                                </button>
                              ) : (
                                <div className="mt-4 p-3 rounded-lg border text-xs leading-normal">
                                  {lessonReviewAnswer === selectedLesson.reviewQuestion.correct ? (
                                    <div className="text-emerald-400">
                                      <p className="font-bold flex items-center gap-1"><CheckCircle className="h-4 w-4" /> To&apos;g&apos;ri javob!</p>
                                      <p className="text-slate-400 mt-1">{selectedLesson.reviewQuestion.explanation}</p>
                                    </div>
                                  ) : (
                                    <div className="text-rose-400">
                                      <p className="font-bold flex items-center gap-1"><XCircle className="h-4 w-4" /> Noto&apos;g&apos;ri javob.</p>
                                      <button onClick={() => { setShowLessonReviewFeedback(false); setLessonReviewAnswer(null); }} className="mt-2 text-cyan-400 hover:underline">Qayta urinish</button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-500">
                            <Terminal className="h-10 w-10 mx-auto text-slate-600 mb-2" />
                            <p className="text-xs font-semibold">Yo&apos;nalish dars modullaridan birini tanlang</p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* =======================================================
                TAB 3: E-KUTUBXONA & IMMERSIVE SUMMARY GENERATOR
                ======================================================= */}
            {activeTab === "kitoblar" && (
              <div className="space-y-6 animate-fade-in">
                
                {!activeBook ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-cyan-400" /> IT & Kiber Kutubxona
                      </h3>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-56">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Qidirish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-4 py-2 text-xs focus:border-[#00D1FF] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Book lists Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {filteredBooks.map((book) => (
                        <div key={book.id} className="flex gap-4 rounded-2xl border border-white/10 bg-[#0c0f1e]/90 p-4 transition hover:border-[#00d1ff]/40 hover:shadow-lg tm-ring-glow">
                          <div className={`w-24 shrink-0 rounded-xl bg-gradient-to-br ${book.coverColor} p-2.5 flex flex-col justify-between shadow-xl relative overflow-hidden aspect-[3/4]`}>
                            <span className="text-[6px] font-extrabold text-cyan-300">CYBER ED</span>
                            <h4 className="text-[9px] font-black text-white line-clamp-3 leading-tight mt-1">{book.title}</h4>
                            <div className="flex justify-between items-end text-[5px] text-slate-400">
                              <span>{book.author}</span>
                              <span className="bg-black/35 px-1 py-0.5 rounded text-white font-bold">{book.pages} p.</span>
                            </div>
                          </div>

                          <div className="flex flex-col justify-between py-1 flex-1">
                            <div>
                              <span className="text-[8px] uppercase font-bold text-pink-400 tracking-wider">{book.category}</span>
                              <h4 className="text-sm font-bold text-white mt-1 leading-snug">{book.title}</h4>
                              <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">{book.summary}</p>
                            </div>
                            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
                              <span className="text-[10px] text-slate-500 truncate max-w-[100px]">Muallif: {book.author}</span>
                              <button onClick={() => handleOpenBook(book)} className="text-[11px] font-bold text-[#00D1FF] hover:underline flex items-center gap-1">
                                O&apos;qish <Play className="h-2 w-2" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  
                  // IMMERSIVE READER PANEL + AI SUMMARY TRIGGER
                  <div className="rounded-2xl border border-white/10 bg-white/[0.01] overflow-hidden animate-fade-in relative">
                    
                    {/* Header Controls */}
                    <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0e1222]/90 gap-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => { playClickSound(); setActiveBook(null); }} className="px-2.5 py-1.5 bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs font-bold">
                          &larr; Shelf
                        </button>
                        <div>
                          <h4 className="text-xs font-bold text-[#00D1FF] line-clamp-1">{activeBook.title}</h4>
                          <p className="text-[10px] text-slate-500">{activeBook.chapters[activeChapterIndex]?.title}</p>
                        </div>
                      </div>

                      {/* Toolbar actions */}
                      <div className="flex items-center gap-3">
                        
                        {/* AI Summarize Button */}
                        <button
                          onClick={handleSummarizeBook}
                          disabled={aiSummarizing}
                          className="px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold flex items-center gap-1.5 animate-pulse hover:bg-purple-500/20"
                        >
                          <Sparkles className="h-3.5 w-3.5" /> AI Konspekt
                        </button>

                        <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
                          {(["dark", "sepia", "light"] as const).map((th) => (
                            <button
                              key={th}
                              onClick={() => setReaderTheme(th)}
                              className={`px-2 py-1 text-[9px] font-bold rounded uppercase transition ${
                                readerTheme === th ? "bg-cyan-500 text-black" : "text-slate-400"
                              }`}
                            >
                              {th}
                            </button>
                          ))}
                        </div>

                        {/* Zoom */}
                        <div className="flex items-center gap-1 text-xs">
                          <button onClick={() => setReaderZoom(z => Math.max(80, z - 10))} className="p-1 bg-white/5 rounded border border-white/10 text-slate-400"><ZoomOut className="h-3.5 w-3.5" /></button>
                          <span className="w-8 text-center text-[10px] font-mono">{readerZoom}%</span>
                          <button onClick={() => setReaderZoom(z => Math.min(150, z + 10))} className="p-1 bg-white/5 rounded border border-white/10 text-slate-400"><ZoomIn className="h-3.5 w-3.5" /></button>
                        </div>

                      </div>
                    </div>

                    {/* AI SUMMARY INTERACTIVE SLIDE DOWN */}
                    {aiSummarizing && (
                      <div className="p-4 border-b border-purple-500/20 bg-purple-500/[0.02] text-center text-xs text-purple-400 animate-pulse">
                        Kiber AI o&apos;quv yordamchisi bob matnini tahlil qilmoqda...
                      </div>
                    )}
                    {aiSummary && (
                      <div className="p-5 border-b border-purple-500/25 bg-gradient-to-br from-[#0c0f20] to-[#1a1236] text-xs leading-relaxed text-purple-300 animate-success-pop space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5 text-purple-400"><Sparkles className="h-4 w-4" /> KIBER AI TEZKOR KONSPEKT</span>
                          <button onClick={() => setAiSummary(null)} className="text-[10px] text-slate-500 hover:text-white">Yopish</button>
                        </div>
                        <div className="whitespace-pre-line font-mono bg-black/40 p-4 rounded-xl border border-purple-500/10">
                          {aiSummary}
                        </div>
                      </div>
                    )}

                    {/* Immersive Text View */}
                    <div 
                      className="p-6 sm:p-10 min-h-[400px] overflow-y-auto"
                      style={{
                        backgroundColor: readerTheme === "dark" ? "#0c0f20" : readerTheme === "sepia" ? "#f4ecd8" : "#ffffff",
                        color: readerTheme === "dark" ? "#cbd5e1" : readerTheme === "sepia" ? "#433422" : "#1e293b",
                        fontSize: readerFontSize === "sm" ? "13px" : readerFontSize === "md" ? "15px" : readerFontSize === "lg" ? "17px" : "20px",
                        zoom: `${readerZoom}%`
                      }}
                    >
                      <div className="max-w-2xl mx-auto space-y-4">
                        <h3 className="text-xl font-black border-b pb-3 uppercase tracking-tight">{activeBook.chapters[activeChapterIndex]?.title}</h3>
                        <div className="whitespace-pre-line leading-relaxed font-sans pt-3">
                          {activeBook.chapters[activeChapterIndex]?.content}
                        </div>
                      </div>
                    </div>

                    {/* Footer Nav */}
                    <div className="flex items-center justify-between px-4 py-3 bg-[#0e1222]/90 border-t border-white/10">
                      <button
                        disabled={activeChapterIndex === 0}
                        onClick={() => handleBookChapterChange(activeChapterIndex - 1)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 text-xs font-semibold rounded-lg text-slate-300 hover:text-white disabled:opacity-30 transition"
                      >
                        &larr; Oldingi bob
                      </button>
                      <span className="text-xs font-mono text-slate-500">Bob: {activeChapterIndex + 1} / {activeBook.chapters.length}</span>
                      <button
                        disabled={activeChapterIndex === activeBook.book.chapters?.length - 1 || activeChapterIndex === activeBook.chapters.length - 1}
                        onClick={() => handleBookChapterChange(activeChapterIndex + 1)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 text-xs font-semibold rounded-lg text-slate-300 hover:text-white disabled:opacity-30 transition"
                      >
                        Keyingi bob &rarr;
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* =======================================================
                TAB 4: TEST CENTER & DYNAMIC DOCK SYSTEM (Sync & Verification)
                ======================================================= */}
            {activeTab === "testlar" && (
              <div className="space-y-6 animate-fade-in">
                
                {!activeQuiz ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white flex flex-wrap items-center gap-2">
                          <Award className="h-5 w-5 text-cyan-400" /> Kiber Test Arena
                          <span className="text-[10px] bg-slate-800 text-[#00D1FF] border border-[#00D1FF]/20 px-2 py-0.5 rounded-full font-mono">
                            DB: {dynamicQuizzes.length} ta yuklandi
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Sertifikat olish va bilimingizni sinash uchun testlar.</p>
                      </div>
                      <p className="text-xs text-slate-500">Muvaffaqiyat ko&apos;rsatkichi: 80% +</p>
                    </div>

                    {dbErrorMsg && (
                      <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono">
                        Bazaga ulanish xatosi: {dbErrorMsg}
                      </div>
                    )}

                    {/* Category tabs bo'limlar */}
                    <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-4">
                      {[
                        "Kompyuter savodxonligi",
                        "Microsoft Office",
                        "Dasturlash",
                        "Sun'iy intellekt",
                        "Robototexnika",
                        "Kiberxavfsizlik"
                      ].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => { playClickSound(); setSelectedQuizCategory(cat); }}
                          className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                            selectedQuizCategory === cat
                              ? "bg-[#00D1FF]/15 text-[#00D1FF] border-[#00D1FF]/40 shadow-sm shadow-[#00D1FF]/5"
                              : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {/* TRYHACKME ADAPTIVE PRACTICE ARENA CARD */}
                      <div className="flex flex-col justify-between rounded-2xl border border-dashed border-[#00D1FF]/40 bg-gradient-to-br from-[#00D1FF]/5 to-transparent p-5 hover:border-[#00d1ff] hover:shadow-lg transition tm-ring-glow sm:col-span-3">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                              <span className="text-[9px] uppercase font-bold text-cyan-400 tracking-wider">Cheksiz Mashg&apos;ulot</span>
                            </div>
                            <h4 className="text-base font-extrabold text-white mt-2 leading-snug">Cheksiz Kiber-Mashg&apos;ulot Arena ⚔️</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                              Tarmoqlar, Linux CLI, Veb-xavfsizlik, Kriptografiya va Kompyuter asoslari bo&apos;yicha **1000+ tasodifiy savollar** daryosi. Har bir to&apos;g&apos;ri yechilgan mashg&apos;ulot uchun **+50 XP** to&apos;plang va nishonlar oching!
                            </p>
                          </div>
                          
                          {/* Category selectors */}
                          <div className="flex flex-wrap gap-1.5 pt-2 md:pt-0">
                            {(["all", "networks", "linux", "web", "os"] as const).map((cat) => (
                              <button
                                key={cat}
                                onClick={() => {
                                  playClickSound();
                                  const adaptiveQuiz = generateAdaptiveQuiz(cat, 15);
                                  handleStartQuiz(adaptiveQuiz);
                                }}
                                className="px-2.5 py-1 bg-white/5 hover:bg-[#00D1FF]/20 hover:text-white rounded-lg border border-white/10 text-[10px] font-bold text-slate-300 transition uppercase cursor-pointer"
                              >
                                {cat === "all" ? "Barchasi" : cat === "networks" ? "Tarmoq" : cat === "linux" ? "Linux" : cat === "web" ? "Veb" : "Tizim"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {filteredQuizzes.length === 0 ? (
                        <div className="sm:col-span-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] py-12 text-center text-slate-500">
                          <p className="text-xs">Ushbu bo'limda hozircha testlar mavjud emas.</p>
                          <p className="text-[10px] text-slate-600 mt-1">Admin panel orqali yangi testlar qo'shishingiz mumkin.</p>
                        </div>
                      ) : (
                        filteredQuizzes.map((quiz) => {
                          const savedScore = completedQuizzes[quiz.id];
                          const isPassed = savedScore >= 80;
                          return (
                            <div key={quiz.id} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0c0f1e]/90 p-5 hover:border-pink-500/40 hover:shadow-lg transition tm-ring-glow">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] uppercase font-bold text-pink-400 tracking-wider">{quiz.category}</span>
                                  {savedScore !== undefined && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                      isPassed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                    }`}>{savedScore}%</span>
                                  )}
                                </div>
                                <h4 className="text-sm font-extrabold text-white mt-3 leading-snug">{quiz.title}</h4>
                                <p className="text-[10px] text-slate-500 mt-2 font-mono">Savollar: {quiz.questions.length} | Vaqt: {quiz.timeLimit}s</p>
                              </div>
                              
                              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">{isPassed ? "Muvaffaqiyatli topshirildi ✓" : "Topshirilmagan"}</span>
                                <button
                                  onClick={() => { playClickSound(); handleStartQuiz(quiz); }}
                                  className="px-3 py-1.5 bg-[#00D1FF] text-black text-xs font-bold rounded-lg hover:brightness-110 transition"
                                >
                                  {savedScore !== undefined ? "Qayta" : "Boshlash"}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Sertifikatlash tizimi vaqtincha olib tashlandi */}
                    {false && (
                      <div className="hidden" />
                    )}
                  </div>
                ) : (
                  
                  // Active quiz test arena
                  <div className="rounded-2xl border border-white/10 bg-[#0c0f20]/90 p-5 sm:p-8 space-y-6 tm-glow animate-fade-in">
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-pink-400 tracking-wider">Faol Test</span>
                        <h3 className="font-extrabold text-sm text-white mt-1">{activeQuiz.title}</h3>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 rounded-lg border border-rose-500/30 text-rose-400 font-mono text-xs">
                          <Clock className="h-3.5 w-3.5 animate-spin" /> {quizTimer} s.
                        </div>
                        <button onClick={() => { playClickSound(); setActiveQuiz(null); setQuizFinished(false); }} className="text-slate-400 hover:text-white text-xs font-bold">
                          Bekor qilish
                        </button>
                      </div>
                    </div>

                    {!quizFinished ? (
                      <div className="space-y-6">
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Savol: {currentQuestionIndex + 1} / {activeQuiz.questions.length}</span>
                            <span>To&apos;g&apos;ri: {quizScore} ta</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#00D1FF] to-[#6C63FF] transition-all duration-300"
                              style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="rounded-xl bg-white/[0.02] p-4 border border-white/5">
                          <h4 className="text-base sm:text-lg font-bold text-white leading-snug whitespace-pre-line">
                            {activeQuiz.questions[currentQuestionIndex].question}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {activeQuiz.questions[currentQuestionIndex].options.map((opt: string, idx: number) => {
                            const isSelected = selectedOptionIndex === idx;
                            const isCorrectAns = activeQuiz.questions[currentQuestionIndex].correct === idx;
                            
                            let btnStyle = "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300";
                            
                            if (isAnswerSubmitted) {
                              if (isCorrectAns) {
                                btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-400";
                              } else if (isSelected) {
                                btnStyle = "bg-rose-500/10 border-rose-500 text-rose-400";
                              } else {
                                btnStyle = "bg-white/[0.01] border-white/5 text-slate-600 opacity-60";
                              }
                            } else if (isSelected) {
                              btnStyle = "bg-cyan-500/15 border-[#00D1FF] text-white";
                            }

                            return (
                              <button
                                key={idx}
                                disabled={isAnswerSubmitted}
                                onClick={() => { playClickSound(); handleOptionSelect(idx); }}
                                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-xs sm:text-sm font-semibold transition ${btnStyle}`}
                              >
                                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                                  isSelected ? "bg-[#00D1FF] text-black border-[#00D1FF]" : "border-slate-500 text-slate-400"
                                }`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                          {isAnswerSubmitted && (
                            <div className="text-xs text-slate-400 leading-normal flex-1 max-w-lg">
                              <span className="font-bold text-white block">Tushuntirish:</span>
                              {activeQuiz.questions[currentQuestionIndex].explanation}
                            </div>
                          )}

                          <div className="w-full sm:w-auto text-right shrink-0 ml-auto">
                            {!isAnswerSubmitted ? (
                              <button
                                onClick={handleAnswerSubmit}
                                disabled={selectedOptionIndex === null}
                                className="w-full sm:w-auto px-5 py-3 bg-[#00D1FF] text-black text-xs font-bold rounded-lg hover:brightness-110 disabled:opacity-50 transition"
                              >
                                Javobni tasdiqlash
                              </button>
                            ) : (
                              <button
                                onClick={handleNextQuestion}
                                className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-[#00D1FF] to-[#6C63FF] text-[#0B0F1A] text-xs font-bold rounded-lg hover:brightness-115 transition"
                              >
                                {currentQuestionIndex < activeQuiz.questions.length - 1 ? "Keyingi savol &rarr;" : "Natijalar &rarr;"}
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ) : (
                      // Quiz finish results screen
                      <div className="text-center py-6 space-y-6">
                        <Trophy className="h-12 w-12 mx-auto text-yellow-500 animate-bounce" />
                        
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-white">Test yakunlandi!</h4>
                          <p className="text-xs text-slate-400">Sizning yakuniy natijangiz:</p>
                          <p className="text-4xl font-black text-transparent bg-gradient-to-r from-[#00D1FF] to-[#6C63FF] bg-clip-text">
                            {Math.round((quizScore / activeQuiz.questions.length) * 100)}%
                          </p>
                          <p className="text-xs text-slate-500">({activeQuiz.questions.length} tadan {quizScore} ta to&apos;g&apos;ri)</p>
                        </div>

                        <div className="max-w-md mx-auto p-4 rounded-xl border border-white/10 bg-white/[0.01] text-xs">
                          {Math.round((quizScore / activeQuiz.questions.length) * 100) >= 80 ? (
                            <p className="text-emerald-400 font-bold">
                              Ajoyib! Siz testdan muvaffaqiyatli o&apos;tdingiz va sertifikat generatorini ochdingiz (+150 PTS).
                            </p>
                          ) : (
                            <p className="text-rose-400 font-bold">
                              Afsuski, sertifikat uchun ball 80% dan yuqori bo&apos;lishi kerak. Darslarni qayta takrorlang!
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => { playClickSound(); handleStartQuiz(activeQuiz); }}
                            className="px-4 py-2.5 bg-white/5 border border-white/10 text-xs font-bold rounded-lg text-slate-300 hover:text-white"
                          >
                            Qayta yechish
                          </button>
                          <button
                            onClick={() => { playClickSound(); setActiveQuiz(null); setQuizFinished(false); }}
                            className="px-4 py-2.5 bg-[#00D1FF] text-black text-xs font-bold rounded-lg hover:brightness-110 transition"
                          >
                            Boshqa testlar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =======================================================
                TAB 5: CTF CYBER CHALLENGES ARENA
                ======================================================= */}
            {activeTab === "ctf" && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-[#0c0f1e]/90 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient from-pink-500/10 to-transparent blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-pink-500 animate-pulse" /> Capture The Flag (CTF Arena)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Kiber-arena mini-o&apos;yinlari va sandbox laboratoriyalarida amaliy xakerlik mahoratingizni sinab ko&apos;ring.
                    </p>
                  </div>
                  
                  {/* Competitive badge */}
                  <span className="rounded-full bg-pink-500/10 border border-pink-500/30 px-3 py-1 text-[10px] font-extrabold text-pink-400 tracking-wider shrink-0 select-none">
                    KIBER-sandbox v2.0
                  </span>
                </div>

                {/* Sub-tabs selectors */}
                <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-black/40 border border-white/5">
                  <button
                    onClick={() => { playClickSound(); setCtfSubTab("theory"); }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      ctfSubTab === "theory"
                        ? "bg-pink-600 text-white shadow-lg shadow-pink-500/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    🛡️ Hacking Topshiriqlari
                  </button>
                  <button
                    onClick={() => { playClickSound(); setCtfSubTab("sqli"); }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      ctfSubTab === "sqli"
                        ? "bg-pink-600 text-white shadow-lg shadow-pink-500/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    🔐 SQL Injection Sandbox
                  </button>
                  <button
                    onClick={() => { playClickSound(); setCtfSubTab("cipher"); }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      ctfSubTab === "cipher"
                        ? "bg-pink-600 text-white shadow-lg shadow-pink-500/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    💻 Shifr Terminali
                  </button>
                  <button
                    onClick={() => { playClickSound(); setCtfSubTab("nmap"); }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      ctfSubTab === "nmap"
                        ? "bg-pink-600 text-white shadow-lg shadow-pink-500/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    📡 Port Scanner & Exploit
                  </button>
                </div>

                {/* Sub-tab 1: Theory questions */}
                {ctfSubTab === "theory" && (
                  <div className="grid grid-cols-1 gap-6">
                    {CTF_CHALLENGES.map((ctf) => {
                      const isSolved = solvedCtfs.includes(ctf.id);
                      const feedback = ctfFeedback[ctf.id];
                      return (
                        <div 
                          key={ctf.id} 
                          className={`rounded-2xl border p-5 space-y-4 transition-all duration-300 ${
                            isSolved 
                              ? "border-emerald-500/30 bg-emerald-500/[0.02]" 
                              : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-3">
                            <div>
                              <h4 className="font-bold text-white flex items-center gap-2 text-xs sm:text-sm">
                                {isSolved ? "✅" : "🛡️"} {ctf.title}
                              </h4>
                              <p className="text-[9px] text-pink-400 font-bold uppercase mt-0.5 tracking-wider">Mukofot: +{ctf.points} PTS</p>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              isSolved ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                            }`}>
                              {isSolved ? "YECHILDI" : "FAOLLASHTIRILGAN"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {ctf.description}
                          </p>

                          {/* Interactive inputs */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                            <input
                              type="text"
                              placeholder={ctf.placeholder}
                              disabled={isSolved}
                              value={ctfAnswers[ctf.id] || ""}
                              onChange={(e) => setCtfAnswers({ ...ctfAnswers, [ctf.id]: e.target.value })}
                              onKeyDown={(e) => { if (e.key === "Enter" && !isSolved && (ctfAnswers[ctf.id] || "").trim()) handleSubmitCtf(ctf.id, ctf.correctFlag); }}
                              className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs font-mono text-[#00D1FF] outline-none focus:border-pink-500 transition"
                            />
                            <button
                              onClick={() => handleSubmitCtf(ctf.id, ctf.correctFlag)}
                              disabled={isSolved || !(ctfAnswers[ctf.id] || "").trim()}
                              className="px-5 py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shrink-0"
                            >
                              Taqdim etish (Submit Flag)
                            </button>
                          </div>

                          {/* Hints drawer */}
                          <details className="text-[10px] text-slate-500 cursor-pointer select-none">
                            <summary className="hover:text-slate-300 font-bold">Maslahat (Hint) olish &darr;</summary>
                            <p className="mt-2 font-sans text-amber-300/80 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 leading-relaxed">{ctf.hint}</p>
                          </details>

                          {/* Result warnings */}
                          {feedback === "success" && (
                            <div className="text-emerald-400 text-xs font-bold leading-normal animate-fade-in font-mono flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" /> To&apos;g&apos;ri Bayroq! Mukofot ochkolari va &quot;CTF Buzg&apos;unchisi&quot; nishoni ochildi! 🎉
                            </div>
                          )}
                          {feedback === "error" && (
                            <div className="text-rose-400 text-xs font-bold leading-normal animate-shake font-mono flex items-center gap-1">
                              <XCircle className="h-4 w-4" /> Noto&apos;g&apos;ri bayroq. Qayta tahlil qiling va hintga qarang.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Sub-tab 2: SQL Injection Sandbox */}
                {ctfSubTab === "sqli" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Visualizer - Left (6 columns) */}
                    <div className="lg:col-span-6 space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-[#0c0f1e]/90 p-5 shadow-2xl space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
                          SQL Query Visualizer & Logs
                        </h4>
                        
                        {/* Live Query box */}
                        <div className="rounded-xl border border-white/5 bg-black/60 p-4 font-mono text-xs text-cyan-400 shadow-inner space-y-1 relative overflow-hidden">
                          <span className="absolute right-2 top-2 text-[8px] font-bold text-slate-600 uppercase tracking-widest pointer-events-none">live sql string</span>
                          <div className="text-slate-500">-- Avtomatik shakllanadigan SQL so&apos;rovi:</div>
                          <div className="leading-relaxed">
                            <span className="text-pink-400">SELECT</span> * <span className="text-pink-400">FROM</span> users <span className="text-pink-400">WHERE</span> username = <span className="text-emerald-400">&apos;{sqlUsername || "admin"}&apos;</span> <span className="text-pink-400">AND</span> password = <span className="text-emerald-400">&apos;{sqlPassword || "••••••••"}&apos;</span>;
                          </div>
                        </div>

                        {/* Terminal Logs */}
                        <div className="rounded-xl border border-white/5 bg-black/80 p-4 h-[200px] overflow-y-auto font-mono text-[10px] text-emerald-400 space-y-1.5 shadow-inner">
                          {sqlConsoleLogs.length === 0 ? (
                            <div className="text-slate-600 italic">Baza aloqa oynasi bo&apos;sh. Payload yuboring...</div>
                          ) : (
                            sqlConsoleLogs.map((log, idx) => {
                              let c = "text-emerald-400";
                              if (log.startsWith("[-]")) c = "text-rose-400 animate-shake";
                              else if (log.startsWith("[+]") || log.startsWith("[DUMP]")) c = "text-cyan-400 font-bold";
                              else if (log.startsWith("[FLAG]")) c = "text-yellow-400 font-extrabold animate-pulse";
                              return (
                                <div key={idx} className={`${c} leading-normal`}>
                                  {log}
                                </div>
                              );
                            })
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => { playClickSound(); setSqlConsoleLogs([]); }}
                            className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[10px] font-bold text-slate-400 transition"
                          >
                            Tozalash
                          </button>
                          <button
                            onClick={() => {
                              playClickSound();
                              setSqlUsername("");
                              setSqlPassword("");
                              setSqlBypassed(false);
                              setSqlDatabaseDumped(false);
                              setSqlConsoleLogs(["[i] Sandbox qayta yuklandi."]);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[10px] font-bold text-slate-400 transition"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Admin Portal Form - Right (6 columns) */}
                    <div className="lg:col-span-6">
                      <div className="rounded-2xl border border-white/10 bg-[#0c0f1e]/90 p-5 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-cyan-500/5 to-transparent blur-2xl pointer-events-none" />
                        
                        <div className="border-b border-white/5 pb-3">
                          <h4 className="font-bold text-white flex items-center gap-2 text-xs sm:text-sm">
                            🔐 Maxfiy Baza Ma&apos;muriyati (Admin Portal)
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                            Maqsad: Login formasini SQLi orqali aylanib o&apos;tib, admin huquqiga ega bo&apos;ling yoki database dump qiling.
                          </p>
                        </div>

                        {sqlBypassed ? (
                          <div className="space-y-4 animate-scale-up">
                            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center justify-center text-center gap-2">
                              <CheckCircle className="h-10 w-10 text-emerald-400 animate-pulse" />
                              <div className="text-xs font-black text-white uppercase tracking-wider font-mono">TIZIM BUZILDI! ADMIN HUQUQI OLINDI</div>
                              <div className="text-[10px] text-slate-400 font-mono space-y-1">
                                <div>Foydalanuvchi: admin (Super Admin)</div>
                                <div>Kirish usuli: SQL Injection Bypass</div>
                                <div>Siz kiritgan payload: <span className="text-cyan-400 font-bold">{sqlUsername}</span></div>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl border border-white/5 bg-black/40 space-y-3">
                              <div className="text-[10px] text-slate-400 leading-relaxed font-sans">
                                Kirish muvaffaqiyatli amalga oshirildi. Endi siz bazadagi barcha maxfiy ma&apos;lumotlarni (database dump) yuklab olishingiz mumkin.
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    playClickSound();
                                    playChimeSound();
                                    setSqlDatabaseDumped(true);
                                    setSqlConsoleLogs((prev) => [
                                      ...prev,
                                      "[DUMP] 'secrets' jadvali yuklanmoqda...",
                                      "[DUMP] Column 1: id, Column 2: flag_code",
                                      "[DUMP] Row 1: id=1, flag_code=THM{sqli_union_database_dump_2026}",
                                      "[FLAG] Buzzing! Flag topildi: THM{sqli_union_database_dump_2026}"
                                    ]);
                                  }}
                                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg transition"
                                >
                                  📥 Maxfiy Bazani Yuklash (Dump secrets)
                                </button>
                                
                                {solvedCtfs.includes("ctf-2") ? (
                                  <span className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg shrink-0 flex items-center justify-center">
                                    ✓ Topshirildi
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      handleSubmitCtf("ctf-2", "' OR 1=1 --");
                                    }}
                                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-lg transition shrink-0"
                                  >
                                    ⚡ CTF Ochkosini Yig&apos;ish (+150 PTS)
                                  </button>
                                )}
                              </div>
                            </div>

                            {sqlDatabaseDumped && (
                              <div className="p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-300 text-xs leading-relaxed animate-fade-in font-sans">
                                <strong>Kiber-Bayroq topildi!</strong> <code className="font-mono text-yellow-400 font-bold bg-black/40 px-1 rounded">THM{`{sqli_union_database_dump_2026}`}</code>. Ushbu bayroqni saqlab oling.
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Foydalanuvchi nomi (Username)</label>
                              <input
                                type="text"
                                value={sqlUsername}
                                onChange={(e) => setSqlUsername(e.target.value)}
                                placeholder="Foydalanuvchi nomi yoki SQL payload..."
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition focus:border-pink-500 font-mono"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maxfiy kalit (Password)</label>
                              <input
                                type="password"
                                value={sqlPassword}
                                onChange={(e) => setSqlPassword(e.target.value)}
                                placeholder="Parol kiriting..."
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition focus:border-pink-500"
                              />
                            </div>

                            <button
                              onClick={() => {
                                playClickSound();
                                setSqlConsoleLogs((prev) => [
                                  ...prev,
                                  "[*] Ulanish so'rovi yuborilmoqda...",
                                  `[*] So'rov: SELECT * FROM users WHERE username = '${sqlUsername || "admin"}' AND password = '${sqlPassword || "••••••••"}';`
                                ]);
                                
                                setTimeout(() => {
                                  const trimmedUser = sqlUsername.trim();
                                  if (trimmedUser.includes("' OR 1=1 --") || trimmedUser.includes("' OR '1'='1") || trimmedUser.includes("' OR 1=1")) {
                                    playChimeSound();
                                    setSqlBypassed(true);
                                    setSqlConsoleLogs((prev) => [
                                      ...prev,
                                      "[+] MUVAFFAQIYATLI! SQL mantiqiy aylanib o'tish (Bypass) muvaffaqiyatli.",
                                      "[+] Ma'muriyat paneli ochilmoqda...",
                                      "[FLAG] Buzib kirildi! Super admin huquqlari berildi."
                                    ]);
                                  } else if (trimmedUser.toLowerCase().includes("union select") && trimmedUser.toLowerCase().includes("secrets")) {
                                    playChimeSound();
                                    setSqlBypassed(true);
                                    setSqlDatabaseDumped(true);
                                    setSqlConsoleLogs((prev) => [
                                      ...prev,
                                      "[+] MUVAFFAQIYATLI! UNION in'eksiyasi aniqlandi.",
                                      "[DUMP] secrets jadvalidan flag chiqarildi: THM{sqli_union_database_dump_2026}"
                                    ]);
                                  } else {
                                    playBuzzSound();
                                    setSqlConsoleLogs((prev) => [
                                      ...prev,
                                      "[-] XATO! Noto'g'ri login paroli yoki nofaol foydalanuvchi.",
                                      "[-] SQL Execution output: 0 rows affected."
                                    ]);
                                  }
                                }, 800);
                              }}
                              className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl transition duration-200"
                            >
                              ⚡ Tizimga Kirish (Execute Exploit)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* Sub-tab 3: Cipher Decryption Console */}
                {ctfSubTab === "cipher" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Retro CRT Shell Console - Left (7 columns) */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-[#0c0f1e]/90 p-5 shadow-2xl relative">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
                          Kiber Shifr Terminali Emulator
                        </h4>
                        
                        {/* CRT Screen */}
                        <div className="rounded-xl border border-emerald-500/20 bg-black p-4 h-[300px] overflow-y-auto font-mono text-xs text-emerald-400 space-y-1.5 shadow-[inset_0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden group">
                          {/* Scanlines layer */}
                          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.12)_50%,rgba(0,0,0,0.12))] bg-[size:100%_4px]" />
                          
                          <div className="relative z-10 space-y-1">
                            {cipherConsoleLogs.map((log, idx) => (
                              <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive CLI Input */}
                        <div className="flex gap-2 pt-3">
                          <div className="text-emerald-500 font-mono text-xs pt-3 pl-1">$</div>
                          <input
                            type="text"
                            value={cipherCommandInput}
                            onChange={(e) => setCipherCommandInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && cipherCommandInput.trim()) {
                                playClickSound();
                                const input = cipherCommandInput.trim();
                                setCipherConsoleLogs((prev) => [...prev, `$ ${input}`]);
                                setCipherCommandInput("");
                                
                                // Command parser logic
                                setTimeout(() => {
                                  const parts = input.split(" ");
                                  const cmd = parts[0].toLowerCase();
                                  
                                  if (cmd === "help") {
                                    setCipherConsoleLogs((prev) => [
                                      ...prev,
                                      "Mavjud terminal buyruqlari listi:",
                                      "  base64 -d [matn]                 - Base64 matnini dekodlash",
                                      "  rot13 [matn]                     - ROT13 kodini dekodlash/shifrlash",
                                      "  caesar -d [matn] [siljish]        - Sezar shifrini qayta hisoblash",
                                      "  clear                            - Ekranni tozalash"
                                    ]);
                                  } else if (cmd === "clear") {
                                    setCipherConsoleLogs([]);
                                  } else if (cmd === "base64" && parts[1] === "-d" && parts[2]) {
                                    const target = parts[2];
                                    try {
                                      const dec = atob(target);
                                      setCipherConsoleLogs((prev) => [...prev, `[BASE64 DECODED]: ${dec}`]);
                                    } catch (err) {
                                      setCipherConsoleLogs((prev) => [...prev, "[-] Xato: base64 satri noto'g'ri kodlangan."]);
                                    }
                                  } else if (cmd === "rot13" && parts[1]) {
                                    const target = parts[1];
                                    const dec = target.replace(/[a-zA-Z]/g, (c) => {
                                      const base = c <= 'Z' ? 65 : 97;
                                      return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base);
                                    });
                                    setCipherConsoleLogs((prev) => [...prev, `[ROT13 OUT]: ${dec}`]);
                                  } else if (cmd === "caesar" && parts[1] === "-d" && parts[2]) {
                                    const target = parts[2];
                                    const shift = parseInt(parts[3] || "3", 10);
                                    
                                    const dec = target.split('').map((char) => {
                                      const code = char.charCodeAt(0);
                                      if (code >= 65 && code <= 90) {
                                        return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
                                      }
                                      if (code >= 97 && code <= 122) {
                                        return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
                                      }
                                      return char;
                                    }).join('');
                                    
                                    setCipherConsoleLogs((prev) => [...prev, `[CAESAR OUT (shift=${shift})]: ${dec}`]);
                                  } else {
                                    setCipherConsoleLogs((prev) => [...prev, `-bash: ${cmd}: command not found. Type 'help' to see list.`]);
                                  }
                                }, 200);
                              }
                            }}
                            placeholder="Buyruq yozing (masalan: help, clear, base64 -d VEVYTk8=)..."
                            className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none transition font-mono focus:border-pink-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Challenges List - Right (5 columns) */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-[#0c0f1e]/90 p-5 shadow-2xl space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
                          Mavjud Shifr Topshiriqlari
                        </h4>

                        <div className="space-y-3">
                          {/* Caesar challenge */}
                          <div 
                            onClick={() => { playClickSound(); setCipherActiveChallenge(0); }}
                            className={`p-3 rounded-xl border transition cursor-pointer ${
                              cipherActiveChallenge === 0 
                                ? "border-pink-500/40 bg-white/[0.03]" 
                                : "border-white/5 bg-transparent hover:bg-white/[0.01]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-pink-400">1-Shifr (Caesar)</span>
                              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded">100 PTS</span>
                            </div>
                            <h5 className="text-xs font-bold text-white mt-1">Sezar shifrini yechish</h5>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">Shifrlangan so&apos;z: DBSB (Shift 1)</p>
                          </div>

                          {/* Base64 challenge */}
                          <div 
                            onClick={() => { playClickSound(); setCipherActiveChallenge(1); }}
                            className={`p-3 rounded-xl border transition cursor-pointer ${
                              cipherActiveChallenge === 1 
                                ? "border-pink-500/40 bg-white/[0.03]" 
                                : "border-white/5 bg-transparent hover:bg-white/[0.01]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-pink-400">2-Shifr (Base64)</span>
                              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded">Bonus Challenge</span>
                            </div>
                            <h5 className="text-xs font-bold text-white mt-1">Base64 Dekodlash</h5>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">Shifrlangan so&apos;z: VEVYTk8gTUFSS0Fa</p>
                          </div>

                          {/* ROT13 challenge */}
                          <div 
                            onClick={() => { playClickSound(); setCipherActiveChallenge(2); }}
                            className={`p-3 rounded-xl border transition cursor-pointer ${
                              cipherActiveChallenge === 2 
                                ? "border-pink-500/40 bg-white/[0.03]" 
                                : "border-white/5 bg-transparent hover:bg-white/[0.01]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-pink-400">3-Shifr (ROT13)</span>
                              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded">Bonus Challenge</span>
                            </div>
                            <h5 className="text-xs font-bold text-white mt-1">ROT13 shifrini buzish</h5>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">Shifrlangan so&apos;z: KPBER_CEY</p>
                          </div>
                        </div>

                        {/* Selected challenge instructions & answer submit */}
                        <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-3">
                          {cipherActiveChallenge === 0 && (
                            <>
                              <div className="text-[10.5px] text-slate-300 leading-normal">
                                <strong>Vazifa:</strong> <code className="text-cyan-400 font-mono">DBSB</code> satrini Caesar-d 1 koeffitsiyent bilan terminalda dekodlang yoki yechimini topshiring.
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={cipherAnswerInput}
                                  onChange={(e) => setCipherAnswerInput(e.target.value)}
                                  placeholder="Yechilgan javobni yozing..."
                                  className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-700 outline-none"
                                />
                                <button
                                  onClick={() => {
                                    if (cipherAnswerInput.trim().toUpperCase() === "CYBER") {
                                      handleSubmitCtf("ctf-1", "CYBER");
                                      setCipherAnswerInput("");
                                    } else {
                                      playBuzzSound();
                                      setCipherConsoleLogs((prev) => [...prev, "[-] Xato javob. Qaytadan urinib ko'ring."]);
                                    }
                                  }}
                                  className="px-3 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-lg transition"
                                >
                                  Topshirish
                                </button>
                              </div>
                            </>
                          )}

                          {cipherActiveChallenge === 1 && (
                            <>
                              <div className="text-[10.5px] text-slate-300 leading-normal">
                                Vazifa: <code className="text-cyan-400 font-mono">Q1lCRVIgVEVDSCBBQ0FERU1Z</code> satrini terminalda <code className="text-pink-400">base64 -d Q1lCRVIgVEVDSCBBQ0FERU1Z</code> buyrug&apos;i orqali yeching va javobni kiriting.
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={cipherAnswerInput}
                                  onChange={(e) => setCipherAnswerInput(e.target.value)}
                                  placeholder="Yechilgan javobni yozing..."
                                  className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-700 outline-none"
                                  id="cipher-challenge-input"
                                />
                                <button
                                  onClick={() => {
                                    if (cipherAnswerInput.trim().toUpperCase() === "CYBER TECH ACADEMY") {
                                      playChimeSound();
                                      setCipherConsoleLogs((prev) => [...prev, "[+] Tabriklaymiz! Base64 topshirig'i muvaffaqiyatli yechildi!"]);
                                      setCipherAnswerInput("");
                                    } else {
                                      playBuzzSound();
                                      setCipherConsoleLogs((prev) => [...prev, "[-] Xato javob. Qaytadan urinib ko'ring."]);
                                    }
                                  }}
                                  className="px-3 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-lg transition"
                                >
                                  Topshirish
                                </button>
                              </div>
                            </>
                          )}

                          {cipherActiveChallenge === 2 && (
                            <>
                              <div className="text-[10.5px] text-slate-300 leading-normal">
                                <strong>Vazifa:</strong> <code className="text-cyan-400 font-mono">KPBER_CEY</code> satrini terminalda <code className="text-pink-400">rot13 KPBER_CEY</code> buyrug&apos;i orqali yeching va javobni topshiring.
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={cipherAnswerInput}
                                  onChange={(e) => setCipherAnswerInput(e.target.value)}
                                  placeholder="Yechilgan javobni yozing..."
                                  className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-700 outline-none"
                                />
                                <button
                                  onClick={() => {
                                    if (cipherAnswerInput.trim().toUpperCase() === "XCORE_PEL") {
                                      playChimeSound();
                                      setCipherConsoleLogs((prev) => [...prev, "[+] Tabriklaymiz! ROT13 topshirig'i muvaffaqiyatli yechildi!"]);
                                      setCipherAnswerInput("");
                                    } else {
                                      playBuzzSound();
                                      setCipherConsoleLogs((prev) => [...prev, "[-] Xato javob. Qaytadan urinib ko'ring."]);
                                    }
                                  }}
                                  className="px-3 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-lg transition"
                                >
                                  Topshirish
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                      </div>
                    </div>

                  </div>
                )}

                {/* Sub-tab 4: Vulnerability Port Scanner */}
                {ctfSubTab === "nmap" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Scanner configuration - Left (5 columns) */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-[#0c0f1e]/90 p-5 shadow-2xl space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
                          📡 Nmap Skanerlash Panel
                        </h4>

                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hujum IP Manzili (Target IP)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={nmapTargetIp}
                              onChange={(e) => setNmapTargetIp(e.target.value)}
                              placeholder="Masalan: 10.10.23.45"
                              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none transition font-mono focus:border-pink-500"
                            />
                            <button
                              onClick={() => {
                                if (!nmapTargetIp.trim()) {
                                  playBuzzSound();
                                  return;
                                }
                                playClickSound();
                                setNmapScanning(true);
                                setNmapLogs([]);
                                setNmapExploited(false);
                                
                                const lines = [
                                  "[i] Tarmoq skaneri ishga tushirilmoqda...",
                                  `[*] Skanerlanayotgan host: ${nmapTargetIp}`,
                                  "[*] Portlarni tahlil qilish: 1-10000 portlar...",
                                  "[!] Ochiq portlar aniqlandi:",
                                  "    - Port 22: SSH (OpenSSH 7.2p2 - Vulnerable!)",
                                  "    - Port 80: HTTP (Apache 2.4.18 - Active)",
                                  "    - Port 4444: krb5 (Simulated Backdoor - Vulnerable!)",
                                  "[+] Skanerlash yakunlandi. Zaif backdoor porti topildi: 4444."
                                ];
                                
                                lines.forEach((line, index) => {
                                  setTimeout(() => {
                                    playSynthesizedTone([600 + index * 50], 0.05, "sine");
                                    setNmapLogs((prev) => [...prev, line]);
                                    if (index === lines.length - 1) {
                                      setNmapScanning(false);
                                    }
                                  }, (index + 1) * 500);
                                });
                              }}
                              disabled={nmapScanning || !nmapTargetIp.trim()}
                              className="px-4 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition duration-200 shrink-0"
                            >
                              {nmapScanning ? "Skanerlanmoqda..." : "Scan IP"}
                            </button>
                          </div>
                          
                          <div className="text-[10px] text-slate-500 leading-normal">
                            Maslahat: Tarmoqdagi eng zaif server deb aniqlangan <code 
                              onClick={() => setNmapTargetIp("10.10.23.45")}
                              className="text-cyan-400 underline cursor-pointer font-mono"
                            >10.10.23.45</code> IP manzilini kiriting.
                          </div>
                        </div>

                        {/* Exploit remote backdoor connection */}
                        {nmapLogs.some(line => line.includes("Backdoor")) && (
                          <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-4 animate-scale-up">
                            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-yellow-400" /> Backdoor Ekspluatatsiyasi
                            </h5>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                              Nmap orqali serverning 4444-portida faol zaif backdoor aniqlandi. Ushbu zaiflikdan foydalanib, masofaviy root ruxsatini qo&apos;lga kiriting.
                            </p>

                            {nmapExploited ? (
                              <div className="space-y-3">
                                <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-center text-xs text-emerald-400 font-mono font-bold animate-pulse">
                                  ✓ ROOT TERMINAL ULASH SHESS-1 OCHILDI
                                </div>
                                {solvedCtfs.includes("ctf-3") ? (
                                  <span className="w-full py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg flex items-center justify-center">
                                    ✓ Kiber topshiriq bajarildi!
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      handleSubmitCtf("ctf-3", "THM{nmap_port_backdoor_exploit_2026}");
                                    }}
                                    className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-lg transition"
                                  >
                                    ⚡ CTF Bayrog&apos;ini Topsirish (+200 PTS)
                                  </button>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  playClickSound();
                                  setNmapExploitProgress(true);
                                  
                                  const exploitLogs = [
                                    "[~] Serverga 10.10.23.45:4444 orqali bog'lanilmoqda...",
                                    "[~] Ekspluatatsiya paketi yuborilmoqda (buffer overflow)...",
                                    "[+] Backdoor sindirildi! SSH terminal aloqasi o'rnatildi.",
                                    "[+] Maxfiy flag yuklandi: THM{nmap_port_backdoor_exploit_2026}"
                                  ];
                                  
                                  exploitLogs.forEach((line, index) => {
                                    setTimeout(() => {
                                      playSynthesizedTone([800 - index * 100], 0.08, "triangle");
                                      setNmapLogs((prev) => [...prev, line]);
                                      if (index === exploitLogs.length - 1) {
                                        setNmapExploitProgress(false);
                                        setNmapExploited(true);
                                        playChimeSound();
                                      }
                                    }, (index + 1) * 800);
                                  });
                                }}
                                disabled={nmapExploitProgress}
                                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg transition"
                              >
                                {nmapExploitProgress ? "Ekspluatatsiya yuborilmoqda..." : "⚡ Zaiflikni Ekspluatatsiya qilish"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Console Logs - Right (7 columns) */}
                    <div className="lg:col-span-7">
                      <div className="rounded-2xl border border-white/10 bg-[#0c0f1e]/90 p-5 shadow-2xl space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
                          Port Scanner Console Output
                        </h4>

                        <div className="rounded-xl border border-white/5 bg-black/80 p-4 h-[320px] overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-1.5 shadow-inner">
                          {nmapLogs.length === 0 ? (
                            <div className="text-slate-600 italic">Console ready. Input target IP and click scan.</div>
                          ) : (
                            nmapLogs.map((log, idx) => {
                              let c = "text-emerald-400";
                              if (log.startsWith("[-]")) c = "text-rose-400";
                              else if (log.startsWith("[+]") || log.startsWith("[!]") || log.startsWith("[DUMP]")) c = "text-cyan-400 font-bold";
                              return (
                                <div key={idx} className={`${c} leading-relaxed`}>
                                  {log}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* =======================================================
                TAB 6: PESHQADAMLAR GLOBAL LEADERBOARD
                ======================================================= */}
            {activeTab === "leaderboard" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500 animate-pulse" style={{ color: themeColors.solid }} /> Global Peshqadamlar (Leaderboard)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Barcha testlardan va kiber topshiriqlardan to&apos;plangan ochkolar bo&apos;yicha reyting jadvali.
                  </p>
                </div>

                {!user ? (
                  /* Lock screen for guest users */
                  <div className="rounded-3xl border border-dashed border-[#00d1ff]/20 bg-[#0c0f1e]/90 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden max-w-xl mx-auto shadow-2xl animate-success-pop">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,99,255,0.05),transparent)]" />
                    <div className="relative space-y-4">
                      <div className="h-16 w-16 mx-auto rounded-full bg-[#00D1FF]/10 flex items-center justify-center border border-[#00D1FF]/30 text-[#00D1FF] animate-bounce">
                        <Lock className="h-7 w-7" />
                      </div>
                      <h4 className="text-lg font-black text-white">Gmail Orqali Kirish Majburiy</h4>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                        Global peshqadamlar jadvalida ishtirok etish va boshqa talabalarning reytingini ko&apos;rish uchun faqat Gmail orqali tizimga kirgan foydalanuvchilar qabul qilinadi.
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={handleGoogleLogin}
                          className="mx-auto inline-flex items-center gap-2 rounded-xl bg-white text-black px-6 py-3.5 text-xs font-black shadow-lg shadow-white/5 hover:brightness-110 transition duration-300"
                        >
                          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-4.5 w-4.5" alt="Google" />
                          Gmail orqali kirish va Reytingga qo&apos;shilish
                        </button>
                      </div>
                    </div>
                  </div>
                ) : dbConnectionError ? (
                  <div className="rounded-3xl border border-dashed border-[#00d1ff]/20 bg-[#0c0f1e]/90 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden max-w-2xl mx-auto shadow-2xl animate-success-pop">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,209,255,0.04),transparent)]" />
                    <div className="relative space-y-4">
                      <div className="h-16 w-16 mx-auto rounded-full bg-[#00D1FF]/10 flex items-center justify-center border border-[#00D1FF]/30 text-[#00D1FF]">
                        <Database className="h-7 w-7 animate-pulse" />
                      </div>
                      <h4 className="text-lg font-black text-white">Ma&apos;lumotlar Bazasi Jadvallari Sozlanmagan</h4>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                        Tizim reytinglari, testlari va bulutli sinxronlash to&apos;liq ishlashi uchun Supabase loyihangizda tegishli ma&apos;lumotlar bazasi jadvallarini yaratishingiz kerak.
                      </p>
                      
                      <div className="text-left space-y-2 max-w-md mx-auto">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Bosqichma-bosqich ko&apos;rsatma:</span>
                        <ol className="text-[11px] text-slate-400 list-decimal list-inside space-y-1.5 font-sans leading-relaxed">
                          <li>O&apos;z Supabase boshqaruv panelingizga kiring (supabase.com).</li>
                          <li>Chap menyudan <strong>SQL Editor</strong> bo&apos;limini tanlang.</li>
                          <li><strong>New Query</strong> tugmasini bosing.</li>
                          <li>Quyidagi SQL kodini ko&apos;chirib, muharrirga joylashtiring va <strong>Run</strong> tugmasini bosing.</li>
                        </ol>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={handleCopySql}
                          className={`w-full max-w-md py-3.5 px-6 rounded-xl text-xs font-black transition ${
                            sqlCopied 
                              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                              : "bg-[#00D1FF] text-black hover:brightness-110 shadow-lg shadow-[#00D1FF]/10"
                          }`}
                        >
                          {sqlCopied ? "✓ SQL Script Nusxalandi!" : "SQL Scriptni Nusxalash (Copy SQL)"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : dbRankingsLoading && rankings.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 font-mono animate-pulse">
                    Peshqadamlar jadvali yuklanmoqda...
                  </div>
                ) : (
                  <>
                    {/* 3D Visual Podium for Top 3 */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end justify-center py-8 px-2 sm:px-6 rounded-3xl border border-[#00d1ff]/15 bg-gradient-to-b from-[#0e1630] to-[#0b0f1a] relative overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(108,99,255,0.06),transparent)]" />
                      
                      {/* 2nd Place - Left */}
                      {rankings[1] && (
                        <div className="flex flex-col items-center justify-end text-center group animate-fade-in order-1">
                          <div className="relative mb-3 flex flex-col items-center">
                            <div className="absolute -top-6 text-slate-300 text-lg">🥈</div>
                            {rankings[1].avatar ? (
                              <img src={rankings[1].avatar} alt="" className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.3)] group-hover:scale-105 transition duration-300" />
                            ) : (
                              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-slate-300/10 border-2 border-slate-300 flex items-center justify-center text-slate-200 font-bold text-sm sm:text-base group-hover:scale-105 transition duration-300">
                                {rankings[1].name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="absolute -bottom-2 bg-slate-400 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-mono">2-O&apos;rin</span>
                          </div>
                          
                          <div className="h-28 w-20 sm:w-28 rounded-t-2xl border border-slate-300/30 bg-gradient-to-b from-slate-400/10 to-slate-400/5 p-3 flex flex-col justify-between shadow-xl">
                            <div className="mt-1">
                              <p className="text-[10px] sm:text-xs font-bold text-slate-200 truncate max-w-full">{rankings[1].name.split(" ")[0]}</p>
                              <p className="text-[9px] sm:text-xs font-extrabold text-slate-400 mt-1 font-mono">{rankings[1].points} PTS</p>
                            </div>
                            <div className="h-2 bg-slate-400/40 rounded-full w-full mx-auto" />
                          </div>
                        </div>
                      )}

                      {/* 1st Place - Center */}
                      {rankings[0] && (
                        <div className="flex flex-col items-center justify-end text-center group animate-fade-in order-2 scale-105 sm:scale-110 z-10">
                          <div className="relative mb-4 flex flex-col items-center">
                            <div className="absolute -top-7 text-yellow-400 text-2xl animate-bounce">👑</div>
                            {rankings[0].avatar ? (
                              <img src={rankings[0].avatar} alt="" className="h-14 w-14 sm:h-20 sm:w-20 rounded-full border-2 border-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.5)] group-hover:scale-105 transition duration-300" />
                            ) : (
                              <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-yellow-400/10 border-2 border-yellow-400 flex items-center justify-center text-yellow-300 font-bold text-base sm:text-lg group-hover:scale-105 transition duration-300">
                                {rankings[0].name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="absolute -bottom-2 bg-yellow-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-mono">Chempion</span>
                          </div>
                          
                          <div className="h-36 w-24 sm:w-32 rounded-t-2xl border-2 border-yellow-400/40 bg-gradient-to-b from-yellow-400/20 to-yellow-400/5 p-4 flex flex-col justify-between shadow-2xl relative">
                            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(234,179,8,0.15),transparent)] rounded-t-2xl" />
                            <div className="mt-1 relative z-10">
                              <p className="text-[11px] sm:text-sm font-black text-yellow-100 truncate max-w-full">{rankings[0].name.split(" ")[0]}</p>
                              <p className="text-[10px] sm:text-xs font-black text-yellow-400 mt-1 font-mono">{rankings[0].points} PTS</p>
                            </div>
                            <div className="h-2.5 bg-yellow-400/40 rounded-full w-full mx-auto relative z-10" />
                          </div>
                        </div>
                      )}

                      {/* 3rd Place - Right */}
                      {rankings[2] && (
                        <div className="flex flex-col items-center justify-end text-center group animate-fade-in order-3">
                          <div className="relative mb-3 flex flex-col items-center">
                            <div className="absolute -top-6 text-amber-600 text-lg">🥉</div>
                            {rankings[2].avatar ? (
                              <img src={rankings[2].avatar} alt="" className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.3)] group-hover:scale-105 transition duration-300" />
                            ) : (
                              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-amber-600/10 border-2 border-amber-600 flex items-center justify-center text-amber-500 font-bold text-sm sm:text-base group-hover:scale-105 transition duration-300">
                                {rankings[2].name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="absolute -bottom-2 bg-amber-600 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-mono">3-O&apos;rin</span>
                          </div>
                          
                          <div className="h-24 w-20 sm:w-28 rounded-t-2xl border border-amber-600/30 bg-gradient-to-b from-amber-600/10 to-amber-600/5 p-3 flex flex-col justify-between shadow-xl">
                            <div className="mt-1">
                              <p className="text-[10px] sm:text-xs font-bold text-slate-200 truncate max-w-full">{rankings[2].name.split(" ")[0]}</p>
                              <p className="text-[9px] sm:text-xs font-extrabold text-amber-500 mt-1 font-mono">{rankings[2].points} PTS</p>
                            </div>
                            <div className="h-2 bg-amber-600/40 rounded-full w-full mx-auto" />
                          </div>
                        </div>
                      )}

                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0c0f1e]/90 overflow-hidden shadow-2xl">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm text-slate-300">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-bold text-slate-500 uppercase tracking-wider">
                              <th className="px-6 py-4">O&apos;rin</th>
                              <th className="px-6 py-4">O&apos;quvchi</th>
                              <th className="px-6 py-4 text-right">Ochkolar (PTS)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-mono">
                            {rankings.map((student, rIdx) => (
                              <tr 
                                key={rIdx} 
                                className={`transition ${
                                  student.isActive 
                                    ? `bg-gradient-to-r ${themeColors.gradient} ${themeColors.text} font-bold` 
                                    : "hover:bg-white/[0.01]"
                                }`}
                              >
                                <td className="px-6 py-4">
                                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                                    rIdx === 0 
                                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" 
                                      : rIdx === 1 
                                      ? "bg-slate-300/20 text-slate-300 border border-slate-300/30" 
                                      : rIdx === 2 
                                      ? "bg-amber-600/20 text-amber-500 border border-amber-600/30" 
                                      : "text-slate-500"
                                  }`}>
                                    {rIdx + 1}
                                  </span>
                                </td>
                                <td className="px-6 py-4 flex items-center gap-3">
                                  {student.avatar ? (
                                    <img src={student.avatar} alt="" className="h-8 w-8 rounded-full border border-[#00D1FF]/40" />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                                      {student.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <span className="truncate max-w-[150px] sm:max-w-xs">{student.name}</span>
                                </td>
                                <td className={`px-6 py-4 text-right font-extrabold ${
                                  student.isActive ? themeColors.text : "text-slate-400"
                                }`}>
                                  {student.points} PTS
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* =======================================================
                TAB 7: PROFIL VA SOZLAMALAR PANEL
                ======================================================= */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-fade-in">

                {/* Page title */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${themeColors.solid}22`, border: `1px solid ${themeColors.solid}44` }}>
                    <User className="h-5 w-5" style={{ color: themeColors.solid }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Mening Profilim</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Shaxsiy ma&apos;lumotlar va o&apos;quv natijalari</p>
                  </div>
                </div>

                {/* Avatar + Name card */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c0f1e] to-[#10082a] p-6">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl animate-glow-pulse" style={{ background: `${themeColors.solid}18` }} />
                  <div className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full blur-2xl opacity-50" style={{ background: `${themeColors.solid}10` }} />

                  <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {user?.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Avatar"
                          className="h-20 w-20 rounded-full object-cover"
                          style={{ border: `2px solid ${themeColors.solid}`, boxShadow: `0 0 20px ${themeColors.solid}55` }}
                        />
                      ) : (
                        <div
                          className="h-20 w-20 rounded-full flex items-center justify-center text-3xl font-black text-black"
                          style={{ background: `linear-gradient(135deg, ${themeColors.solid}, #6c63ff)` }}
                        >
                          {user ? user.email?.charAt(0).toUpperCase() : "?"}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-[#0c0f1e] flex items-center justify-center" style={{ background: user ? "#22c55e" : "#f59e0b" }}>
                        <span className="h-2 w-2 rounded-full bg-white block" />
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
                      <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full" style={{ background: `${themeColors.solid}18`, color: themeColors.solid, border: `1px solid ${themeColors.solid}44` }}>
                        {user ? "Gmail • Tasdiqlangan" : "Mehmon foydalanuvchi"}
                      </span>
                      <h4 className="text-xl font-black text-white truncate mt-1">
                        {studentName || (user ? user.user_metadata?.full_name : "Mehmon")}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono truncate">{user ? user.email : "Tizimga kirilmagan"}</p>

                      {/* Points row */}
                      <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                        <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-black/30 border border-white/5">
                          <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                          <span className="text-xs font-bold text-yellow-400">{userPoints} PTS</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-black/30 border border-white/5">
                          <Award className="h-3.5 w-3.5 text-purple-400" />
                          <span className="text-xs font-bold text-purple-400">{unlockedBadges.length} nishon</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-black/30 border border-white/5">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400">{Object.keys(completedQuizzes).length} test</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name editor */}
                <div className="rounded-2xl border border-white/10 bg-[#0c0f1e]/90 p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: themeColors.solid }} />
                    Ismni tahrirlash
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="To'liq ism-familiya..."
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none transition focus:border-opacity-70"
                      style={{ focusBorderColor: themeColors.solid } as any}
                      onFocus={(e) => e.currentTarget.style.borderColor = themeColors.solid}
                      onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                    <button
                      onClick={() => { playClickSound(); handleSaveStudentName(studentName); }}
                      className="px-4 py-2.5 text-white text-sm font-bold rounded-xl transition hover:brightness-110 shrink-0"
                      style={{ background: themeColors.solid, color: "#0b0f1a" }}
                    >
                      Saqlash
                    </button>
                  </div>
                </div>

                {/* Badges grid */}
                <div className="rounded-2xl border border-white/10 bg-[#0c0f1e]/90 p-5 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: themeColors.solid }} />
                    Nishonlar kabineti
                  </h4>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {BADGES.map((b) => {
                      const isUnlocked = unlockedBadges.includes(b.id);
                      return (
                        <div
                          key={b.id}
                          title={b.desc}
                          className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-center border transition ${
                            isUnlocked
                              ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                              : "border-white/5 bg-black/20 opacity-40"
                          }`}
                        >
                          <span className="text-2xl">{b.icon}</span>
                          <p className="text-[9px] font-bold text-white leading-tight">{b.label}</p>
                          <span className={`text-[8px] font-mono font-bold ${isUnlocked ? "text-emerald-400" : "text-slate-600"}`}>
                            {isUnlocked ? "✓" : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Settings row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* Sound toggle */}
                  <div className="rounded-2xl border border-white/10 bg-[#0c0f1e]/90 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">8-Bit ovoz</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Animatsion ovoz effektlari</p>
                    </div>
                    <button
                      onClick={() => { const next = !soundEnabled; setSoundEnabled(next); localStorage.setItem("ct_sound_muted", String(!next)); window.dispatchEvent(new Event("storage")); if (next) { setTimeout(() => playClickSound(), 30); } }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${soundEnabled ? "" : "bg-slate-700"}`}
                      style={soundEnabled ? { background: themeColors.solid } : {}}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${soundEnabled ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>

                  {/* Sync status */}
                  <div className="rounded-2xl border border-white/10 bg-[#0c0f1e]/90 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">Sinxronizatsiya</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{user ? "Bulutli Gmail sinxron" : "Mahalliy brauzer"}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold rounded-lg px-2.5 py-1.5 ${user ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user ? "bg-emerald-400 animate-ping" : "bg-yellow-400"}`} />
                      {user ? "FAOL" : "MEHMON"}
                    </span>
                  </div>
                </div>

                {/* Login / Logout CTA */}
                {!user ? (
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white py-4 text-sm font-bold text-black hover:brightness-105 transition shadow-lg"
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
                    Gmail orqali kirish va sinxronlash
                  </button>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] py-3 text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    Tizimdan chiqish
                  </button>
                )}

              </div>
            )}

          </div>{/* /col-span-9 */}
        </div>{/* /grid */}
      </div>{/* /mx-auto */}


      {/* =======================================================
          7. FLOATING KIBER MENTOR CHATBOT DRAWER
          ======================================================= */}
      <div className="fixed bottom-4 right-4 z-50">
        {!mentorOpen ? (
          <button
            onClick={() => { playClickSound(); setMentorOpen(true); }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#00D1FF] to-[#6C63FF] text-[#0B0F1A] shadow-2xl hover:brightness-110 transition animate-glow-pulse"
            title="Kiber AI Mentor bilan gaplashish"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-80 sm:w-96 rounded-2xl border border-cyan-500/20 bg-[#0e1328]/95 shadow-2xl backdrop-blur flex flex-col h-[400px] overflow-hidden animate-success-pop">
            
            {/* Header */}
            <div className="px-4 py-3 bg-[#0d1022] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-[#00D1FF] font-mono uppercase tracking-wider">AI Kiber-Mentor</span>
              </div>
              <button 
                onClick={() => { playClickSound(); setMentorOpen(false); }} 
                className="text-xs text-slate-500 hover:text-white"
              >
                Yopish
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-white/10">
              {mentorMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed leading-normal ${
                    msg.sender === "user" 
                      ? "bg-[#6C63FF]/20 text-[#dbd9ff] border border-[#6C63FF]/30" 
                      : "bg-[#00D1FF]/10 text-cyan-100 border border-[#00D1FF]/20"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input message form */}
            <div className="p-3 border-t border-white/10 bg-[#0d1022] flex items-center gap-2">
              <input
                type="text"
                placeholder="Savolingizni yozing..."
                value={mentorInput}
                onChange={(e) => setMentorInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMentorMessage()}
                className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#00D1FF] outline-none"
              />
              <button
                onClick={handleSendMentorMessage}
                disabled={!mentorInput.trim()}
                className="p-2 bg-[#00D1FF] text-black rounded-lg hover:brightness-110 disabled:opacity-50 transition"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Gmail OAuth Restriction Modal Overlay */}
      {gmailError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#0d070b] p-6 text-center space-y-5 relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.25)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.08),transparent)]" />
            <div className="relative space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/30 text-rose-500 animate-bounce">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-wider">Tizimga Kirish Cheklangan!</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Kiberxavfsizlik va dasturlash o&apos;quv portalimizda faqat <strong className="text-rose-400">@gmail.com</strong> provayderi orqali kirgan foydalanuvchilar qabul qilinadi.
              </p>
              <p className="text-[11px] text-slate-500 font-mono leading-normal">
                Siz tanlagan Google hisobi ushbu shartga javob bermaydi yoki soxta hisob hisoblanadi. Iltimos, faqat haqiqiy Google Gmail profilingiz bilan qayta kiring.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => { playClickSound(); setGmailError(false); }}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-rose-600 text-white py-3 text-xs font-bold hover:bg-rose-700 transition"
                >
                  Tushundim, qayta urinish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Database SQL migration script constant
const MIGRATION_SQL = `-- Supabase Database Schema for Cyber Tech Portal
-- Copy and paste this script directly into your Supabase SQL Editor and click RUN!

-- 1. Create Quizzes table
CREATE TABLE IF NOT EXISTS public.ct_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  time_limit INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Questions table
CREATE TABLE IF NOT EXISTS public.ct_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.ct_quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_option INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create User Progress table
CREATE TABLE IF NOT EXISTS public.ct_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  completed_quizzes JSONB DEFAULT '{}'::jsonb NOT NULL,
  unlocked_lessons TEXT[] DEFAULT ARRAY[]::text[] NOT NULL,
  book_bookmarks JSONB DEFAULT '{}'::jsonb NOT NULL,
  unlocked_badges TEXT[] DEFAULT ARRAY[]::text[] NOT NULL,
  student_name TEXT,
  leaderboard_points INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Leaderboard rankings table
CREATE TABLE IF NOT EXISTS public.ct_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  avatar_url TEXT,
  points INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.ct_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ct_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ct_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ct_leaderboard ENABLE ROW LEVEL SECURITY;

-- 6. Setup RLS Policies
CREATE POLICY "Allow public read ct_quizzes" ON public.ct_quizzes FOR SELECT USING (true);
CREATE POLICY "Allow public read ct_questions" ON public.ct_questions FOR SELECT USING (true);
CREATE POLICY "Allow users select progress" ON public.ct_user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users insert/update progress" ON public.ct_user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow public read ct_leaderboard" ON public.ct_leaderboard FOR SELECT USING (true);
CREATE POLICY "Allow users upsert ct_leaderboard" ON public.ct_leaderboard FOR ALL USING (auth.uid() = user_id);
`;
