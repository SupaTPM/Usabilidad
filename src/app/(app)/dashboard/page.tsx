import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RIASEC } from "@/lib/vocational/riasec";
import type { RiasecDim } from "@/lib/supabase/database.types";

export const metadata = { title: "Mi panel · Brújula" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: assessments }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user!.id).single(),
    supabase
      .from("assessments")
      .select("id, holland_code, status, completed_at, started_at")
      .eq("user_id", user!.id)
      .order("started_at", { ascending: false }),
  ]);

  const firstName = (profile?.full_name || "").split(" ")[0];
  const completed = (assessments ?? []).filter((a) => a.status === "completed");

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Hola{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="mt-2 text-muted">
          {completed.length === 0
            ? "Aún no has hecho tu test vocacional. Empieza cuando quieras."
            : "Aquí está tu actividad. Puedes repetir el test cuando cambien tus intereses."}
        </p>
      </header>

      {/* CTA principal */}
      <section className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="font-display text-xl font-semibold">
            {completed.length === 0 ? "Haz tu test vocacional" : "Repetir el test"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            30 preguntas · menos de 10 minutos.
          </p>
        </div>
        <Link
          href="/test"
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-fg shadow-sm transition hover:opacity-90"
        >
          {completed.length === 0 ? "Comenzar test" : "Hacer de nuevo"}
        </Link>
      </section>

      {/* Historial (RF7) */}
      <section aria-labelledby="historial">
        <h2 id="historial" className="font-display text-xl font-bold tracking-tight">
          Tus evaluaciones
        </h2>
        {completed.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-muted">
            Cuando completes un test, tus resultados quedarán guardados aquí.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {completed.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/resultados/${a.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 transition hover:border-primary"
                >
                  <div className="flex items-center gap-3">
                    <CodeBadge code={a.holland_code} />
                    <div>
                      <p className="font-semibold">
                        Perfil {a.holland_code}
                      </p>
                      <p className="text-sm text-muted">
                        {formatDate(a.completed_at)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    Ver resultados →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CodeBadge({ code }: { code: string | null }) {
  const letters = (code ?? "").split("") as RiasecDim[];
  return (
    <span className="flex gap-1" aria-hidden>
      {letters.map((l, i) => (
        <span
          key={i}
          className="grid h-8 w-8 place-items-center rounded-md font-mono text-sm font-bold text-white"
          style={{ background: `rgb(var(${RIASEC[l]?.colorVar ?? "--primary"}))` }}
        >
          {l}
        </span>
      ))}
    </span>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
