import Link from "next/link";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { formatUzs } from "@/lib/format";
import type { Package } from "@/lib/types";

export const metadata = {
  title: "Paketlar",
  description: "Kurslar kombinatsiyasi va bonuslar bilan foydali paketlar.",
};

export default async function PaketlarPage() {
  let packages: Package[] = [];
  try {
    const supabase = createPublicSupabaseClient();
    const { data } = await supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    packages = (data ?? []) as Package[];
  } catch {
    packages = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Paketlar</h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        Bir nechta kursni birga o‘rganing — tejamkor narx va qo‘shimcha bonuslar.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {packages.map((p) => (
          <article
            key={p.id}
            className="relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-[#6C63FF]/30"
          >
            {p.is_recommended && (
              <span className="absolute right-6 top-6 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-300">
                Tavsiya etiladi
              </span>
            )}
            <h2 className="pr-28 text-xl font-semibold text-white">{p.name}</h2>
            <p className="mt-3 flex-1 text-slate-400">{p.description}</p>
            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-bold text-[#00D1FF]">{formatUzs(Number(p.price))}</span>
              {p.original_price > p.price && (
                <span className="text-lg text-slate-600 line-through">
                  {formatUzs(Number(p.original_price))}
                </span>
              )}
            </div>
            {p.bonus ? (
              <p className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                <span className="font-semibold">Bonus:</span> {p.bonus}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/paketlar/${p.slug}`}
                className="inline-flex w-fit rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-[#00D1FF]/40"
              >
                Batafsil
              </Link>
              <Link
                href="/ariza?free=1"
                className="inline-flex w-fit rounded-full bg-gradient-to-r from-[#00D1FF] to-[#6C63FF] px-5 py-2.5 text-sm font-semibold text-[#0B0F1A] hover:brightness-110"
              >
                Ariza qoldirish
              </Link>
            </div>
          </article>
        ))}
      </div>
      {packages.length === 0 && (
        <p className="mt-8 text-slate-500">Paketlar hozircha bo‘sh.</p>
      )}
    </div>
  );
}
