import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HollandHexagon } from "@/components/HollandHexagon";
import { DimensionBars } from "@/components/DimensionBars";
import { CareerCard, type CareerData } from "@/components/CareerCard";
import { ResultActions } from "@/components/ResultActions";
import { RIASEC } from "@/lib/vocational/riasec";
import { rankedDimensions, type Scores } from "@/lib/vocational/matching";
import type { RiasecDim } from "@/lib/supabase/database.types";

export const metadata = { title: "Tus resultados · Brújula" };

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: assessment } = await supabase
    .from("assessments")
    .select("id, scores, holland_code, completed_at")
    .eq("id", id)
    .single();

  if (!assessment) notFound();

  const { data: recs } = await supabase
    .from("recommendations")
    .select(
      "score, rank, explanation, careers(id, name, description, riasec_code, field, avg_duration_years, academic_demand, job_demand, avg_monthly_cost, job_market_outlook, university_examples, key_skills)"
    )
    .eq("assessment_id", id)
    .order("rank", { ascending: true });

  const scores = assessment.scores as Scores;
  const top = rankedDimensions(scores).slice(0, 3);
  const careerIds = (recs ?? [])
    .map((r) => (r.careers as unknown as CareerData)?.id)
    .filter(Boolean);
  const compareHref = `/comparar?ids=${careerIds.slice(0, 3).join(",")}`;

  return (
    <div className="space-y-12">
      {/* Encabezado del perfil */}
      <header>
        <p className="font-mono text-sm font-semibold text-primary">
          Tu perfil vocacional
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Tu código es{" "}
          <span className="font-mono text-primary">
            {assessment.holland_code}
          </span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Combinas sobre todo{" "}
          {top.map((d, i) => (
            <span key={d}>
              <strong>{RIASEC[d].name}</strong>
              {i < top.length - 1 ? ", " : ""}
            </span>
          ))}
          . Así se reparten tus intereses:
        </p>
      </header>

      {/* Hexágono + barras */}
      <section className="grid gap-8 rounded-2xl border border-border bg-surface p-6 sm:p-8 lg:grid-cols-2">
        <div className="flex items-center justify-center">
          <HollandHexagon scores={scores} size={340} />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="mb-4 font-display text-lg font-semibold">
            Tus dimensiones
          </h2>
          <DimensionBars scores={scores} />
        </div>
      </section>

      {/* Acciones */}
      <ResultActions compareHref={compareHref} />

      {/* Recomendaciones */}
      <section aria-labelledby="recos">
        <h2 id="recos" className="font-display text-2xl font-bold tracking-tight">
          Carreras recomendadas para ti
        </h2>
        <p className="mt-1 text-muted">
          Ordenadas por afinidad con tu perfil. Cada una explica por qué aparece.
        </p>
        <div className="mt-6 space-y-5">
          {(recs ?? []).map((r) => {
            const career = r.careers as unknown as CareerData;
            return (
              <CareerCard
                key={career.id}
                career={career}
                rank={r.rank}
                score={r.score}
                explanation={r.explanation}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
