"use client";

import { useMemo, useState } from "react";
import { CareerCard, type CareerData } from "./CareerCard";

/** Normaliza para comparar sin distinción de acentos ni mayúsculas. */
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * Explorador de carreras con búsqueda y filtro por área. Todo el filtrado
 * ocurre en el cliente sobre los datos ya cargados: no navega ni recarga la
 * vista en cada búsqueda.
 */
export function CareersExplorer({ careers }: { careers: CareerData[] }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<string>("Todas");

  const areas = useMemo(() => {
    const set = new Set(careers.map((c) => c.field).filter(Boolean) as string[]);
    return ["Todas", ...Array.from(set).sort()];
  }, [careers]);

  const results = useMemo(() => {
    const q = norm(query.trim());
    return careers.filter((c) => {
      if (area !== "Todas" && c.field !== area) return false;
      if (!q) return true;
      const haystack = norm(
        [c.name, c.field, c.description, c.riasec_code, ...(c.key_skills ?? [])]
          .filter(Boolean)
          .join(" ")
      );
      return haystack.includes(q);
    });
  }, [careers, query, area]);

  return (
    <div>
      <div className="space-y-4">
        <div>
          <label htmlFor="buscar" className="mb-1.5 block text-sm font-medium">
            Buscar
          </label>
          <input
            id="buscar"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Carrera, área o habilidad…"
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-base outline-none focus:border-primary"
          />
        </div>

        <div role="group" aria-label="Filtrar por área" className="flex flex-wrap gap-2">
          {areas.map((a) => {
            const active = area === a;
            return (
              <button
                key={a}
                type="button"
                aria-pressed={active}
                onClick={() => setArea(a)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-primary bg-primary text-primary-fg"
                    : "border-border bg-surface hover:border-primary"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted" role="status" aria-live="polite">
        {results.length}{" "}
        {results.length === 1 ? "carrera encontrada" : "carreras encontradas"}
      </p>

      {results.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-muted">
          No hay carreras que coincidan con tu búsqueda. Prueba con otra palabra
          o cambia el área.
        </p>
      ) : (
        <div className="mt-4 space-y-5">
          {results.map((c) => (
            <CareerCard key={c.id} career={c} />
          ))}
        </div>
      )}
    </div>
  );
}
