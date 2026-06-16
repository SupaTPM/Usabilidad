"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/dashboard";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const errorId = error ? "auth-error" : undefined;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        // Si el proyecto exige confirmación por correo, no hay sesión todavía.
        if (!data.session) {
          setInfo(
            "Revisa tu correo y confirma tu cuenta para continuar. Luego inicia sesión."
          );
          setLoading(false);
          return;
        }
        router.push("/onboarding");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(redirect as never);
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? traducirError(err.message)
          : "Algo salió mal. Inténtalo de nuevo."
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && (
        <p
          id="auth-error"
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}
      {info && (
        <p
          role="status"
          className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm"
        >
          {info}
        </p>
      )}

      {mode === "register" && (
        <Field
          id="fullName"
          label="Nombre completo"
          value={fullName}
          onChange={setFullName}
          autoComplete="name"
          required
          formErrorId={errorId}
        />
      )}
      <Field
        id="email"
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        required
        formErrorId={errorId}
      />
      <Field
        id="password"
        label="Contraseña"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete={mode === "register" ? "new-password" : "current-password"}
        required
        hint={mode === "register" ? "Mínimo 6 caracteres." : undefined}
        formErrorId={errorId}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-fg shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        <span aria-live="polite" aria-atomic="true">
          {loading
            ? "Un momento…"
            : mode === "register"
              ? "Crear cuenta"
              : "Entrar"}
        </span>
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "register" ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-primary underline">
              Inicia sesión
            </Link>
          </>
        ) : (
          <>
            ¿Primera vez?{" "}
            <Link href="/register" className="font-medium text-primary underline">
              Crea tu cuenta
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
  hint,
  formErrorId,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
  formErrorId?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, formErrorId].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="text-danger" aria-hidden> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={formErrorId ? "true" : undefined}
        aria-describedby={describedBy}
        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-base outline-none focus:border-primary"
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

function traducirError(msg: string): string {
  if (/invalid login credentials/i.test(msg))
    return "Correo o contraseña incorrectos.";
  if (/email not confirmed/i.test(msg))
    return "Tu correo aún no está confirmado. Revisa tu bandeja de entrada.";
  if (/rate limit|too many|429/i.test(msg))
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  if (/already registered|already exists/i.test(msg))
    return "Ese correo ya tiene una cuenta. Inicia sesión.";
  if (/password should be at least/i.test(msg))
    return "La contraseña debe tener al menos 6 caracteres.";
  return msg;
}
