import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Boshqaruv" },
  { href: "/admin/arizalar", label: "Arizalar" },
  { href: "/admin/oquvchilar", label: "O‘quvchilar" },
  { href: "/admin/guruhlar", label: "Guruhlar" },
  { href: "/admin/davomat", label: "Davomat" },
  { href: "/admin/tollov", label: "To‘lov" },
  { href: "/admin/kurslar", label: "Kurslar" },
  { href: "/admin/paketlar", label: "Paketlar" },
  { href: "/admin/sozlamalar", label: "Sozlamalar" },
  { href: "/admin/journal", label: "Jurnal" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {links.map((l) => {
        const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
