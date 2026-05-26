"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Trash2, Edit, BookOpen, Save, X, Loader2, 
  AlertCircle, ChevronRight, Check, BookMarked, HelpCircle
} from "lucide-react";

interface Chapter {
  title: string;
  content: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  pages: number;
  category: string;
  coverColor: string;
  summary: string;
  chapters: Chapter[];
  pdfUrl?: string;
}

interface Props {
  initialBooks: Book[];
}

const COVER_GRADIENTS = [
  { label: "Pink-Purple (Glow)", value: "from-pink-600 to-purple-800" },
  { label: "Teal-Cyan (Hacker)", value: "from-teal-600 to-cyan-900" },
  { label: "Indigo-Pink (Cyber)", value: "from-indigo-600 to-pink-900" },
  { label: "Red-Dark (Danger)", value: "from-red-700 to-red-950" },
  { label: "Purple-Dark (Standard)", value: "from-purple-700 to-purple-950" },
  { label: "Sky-Blue (Linux)", value: "from-sky-700 to-blue-950" },
];

const CATEGORIES = ["Kiberxavfsizlik", "Dasturlash", "Linux", "Tarmoq xavfsizligi", "Ma'lumotlar bazasi"];

export function CybertechBooksClient({ initialBooks }: Props) {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState(120);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [coverColor, setCoverColor] = useState(COVER_GRADIENTS[0].value);
  const [summary, setSummary] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([{ title: "1-Bob: Muqaddima", content: "" }]);

  // AI PDF upload states
  const [parsingPdf, setParsingPdf] = useState(false);
  const [parsingProgress, setParsingProgress] = useState("");

  const handlePdfUploadForAiBook = async (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast("err", "Faqat PDF formatidagi fayllarni yuklash mumkin.");
      return;
    }

    setParsingPdf(true);
    setParsingProgress("PDF yuklanmoqda...");

    try {
      // Load PDF.js dynamically
      const pdfjs = await new Promise<any>((resolve, reject) => {
        if ((window as any).pdfjsLib) {
          resolve((window as any).pdfjsLib);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
          const pdfjsLib = (window as any).pdfjsLib;
          pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          resolve(pdfjsLib);
        };
        script.onerror = () => reject(new Error("PDF.js yuklab bo'lmadi."));
        document.head.appendChild(script);
      });

      setParsingProgress("PDF matnlari ajratib olinmoqda...");
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let extractedText = "";
      const maxPages = Math.min(pdf.numPages, 10);

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        extractedText += pageText + "\n\n";
      }

      extractedText = extractedText.replace(/\s+/g, " ").trim();

      if (extractedText.length < 200) {
        throw new Error("PDF matni juda qisqa yoki skanerlangan (rasmli PDF).");
      }

      setParsingProgress("AI kitobni tarjima qilmoqda va boblarga ajratmoqda (30-50s)...");

      const res = await fetch("/api/admin/ai-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI tahlilida xatolik yuz berdi");
      }

      setTitle(data.title || "");
      setAuthor(data.author || "Noma'lum muallif");
      setPages(data.pages || pdf.numPages);
      setCategory(data.category || CATEGORIES[0]);
      setSummary(data.summary || "");
      if (Array.isArray(data.chapters) && data.chapters.length > 0) {
        setChapters(data.chapters);
      }

      toast("ok", "AI kitobni muvaffaqiyatli tarjima qildi va maydonlarni to'ldirdi! Ko'rib chiqing va saqlang.");
    } catch (err: any) {
      console.error("AI Book PDF upload error:", err);
      toast("err", "PDF import xatosi: " + (err.message || "tizim xatosi"));
    } finally {
      setParsingPdf(false);
      setParsingProgress("");
    }
  };

  const toast = (type: "ok" | "err", msg: string) => {
    setNotice({ type, msg });
    setTimeout(() => setNotice(null), 4000);
  };

  const openAddModal = () => {
    setEditingBookId(null);
    setTitle("");
    setAuthor("");
    setPages(120);
    setCategory(CATEGORIES[0]);
    setCoverColor(COVER_GRADIENTS[0].value);
    setSummary("");
    setPdfUrl("");
    setChapters([{ title: "1-Bob: Muqaddima", content: "" }]);
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBookId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setPages(book.pages);
    setCategory(book.category);
    setCoverColor(book.coverColor || COVER_GRADIENTS[0].value);
    setSummary(book.summary);
    setPdfUrl(book.pdfUrl || "");
    setChapters(book.chapters && book.chapters.length > 0 ? book.chapters : [{ title: "1-Bob: Muqaddima", content: "" }]);
    setIsModalOpen(true);
  };

  // Chapter editing helpers
  const addChapter = () => {
    setChapters([...chapters, { title: `${chapters.length + 1}-Bob: `, content: "" }]);
  };

  const removeChapter = (index: number) => {
    if (chapters.length <= 1) {
      toast("err", "Kamida bitta bob bo'lishi kerak!");
      return;
    }
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const updateChapter = (index: number, field: "title" | "content", value: string) => {
    setChapters(
      chapters.map((ch, i) => (i === index ? { ...ch, [field]: value } : ch))
    );
  };

  // Save / Update logic
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !summary.trim()) {
      toast("err", "Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    const hasEmptyChapter = chapters.some(ch => !ch.title.trim() || !ch.content.trim());
    if (hasEmptyChapter) {
      toast("err", "Iltimos, barcha bob sarlavhalari va tarkiblarini yozib chiqing!");
      return;
    }

    startTransition(async () => {
      let updatedBooks: Book[] = [];
      if (editingBookId) {
        // Edit existing
        updatedBooks = books.map((b) =>
          b.id === editingBookId
            ? { ...b, title, author, pages, category, coverColor, summary, pdfUrl: pdfUrl.trim() || undefined, chapters }
            : b
        );
      } else {
        // Add new
        const newBook: Book = {
          id: `book-${Date.now()}`,
          title,
          author,
          pages,
          category,
          coverColor,
          summary,
          pdfUrl: pdfUrl.trim() || undefined,
          chapters,
        };
        updatedBooks = [...books, newBook];
      }

      try {
        const response = await fetch("/api/cybertech/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedBooks),
        });

        if (response.ok) {
          setBooks(updatedBooks);
          toast("ok", editingBookId ? "Kitob tahrirlandi!" : "Yangi kitob yuklandi!");
          setIsModalOpen(false);
          router.refresh();
        } else {
          toast("err", "Kitobni saqlashda xatolik yuz berdi.");
        }
      } catch (err) {
        console.error("Save error:", err);
        toast("err", "Tarmoqda xatolik yuz berdi.");
      }
    });
  };

  // Delete logic
  const handleDeleteBook = async () => {
    if (!deleteBookId) return;

    startTransition(async () => {
      const updatedBooks = books.filter((b) => b.id !== deleteBookId);

      try {
        const response = await fetch("/api/cybertech/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedBooks),
        });

        if (response.ok) {
          setBooks(updatedBooks);
          toast("ok", "Kitob kutubxonadan olib tashlandi!");
          setDeleteBookId(null);
          router.refresh();
        } else {
          toast("err", "O'chirishda xatolik yuz berdi.");
        }
      } catch (err) {
        console.error("Delete error:", err);
        toast("err", "Tarmoq xatoligi.");
      }
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-blue-600" />
            Cyber Tech Kutubxonasi boshqaruvi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Platforma kutubxonasiga yangi kiberxavfsizlik va dasturlash kitoblarini yuklang, tahrirlang yoki oling.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          📖 Yangi Kitob Qo'shish
        </button>
      </div>

      {/* Dynamic alerts */}
      {notice && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-sm font-medium animate-fade-in border ${
            notice.type === "ok"
              ? "bg-emerald-50 text-emerald-800 border-emerald-100"
              : "bg-rose-50 text-rose-800 border-rose-100"
          }`}
        >
          {notice.type === "ok" ? (
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          {notice.msg}
        </div>
      )}

      {/* Library Table Grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4">Kitob</th>
              <th className="px-6 py-4">Muallif</th>
              <th className="px-6 py-4">Kategoriya</th>
              <th className="px-6 py-4">Sahifalar / Boblar</th>
              <th className="px-6 py-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-8 rounded bg-gradient-to-br ${book.coverColor || "from-slate-600 to-slate-800"} shadow-sm shrink-0 flex items-center justify-center text-[8px] font-black text-white p-1 text-center font-mono leading-none uppercase`}>
                      {book.title.slice(0, 3)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 line-clamp-1">{book.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{book.summary}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-600">{book.author}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {book.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                  {book.pages} bet / {book.chapters?.length || 0} ta bob
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(book)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                      title="Tahrirlash"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteBookId(book.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition"
                      title="O'chirish"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {books.length === 0 && (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <BookOpen className="h-8 w-8 mx-auto text-slate-300" />
            <p>Hozircha kutubxonada kitoblar mavjud emas.</p>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col animate-success-pop my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="h-5 w-5 text-blue-600" />
                {editingBookId ? "Kitobni tahrirlash" : "Kutubxonaga yangi kitob yuklash"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* AI PDF Upload Zone */}
              {!editingBookId && (
                <div className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-xl p-5 bg-blue-50/10 transition text-center cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePdfUploadForAiBook(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={parsingPdf}
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    {parsingPdf ? (
                      <>
                        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                        <span className="text-xs font-bold text-blue-600 animate-pulse">{parsingProgress}</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-7 w-7 text-blue-500" />
                        <span className="text-sm font-bold text-slate-800">
                          AI PDF Kitob Yuklash (O'qish, Tarjima va Eslab qolish)
                        </span>
                        <span className="text-xs text-slate-500 max-w-md">
                          Matnli PDF darslikni yuklang. Gemini AI kitobni o'qiydi, o'zbek tiliga o'ta aniq tarjima qiladi, boblarga bo'ladi va platforma xotirasiga (AI Mentor) saqlaydi!
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Form content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Kitob PDF havolasi (URL)</label>
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="Ixtiyoriy, masalan: https://library.ziyonet.uz/uploads/books/Informatika_8.pdf"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400">Agar havola kiritilsa, saytda kitob bevosita shu PDF fayl shaklida yuklab olinadi va yangi oynada ochiladi.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Kitob sarlavhasi</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masalan: Kiberxavfsizlik asoslari"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Muallif</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Masalan: Cyber Tech Academiya"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Kategoriya</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Sahifalar soni</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pages}
                    onChange={(e) => setPages(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Cover Gradient Color Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase block">Muqova dizayni (Gradient)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COVER_GRADIENTS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setCoverColor(g.value)}
                      className={`flex items-center gap-2 p-2 border rounded-xl transition text-left text-xs ${
                        coverColor === g.value
                          ? "border-blue-500 bg-blue-50/20 ring-1 ring-blue-500 font-bold"
                          : "border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <span className={`h-5 w-5 rounded bg-gradient-to-br ${g.value} shadow-xs shrink-0`} />
                      <span className="truncate">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Kitob haqida qisqacha ma'lumot (Summary)</label>
                <textarea
                  required
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Kitobning asosiy maqsadi va unda qanday bilimlar berilishi haqida yozing..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-y"
                />
              </div>

              {/* Chapters Area */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">Kitob Boblari va O'quv kontenti</h4>
                  <button
                    type="button"
                    onClick={addChapter}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Yangi bob qo'shish
                  </button>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 border border-slate-100 rounded-xl p-3 bg-slate-50/30">
                  {chapters.map((ch, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 space-y-3 relative shadow-xs">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-bold text-slate-400 font-mono">#{idx + 1}-BOB</span>
                        <button
                          type="button"
                          onClick={() => removeChapter(idx)}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold"
                        >
                          Bobni o'chirish
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Bob sarlavhasi</label>
                        <input
                          type="text"
                          required
                          value={ch.title}
                          onChange={(e) => updateChapter(idx, "title", e.target.value)}
                          placeholder="Masalan: 1-Bob: Ijtimoiy muhandislik xavfi"
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Bob kontenti (Markdown/Matn)</label>
                        <textarea
                          required
                          rows={4}
                          value={ch.content}
                          onChange={(e) => updateChapter(idx, "content", e.target.value)}
                          placeholder="Bobning to'liq o'quv matnini shu yerga yozing..."
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 outline-none resize-y font-sans leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingBookId ? "Saqlash" : "Yuklash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteBookId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="rounded-2xl bg-white p-6 shadow-xl max-w-sm w-full animate-success-pop border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Kitobni o'chirasizmi?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Ushbu kitob kutubxonadan butunlay o'chiriladi. Ushbu amalni ortga qaytarib bo'lmaydi!
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteBookId(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Bekor
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDeleteBook}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Ha, o'chirilsin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
