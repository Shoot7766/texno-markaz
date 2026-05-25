"use client";

import { useState, useTransition } from "react";
import {
  Sparkles, Loader2, Check, AlertCircle, ChevronDown, ChevronUp,
  Trash2, Save, RefreshCw, FileText, Settings2, Zap, Brain,
  BookOpen, ListCheck, Eye, EyeOff,
} from "lucide-react";
import { createQuiz } from "../actions";

// ── Types ─────────────────────────────────────────────────────────────────────
interface GeneratedQuestion {
  questionText: string;
  options: string[];
  correctOption: number;
  explanation: string;
}
interface GeneratedQuiz {
  title: string;
  questions: GeneratedQuestion[];
  totalGenerated: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Kiberxavfsizlik",
  "Dasturlash",
  "Kompyuter savodxonligi",
  "Sun'iy intellekt",
  "Microsoft Office",
  "Robototexnika",
];

const DIFFICULTIES = [
  { value: "oson",   label: "Oson",   color: "text-emerald-600" },
  { value: "o'rta",  label: "O'rta",  color: "text-amber-600" },
  { value: "qiyin",  label: "Qiyin",  color: "text-rose-600" },
];

const LANGUAGES = [
  { value: "uz", label: "O'zbekcha" },
  { value: "ru", label: "Ruscha" },
  { value: "en", label: "English" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AiQuizGeneratorPage() {
  // Form state
  const [text, setText]               = useState("");
  const [category, setCategory]       = useState(CATEGORIES[0]);
  const [questionCount, setCount]     = useState(10);
  const [difficulty, setDifficulty]   = useState("o'rta");
  const [language, setLanguage]       = useState("uz");
  const [timeLimit, setTimeLimit]     = useState(120);

  // Result state
  const [generated, setGenerated]     = useState<GeneratedQuiz | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedQs, setEditedQs]       = useState<GeneratedQuestion[]>([]);
  const [expandedIdx, setExpanded]    = useState<number | null>(null);
  const [previewAll, setPreviewAll]   = useState(false);

  // Status
  const [generating, setGenerating]   = useState(false);
  const [isPending, startTransition]  = useTransition();
  const [notice, setNotice]           = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [saved, setSaved]             = useState(false);

  const toast = (type: "ok" | "err", msg: string) => {
    setNotice({ type, msg });
    setTimeout(() => setNotice(null), 5000);
  };

  // ── Generate ───────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!text.trim()) return toast("err", "Matn kiriting.");
    if (text.trim().length < 100) return toast("err", "Matn kamida 100 belgi bo'lishi kerak.");

    setGenerating(true);
    setGenerated(null);
    setSaved(false);
    setNotice(null);

    try {
      const res = await fetch("/api/admin/ai-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, category, questionCount, difficulty, language }),
      });
      const data = await res.json();

      if (!res.ok) return toast("err", data.error || "Xatolik yuz berdi.");

      setGenerated(data);
      setEditedTitle(data.title);
      setEditedQs(data.questions);
      setExpanded(null);
      toast("ok", `${data.totalGenerated} ta savol muvaffaqiyatli yaratildi!`);
    } catch (e: any) {
      toast("err", "Tarmoq xatoligi: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  // ── Edit question ──────────────────────────────────────────────────────────
  const updateQ = (idx: number, field: keyof GeneratedQuestion, val: unknown) => {
    setEditedQs(prev => {
      const next = [...prev];
      (next[idx] as any)[field] = val;
      return next;
    });
  };
  const updateOpt = (qi: number, oi: number, val: string) => {
    setEditedQs(prev => {
      const next = [...prev];
      const opts = [...next[qi].options]; opts[oi] = val;
      next[qi] = { ...next[qi], options: opts };
      return next;
    });
  };
  const removeQ = (idx: number) => setEditedQs(prev => prev.filter((_, i) => i !== idx));

  // ── Save to DB ─────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!editedTitle.trim()) return toast("err", "Test sarlavhasini kiriting.");
    if (editedQs.length === 0) return toast("err", "Kamida bitta savol bo'lishi kerak.");

    startTransition(async () => {
      const { error } = await createQuiz(
        { title: editedTitle, category, timeLimit },
        editedQs
      );
      if (error) return toast("err", error);
      setSaved(true);
      toast("ok", `"${editedTitle}" bazaga saqlandi!`);
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-500" />
            AI Test Generator
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kitob, maqola yoki istalgan matndan avtomatik test tuzish — Google Gemini AI orqali.
          </p>
        </div>
        {generated && !saved && (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition shadow-sm shrink-0"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Bazaga saqlash
          </button>
        )}
        {saved && (
          <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
            <Check className="h-4 w-4" /> Saqlandi!
          </div>
        )}
      </div>

      {/* ── Notice ─────────────────────────────────────────────────────────── */}
      {notice && (
        <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm animate-fade-in ${
          notice.type === "ok"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}>
          {notice.type === "ok"
            ? <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            : <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />}
          {notice.msg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* ════════════════════════════════════════════════════════════════════
            LEFT PANEL — Input & Settings
        ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-4">

          {/* Text input */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-500" />
              Matn yoki kitob matni
            </h2>
            <textarea
              rows={12}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Bu yerga kitob yoki maqola matnini joylashtiring...\n\nMasalan:\n- Kitob bobini nusxalab yopishtirsangiz\n- Wikipedia maqolasi\n- Darslik matni\n- Istalgan o'quv materiali\n\nMinimum: 100 belgi\nMaksimum: 15,000 belgi`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm text-slate-800 resize-none outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition placeholder:text-slate-400"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{text.length.toLocaleString()} belgi</span>
              <span className={text.length > 15000 ? "text-rose-500 font-bold" : ""}>
                Maks: 15,000
              </span>
            </div>
          </div>

          {/* Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Settings2 className="h-4 w-4 text-violet-500" />
              Sozlamalar
            </h2>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide block">Kategoriya</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Question count */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide block">
                Savollar soni: <span className="text-violet-600 font-black">{questionCount}</span>
              </label>
              <input
                type="range" min={5} max={50} step={5}
                value={questionCount}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full accent-violet-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>5</span><span>25</span><span>50</span>
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide block">Qiyinlik darajasi</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`flex-1 rounded-lg border py-2 text-xs font-bold transition ${
                      difficulty === d.value
                        ? `${d.color} border-current bg-current/5`
                        : "border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide block">Til</label>
              <div className="flex gap-2">
                {LANGUAGES.map(l => (
                  <button
                    key={l.value}
                    onClick={() => setLanguage(l.value)}
                    className={`flex-1 rounded-lg border py-2 text-xs font-bold transition ${
                      language === l.value
                        ? "border-blue-400 text-blue-600 bg-blue-50"
                        : "border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time limit */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide block">
                Vaqt limiti: <span className="text-slate-800 font-black">
                  {timeLimit >= 60 
                    ? `${Math.floor(timeLimit / 60)} daqiqa${timeLimit % 60 > 0 ? ` ${timeLimit % 60} soniya` : ""}`
                    : `${timeLimit} soniya`
                  } ({timeLimit}s)
                </span>
              </label>
              <input
                type="range" min={30} max={3600} step={30}
                value={timeLimit}
                onChange={e => setTimeLimit(Number(e.target.value))}
                className="w-full accent-slate-600"
              />
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !text.trim() || text.length > 15000}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 transition shadow-md shadow-violet-200"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> AI ishlayapti...</>
              ) : (
                <><Zap className="h-4 w-4" /> AI bilan test tuzish</>
              )}
            </button>

            {generating && (
              <p className="text-center text-xs text-slate-400 animate-pulse">
                Gemini AI matnni tahlil qilmoqda... (10-30 soniya)
              </p>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT PANEL — Generated Questions
        ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3">
          {!generated && !generating && (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
              <Brain className="h-14 w-14 text-slate-300 mb-4" />
              <p className="text-slate-400 font-medium">Hali test yaratilmagan</p>
              <p className="text-slate-300 text-sm mt-1">
                Chapda matn kiriting va &quot;AI bilan test tuzish&quot; tugmasini bosing
              </p>
            </div>
          )}

          {generating && (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 p-8">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-violet-500" />
              </div>
              <p className="mt-6 font-bold text-violet-700">Gemini AI ishlayapti...</p>
              <p className="text-sm text-violet-400 mt-1">Matnni tahlil qilib savollar tuzyapti</p>
              <div className="mt-4 flex gap-1">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          )}

          {generated && editedQs.length > 0 && (
            <div className="space-y-4">
              {/* Quiz title edit */}
              <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-violet-700">
                    <Sparkles className="h-4 w-4" />
                    AI yaratdi — {editedQs.length} savol
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewAll(!previewAll)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 transition"
                    >
                      {previewAll ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {previewAll ? "Yig'ish" : "Barchasini ko'rish"}
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 border border-violet-200 bg-white rounded-lg px-2.5 py-1.5 transition"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Qayta
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide block">Test sarlavhasi</label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={e => setEditedTitle(e.target.value)}
                    className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm font-semibold focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none"
                  />
                </div>

                {/* Save button (repeated for convenience) */}
                {!saved ? (
                  <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isPending ? "Saqlanmoqda..." : `${editedQs.length} ta savolni bazaga saqlash`}
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-bold text-emerald-700">
                    <Check className="h-4 w-4" /> Muvaffaqiyatli saqlandi!
                  </div>
                )}
              </div>

              {/* Questions list */}
              <div className="space-y-3">
                {editedQs.map((q, qi) => (
                  <div key={qi} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {/* Question header */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition"
                      onClick={() => setExpanded(expandedIdx === qi ? null : qi)}
                    >
                      <span className="h-6 w-6 rounded-full bg-violet-100 text-violet-700 text-[11px] font-black flex items-center justify-center shrink-0">
                        {qi + 1}
                      </span>
                      <p className={`flex-1 text-sm font-medium text-slate-800 ${!previewAll && expandedIdx !== qi ? "truncate" : ""}`}>
                        {q.questionText}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                          ✓ {String.fromCharCode(65 + q.correctOption)}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); removeQ(qi); }}
                          className="text-rose-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        {expandedIdx === qi
                          ? <ChevronUp className="h-4 w-4 text-slate-400" />
                          : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Question detail (editable) */}
                    {(expandedIdx === qi || previewAll) && (
                      <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3 bg-slate-50/30">
                        {/* Question text */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Savol matni</label>
                          <input
                            type="text"
                            value={q.questionText}
                            onChange={e => updateQ(qi, "questionText", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 outline-none"
                          />
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="space-y-0.5">
                              <label className={`text-[10px] font-bold uppercase ${oi === q.correctOption ? "text-emerald-600" : "text-slate-400"}`}>
                                {String.fromCharCode(65 + oi)}{oi === q.correctOption ? " ✓ To'g'ri" : ""}
                              </label>
                              <input
                                type="text"
                                value={opt}
                                onChange={e => updateOpt(qi, oi, e.target.value)}
                                className={`w-full rounded-lg border px-3 py-1.5 text-xs outline-none transition ${
                                  oi === q.correctOption
                                    ? "border-emerald-200 bg-emerald-50 focus:border-emerald-400"
                                    : "border-slate-200 bg-white focus:border-blue-300"
                                }`}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Correct + explanation */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">To'g'ri javob</label>
                            <select
                              value={q.correctOption}
                              onChange={e => updateQ(qi, "correctOption", Number(e.target.value))}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none"
                            >
                              <option value={0}>A varianti</option>
                              <option value={1}>B varianti</option>
                              <option value={2}>C varianti</option>
                              <option value={3}>D varianti</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2 space-y-0.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Tushuntirish</label>
                            <input
                              type="text"
                              value={q.explanation}
                              onChange={e => updateQ(qi, "explanation", e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-300 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
