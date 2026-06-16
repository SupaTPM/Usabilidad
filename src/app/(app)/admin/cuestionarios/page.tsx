import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createQuestionnaire, toggleQuestionnaire } from "../actions";

export const metadata = { title: "Cuestionarios · Admin · Brújula" };

export default async function CuestionariosPage() {
  const supabase = await createClient();
  const { data: questionnaires } = await supabase
    .from("questionnaires")
    .select("id, title, description, is_active, created_at")
    .order("created_at", { ascending: false });

  // Contar preguntas por cuestionario
  const { data: counts } = await supabase
    .from("questions")
    .select("questionnaire_id")
    .eq("is_active", true);

  const countMap: Record<string, number> = {};
  for (const q of counts ?? []) {
    countMap[q.questionnaire_id] = (countMap[q.questionnaire_id] ?? 0) + 1;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold">Cuestionarios</h1>
        <p className="mt-1 text-sm text-muted">
          Administrá los formularios vocacionales y sus preguntas.
        </p>
      </header>

      {/* Crear nuevo */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 font-semibold">Nuevo cuestionario</h2>
        <form action={createQuestionnaire} className="space-y-3">
          <div>
            <label htmlFor="q-title" className="mb-1 block text-sm font-medium">
              Título <span className="text-danger" aria-hidden>*</span>
            </label>
            <input
              id="q-title"
              name="title"
              required
              placeholder="Ej.: Test RIASEC 2026"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="q-desc" className="mb-1 block text-sm font-medium">
              Descripción
            </label>
            <textarea
              id="q-desc"
              name="description"
              rows={2}
              placeholder="Descripción opcional…"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition hover:opacity-90"
          >
            Crear cuestionario
          </button>
        </form>
      </section>

      {/* Lista */}
      {(questionnaires ?? []).length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted">
          No hay cuestionarios aún.
        </p>
      ) : (
        <ul className="space-y-3">
          {(questionnaires ?? []).map((q) => (
            <li
              key={q.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      q.is_active ? "bg-success" : "bg-muted"
                    }`}
                    aria-hidden
                  />
                  <p className="font-medium">{q.title}</p>
                </div>
                {q.description && (
                  <p className="mt-0.5 truncate text-sm text-muted">{q.description}</p>
                )}
                <p className="mt-0.5 text-xs text-muted">
                  {countMap[q.id] ?? 0} preguntas activas
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/admin/cuestionarios/${q.id}` as never}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:border-primary"
                >
                  Editar preguntas
                </Link>
                <form action={toggleQuestionnaire}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="is_active" value={String(q.is_active)} />
                  <button
                    type="submit"
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      q.is_active
                        ? "border-danger/40 text-danger hover:bg-danger/10"
                        : "border-success/40 text-success hover:bg-success/10"
                    }`}
                  >
                    {q.is_active ? "Desactivar" : "Activar"}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
