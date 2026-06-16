import { assignStudent, removeAssignment } from "../actions";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata = { title: "Asignaciones · Admin · Brújula" };

export default async function AsignacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ sel?: string }>;
}) {
  const { sel: selectedId } = await searchParams;
  const supabase = await createClient();

  // Todos los orientadores
  const { data: orientadores } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "orientador")
    .order("full_name");

  // Todos los estudiantes
  const { data: allStudents } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "student")
    .order("full_name");

  // Si hay orientador seleccionado, traemos sus asignaciones
  const { data: assignments } = selectedId
    ? await supabase
        .from("student_assignments")
        .select("student_id")
        .eq("orientador_id", selectedId)
    : { data: [] };

  const assignedIds = new Set((assignments ?? []).map((a) => a.student_id));
  const assignedStudents = (allStudents ?? []).filter((s) => assignedIds.has(s.id));
  const availableStudents = (allStudents ?? []).filter((s) => !assignedIds.has(s.id));

  const selectedOrientador = (orientadores ?? []).find((o) => o.id === selectedId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Asignaciones</h1>
        <p className="mt-1 text-sm text-muted">
          Seleccioná un orientador para gestionar sus estudiantes asignados.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Lista de orientadores */}
        <aside>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Orientadores ({(orientadores ?? []).length})
          </p>
          {(orientadores ?? []).length === 0 ? (
            <p className="text-sm text-muted">No hay orientadores registrados.</p>
          ) : (
            <ul className="space-y-1">
              {(orientadores ?? []).map((o) => (
                <li key={o.id}>
                  <a
                    href={`/admin/usuarios?sel=${o.id}`}
                    className={`block rounded-lg border px-3 py-2.5 text-sm transition ${
                      o.id === selectedId
                        ? "border-primary bg-primary/5 font-semibold text-primary"
                        : "border-transparent hover:border-border hover:bg-surface"
                    }`}
                  >
                    <span className="block font-medium">{o.full_name ?? "—"}</span>
                    <span className="block text-xs text-muted">{o.email}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Panel de asignaciones */}
        <div>
          {!selectedId ? (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
              Seleccioná un orientador para ver sus estudiantes.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-surface p-5">
                <p className="font-semibold">{selectedOrientador?.full_name}</p>
                <p className="text-sm text-muted">{selectedOrientador?.email}</p>
              </div>

              {/* Estudiantes asignados */}
              <section>
                <h2 className="mb-3 text-sm font-semibold">
                  Estudiantes asignados ({assignedStudents.length})
                </h2>
                {assignedStudents.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
                    Sin estudiantes asignados aún.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {assignedStudents.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{s.full_name ?? "—"}</p>
                          <p className="text-xs text-muted">{s.email}</p>
                        </div>
                        <form action={removeAssignment}>
                          <input type="hidden" name="orientador_id" value={selectedId} />
                          <input type="hidden" name="student_id" value={s.id} />
                          <button
                            type="submit"
                            className="rounded-md border border-danger/40 px-3 py-1 text-xs font-medium text-danger transition hover:bg-danger/10"
                          >
                            Quitar
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Agregar estudiante */}
              {availableStudents.length > 0 && (
                <section>
                  <h2 className="mb-3 text-sm font-semibold">Agregar estudiante</h2>
                  <form action={assignStudent} className="flex gap-2">
                    <input type="hidden" name="orientador_id" value={selectedId} />
                    <select
                      name="student_id"
                      required
                      className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                      aria-label="Seleccionar estudiante"
                    >
                      <option value="">Seleccioná un estudiante…</option>
                      {availableStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name ?? s.email}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition hover:opacity-90"
                    >
                      Asignar
                    </button>
                  </form>
                </section>
              )}

              {availableStudents.length === 0 && assignedStudents.length > 0 && (
                <p className="text-sm text-muted">
                  Todos los estudiantes registrados ya están asignados a este orientador.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
