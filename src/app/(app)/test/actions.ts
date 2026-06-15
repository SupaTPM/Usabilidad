"use server";

import { createClient } from "@/lib/supabase/server";
import { computeScores, hollandCode, matchCareers } from "@/lib/vocational/matching";
import type { RiasecDim } from "@/lib/supabase/database.types";

export interface SubmitResult {
  ok: boolean;
  assessmentId?: string;
  error?: string;
}

/**
 * Procesa el test completo (RF4): guarda respuestas, calcula el perfil
 * RIASEC, lo compara con el catálogo de carreras y persiste las
 * recomendaciones con su explicación (RF5, RF6). Devuelve el id para
 * navegar a los resultados.
 */
export async function submitAssessment(
  answers: { questionId: string; value: number }[]
): Promise<SubmitResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  // Preguntas (para mapear dimensión) y carreras (para el matching).
  const [{ data: questions }, { data: careers }, { data: questionnaire }] =
    await Promise.all([
      supabase.from("questions").select("id, dimension").eq("is_active", true),
      supabase.from("careers").select("id, name, riasec_code").eq("is_active", true),
      supabase.from("questionnaires").select("id").eq("is_active", true).limit(1).single(),
    ]);

  if (!questions?.length || !careers?.length) {
    return { ok: false, error: "Faltan datos del cuestionario. Ejecuta el seed." };
  }

  const scores = computeScores(
    questions.map((q) => ({ id: q.id, dimension: q.dimension as RiasecDim })),
    answers.map((a) => ({ question_id: a.questionId, value: a.value }))
  );
  const code = hollandCode(scores);
  const matches = matchCareers(scores, careers).slice(0, 6);

  // 1) crear evaluación
  const { data: assessment, error: aErr } = await supabase
    .from("assessments")
    .insert({
      user_id: user.id,
      questionnaire_id: questionnaire?.id ?? null,
      status: "completed",
      scores,
      holland_code: code,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (aErr || !assessment) {
    return { ok: false, error: "No se pudo guardar la evaluación." };
  }

  // 2) guardar respuestas
  const { error: rErr } = await supabase.from("assessment_responses").insert(
    answers.map((a) => ({
      assessment_id: assessment.id,
      question_id: a.questionId,
      value: a.value,
    }))
  );
  if (rErr) return { ok: false, error: "No se pudieron guardar tus respuestas." };

  // 3) guardar recomendaciones
  const { error: recErr } = await supabase.from("recommendations").insert(
    matches.map((m) => ({
      assessment_id: assessment.id,
      career_id: m.career_id,
      score: m.score,
      rank: m.rank,
      explanation: m.explanation,
    }))
  );
  if (recErr) return { ok: false, error: "No se pudieron guardar las recomendaciones." };

  return { ok: true, assessmentId: assessment.id };
}
