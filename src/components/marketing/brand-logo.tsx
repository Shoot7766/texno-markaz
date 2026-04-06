import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  logoUrl?: string | null;
  /** Bo‘sh bo‘lsa "Texno Markaz" ko‘rinadi */
  centerName?: string | null;
  className?: string;
  /** Navbar: kattaroq */
  size?: "sm" | "md" | "lg";
  priority?: boolean;
};

export function BrandLogo({ logoUrl, centerName, className, size = "md", priority = false }: Props) {
  const name = (centerName?.trim() || "Texno Markaz") as string;
  const h = size === "lg" ? 44 : size === "sm" ? 28 : 36;

  if (logoUrl?.trim()) {
    return (
      <span className={cn("relative inline-flex items-center", className)}>
        <Image
          src={logoUrl.trim()}
          alt={name}
          width={180}
          height={h}
          className="h-9 w-auto max-w-[160px] object-contain sm:h-10 sm:max-w-[200px]"
          priority={priority}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-block font-bold tracking-tight",
        "bg-gradient-to-r from-[#00D1FF] to-[#6C63FF] bg-clip-text text-transparent",
        size === "lg" && "text-xl sm:text-2xl",
        size === "md" && "text-lg sm:text-xl",
        size === "sm" && "text-base",
        className
      )}
    >
      {name}
    </span>
  );
}
