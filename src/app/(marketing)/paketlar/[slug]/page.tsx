import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { formatUzs } from "@/lib/format";
import type { Course, Package } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const supabase = createPublicSupabaseClient();
    const { data } = await supabase
      .from("packages")
      .select("name, description")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) return { title: "Paket" };
    return {
      title: data.name,
      description: data.description.slice(0, 160),
    };
  } catch {
    return { title: "Paket" };
  }
}

export default async function PaketDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();
  const { data: pkg, error } = await supabase
    .from("packages")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !pkg) notFound();

  const p = pkg as Package;
  let relatedCourses: Course[] = [];
  if (p.course_ids?.length) {
    const { data: courses } = await supabase
      .from("courses")
      .select("*")
      .in("id", p.course_ids)
      .eq("is_active", true);
    relatedCourses = (courses ?? []) as Course[];
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <nav className="text-sm text-slate-500">
        <Link href="/paketlar" className="text-[#00D1FF] hover:underline">
          Paketlar
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">{p.name}</span>
      </nav>

      <article className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 tm-ring-glow">
        {p.is_recommended && (
          <span className="inline-block rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-300">
            Tavsiya etiladi
          </span>
        )}
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">{p.name}</h1>
        <p className="mt-4 text-lg text-slate-400">{p.description}</p>

        <div className="mt-8 flex flex-wrap items-baseline gap-3 border-t border-white/10 pt-8">
          <span className="text-3xl font-bold text-[#00D1FF]">{formatUzs(Number(p.price))}</span>
          {p.original_price > p.price && (
            <span className="text-xl text-slate-600 line-through">
              {formatUzs(Number(p.original_price))}
            </span>
          )}
        </div>
        {p.bonus ? (
          <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-300">
            <span className="font-semibold">Bonus:</span> {p.bonus}
          </p>
        ) : null}

        {relatedCourses.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Paket tarkibi
            </h2>
            <ul className="mt-3 space-y-2">
              {relatedCourses.map((c) => (
                <li key={c.id}>
                  <Link href={`/kurslar/${c.slug}`} className="text-[#00D1FF] hover:underline">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/ariza?free=1"
            className="inline-flex rounded-full bg-gradient-to-r from-[#00D1FF] to-[#6C63FF] px-6 py-3 text-sm font-semibold text-[#0B0F1A] shadow-lg shadow-cyan-500/20 hover:brightness-110"
          >
            Bepul darsga yozilish
          </Link>
          <Link
            href="/ariza"
            className="inline-flex rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-[#00D1FF]/40"
          >
            Ariza qoldirish
          </Link>
        </div>
      </article>
    </div>
  );
}
