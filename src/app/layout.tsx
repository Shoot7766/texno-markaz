import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Texno Markaz — 0 dan IT kasb o‘rgan",
    template: "%s | Texno Markaz",
  },
  description:
    "Amaliy darslar, ishga yordam, AI bilan o‘qitish. Kompyuter savodxonligi, dizayn, web va AI kurslari.",
  themeColor: "#0B0F1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="h-full antialiased">
      <body className={`${dmSans.className} min-h-full flex flex-col bg-[#0B0F1A] text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
