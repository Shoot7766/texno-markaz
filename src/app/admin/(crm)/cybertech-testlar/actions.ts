"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface QuestionInput {
  questionText: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

export interface QuizInput {
  title: string;
  category: string;
  timeLimit: number;
}

// Helper to assert admin privilege securely on the server-side
async function assertAdmin(): Promise<{ error?: string; user?: any }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Avtorizatsiya talab qilinadi." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return { error: "Faqat adminlar ushbu amalni bajara oladi." };
  }
  return { user };
}

// ─── Create Quiz ──────────────────────────────────────────────────────────────
export async function createQuiz(
  quizInfo: QuizInput,
  questions: QuestionInput[]
): Promise<{ error?: string }> {
  const authCheck = await assertAdmin();
  if (authCheck.error) return { error: authCheck.error };

  const serviceClient = createServiceClient();

  // Insert quiz
  const { data: quizData, error: quizErr } = await serviceClient
    .from("ct_quizzes")
    .insert({
      title: quizInfo.title.trim(),
      category: quizInfo.category,
      time_limit: Number(quizInfo.timeLimit),
    })
    .select()
    .single();

  if (quizErr) return { error: quizErr.message };

  // Insert questions
  const toInsert = questions.map((q) => ({
    quiz_id: quizData.id,
    question_text: q.questionText.trim(),
    options: q.options.map((o) => o.trim()),
    correct_option: q.correctOption,
    explanation: q.explanation.trim(),
  }));

  const { error: qsErr } = await serviceClient.from("ct_questions").insert(toInsert);
  if (qsErr) return { error: qsErr.message };

  revalidatePath("/admin/cybertech-testlar");
  return {};
}

// ─── Delete Quiz ──────────────────────────────────────────────────────────────
export async function deleteQuiz(id: string): Promise<{ error?: string }> {
  const authCheck = await assertAdmin();
  if (authCheck.error) return { error: authCheck.error };

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.from("ct_quizzes").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/cybertech-testlar");
  return {};
}

// ─── Update Quiz Meta ─────────────────────────────────────────────────────────
export async function updateQuizMeta(
  id: string,
  patch: Partial<QuizInput>
): Promise<{ error?: string }> {
  const authCheck = await assertAdmin();
  if (authCheck.error) return { error: authCheck.error };

  const updateObj: Record<string, unknown> = {};
  if (patch.title) updateObj.title = patch.title.trim();
  if (patch.category) updateObj.category = patch.category;
  if (patch.timeLimit) updateObj.time_limit = Number(patch.timeLimit);

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from("ct_quizzes")
    .update(updateObj)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/cybertech-testlar");
  return {};
}

// ─── Delete Single Question ───────────────────────────────────────────────────
export async function deleteQuestion(id: string): Promise<{ error?: string }> {
  const authCheck = await assertAdmin();
  if (authCheck.error) return { error: authCheck.error };

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.from("ct_questions").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/cybertech-testlar");
  return {};
}

// ─── Add question to existing quiz ───────────────────────────────────────────
export async function addQuestionToQuiz(
  quizId: string,
  question: QuestionInput
): Promise<{ error?: string }> {
  const authCheck = await assertAdmin();
  if (authCheck.error) return { error: authCheck.error };

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.from("ct_questions").insert({
    quiz_id: quizId,
    question_text: question.questionText.trim(),
    options: question.options.map((o) => o.trim()),
    correct_option: question.correctOption,
    explanation: question.explanation.trim(),
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/cybertech-testlar");
  return {};
}
