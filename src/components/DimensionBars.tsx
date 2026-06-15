import type { RiasecDim } from "@/lib/supabase/database.types";
import { RIASEC } from "@/lib/vocational/riasec";
import { rankedDimensions, type Scores } from "@/lib/vocational/matching";

/** Barras por dimensión, ordenadas de mayor a menor afinidad. */
export function DimensionBars({ scores }: { scores: Scores }) {
  const ordered = rankedDimensions(scores);
  return (
    <ul className="space-y-3">
      {ordered.map((dim: RiasecDim) => {
        const m = RIASEC[dim];
        const value = scores[dim] ?? 0;
        return (
          <li key={dim}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">
                <span className="font-mono font-bold" style={{ color: `rgb(var(${m.colorVar}))` }}>
                  {dim}
                </span>{" "}
                {m.name}
              </span>
              <span className="font-mono text-muted">{value}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full"
                style={{ width: `${value}%`, background: `rgb(var(${m.colorVar}))` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
