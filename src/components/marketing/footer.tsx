import Link from "next/link";
import { BrandLogo } from "@/components/marketing/brand-logo";

export function MarketingFooter({
  phone,
  telegram,
  instagram,
  address,
  centerName,
  logoUrl,
}: {
  phone: string;
  telegram: string;
  instagram: string;
  address: string;
  centerName: string;
  logoUrl?: string | null;
}) {
  return (
    <footer className="border-t border-[#39ff14]/15 bg-[#05070c]/95 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        
        {/* Column 1: Brand & Contact */}
        <div className="font-mono text-xs">
          <BrandLogo logoUrl={logoUrl} centerName={centerName} size="sm" className="mb-4" />
          <p className="font-bold text-white uppercase tracking-wider mt-4">&gt;_ Aloqa</p>
          <p className="mt-2 text-slate-400 font-mono leading-relaxed">{phone}</p>
          <p className="mt-1 text-slate-400 font-mono leading-relaxed">{address}</p>
        </div>

        {/* Column 2: Social Networks */}
        <div className="font-mono text-xs">
          <p className="font-bold text-white uppercase tracking-wider">&gt;_ Ijtimoiy tarmoqlar</p>
          <ul className="mt-3 space-y-2 font-bold uppercase tracking-wider text-[10px]">
            <li>
              <a
                href={telegram}
                className="text-[#39ff14] hover:text-[#00D1FF] transition duration-300"
                target="_blank"
                rel="noreferrer"
              >
                Telegram.CHANNEL
              </a>
            </li>
            <li>
              <a
                href={instagram}
                className="text-[#39ff14] hover:text-[#00D1FF] transition duration-300"
                target="_blank"
                rel="noreferrer"
              >
                Instagram.FEED
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Quick Links */}
        <div className="font-mono text-xs">
          <p className="font-bold text-white uppercase tracking-wider">&gt;_ Tezkor havolalar</p>
          <ul className="mt-3 space-y-2 font-bold uppercase tracking-wider text-[10px]">
            <li>
              <Link href="/kurslar" className="text-slate-400 hover:text-[#39ff14] transition duration-300">
                Kurslar_arxivi
              </Link>
            </li>
            <li>
              <Link href="/dars-jadvali" className="text-slate-400 hover:text-[#39ff14] transition duration-300">
                Dars_jadvali.log
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: System Diagnostics Dashboard (Exclusive Hacker Feature!) */}
        <div className="font-mono text-xs">
          <p className="font-bold text-white uppercase tracking-wider">&gt;_ System Diagnostics</p>
          <ul className="mt-3 space-y-1.5 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
            <li className="flex items-center justify-between border-b border-white/5 pb-1">
              <span>Node Connection:</span>
              <span className="text-[#39ff14] font-black">ESTABLISHED ✓</span>
            </li>
            <li className="flex items-center justify-between border-b border-white/5 pb-1">
              <span>Security Shield:</span>
              <span className="text-[#00D1FF] font-black">ACTIVE 🛡</span>
            </li>
            <li className="flex items-center justify-between border-b border-white/5 pb-1">
              <span>SSL Encryption:</span>
              <span className="text-violet-400 font-black">HIGH (256-BIT)</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Diagnostic Code:</span>
              <span className="text-pink-500 font-black">CYBER_SYS_3.2</span>
            </li>
          </ul>
        </div>

      </div>
      <div className="border-t border-white/5 py-6 text-center text-[9px] font-mono text-slate-600 uppercase tracking-[0.25em]">
        // SECURE PORTAL TERMINAL ONLINE // © {new Date().getFullYear()} {centerName || "Cyber Tech Academy"}. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
}
