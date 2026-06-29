import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { AuthPageShell } from "@/components/AuthPageShell";

export const metadata = { title: "Crear cuenta · Brújula" };

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Crea tu cuenta
      </h1>
      <p className="mt-2 text-muted">
        Empieza a descubrir las carreras que encajan contigo.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <Suspense>
          <AuthForm mode="register" />
        </Suspense>
      </div>
    </AuthPageShell>
  );
}
