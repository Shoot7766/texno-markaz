import Link from "next/link";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/marketing/brand-logo";

const nav = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/kurslar", label: "Kurslar" },
  { href: "/dars-jadvali", label: "Dars jadvali" },
  { href: "/paketlar", label: "Paketlar" },
  { href: "/ariza", label: "Ariza" },
];

type Props = {
  centerName: string;
  logoUrl?: string | null;
};

export function MarketingHeader({ centerName, logoUrl }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0f1a]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-90">
          <BrandLogo logoUrl={logoUrl} centerName={centerName} size="md" priority />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-400 transition hover:text-[#00D1FF]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/ariza?free=1"
            className="rounded-full bg-gradient-to-r from-[#00D1FF] to-[#6C63FF] px-4 py-2 text-sm font-semibold text-[#0B0F1A] shadow-lg shadow-cyan-500/20 transition hover:brightness-110"
          >
            Bepul dars
          </Link>
        </nav>
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-lg p-2 text-slate-300 hover:bg-white/5">
            <Menu className="h-6 w-6" />
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#12182a] p-2 shadow-xl tm-glow">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-[#00D1FF]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/ariza?free=1"
              className="mt-1 block rounded-lg bg-gradient-to-r from-[#00D1FF] to-[#6C63FF] px-3 py-2 text-center text-sm font-semibold text-[#0B0F1A]"
            >
              Bepul dars
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
