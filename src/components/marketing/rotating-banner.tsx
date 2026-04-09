"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Unsplash — marketing (keyin o‘z rasmlaringizni Storage ga qo‘shishingiz mumkin) */
const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80&auto=format&fit=crop",
    alt: "Darsxonada o‘qitish",
    caption: "Zamonaviy sinfxona va mentorlar",
  },
  {
    src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&q=80&auto=format&fit=crop",
    alt: "Texnologiya",
    caption: "IT va dasturlash — amaliy loyihalar",
  },
  {
    src: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=80&auto=format&fit=crop",
    alt: "Kiberxavfsizlik",
    caption: "Kiberxavfsizlik va xavfsiz internet",
  },
  {
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80&auto=format&fit=crop",
    alt: "Kodlash",
    caption: "Birinchi dars — BEPUL",
  },
] as const;

const N = SLIDES.length;
const TZ = 200;

export function RotatingBanner() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  return (
    <div className="border-b border-cyan-500/25 bg-gradient-to-b from-[#0a0f1c] to-[#060912]">
      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-[#6C63FF]">
          Texno Markaz
        </p>

        <div className="relative mx-auto flex min-h-[220px] max-w-3xl items-center justify-center [perspective:1400px] sm:min-h-[260px]">
          {reduceMotion ? (
            <div className="relative h-52 w-full max-w-[340px] overflow-hidden rounded-2xl border border-cyan-400/25 shadow-[0_0_50px_-12px_rgba(0,209,255,0.45)]">
              <Image
                src={SLIDES[0].src}
                alt={SLIDES[0].alt}
                fill
                className="object-cover"
                sizes="340px"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0F1A]/90 via-transparent to-[#0B0F1A]/30" />
              <p className="absolute bottom-3 left-3 right-3 text-center text-sm font-semibold text-white drop-shadow-md">
                {SLIDES[0].caption}
              </p>
            </div>
          ) : (
            <div
              className="relative h-52 w-full max-w-[340px] animate-banner-3d-spin [transform-style:preserve-3d]"
              style={{ willChange: "transform" }}
            >
              {SLIDES.map((slide, i) => (
                <div
                  key={slide.src}
                  className="absolute left-1/2 top-0 h-52 w-[min(92vw,340px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-cyan-400/25 shadow-[0_0_50px_-12px_rgba(0,209,255,0.45)]"
                  style={{
                    transform: `rotateY(${(360 / N) * i}deg) translateZ(${TZ}px)`,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    sizes="340px"
                    priority={i === 0}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0F1A]/90 via-transparent to-[#0B0F1A]/30" />
                  <p className="absolute bottom-3 left-3 right-3 text-center text-sm font-semibold text-white drop-shadow-md">
                    {slide.caption}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {reduceMotion && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Tizimda animatsiya kamaytirilgan. 3D aylanish o‘chirilgan.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/5 bg-black/25 px-4 py-3 text-xs sm:text-sm">
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
