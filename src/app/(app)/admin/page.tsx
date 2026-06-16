import Link from "next/link";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata = { title: "Administración · Brújula" };

export default async function AdminPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const [questionnaires, questions, careers, assessments, orientadores, students] =
    await Promise.all([
      supabase.from("questionnaires").select("id", { count: "exact", head: true }),
      supabase.from("questions").select("id", { count: "exact", head: true }),
      supabase.from("careers").select("id", { count: "exact", head: true }),
      supabase.from("assessments").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "orientador"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    ]);

  const stats = [
    { label: "Cuestionarios", value: questionnaires.count ?? 0 },
    { label: "Preguntas", value: questions.count ?? 0 },
    { label: "Carreras", value: careers.count ?? 0 },
    { label: "Evaluaciones", value: assessments.count ?? 0 },
    { label: "Orientadores", value: orientadores.count ?? 0 },
    { label: "Estudiantes", value: students.count ?? 0 },
  ];

  const sections = [
    {
      href: "/admin/cuestionarios",
      title: "Cuestionarios y preguntas",
      description: "Crear formularios vocacionales, agregar y editar preguntas, activar o desactivar cuestionarios.",
    },
    {
      href: "/admin/usuarios",
      title: "Asignaciones",
      description: "Asignar estudiantes a orientadores para seguimiento personalizado.",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Administración
        </h1>
        <p className="mt-2 text-muted">
          Gestiona el contenido y los usuarios del sistema.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
            <div className="font-mono text-3xl font-extrabold text-primary">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href as never}
            className="group rounded-xl border border-border bg-surface p-6 transition hover:border-primary"
          >
            <p className="font-semibold group-hover:text-primary">{s.title} →</p>
            <p className="mt-1 text-sm text-muted">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
