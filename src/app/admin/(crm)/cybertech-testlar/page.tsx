import { createClient } from "@/lib/supabase/server";
import { CyberTestsClient } from "./client";

export const metadata = { title: "CT Testlar boshqaruvi" };

export default async function AdminCyberTechTestsPage() {
  const supabase = await createClient();

  const { data: quizzes, error } = await supabase
    .from("ct_quizzes")
    .select("*, ct_questions(*)")
    .order("created_at", { ascending: false });

  return (
    <CyberTestsClient
      initialQuizzes={quizzes ?? []}
      dbError={error?.message ?? null}
    />
  );
}
