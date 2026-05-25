import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  logoUrl?: string | null;
  /** Bo‘sh bo‘lsa "Cyber Tech Academy" ko‘rinadi */
  centerName?: string | null;
  className?: string;
  /** Navbar: kattaroq */
  size?: "sm" | "md" | "lg";
  priority?: boolean;
};

export function BrandLogo({ logoUrl, centerName, className, size = "md", priority = false }: Props) {
  const name = (centerName?.trim() || "Cyber Tech Academy") as string;
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
        "bg-gradient-to-r from-[#39ff14] to-[#00D1FF] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(57,255,20,0.35)]",
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
