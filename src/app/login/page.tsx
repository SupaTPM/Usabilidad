import { Suspense } from "react";
import { Logo } from "@/components/Brand";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Iniciar sesión · Brújula" };

export default function LoginPage() {
  return (
    <main
      id="contenido"
      className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12"
    >
      <div className="mb-8">
        <Logo />
      </div>
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
    </main>
  );
}
