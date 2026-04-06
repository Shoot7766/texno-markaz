import { Suspense } from "react";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { VisitorTracker } from "@/components/visitor-tracker";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

async function getFooter() {
  try {
    const supabase = createPublicSupabaseClient();
    const { data } = await supabase
      .from("settings")
      .select("center_name, phone, telegram, instagram, address, logo_url")
      .limit(1)
      .maybeSingle();
    return (
      data ?? {
        center_name: "Texno Markaz",
        phone: "+998 90 123 45 67",
        telegram: "https://t.me/",
        instagram: "https://instagram.com/",
        address: "Toshkent",
        logo_url: "",
      }
    );
  } catch {
    return {
      center_name: "Texno Markaz",
      phone: "+998 90 123 45 67",
      telegram: "https://t.me/",
      instagram: "https://instagram.com/",
      address: "Toshkent",
      logo_url: "",
    };
  }
}

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getFooter();

  return (
    <>
      <Suspense fallback={null}>
        <VisitorTracker />
      </Suspense>
      <MarketingHeader centerName={s.center_name} logoUrl={s.logo_url} />
      <main className="flex-1">{children}</main>
      <MarketingFooter
        centerName={s.center_name}
        logoUrl={s.logo_url}
        phone={s.phone}
        telegram={s.telegram || "#"}
        instagram={s.instagram || "#"}
        address={s.address || ""}
      />
    </>
  );
}
