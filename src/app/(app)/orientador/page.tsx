import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import type { ProfileRow, AssessmentRow } from "@/lib/supabase/database.types";

export const metadata = { title: "Mis estudiantes · Brújula" };

type AssessmentSummaryForCard = Pick<AssessmentRow, "id" | "holland_code" | "completed_at" | "status">;

type StudentWithAssessment = {
  profile: Pick<ProfileRow, "id" | "full_name" | "email" | "education_level">;
  latestAssessment: AssessmentSummaryForCard | null;
};

/**
 * Dashboard del orientador. Solo accesible con role='orientador'.
 * Muestra los estudiantes asignados y su último resultado vocacional.
 */
export default async function OrientadorPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "orientador") redirect("/dashboard");

  // 1. IDs de estudiantes asignados a este orientador.
  const { data: assignments } = await supabase
    .from("student_assignments")
    .select("student_id, assigned_at")
    .eq("orientador_id", user!.id);

  const studentIds = (assignments ?? []).map((a) => a.student_id);

  // 2. Perfiles de los estudiantes (RLS permite verlos por la política orientador).
  const { data: studentProfiles } = studentIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, education_level")
        .in("id", studentIds)
    : { data: [] as ProfileRow[] };

  type AssessmentSummary = Pick<AssessmentRow, "id" | "user_id" | "holland_code" | "completed_at" | "status">;

  // 3. Última evaluación completada por estudiante.
  const { data: assessments } = studentIds.length > 0
    ? await supabase
        .from("assessments")
        .select("id, user_id, holland_code, completed_at, status")
        .in("user_id", studentIds)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
    : { data: [] as AssessmentSummary[] };

  // Mapear: ultimo assessment por student_id.
  const latestByStudent = new Map<string, AssessmentSummary>();
  for (const a of (assessments ?? []) as AssessmentSummary[]) {
    if (!latestByStudent.has(a.user_id)) latestByStudent.set(a.user_id, a);
  }

  const students: StudentWithAssessment[] = (studentProfiles ?? []).map((p) => ({
    profile: p as Pick<ProfileRow, "id" | "full_name" | "email" | "education_level">,
    latestAssessment: (latestByStudent.get(p.id) ?? null) as AssessmentSummaryForCard | null,
  }));

  const completedCount = students.filter((s) => s.latestAssessment).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Mis estudiantes
        </h1>
        <p className="mt-2 text-muted">
          Seguimiento de los estudiantes asignados a tu orientación.
        </p>
      </header>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="font-mono text-3xl font-extrabold text-primary">
            {students.length}
          </div>
          <div className="mt-1 text-sm text-muted">Estudiantes asignados</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="font-mono text-3xl font-extrabold text-success">
            {completedCount}
          </div>
          <div className="mt-1 text-sm text-muted">Con test completado</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="font-mono text-3xl font-extrabold text-warning">
            {students.length - completedCount}
          </div>
          <div className="mt-1 text-sm text-muted">Sin completar aún</div>
        </div>
      </div>

      {/* Lista de estudiantes */}
      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="font-medium text-fg">Sin estudiantes asignados aún</p>
          <p className="mt-1 text-sm text-muted">
            Contactá al administrador para que te asigne estudiantes.
          </p>
        </div>
      ) : (
        <section aria-label="Estudiantes asignados">
          <h2 className="mb-4 text-lg font-semibold">Listado</h2>
          <ul className="space-y-4" role="list">
            {students.map(({ profile: p, latestAssessment: a }) => (
              <li
                key={p.id}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{p.full_name ?? "Sin nombre"}</p>
                    <p className="text-sm text-muted">{p.email}</p>
                    {p.education_level && (
                      <p className="mt-0.5 text-xs capitalize text-muted">
                        {p.education_level}
                      </p>
                    )}
                  </div>

                  {a ? (
                    <div className="text-right">
                      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-mono font-bold text-primary">
                        {a.holland_code ?? "—"}
                      </span>
                      <p className="mt-1 text-xs text-muted">
                        {a.completed_at
                          ? new Date(a.completed_at).toLocaleDateString("es", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                      <a
                        href={`/resultados/${a.id}`}
                        className="mt-1 block text-xs font-medium text-primary underline hover:opacity-80"
                        aria-label={`Ver resultados de ${p.full_name ?? "estudiante"}`}
                      >
                        Ver resultados
                      </a>
                    </div>
                  ) : (
                    <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted">
                      Sin test
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="rounded-xl border border-border bg-surface-2 p-5 text-sm text-muted">
        <p className="font-medium text-fg">Nota</p>
        <p className="mt-1">
          Los estudiantes son asignados por el administrador del sistema.
          Para agregar o remover estudiantes, contactá a quien gestiona la plataforma.
        </p>
      </div>
    </div>
  );
}
