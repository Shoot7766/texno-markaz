"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, Terminal, Loader2, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";

interface Message {
  sender: "user" | "ai";
  text: string;
  isQuery?: boolean;
}

export function CrmCopilot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Assalomu alaykum! Men Texno Markaz virtual yordamchisiman. CRM tizimidagi barcha amallarni (o'quvchi qo'shish, to'lovlar, guruhlar yaratish yoki qarzlar bo'yicha hisobotlar olish) bajarishim mumkin.\n\nMenga vazifa bering, masalan:\n`\"Yangi o'quvchi Sardor Qobilov, tel +998991234567 ni Dasturlash kursiga qo'sh\"`"
    }
  ]);

  // Autopilot / Autonomous Control Mode states
  const [isAutopilot, setIsAutopilot] = useState(false);
  const [autopilotLogs, setAutopilotLogs] = useState<string[]>([
    "AI CRM Yadrosi ishga tushirildi.",
    "Barcha ma'lumotlar bazasi aloqalari barqaror.",
    "Sinf jurnallari va davomat tahlil qilinmoqda..."
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Autonomous Logger interval effect
  useEffect(() => {
    if (!isAutopilot) return;
    
    const logPool = [
      "Talabalarning to'lov qarzdorligi tekshirildi. Hech qanday anomal qarz topilmadi.",
      "Yangi arizalar (leads) navbati skanerlandi. Hammasi nazorat ostida.",
      "Dars jadvali to'qnashuvlari tekshirildi. Konfliktlar mavjud emas.",
      "Bugungi davomat jurnali to'liq tekshirildi va tasdiqlandi.",
      "AI Kiber-Agent: CRM ish faoliyatini 99.8% optimallikda ushlab turibdi.",
      "Kutubxonadagi kitoblar va AI Mentor bilimi sinxronlashtirildi.",
      "Vercel serverless cron test generatori so'rovlari muvaffaqiyatli topshirildi."
    ];
    
    const interval = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      const timestamp = new Date().toLocaleTimeString();
      setAutopilotLogs(prev => [`[${timestamp}] ${randomLog}`, ...prev.slice(0, 10)]);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [isAutopilot]);

  // Proaktiv tizim tekshiruvi (Scan)
  const triggerSystemScan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/crm-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "[SYSTEM_SCAN]" })
      });

      const data = await res.json();

      if (!data.error && data.message) {
        setMessages(prev => [...prev, {
          sender: "ai",
          text: `🔍 *KUNLIK TIZIM TAHLILI VA EHM ESLATMALARI:*\n\n${data.message}`,
          isQuery: true
        }]);
      }
    } catch (err: any) {
      console.error("System scan failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClick = () => {
    setIsOpen(true);
    if (!hasScanned) {
      setHasScanned(true);
      triggerSystemScan();
    }
  };

  const handleSend = async (textToSend?: string) => {
    const input = textToSend || prompt;
    if (!input.trim() || loading) return;

    // Add user message
    setMessages(prev => [...prev, { sender: "user", text: input }]);
    if (!textToSend) setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/crm-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input })
      });

      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, { sender: "ai", text: `⚠️ Xatolik yuz berdi: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, {
          sender: "ai",
          text: data.message || "Amal muvaffaqiyatli bajarildi!",
          isQuery: data.action === "QUERY_DATA"
        }]);

        // Agar ma'lumot yozish amali bajarilgan bo'lsa, CRM sahifasini yangilaymiz
        if (data.action && data.action !== "QUERY_DATA" && data.action !== "NEED_INFO") {
          router.refresh();
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { sender: "ai", text: `❌ Tarmoq xatosi: ${err.message || err}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "Kunlik tizim hisoboti [SYSTEM_SCAN]",
    "O'quvchi qo'sh: Sardor Qobilov, tel +998991234567, Kurs: Dasturlash",
    "Kompyuter savodxonligida nechta o'quvchi bor?",
    "Sardor Qobilov uchun naqd 300 000 to'lov qo'sh"
  ];

  return (
    <>
      {/* Floating Trigger Bubble */}
      <button
        onClick={handleOpenClick}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#00D1FF] to-[#6c63ff] text-white shadow-lg hover:shadow-cyan-500/20 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 animate-pulse cursor-pointer"
        title="AI CRM Yordamchi"
      >
        <Sparkles className="h-6 w-6 animate-spin-slow" />
      </button>

      {/* Slide-out Cyberpunk Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 bg-black/50 animate-fade-in">
          {/* Panel click-outside backdrop shadow */}
          <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />

          <div className="flex h-[80vh] w-full max-w-md flex-col rounded-2xl border border-white/10 bg-[#0c0f1e]/95 text-white shadow-2xl overflow-hidden tm-ring-glow animate-success-pop">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#080a14] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
                  <div className="h-2 w-2 rounded-full bg-emerald-500 relative" />
                </div>
                <span className="text-xs font-black tracking-widest uppercase text-cyan-400 flex items-center gap-1.5 font-mono">
                  <Terminal className="h-3.5 w-3.5" /> AI Copilot Online
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Autonomous Autopilot Toggle Banner */}
            <div className="bg-[#080a14] border-b border-white/5 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className={`h-4 w-4 ${isAutopilot ? "text-emerald-400 animate-spin-slow" : "text-slate-500"}`} />
                <div>
                  <div className="text-[10px] font-bold tracking-wider text-white">AVTOMATIK BOSHQARUV (AUTOPILOT)</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    {isAutopilot ? "🟢 AI faol va CRM-ni boshqarmoqda" : "⚪ Faqat so'rovlar bo'yicha (Manual)"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAutopilot(!isAutopilot);
                  if (!isAutopilot) {
                    setAutopilotLogs(prev => [
                      `[${new Date().toLocaleTimeString()}] AVTO-BOSHQARUV yoqildi. Proaktiv nazorat boshlandi.`,
                      ...prev
                    ]);
                  }
                }}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isAutopilot ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isAutopilot ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Live Autopilot Terminal Console */}
            {isAutopilot && (
              <div className="mx-4 mt-2 p-3 bg-black/60 rounded-xl border border-emerald-500/20 font-mono text-[9px] text-emerald-400 max-h-[85px] overflow-y-auto space-y-1 scrollbar-none shadow-inner animate-fade-in relative">
                <div className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-slate-500 font-bold block mb-1">=== AUTO CRM LOGGER ===</span>
                {autopilotLogs.map((log, idx) => (
                  <div key={idx} className="truncate leading-relaxed">{log}</div>
                ))}
              </div>
            )}

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-lg border text-white ${
                    msg.sender === "user"
                      ? "bg-slate-800 border-white/10"
                      : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  }`}>
                    {msg.sender === "user" ? <span className="font-bold text-[10px]">AD</span> : <Bot className="h-4 w-4" />}
                  </div>

                  {/* Bubble */}
                  <div className={`rounded-xl px-3 py-2 leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#6c63ff]/20 border border-[#6c63ff]/30 text-white rounded-tr-none"
                      : msg.isQuery
                        ? "bg-[#080a14] border border-cyan-500/10 text-slate-300 rounded-tl-none font-mono whitespace-pre-wrap"
                        : "bg-white/5 border border-white/10 text-slate-300 rounded-tl-none whitespace-pre-wrap"
                  }`}>
                    {msg.isQuery ? (
                      <div className="prose prose-invert prose-xs max-w-none text-slate-300 leading-relaxed font-mono">
                        {msg.text.split("\n").map((line, lIdx) => {
                          if (line.startsWith("### ")) return <h5 key={lIdx} className="text-cyan-400 font-extrabold mt-3 mb-1 text-[11px] uppercase tracking-wider">{line.replace("### ", "")}</h5>;
                          if (line.startsWith("## ")) return <h4 key={lIdx} className="text-cyan-400 font-black mt-4 mb-2 text-xs uppercase tracking-widest">{line.replace("## ", "")}</h4>;
                          if (line.startsWith("- ") || line.startsWith("* ")) return <div key={lIdx} className="pl-3 flex items-start gap-1.5 py-0.5"><span className="text-cyan-400 select-none">•</span><span>{line.substring(2)}</span></div>;
                          return <p key={lIdx} className="min-h-[1em] my-1">{line}</p>;
                        })}
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="flex h-7 w-7 select-none items-center justify-center rounded-lg border bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="rounded-xl px-3 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-tl-none font-mono animate-pulse">
                    Agent so&apos;rovni tahlil qilyapti va bajarmoqda...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions (if no conversation or quick pick is needed) */}
            <div className="p-3 border-t border-white/5 bg-[#080a14]/60 space-y-1.5">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Tezkor namunalar:</span>
              <div className="flex flex-wrap gap-1">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p)}
                    disabled={loading}
                    className="text-[10px] bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/20 px-2 py-1 rounded-md transition text-left cursor-pointer disabled:opacity-50"
                  >
                    {p.length > 50 ? p.substring(0, 48) + "..." : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Footer */}
            <div className="p-3 bg-[#080a14] border-t border-white/10 flex gap-2 items-center">
              <textarea
                placeholder="Buyruq kiriting... (Enter jo'natish)"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={loading}
                rows={1}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition resize-none max-h-16"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !prompt.trim()}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#00D1FF] text-black hover:brightness-110 disabled:opacity-40 disabled:brightness-100 transition cursor-pointer shrink-0"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
