import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { formatUzs } from "@/lib/format";
import type { Course } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const supabase = createPublicSupabaseClient();
    const { data } = await supabase
      .from("courses")
      .select("name, description")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) return { title: "Kurs" };
    return {
      title: data.name,
      description: data.description.slice(0, 160),
    };
  } catch {
    return { title: "Kurs" };
  }
}

export default async function KursDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();
  const { data: row, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !row) notFound();

  const c = row as Course;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <nav className="text-sm text-slate-500">
        <Link href="/kurslar" className="text-[#00D1FF] hover:underline">
          Kurslar
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">{c.name}</span>
      </nav>

      <article
        className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 tm-ring-glow"
        style={{ borderTopWidth: 4, borderTopColor: c.color ?? "#00D1FF" }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">{c.name}</h1>
        <p className="mt-4 text-lg text-slate-400">{c.description}</p>

        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Narx</dt>
            <dd className="mt-1 text-xl font-semibold text-[#00D1FF]">
              {formatUzs(Number(c.price))}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Davomiylik</dt>
            <dd className="mt-1 text-xl font-semibold text-white">{c.duration}</dd>
          </div>
          {c.level ? (
            <div>
              <dt className="text-sm text-slate-500">Daraja</dt>
              <dd className="mt-1 font-medium text-slate-300">{c.level}</dd>
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <dt className="text-sm text-slate-500">Kimlar uchun</dt>
            <dd className="mt-2 text-slate-300">
              {(c.for_who ?? []).length ? (c.for_who ?? []).join(" · ") : "—"}
            </dd>
          </div>
          {(c.features ?? []).length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-slate-500">Afzalliklar</dt>
              <dd className="mt-2">
                <ul className="list-inside list-disc space-y-1 text-slate-400">
                  {(c.features ?? []).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>

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
