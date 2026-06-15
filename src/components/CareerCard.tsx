import type { DemandLevel } from "@/lib/supabase/database.types";

export interface CareerData {
  id: string;
  name: string;
  description: string | null;
  riasec_code: string;
  field: string | null;
  avg_duration_years: number | null;
  academic_demand: DemandLevel | null;
  job_demand: DemandLevel | null;
  avg_monthly_cost: number | null;
  job_market_outlook: string | null;
  university_examples: string[];
  key_skills: string[];
}

const DEMAND: Record<DemandLevel, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export function CareerCard({
  career,
  rank,
  score,
  explanation,
}: {
  career: CareerData;
  rank?: number;
  score?: number;
  explanation?: string | null;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            {rank != null && (
              <span className="font-mono text-sm font-bold text-muted">
                #{rank}
              </span>
            )}
            <h3 className="font-display text-xl font-bold tracking-tight">
              {career.name}
            </h3>
          </div>
          <p className="mt-1 text-sm text-muted">
            {career.field} · Código {career.riasec_code}
          </p>
        </div>
        {score != null && (
          <div className="shrink-0 text-right">
            <div className="font-mono text-2xl font-extrabold text-primary">
              {score}%
            </div>
            <div className="text-xs text-muted">afinidad</div>
          </div>
        )}
      </div>

      {explanation && (
        <div className="mx-5 mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:mx-6">
          <p className="text-sm">
            <span className="font-semibold">Por qué encaja contigo: </span>
            {explanation}
          </p>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-px border-t border-border bg-border text-sm sm:grid-cols-4">
        <Cell label="Duración" value={career.avg_duration_years ? `${career.avg_duration_years} años` : "—"} />
        <Cell label="Exigencia" value={career.academic_demand ? DEMAND[career.academic_demand] : "—"} />
        <Cell label="Demanda laboral" value={career.job_demand ? DEMAND[career.job_demand] : "—"} />
        <Cell
          label="Costo aprox."
          value={career.avg_monthly_cost ? `$${career.avg_monthly_cost}/mes` : "—"}
        />
      </dl>

      <div className="space-y-3 p-5 sm:p-6">
        {career.description && (
          <p className="text-sm text-muted">{career.description}</p>
        )}
        {career.job_market_outlook && (
          <p className="text-sm">
            <span className="font-semibold">Campo laboral: </span>
            {career.job_market_outlook}
          </p>
        )}
        {career.key_skills?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {career.key_skills.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        {career.university_examples?.length > 0 && (
          <p className="text-xs text-muted">
            Dónde estudiarla: {career.university_examples.join(" · ")}
          </p>
        )}
      </div>
    </article>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface p-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}
