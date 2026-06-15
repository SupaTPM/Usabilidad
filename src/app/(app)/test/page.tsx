import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TestRunner } from "@/components/TestRunner";

export const metadata = { title: "Test vocacional · Brújula" };

export default async function TestPage() {
  const supabase = await createClient();
  const { data: questions } = await supabase
    .from("questions")
    .select("id, text, category, order_index")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (!questions?.length) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h1 className="font-display text-2xl font-bold">Aún no hay preguntas</h1>
        <p className="mt-2 text-muted">
          Ejecuta el seed de la base de datos para cargar el cuestionario:
        </p>
        <code className="mt-3 inline-block rounded-lg bg-surface-2 px-3 py-2 font-mono text-sm">
          npm run db:reset
        </code>
        <div className="mt-6">
          <Link href="/dashboard" className="text-primary underline">
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-mono text-sm font-semibold text-primary">Paso 2 de 2</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
        Test de intereses
      </h1>
      <p className="mt-2 text-muted">
        Responde con sinceridad: piensa en cuánto te identificas con cada frase.
        No hay respuestas correctas.
      </p>
      <div className="mt-8">
        <TestRunner questions={questions} />
      </div>
    </div>
  );
}
