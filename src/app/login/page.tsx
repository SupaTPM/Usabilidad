import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { AuthPageShell } from "@/components/AuthPageShell";

export const metadata = { title: "Iniciar sesión · Brújula" };

export default function LoginPage() {
  return (
    <AuthPageShell>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Bienvenido de vuelta
      </h1>
      <p className="mt-2 text-muted">
        Entra para retomar tu orientación vocacional.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </AuthPageShell>
  );
}
