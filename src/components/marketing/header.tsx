"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/marketing/brand-logo";

const nav = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/cyber-tech", label: "Cyber Tech" },
  { href: "/kurslar", label: "Kurslar" },
  { href: "/dars-jadvali", label: "Dars jadvali" },
];

type Props = {
  centerName: string;
  logoUrl?: string | null;
};

export function MarketingHeader({ centerName, logoUrl }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#39ff14]/15 bg-[#05070c]/85 backdrop-blur-xl shadow-[0_4px_30px_rgba(57,255,20,0.03)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        
        <div className="flex items-center gap-2">
          <Link href="/" className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-90">
            <BrandLogo logoUrl={logoUrl} centerName={centerName} size="md" priority />
          </Link>
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#39ff14]/20 bg-[#39ff14]/5 text-[9px] font-mono text-[#39ff14] uppercase tracking-widest font-black">
            <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14] animate-pulse" />
            SECURE NODE // ONLINE
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-5 lg:gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-xs font-mono font-bold uppercase tracking-wider text-slate-400 transition-all duration-300 hover:text-[#39ff14] hover:drop-shadow-[0_0_8px_#39ff14]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation Drawer */}
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-lg p-2 text-slate-300 hover:bg-white/5">
            <Menu className="h-6 w-6" />
          </summary>
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#39ff14]/30 bg-[#05070c]/95 p-3.5 shadow-2xl z-50 backdrop-blur-xl">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-300 hover:bg-[#39ff14]/10 hover:text-[#39ff14] transition"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </details>

      </div>
    </header>
  );
}
