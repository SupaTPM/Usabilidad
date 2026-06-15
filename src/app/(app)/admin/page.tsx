import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Administración · Brújula" };

/**
 * Panel de administración (RF10). Acceso restringido a rol 'admin' por
 * RLS y por esta comprobación. Base para gestionar cuestionarios,
 * preguntas y carreras (CRUD a implementar sobre estas tablas).
 */
export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const [questionnaires, questions, careers, assessments] = await Promise.all([
    supabase.from("questionnaires").select("id", { count: "exact", head: true }),
    supabase.from("questions").select("id", { count: "exact", head: true }),
    supabase.from("careers").select("id", { count: "exact", head: true }),
    supabase.from("assessments").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Cuestionarios", value: questionnaires.count ?? 0 },
    { label: "Preguntas", value: questions.count ?? 0 },
    { label: "Carreras", value: careers.count ?? 0 },
    { label: "Evaluaciones", value: assessments.count ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Administración
        </h1>
        <p className="mt-2 text-muted">
          Gestiona el contenido del sistema vocacional.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
            <div className="font-mono text-3xl font-extrabold text-primary">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface-2 p-5 text-sm text-muted">
        <p className="font-medium text-fg">Próximos pasos del panel</p>
        <p className="mt-1">
          Las tablas <code className="font-mono">questionnaires</code>,{" "}
          <code className="font-mono">questions</code> y{" "}
          <code className="font-mono">careers</code> ya tienen políticas RLS que
          permiten escritura solo a administradores. Aquí se conectará el CRUD
          para crear y editar preguntas, formularios y recomendaciones.
        </p>
      </div>
    </div>
  );
}
