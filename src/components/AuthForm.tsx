"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useShowHints } from "@/lib/accessibility/useShowHints";

type Mode = "login" | "register";

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  form?: string;
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/dashboard";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateClient(): FieldErrors {
    const errors: FieldErrors = {};
    if (mode === "register" && !fullName.trim()) {
      errors.fullName = "Ingresa tu nombre completo.";
    }
    if (!email.trim()) errors.email = "Ingresa tu correo electrónico.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "El correo no tiene un formato válido.";
    }
    if (!password) errors.password = "Ingresa tu contraseña.";
    else if (mode === "register" && password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    return errors;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setInfo(null);

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

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
      const message =
        err instanceof Error
          ? traducirError(err.message)
          : "Algo salió mal. Inténtalo de nuevo.";
      if (/contraseña|correo incorrectos/i.test(message)) {
        setFieldErrors({ password: message, form: message });
      } else if (/contraseña debe tener/i.test(message)) {
        setFieldErrors({ password: message });
      } else if (/correo ya tiene/i.test(message)) {
        setFieldErrors({ email: message, form: message });
      } else if (/correo aún no está confirmado/i.test(message)) {
        setFieldErrors({ email: message, form: message });
      } else {
        setFieldErrors({ form: message });
      }
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
      noValidate
      {...(mode === "register"
        ? {
            "data-critical": "",
            "data-confirm-title": "Crear cuenta",
            "data-confirm-message":
              "¿Quieres crear tu cuenta con estos datos? Podrás revisar tu perfil después.",
            "data-confirm-label": "Crear cuenta",
          }
        : {})}
    >
      {fieldErrors.form && (
        <p
          id="auth-error"
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {fieldErrors.form}
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
          onChange={(v) => {
            setFullName(v);
            setFieldErrors((prev) => ({ ...prev, fullName: undefined, form: undefined }));
          }}
          autoComplete="name"
          required
          error={fieldErrors.fullName}
        />
      )}
      <Field
        id="email"
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(v) => {
          setEmail(v);
          setFieldErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
        }}
        autoComplete="email"
        required
        hint="Usa un correo al que tengas acceso. Lo necesitarás para iniciar sesión."
        hintExpandable
        error={fieldErrors.email}
      />
      <Field
        id="password"
        label="Contraseña"
        type="password"
        value={password}
        onChange={(v) => {
          setPassword(v);
          setFieldErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
        }}
        autoComplete={mode === "register" ? "new-password" : "current-password"}
        required
        hint={
          mode === "register"
            ? "Mínimo 6 caracteres. Usa una contraseña que recuerdes o deja que tu gestor la genere."
            : "Puedes pegar la contraseña desde tu gestor de contraseñas."
        }
        hintExpandable
        error={fieldErrors.password}
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
  hintExpandable,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
  hintExpandable?: boolean;
  error?: string;
}) {
  const showHints = useShowHints();
  const hintId = hint && (showHints || !hintExpandable) ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

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
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-lg border bg-surface px-4 py-2.5 text-base outline-none focus:border-primary ${
          error ? "border-danger" : "border-border"
        }`}
      />
      {error && (
        <p id={errorId} role="alert" className="field-error-visible mt-1 text-sm text-danger">
          {error}
        </p>
      )}
      {hint && (
        <p
          id={`${id}-hint`}
          className={`mt-1 text-xs text-muted ${hintExpandable ? "field-hint" : ""}`}
          aria-hidden={hintExpandable && !showHints ? "true" : undefined}
        >
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
