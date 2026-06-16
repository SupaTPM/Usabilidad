import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createQuestion,
  deleteQuestion,
  toggleQuestion,
  updateQuestionnaire,
} from "../../actions";

export const metadata = { title: "Preguntas · Admin · Brújula" };

const DIMENSIONS = ["R", "I", "A", "S", "E", "C"] as const;
const DIM_LABELS: Record<string, string> = {
  R: "R — Realista",
  I: "I — Investigador",
  A: "A — Artístico",
  S: "S — Social",
  E: "E — Emprendedor",
  C: "C — Convencional",
};
const CATEGORIES = ["intereses", "aptitudes", "habilidades", "preferencias"];

export default async function QuestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: questionnaire } = await supabase
    .from("questionnaires")
    .select("id, title, description, is_active")
    .eq("id", id)
    .single();

  if (!questionnaire) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("id, text, dimension, category, order_index, is_active")
    .eq("questionnaire_id", id)
    .order("order_index");

  const grouped: Record<string, typeof questions> = {};
  for (const dim of DIMENSIONS) grouped[dim] = [];
  for (const q of questions ?? []) {
    grouped[q.dimension] ??= [];
    grouped[q.dimension]!.push(q);
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted">
            <Link href={"/admin/cuestionarios" as never} className="hover:text-fg">
              ← Cuestionarios
            </Link>
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold">{questionnaire.title}</h1>
          {questionnaire.description && (
            <p className="mt-1 text-sm text-muted">{questionnaire.description}</p>
          )}
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${
            questionnaire.is_active
              ? "bg-success/10 text-success"
              : "bg-surface-2 text-muted"
          }`}
        >
          {questionnaire.is_active ? "Activo" : "Inactivo"}
        </span>
      </header>

      {/* Editar datos del cuestionario */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 font-semibold">Editar cuestionario</h2>
        <form action={updateQuestionnaire} className="space-y-3">
          <input type="hidden" name="id" value={id} />
          <div>
            <label htmlFor="edit-title" className="mb-1 block text-sm font-medium">
              Título
            </label>
            <input
              id="edit-title"
              name="title"
              required
              defaultValue={questionnaire.title}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="edit-desc" className="mb-1 block text-sm font-medium">
              Descripción
            </label>
            <textarea
              id="edit-desc"
              name="description"
              rows={2}
              defaultValue={questionnaire.description ?? ""}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition hover:opacity-90"
          >
            Guardar cambios
          </button>
        </form>
      </section>

      {/* Preguntas agrupadas por dimensión */}
      <section className="space-y-6">
        <h2 className="font-display text-lg font-bold">
          Preguntas ({(questions ?? []).length})
        </h2>

        {DIMENSIONS.map((dim) => (
          <div key={dim} className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-3 font-semibold">{DIM_LABELS[dim]}</h3>
            {(grouped[dim] ?? []).length === 0 ? (
              <p className="mb-3 text-sm text-muted">Sin preguntas en esta dimensión.</p>
            ) : (
              <ul className="mb-3 space-y-2">
                {(grouped[dim] ?? []).map((q) => (
                  <li
                    key={q.id}
                    className={`flex items-start justify-between gap-3 rounded-lg border p-3 text-sm ${
                      q.is_active ? "border-border" : "border-border/50 opacity-60"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={q.is_active ? "" : "line-through"}>{q.text}</p>
                      <p className="mt-0.5 text-xs text-muted capitalize">
                        #{q.order_index} · {q.category}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <form action={toggleQuestion}>
                        <input type="hidden" name="id" value={q.id} />
                        <input type="hidden" name="questionnaire_id" value={id} />
                        <input type="hidden" name="is_active" value={String(q.is_active)} />
                        <button
                          type="submit"
                          className="rounded-md border border-border px-2 py-1 text-xs text-muted transition hover:border-primary hover:text-fg"
                        >
                          {q.is_active ? "Ocultar" : "Activar"}
                        </button>
                      </form>
                      <form action={deleteQuestion}>
                        <input type="hidden" name="id" value={q.id} />
                        <input type="hidden" name="questionnaire_id" value={id} />
                        <button
                          type="submit"
                          className="rounded-md border border-danger/30 px-2 py-1 text-xs text-danger transition hover:bg-danger/10"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Agregar pregunta en esta dimensión */}
            <form action={createQuestion} className="flex flex-col gap-2 sm:flex-row">
              <input type="hidden" name="questionnaire_id" value={id} />
              <input type="hidden" name="dimension" value={dim} />
              <input
                name="text"
                required
                placeholder={`Nueva pregunta ${dim}…`}
                className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <select
                name="category"
                className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                aria-label="Categoría de la pregunta"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-fg transition hover:opacity-90"
              >
                + Agregar
              </button>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}
