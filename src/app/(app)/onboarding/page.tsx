import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/OnboardingForm";

export const metadata = { title: "Tu perfil · Brújula" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-lg">
      <p className="font-mono text-sm font-semibold text-primary">Paso 1 de 2</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
        Cuéntanos sobre ti
      </h1>
      <p className="mt-2 text-muted">
        Con esto personalizamos tus recomendaciones. Solo toma un minuto.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <OnboardingForm defaultName={profile?.full_name ?? ""} />
      </div>
    </div>
  );
}
