"use client";

import { useState, useTransition, useCallback } from "react";
import {
  Plus, Trash2, Check, AlertCircle, Loader2, ChevronDown,
  ChevronUp, BookOpen, ListCheck, Clock, Tag, Eye, EyeOff,
  Terminal, Shield, Cpu, Brain, Monitor, Lock
} from "lucide-react";
import {
  createQuiz, deleteQuiz, deleteQuestion, addQuestionToQuiz,
  type QuestionInput, type QuizInput,
} from "./actions";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "Kompyuter savodxonligi", icon: Monitor },
  { label: "Dasturlash",             icon: Terminal },
  { label: "Microsoft Office",       icon: BookOpen },
  { label: "Sun'iy intellekt",       icon: Brain },
  { label: "Robototexnika",          icon: Cpu },
  { label: "Kiberxavfsizlik",        icon: Shield },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Kompyuter savodxonligi": "bg-blue-50 text-blue-700 border-blue-200",
  "Dasturlash":             "bg-violet-50 text-violet-700 border-violet-200",
  "Microsoft Office":       "bg-sky-50 text-sky-700 border-sky-200",
  "Sun'iy intellekt":       "bg-amber-50 text-amber-700 border-amber-200",
  "Robototexnika":          "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Kiberxavfsizlik":        "bg-rose-50 text-rose-700 border-rose-200",
};

