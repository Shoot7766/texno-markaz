"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { arizaSchema } from "@/lib/validators/ariza";
import type { z } from "zod";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "tm_visitor_id";

type Props = {
  options: string[];
  /** /ariza?free=1 — bepul dars uchun izoh va banner */
  isFreeLesson?: boolean;
};

export function ArizaForm({ options, isFreeLesson }: Props) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  type ArizaValues = z.infer<typeof arizaSchema>;

  const defaultComment = isFreeLesson
    ? "Bepul birinchi darsga yozilmoqchiman."
    : "";

  const form = useForm({
    resolver: zodResolver(arizaSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "+998",
      age: 18,
      course_or_package: options[0] ?? "",
      preferred_time: "",
      source: "telegram" as const,
      comment: defaultComment,
      website: "",
    },
  });

  async function onSubmit(data: ArizaValues) {
    setServerError(null);
    let visitor_id: string | undefined;
    if (typeof window !== "undefined") {
      visitor_id = localStorage.getItem(STORAGE_KEY) ?? undefined;
    }

    const res = await fetch("/api/ariza", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, visitor_id }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setServerError(
        typeof json.error === "string" ? json.error : "Yuborishda xato yuz berdi"
      );
      return;
    }
    setDone(true);
    form.reset();
  }

  const inputBase =
    "mt-1 w-full rounded-lg border px-3 py-2.5 text-white outline-none ring-[#00D1FF] placeholder:text-slate-500 focus:ring-2";
  const inputBorder = (err: boolean) =>
    err ? "border-red-500/60" : "border-white/10 bg-white/5";

  if (done) {
    return (
      <div
        className="animate-success-pop flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-8 py-16 text-center"
        role="status"
      >
        <CheckCircle2 className="h-16 w-16 text-emerald-400" />
        <h2 className="mt-6 text-xl font-semibold text-white">Ariza qabul qilindi</h2>
        <p className="mt-2 max-w-md text-slate-400">
          Tez orada mutaxassislarimiz siz bilan bog‘lanadi. Rahmat!
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-8 text-sm font-medium text-[#00D1FF] hover:underline"
        >
          Yana ariza yuborish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isFreeLesson && (
        <div className="relative overflow-hidden rounded-2xl border border-[#00D1FF]/30 bg-gradient-to-br from-[#00D1FF]/10 to-[#6C63FF]/10 p-5 tm-glow-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-6 w-6 shrink-0 text-[#00D1FF]" />
            <div>
              <p className="font-semibold text-white">Bepul birinchi dars</p>
              <p className="mt-1 text-sm text-slate-400">
                Joylar cheklangan. Ariza qoldiring — mutaxassislarimiz siz bilan bog‘lanadi.
              </p>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-xl space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 tm-ring-glow sm:p-8"
        noValidate
      >
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="absolute h-0 w-0 opacity-0"
          aria-hidden
          {...form.register("website")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-300">Ism</label>
            <input
              className={cn(inputBase, inputBorder(!!form.formState.errors.first_name))}
              {...form.register("first_name")}
            />
            {form.formState.errors.first_name && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.first_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Familiya</label>
            <input
              className={cn(inputBase, inputBorder(!!form.formState.errors.last_name))}
              {...form.register("last_name")}
            />
            {form.formState.errors.last_name && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Telefon</label>
          <input
            placeholder="+998901234567"
            className={cn(inputBase, inputBorder(!!form.formState.errors.phone))}
            {...form.register("phone")}
          />
          {form.formState.errors.phone && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Yosh</label>
          <input
            type="number"
            min={10}
            max={80}
            className={cn(inputBase, "border-white/10 bg-white/5")}
            {...form.register("age", { valueAsNumber: true })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Kurs yoki paket</label>
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#0d1324] px-3 py-2.5 text-white outline-none ring-[#00D1FF] focus:ring-2"
            {...form.register("course_or_package")}
          >
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Qulay vaqt</label>
          <input
            className={cn(inputBase, "border-white/10 bg-white/5")}
            placeholder="Masalan: kechki 18:00 dan keyin"
            {...form.register("preferred_time")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Qayerdan eshitdingiz</label>
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#0d1324] px-3 py-2.5 text-white outline-none ring-[#00D1FF] focus:ring-2"
            {...form.register("source")}
          >
            <option value="instagram">Instagram</option>
            <option value="telegram">Telegram</option>
            <option value="tanish">Tanish</option>
            <option value="maktab">Maktab</option>
            <option value="boshqa">Boshqa</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Izoh</label>
          <textarea
            rows={4}
            className={cn(inputBase, "border-white/10 bg-white/5")}
            {...form.register("comment")}
          />
        </div>

        {serverError && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00D1FF] to-[#6C63FF] py-3.5 text-sm font-bold text-[#0B0F1A] shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:opacity-60"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Yuborilmoqda…
            </>
          ) : isFreeLesson ? (
            "Bepul darsga yuborish"
          ) : (
            "Yuborish"
          )}
        </button>
      </form>
    </div>
  );
}
