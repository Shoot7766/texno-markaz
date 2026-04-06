"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/types";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) throw new Error("Forbidden");
  return { supabase, user };
}

export async function updateLeadStatus(id: string, status: LeadStatus, adminNote?: string) {
  const { supabase, user } = await requireAdmin();
  const patch: Record<string, unknown> = { status };
  if (adminNote !== undefined) patch.admin_note = adminNote;
  await supabase.from("leads").update(patch).eq("id", id);
  await supabase.from("activity_logs").insert({
    actor_id: user.id,
    action: "lead_status",
    entity_type: "lead",
    entity_id: id,
    details: { status },
  });
  revalidatePath("/admin/arizalar");
  revalidatePath("/admin");
}

export async function convertLeadToStudent(
  leadId: string,
  payload: {
    course_id: string;
    package_id: string | null;
    group_id: string | null;
    parent_phone: string;
    start_date: string;
    end_date: string | null;
    total_amount: number;
    discount: number;
  }
) {
  const { supabase, user } = await requireAdmin();

  const { data: lead, error: le } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();
  if (le || !lead) throw new Error("Ariza topilmadi");

  const { data: student, error: se } = await supabase
    .from("students")
    .insert({
      lead_id: leadId,
      first_name: lead.first_name,
      last_name: lead.last_name,
      phone: lead.phone,
      parent_phone: payload.parent_phone,
      course_id: payload.course_id,
      package_id: payload.package_id,
      group_id: payload.group_id,
      start_date: payload.start_date,
      end_date: payload.end_date,
      status: "active",
      total_amount: payload.total_amount,
      paid_amount: 0,
      discount: payload.discount,
      payment_status: "qarz",
      comment: "",
    })
    .select("id")
    .single();

  if (se || !student) throw new Error(se?.message ?? "O‘quvchi yaratilmadi");

  await supabase
    .from("leads")
    .update({ status: "oquvchiga_aylantirildi" as LeadStatus })
    .eq("id", leadId);

  await supabase.from("activity_logs").insert({
    actor_id: user.id,
    action: "lead_to_student",
    entity_type: "student",
    entity_id: student.id,
    details: { lead_id: leadId },
  });

  revalidatePath("/admin/arizalar");
  revalidatePath("/admin/oquvchilar");
  revalidatePath("/admin");
}

export async function upsertAttendance(
  studentId: string,
  groupId: string | null,
  date: string,
  status: "keldi" | "kelmadi" | "kechikdi"
) {
  const { supabase, user } = await requireAdmin();
  if (groupId) {
    await supabase
      .from("attendance")
      .delete()
      .eq("student_id", studentId)
      .eq("attendance_date", date)
      .eq("group_id", groupId);
  } else {
    await supabase
      .from("attendance")
      .delete()
      .eq("student_id", studentId)
      .eq("attendance_date", date)
      .is("group_id", null);
  }
  await supabase.from("attendance").insert({
    student_id: studentId,
    group_id: groupId,
    attendance_date: date,
    status,
  });
  await supabase.from("activity_logs").insert({
    actor_id: user.id,
    action: "attendance_mark",
    entity_type: "attendance",
    entity_id: null,
    details: { student_id: studentId, date, status },
  });
  revalidatePath("/admin/davomat");
}

export async function addPayment(
  studentId: string,
  amount: number,
  method: "naqd" | "karta" | "online",
  note: string,
  paidAt: string
) {
  const { supabase, user } = await requireAdmin();
  await supabase.from("payments").insert({
    student_id: studentId,
    amount,
    method,
    note,
    paid_at: paidAt,
  });
  await supabase.from("activity_logs").insert({
    actor_id: user.id,
    action: "payment_add",
    entity_type: "payment",
    entity_id: null,
    details: { student_id: studentId, amount },
  });
  revalidatePath("/admin/tollov");
  revalidatePath("/admin/oquvchilar");
}

export async function updateStudent(
  id: string,
  patch: Record<string, unknown>
) {
  const { supabase, user } = await requireAdmin();
  await supabase.from("students").update(patch).eq("id", id);
  await supabase.from("activity_logs").insert({
    actor_id: user.id,
    action: "student_update",
    entity_type: "student",
    entity_id: id,
    details: patch,
  });
  revalidatePath("/admin/oquvchilar");
}

export async function saveCourse(id: string, patch: Record<string, unknown>) {
  const { supabase, user } = await requireAdmin();
  await supabase.from("courses").update(patch).eq("id", id);
  await supabase.from("activity_logs").insert({
    actor_id: user.id,
    action: "course_update",
    entity_type: "course",
    entity_id: id,
    details: patch,
  });
  revalidatePath("/admin/kurslar");
  revalidatePath("/kurslar");
  revalidatePath("/");
}

export async function savePackage(id: string, patch: Record<string, unknown>) {
  const { supabase, user } = await requireAdmin();
  await supabase.from("packages").update(patch).eq("id", id);
  await supabase.from("activity_logs").insert({
    actor_id: user.id,
    action: "package_update",
    entity_type: "package",
    entity_id: id,
    details: patch,
  });
  revalidatePath("/admin/paketlar");
  revalidatePath("/paketlar");
  revalidatePath("/");
}

export async function upsertSettings(patch: Record<string, unknown>) {
  const { supabase, user } = await requireAdmin();
  const { data } = await supabase.from("settings").select("id").limit(1).maybeSingle();
  if (data?.id) {
    await supabase
      .from("settings")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", data.id);
  }
  await supabase.from("activity_logs").insert({
    actor_id: user.id,
    action: "settings_update",
    entity_type: "settings",
    entity_id: data?.id ?? null,
    details: patch,
  });
  revalidatePath("/admin/sozlamalar");
  revalidatePath("/");
  revalidatePath("/admin/login");
  revalidatePath("/ariza");
  revalidatePath("/kurslar");
  revalidatePath("/paketlar");
}

export async function savePublicStats(patch: Record<string, unknown>) {
  const { supabase, user } = await requireAdmin();
  const { data } = await supabase.from("public_stats").select("id").limit(1).maybeSingle();
  if (data?.id) {
    await supabase.from("public_stats").update(patch).eq("id", data.id);
  }
  await supabase.from("activity_logs").insert({
    actor_id: user.id,
    action: "public_stats_update",
    entity_type: "public_stats",
    entity_id: data?.id ?? null,
    details: patch,
  });
  revalidatePath("/");
  revalidatePath("/admin");
}
