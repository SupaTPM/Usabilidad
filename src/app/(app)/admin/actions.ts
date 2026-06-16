"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) redirect("/login" as never);
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (data?.role !== "admin") redirect("/dashboard" as never);
  return { supabase, userId: user.id };
}

// ─── Asignaciones orientador ↔ estudiante ────────────────────────────
export async function assignStudent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const orientadorId = formData.get("orientador_id") as string;
  const studentId = formData.get("student_id") as string;
  if (!orientadorId || !studentId) return;
  await supabase
    .from("student_assignments")
    .upsert({ orientador_id: orientadorId, student_id: studentId });
  revalidatePath("/admin/usuarios");
}

export async function removeAssignment(formData: FormData) {
  const { supabase } = await requireAdmin();
  const orientadorId = formData.get("orientador_id") as string;
  const studentId = formData.get("student_id") as string;
  await supabase
    .from("student_assignments")
    .delete()
    .eq("orientador_id", orientadorId)
    .eq("student_id", studentId);
  revalidatePath("/admin/usuarios");
}

// ─── Cuestionarios ────────────────────────────────────────────────────
export async function createQuestionnaire(formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string).trim();
  if (!title) return;
  const { data, error } = await supabase
    .from("questionnaires")
    .insert({ title, description: description || null })
    .select("id")
    .single();
  if (!error && data) redirect(`/admin/cuestionarios/${data.id}` as never);
}

export async function updateQuestionnaire(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string).trim();
  await supabase
    .from("questionnaires")
    .update({ title, description: description || null })
    .eq("id", id);
  revalidatePath(`/admin/cuestionarios/${id}`);
}

export async function toggleQuestionnaire(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") as string;
  const isActive = formData.get("is_active") === "true";
  await supabase
    .from("questionnaires")
    .update({ is_active: !isActive })
    .eq("id", id);
  revalidatePath("/admin/cuestionarios");
}

// ─── Preguntas ────────────────────────────────────────────────────────
export async function createQuestion(formData: FormData) {
  const { supabase } = await requireAdmin();
  const questionnaireId = formData.get("questionnaire_id") as string;
  const text = (formData.get("text") as string).trim();
  const dimension = formData.get("dimension") as "R" | "I" | "A" | "S" | "E" | "C";
  const category = (formData.get("category") as string) || "intereses";
  if (!text || !dimension) return;

  const { data: last } = await supabase
    .from("questions")
    .select("order_index")
    .eq("questionnaire_id", questionnaireId)
    .order("order_index", { ascending: false })
    .limit(1);

  await supabase.from("questions").insert({
    questionnaire_id: questionnaireId,
    text,
    dimension,
    category,
    order_index: (last?.[0]?.order_index ?? 0) + 1,
  });
  revalidatePath(`/admin/cuestionarios/${questionnaireId}`);
}

export async function deleteQuestion(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") as string;
  const questionnaireId = formData.get("questionnaire_id") as string;
  await supabase.from("questions").delete().eq("id", id);
  revalidatePath(`/admin/cuestionarios/${questionnaireId}`);
}

export async function toggleQuestion(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") as string;
  const questionnaireId = formData.get("questionnaire_id") as string;
  const isActive = formData.get("is_active") === "true";
  await supabase
    .from("questions")
    .update({ is_active: !isActive })
    .eq("id", id);
  revalidatePath(`/admin/cuestionarios/${questionnaireId}`);
}
