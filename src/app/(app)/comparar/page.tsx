import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { CareerData } from "@/components/CareerCard";
import type { DemandLevel } from "@/lib/supabase/database.types";

export const metadata = { title: "Comparar carreras · Brújula" };

const DEMAND: Record<DemandLevel, string> = { low: "Baja", medium: "Media", high: "Alta" };

const ROWS: { label: string; get: (c: CareerData) => string }[] = [
  { label: "Área", get: (c) => c.field ?? "—" },
  { label: "Código RIASEC", get: (c) => c.riasec_code },
  { label: "Duración", get: (c) => (c.avg_duration_years ? `${c.avg_duration_years} años` : "—") },
  { label: "Exigencia académica", get: (c) => (c.academic_demand ? DEMAND[c.academic_demand] : "—") },
  { label: "Demanda laboral", get: (c) => (c.job_demand ? DEMAND[c.job_demand] : "—") },
  { label: "Costo aprox.", get: (c) => (c.avg_monthly_cost ? `$${c.avg_monthly_cost}/mes` : "—") },
  { label: "Campo laboral", get: (c) => c.job_market_outlook ?? "—" },
];

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const idList = (ids ?? "").split(",").filter(Boolean).slice(0, 4);

  const supabase = await createClient();
  const { data } = idList.length
    ? await supabase.from("careers").select("*").in("id", idList)
    : { data: [] };

  // Mantener el orden recibido en la URL.
  const careers = idList
    .map((id) => (data ?? []).find((c) => c.id === id))
    .filter(Boolean) as CareerData[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Comparar opciones
        </h1>
        <p className="mt-2 text-muted">
          Pon tus alternativas lado a lado para decidir con más información.
        </p>
      </header>

      {careers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted">
          No hay carreras seleccionadas.{" "}
          <Link href="/carreras" className="text-primary underline">
            Explora el catálogo
          </Link>{" "}
          para elegir.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Comparación de carreras seleccionadas
            </caption>
            <thead>
              <tr className="bg-surface-2">
                <th scope="col" className="p-4 text-left font-medium text-muted">
                  Criterio
                </th>
                {careers.map((c) => (
                  <th
                    key={c.id}
                    scope="col"
                    className="min-w-[180px] p-4 text-left font-display text-base font-bold"
                  >
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <th scope="row" className="bg-surface p-4 text-left font-medium text-muted">
                    {row.label}
                  </th>
                  {careers.map((c) => (
                    <td key={c.id} className="bg-surface p-4 align-top">
                      {row.get(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
