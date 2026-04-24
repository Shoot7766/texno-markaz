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
    <footer className="border-t border-white/10 bg-[#080c14]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <BrandLogo logoUrl={logoUrl} centerName={centerName} size="sm" className="mb-4" />
          <p className="text-sm font-semibold text-slate-200">Aloqa</p>
          <p className="mt-2 text-sm text-slate-400">{phone}</p>
          <p className="mt-1 text-sm text-slate-400">{address}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">Ijtimoiy tarmoqlar</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <a
                href={telegram}
                className="text-[#00D1FF] transition hover:text-[#6C63FF]"
                target="_blank"
                rel="noreferrer"
              >
                Telegram
              </a>
            </li>
            <li>
              <a
                href={instagram}
                className="text-[#00D1FF] transition hover:text-[#6C63FF]"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">Tezkor havolalar</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-400">
            <li>
              <Link href="/kurslar" className="transition hover:text-[#00D1FF]">
                Kurslar
              </Link>
            </li>
            <li>
              <Link href="/paketlar" className="transition hover:text-[#00D1FF]">
                Paketlar
              </Link>
            </li>
            <li>
              <Link href="/dars-jadvali" className="transition hover:text-[#00D1FF]">
                Dars jadvali
              </Link>
            </li>
            <li>
              <Link href="/ariza" className="transition hover:text-[#00D1FF]">
                Ariza
              </Link>
            </li>
            <li>
              <Link href="/ariza?free=1" className="transition hover:text-[#00D1FF]">
                Bepul darsga yozilish
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {centerName || "Texno Markaz"}. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
}
