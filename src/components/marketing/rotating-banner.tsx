"use client";

import Link from "next/link";

const tickerItems = [
  "Birinchi dars — BEPUL · joylar cheklangan",
  "Yangi: Robototexnika va Kiberxavfsizlik asoslari kurslari",
  "Ariza qoldiring — mutaxassislarimiz tez orada bog‘lanadi",
  "IT, dizayn, web, AI, Office — amaliy darslar",
  "Texno Markaz — zamonaviy o‘quv markazi",
];

export function RotatingBanner() {
  const loop = [...tickerItems, ...tickerItems];

  return (
    <div className="border-b border-cyan-500/25 bg-gradient-to-r from-[#0d1528] via-[#0a1020] to-[#0d1528]">
      <div className="relative overflow-hidden py-2">
        <div
          className="flex w-max animate-marquee gap-0"
          aria-hidden
        >
          {loop.map((text, i) => (
            <span
              key={i}
              className="inline-flex shrink-0 items-center gap-3 px-8 text-sm font-medium text-slate-200"
            >
              <span className="h-1 w-1 shrink-0 rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
              {text}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 border-t border-white/5 bg-black/20 px-4 py-2 text-xs sm:text-sm">
        <Link
          href="/ariza?free=1"
          className="font-semibold text-[#00D1FF] transition hover:text-[#6C63FF]"
        >
          Bepul darsga yozilish
        </Link>
        <span className="text-slate-600">·</span>
        <Link href="/kurslar" className="font-medium text-slate-400 transition hover:text-white">
          Barcha kurslar
        </Link>
        <span className="text-slate-600">·</span>
        <Link href="/ariza" className="font-medium text-slate-400 transition hover:text-white">
          Ariza
        </Link>
      </div>
    </div>
  );
}