const BLANK_QUESTION = (): QuestionInput => ({
  questionText: "",
  options: ["", "", "", ""],
  correctOption: 0,
  explanation: "",
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface DbQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation: string;
  created_at: string;
}
interface DbQuiz {
  id: string;
  title: string;
  category: string;
  time_limit: number;
  created_at: string;
  ct_questions: DbQuestion[];
}

interface Props {
  initialQuizzes: DbQuiz[];
  dbError: string | null;
}

// ─── Main Client Component ───────────────────────────────────────────────────
export function CyberTestsClient({ initialQuizzes, dbError }: Props) {
  const [quizzes, setQuizzes]         = useState<DbQuiz[]>(initialQuizzes);
  const [notice, setNotice]           = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [isPending, startTransition]  = useTransition();

  // Panel visibility
  const [showCreate, setShowCreate]   = useState(false);
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [addQForId, setAddQForId]     = useState<string | null>(null);

  // ── Create quiz form state ──────────────────────────────────────────────────
  const [quizMeta, setQuizMeta] = useState<QuizInput>({
    title: "",
    category: CATEGORIES[0].label,
    timeLimit: 120,
  });
  const [questions, setQuestions] = useState<QuestionInput[]>([BLANK_QUESTION()]);

  // ── Inline add-question form state ─────────────────────────────────────────
  const [inlineQ, setInlineQ] = useState<QuestionInput>(BLANK_QUESTION());

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const toast = (type: "ok" | "err", msg: string) => {
    setNotice({ type, msg });
    setTimeout(() => setNotice(null), 4000);
  };

  const refreshQuiz = useCallback((updated: DbQuiz) => {
    setQuizzes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  }, []);

  // ─── Create quiz submit ──────────────────────────────────────────────────────
  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizMeta.title.trim()) return toast("err", "Test sarlavhasini kiriting.");
    const invalid = questions.some(
      (q) => !q.questionText.trim() || q.options.some((o) => !o.trim()) || !q.explanation.trim()
    );
    if (invalid) return toast("err", "Barcha maydonlarni to'ldiring.");

    startTransition(async () => {
      const { error } = await createQuiz(quizMeta, questions);
      if (error) return toast("err", error);
      toast("ok", "Test muvaffaqiyatli saqlandi!");
      setShowCreate(false);
      setQuizMeta({ title: "", category: CATEGORIES[0].label, timeLimit: 120 });
      setQuestions([BLANK_QUESTION()]);
      // Re-fetch quizzes from server (optimistic: add temp or rely on router.refresh)
      // Since we use server actions with revalidatePath, page reloads automatically
    });
  };

  // ─── Delete quiz ─────────────────────────────────────────────────────────────
  const handleDeleteQuiz = (id: string) => {
    if (!confirm("Testni o'chirasizmi? Barcha savollar ham o'chadi.")) return;
    startTransition(async () => {
      const { error } = await deleteQuiz(id);
      if (error) return toast("err", error);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      toast("ok", "Test o'chirildi.");
    });
  };

  // ─── Delete question ─────────────────────────────────────────────────────────
  const handleDeleteQuestion = (quizId: string, qId: string) => {
    if (!confirm("Savolni o'chirasizmi?")) return;
    startTransition(async () => {
      const { error } = await deleteQuestion(qId);
      if (error) return toast("err", error);
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === quizId
            ? { ...quiz, ct_questions: quiz.ct_questions.filter((q) => q.id !== qId) }
            : quiz
        )
      );
      toast("ok", "Savol o'chirildi.");
    });
  };

  // ─── Add question to existing quiz ──────────────────────────────────────────
  const handleAddQuestion = (quizId: string) => {
    if (!inlineQ.questionText.trim()) return toast("err", "Savol matnini kiriting.");
    if (inlineQ.options.some((o) => !o.trim())) return toast("err", "Barcha variantlarni kiriting.");
    if (!inlineQ.explanation.trim()) return toast("err", "Tushuntirish kiriting.");

    startTransition(async () => {
      const { error } = await addQuestionToQuiz(quizId, inlineQ);
      if (error) return toast("err", error);
      toast("ok", "Savol qo'shildi.");
      setAddQForId(null);
      setInlineQ(BLANK_QUESTION());
    });
  };

  // ─── Question field helpers ──────────────────────────────────────────────────
  const updateQ = (idx: number, field: keyof QuestionInput, val: unknown) => {
    setQuestions((prev) => {
      const next = [...prev];
      (next[idx] as any)[field] = val;
      return next;
    });
  };
  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIdx].options[oIdx] = val;
      return next;
    });
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Lock className="h-6 w-6 text-blue-600" />
            Cyber Tech Testlar Boshqaruvi
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cyber Tech ta&apos;lim portalidagi interaktiv testlar bazasini boshqarish.
            Jami: <strong>{quizzes.length}</strong> test,{" "}
            <strong>{quizzes.reduce((a, q) => a + q.ct_questions.length, 0)}</strong> savol.
          </p>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm shadow-blue-200"
          >
            <Plus className="h-4 w-4" /> Yangi test qo&apos;shish
          </button>
        )}
      </div>

      {/* ── DB Error Banner ── */}
      {dbError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <div>
            <p className="font-semibold">Bazaga ulanishda xatolik</p>
            <p className="mt-0.5 text-red-700">{dbError}</p>
            <p className="mt-1 text-xs text-red-600">
              Supabase migratsiyani ishga tushiring:{" "}
              <code className="bg-red-100 px-1 rounded">20260524100000_cybertech_quizzes.sql</code>
            </p>
          </div>
        </div>
      )}

      {/* ── Notice Toast ── */}
      {notice && (
        <div
          className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-sm animate-fade-in ${
            notice.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {notice.type === "ok"
            ? <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            : <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />}
          {notice.msg}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          CREATE NEW QUIZ PANEL
      ══════════════════════════════════════════════════════════ */}
      {showCreate && (
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-600" />
              Yangi test tuzish paneli
            </h2>
            <button
              onClick={() => { setShowCreate(false); setQuestions([BLANK_QUESTION()]); }}
              className="text-xs font-medium text-slate-400 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 transition"
            >
              Bekor qilish
            </button>
          </div>

          <form onSubmit={handleCreateQuiz} className="space-y-6">
            {/* Meta row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block uppercase tracking-wide">
                  Test sarlavhasi *
                </label>
                <input
                  type="text"
                  placeholder="masalan, HTML va CSS Asoslari"
                  value={quizMeta.title}
                  onChange={(e) => setQuizMeta({ ...quizMeta, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block uppercase tracking-wide">
                  Kategoriya *
                </label>
                <select
                  value={quizMeta.category}
                  onChange={(e) => setQuizMeta({ ...quizMeta, category: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.label} value={c.label}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block uppercase tracking-wide">
                  Vaqt limiti (soniya) *
                </label>
                <input
                  type="number"
                  min="30"
                  max="3600"
                  value={quizMeta.timeLimit}
                  onChange={(e) => setQuizMeta({ ...quizMeta, timeLimit: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <ListCheck className="h-4 w-4 text-blue-500" />
                  Savollar ro&apos;yxati ({questions.length} ta)
                </h3>
                <button
                  type="button"
                  onClick={() => setQuestions([...questions, BLANK_QUESTION()])}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Savol qo&apos;shish
                </button>
              </div>

              {questions.map((q, qi) => (
                <QuestionCard
                  key={qi}
                  index={qi}
                  question={q}
                  onRemove={() => setQuestions((prev) => prev.filter((_, i) => i !== qi))}
                  canRemove={questions.length > 1}
                  onTextChange={(v) => updateQ(qi, "questionText", v)}
                  onOptionChange={(oi, v) => updateOption(qi, oi, v)}
                  onCorrectChange={(v) => updateQ(qi, "correctOption", v)}
                  onExplChange={(v) => updateQ(qi, "explanation", v)}
                />
              ))}
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => { setShowCreate(false); setQuestions([BLANK_QUESTION()]); }}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition shadow-sm"
              >
                {isPending
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saqlanmoqda...</>
                  : <><Check className="h-3.5 w-3.5" /> Testni saqlash</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          QUIZZES LIST
      ══════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/20 px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            Barcha Testlar
          </h2>
          <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-full">
            {quizzes.length} ta
          </span>
        </div>

        {quizzes.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Hozircha birorta test yo&apos;q</p>
            <p className="text-xs mt-1">Yuqoridagi &quot;Yangi test qo&apos;shish&quot; tugmasini bosing</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {quizzes.map((quiz) => (
              <QuizRow
                key={quiz.id}
                quiz={quiz}
                isExpanded={expandedId === quiz.id}
                onToggle={() => setExpandedId(expandedId === quiz.id ? null : quiz.id)}
                onDelete={() => handleDeleteQuiz(quiz.id)}
                onDeleteQuestion={(qId) => handleDeleteQuestion(quiz.id, qId)}
                showAddQ={addQForId === quiz.id}
                onToggleAddQ={() => {
                  setAddQForId(addQForId === quiz.id ? null : quiz.id);
                  setInlineQ(BLANK_QUESTION());
                }}
                inlineQ={inlineQ}
                setInlineQ={setInlineQ}
                onAddQuestion={() => handleAddQuestion(quiz.id)}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  QuizRow
// ══════════════════════════════════════════════════════════════════════════════
interface QuizRowProps {
  quiz: DbQuiz;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onDeleteQuestion: (qId: string) => void;
  showAddQ: boolean;
  onToggleAddQ: () => void;
  inlineQ: QuestionInput;
  setInlineQ: (q: QuestionInput) => void;
  onAddQuestion: () => void;
  isPending: boolean;
}
function QuizRow({
  quiz, isExpanded, onToggle, onDelete, onDeleteQuestion,
  showAddQ, onToggleAddQ, inlineQ, setInlineQ, onAddQuestion, isPending,
}: QuizRowProps) {
  const catColor = CATEGORY_COLORS[quiz.category] ?? "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="group">
      {/* ── Row header ── */}
      <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition">
        <button
          onClick={onToggle}
          className="flex-1 flex items-center gap-4 text-left min-w-0"
        >
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 truncate">{quiz.title}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${catColor}`}>
                {quiz.category}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="h-3 w-3" /> {quiz.time_limit}s
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <ListCheck className="h-3 w-3" /> {quiz.ct_questions.length} savol
              </span>
              <span className="text-[11px] text-slate-300">
                {new Date(quiz.created_at).toLocaleDateString("uz-UZ")}
              </span>
            </div>
          </div>
          {isExpanded
            ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
            : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleAddQ}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Savol qo&apos;sh
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 border border-rose-100 hover:bg-rose-50 rounded-lg px-3 py-1.5 transition"
          >
            <Trash2 className="h-3.5 w-3.5" /> O&apos;chirish
          </button>
        </div>
      </div>

      {/* ── Add Question inline form ── */}
      {showAddQ && (
        <div className="mx-4 mb-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Mavjud testga yangi savol qo&apos;shish
          </p>
          <QuestionCard
            index={0}
            question={inlineQ}
            canRemove={false}
            onRemove={() => {}}
            onTextChange={(v) => setInlineQ({ ...inlineQ, questionText: v })}
            onOptionChange={(oi, v) => {
              const opts = [...inlineQ.options]; opts[oi] = v;
              setInlineQ({ ...inlineQ, options: opts });
            }}
            onCorrectChange={(v) => setInlineQ({ ...inlineQ, correctOption: v })}
            onExplChange={(v) => setInlineQ({ ...inlineQ, explanation: v })}
          />
          <div className="flex justify-end gap-2">
            <button onClick={onToggleAddQ} className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5">
              Bekor
            </button>
            <button
              onClick={onAddQuestion}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Saqlash
            </button>
          </div>
        </div>
      )}

      {/* ── Questions expand panel ── */}
      {isExpanded && (
        <div className="px-6 pb-5 space-y-3 bg-slate-50/30">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-1 pb-1 border-b border-slate-100">
            Savollar ({quiz.ct_questions.length} ta)
          </p>
          {quiz.ct_questions.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">Bu testda hali savol yo&apos;q.</p>
          ) : (
            quiz.ct_questions.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-900">{q.question_text}</p>
                  </div>
                  <button
                    onClick={() => onDeleteQuestion(q.id)}
                    className="shrink-0 text-rose-400 hover:text-rose-600 transition"
                    title="Savolni o'chirish"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pl-7">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs ${
                        oi === q.correct_option
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold"
                          : "bg-slate-50 border border-slate-100 text-slate-600"
                      }`}
                    >
                      <span className="font-black opacity-60">{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                      {oi === q.correct_option && <Check className="h-3 w-3 ml-auto text-emerald-600" />}
                    </div>
                  ))}
                </div>

                <div className="pl-7">
                  <p className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-600">💡 Tushuntirish: </span>
                    {q.explanation}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  QuestionCard — reusable form card for a single question
// ══════════════════════════════════════════════════════════════════════════════
interface QuestionCardProps {
  index: number;
  question: QuestionInput;
  canRemove: boolean;
  onRemove: () => void;
  onTextChange: (v: string) => void;
  onOptionChange: (oi: number, v: string) => void;
  onCorrectChange: (v: number) => void;
  onExplChange: (v: string) => void;
}
function QuestionCard({
  index, question, canRemove, onRemove,
  onTextChange, onOptionChange, onCorrectChange, onExplChange,
}: QuestionCardProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
          Savol {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-rose-400 hover:text-rose-600 transition"
            title="Savolni olib tashlash"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Question text */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-slate-600 block">Savol matni *</label>
        <input
          type="text"
          placeholder="Savol nima haqida?"
          value={question.questionText}
          onChange={(e) => onTextChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition"
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {question.options.map((opt, oi) => (
          <div key={oi} className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 block">
              Variant {String.fromCharCode(65 + oi)}{" "}
              {oi === question.correctOption && (
                <span className="text-emerald-600 font-black">✓ To&apos;g&apos;ri</span>
              )}
            </label>
            <input
              type="text"
              placeholder={`Variant ${String.fromCharCode(65 + oi)} qiymati`}
              value={opt}
              onChange={(e) => onOptionChange(oi, e.target.value)}
              className={`w-full rounded-lg border px-3 py-1.5 text-sm outline-none transition ${
                oi === question.correctOption
                  ? "border-emerald-200 bg-emerald-50/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  : "border-slate-200 bg-slate-50/50 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Correct option + explanation */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 block">To&apos;g&apos;ri javob *</label>
          <select
            value={question.correctOption}
            onChange={(e) => onCorrectChange(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-blue-500 outline-none"
          >
            <option value={0}>Variant A</option>
            <option value={1}>Variant B</option>
            <option value={2}>Variant C</option>
            <option value={3}>Variant D</option>
          </select>
        </div>
        <div className="sm:col-span-2 space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 block">
            Tushuntirish (o&apos;quvchiga ko&apos;rsatiladi) *
          </label>
          <input
            type="text"
            placeholder="Nima uchun shu javob to'g'ri ekanligining qisqa tahlili"
            value={question.explanation}
            onChange={(e) => onExplChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </div>
      </div>
    </div>
  );
}
