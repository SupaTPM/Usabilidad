import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { CareersExplorer } from "@/components/CareersExplorer";
import { CareersListSkeleton } from "@/components/Skeletons";
import type { CareerData } from "@/components/CareerCard";

export const metadata = { title: "Explorar carreras · Brújula" };

export default function CareersPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Explora carreras
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Revisa el campo laboral, la duración, el costo aproximado y dónde
          estudiar cada opción.
        </p>
      </header>

      <Suspense fallback={<CareersListSkeleton />}>
        <CareersData />
      </Suspense>
    </div>
  );
}

async function CareersData() {
  const supabase = await createClient();
  const { data: careers } = await supabase
    .from("careers")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (!careers?.length) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted">
        No hay carreras cargadas. Ejecuta el seed con{" "}
        <code className="font-mono">npm run db:reset</code>.
      </p>
    );
  }

  return <CareersExplorer careers={careers as CareerData[]} />;
}
