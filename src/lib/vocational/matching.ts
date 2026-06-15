import type { RiasecDim } from "@/lib/supabase/database.types";
import { RIASEC, RIASEC_ORDER, riasecName } from "./riasec";

export type Scores = Record<RiasecDim, number>;

interface QuestionLite {
  id: string;
  dimension: RiasecDim;
}
interface ResponseLite {
  question_id: string;
  value: number; // Likert 1-5
}
interface CareerLite {
  id: string;
  name: string;
  riasec_code: string; // p.ej. "SIA"
}

/**
 * Calcula el perfil RIASEC a partir de las respuestas Likert.
 * Cada dimensión se normaliza a 0-100 (promedio de sus ítems, escala 1-5).
 */
export function computeScores(
  questions: QuestionLite[],
  responses: ResponseLite[]
): Scores {
  const byQuestion = new Map(responses.map((r) => [r.question_id, r.value]));
  const sum: Scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const count: Scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  for (const q of questions) {
    const v = byQuestion.get(q.id);
    if (typeof v === "number") {
      sum[q.dimension] += v;
      count[q.dimension] += 1;
    }
  }

  const scores = {} as Scores;
  for (const dim of RIASEC_ORDER) {
    // (promedio 1-5 → 0-100):  ((avg - 1) / 4) * 100
    const avg = count[dim] > 0 ? sum[dim] / count[dim] : 1;
    scores[dim] = Math.round(((avg - 1) / 4) * 100);
  }
  return scores;
}

/** Dimensiones ordenadas de mayor a menor puntaje. */
export function rankedDimensions(scores: Scores): RiasecDim[] {
  return [...RIASEC_ORDER].sort((a, b) => scores[b] - scores[a]);
}

/** Código Holland: las 3 dimensiones más altas (p.ej. "SIA"). */
export function hollandCode(scores: Scores): string {
  return rankedDimensions(scores).slice(0, 3).join("");
}

/**
 * Afinidad (0-100) entre el código Holland del usuario y el de una carrera.
 * Las posiciones más altas pesan más (3-2-1); coincidir en orden suma extra.
 */
function affinity(userCode: string, careerCode: string): number {
  const weights = [3, 2, 1];
  const maxScore = 3 + 2 + 1 + 3; // posiciones + bonus por orden exacto
  let raw = 0;

  careerCode.split("").forEach((letter, i) => {
    const pos = userCode.indexOf(letter);
    if (pos !== -1) {
      raw += weights[i] ?? 1;
      if (pos === i) raw += 1; // mismo orden → bonus
    }
  });

  return Math.round((raw / maxScore) * 100);
}

export interface CareerMatch {
  career_id: string;
  name: string;
  score: number;
  rank: number;
  explanation: string;
}

/**
 * Rankea las carreras según el perfil del usuario y genera una explicación
 * legible de por qué se recomienda cada una (RF5 + RF6).
 */
export function matchCareers(
  scores: Scores,
  careers: CareerLite[]
): CareerMatch[] {
  const userCode = hollandCode(scores);

  return careers
    .map((c) => {
      const score = affinity(userCode, c.riasec_code);
      const shared = c.riasec_code
        .split("")
        .filter((l) => userCode.includes(l)) as RiasecDim[];
      return { career: c, score, shared };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ career, score, shared }, idx) => ({
      career_id: career.id,
      name: career.name,
      score,
      rank: idx + 1,
      explanation: buildExplanation(career.name, userCode, shared),
    }));
}

function buildExplanation(
  careerName: string,
  userCode: string,
  shared: RiasecDim[]
): string {
  if (shared.length === 0) {
    return `${careerName} se aleja un poco de tu perfil ${userCode}. Puede ser una opción para explorar si te llama la atención, aunque tus intereses apuntan a otras áreas.`;
  }
  const names = shared.map((d) => `${riasecName(d)} (${d})`);
  const list =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
  const traits = shared
    .map((d) => RIASEC[d].tagline.toLowerCase())
    .join(", ");
  return `Coincide con tu perfil en ${list}. Tu tendencia a ${traits} encaja con lo que esta carrera exige a diario, por eso aparece entre tus recomendaciones.`;
}
