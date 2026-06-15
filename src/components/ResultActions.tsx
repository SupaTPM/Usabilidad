"use client";

import Link from "next/link";

/** Acciones sobre los resultados: comparar (RF8) y descargar reporte (RF9). */
export function ResultActions({ compareHref }: { compareHref: string }) {
  return (
    <div className="flex flex-wrap gap-3 print:hidden">
      <Link
        href={compareHref as never}
        className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold transition hover:bg-surface-2"
      >
        Comparar opciones
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition hover:opacity-90"
      >
        Descargar reporte (PDF)
      </button>
    </div>
  );
}
