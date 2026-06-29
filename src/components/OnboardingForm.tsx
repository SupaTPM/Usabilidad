"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useShowHints } from "@/lib/accessibility/useShowHints";
import type { EducationLevel } from "@/lib/supabase/database.types";

const LEVELS: { value: EducationLevel; label: string }[] = [
  { value: "secundaria", label: "Secundaria" },
  { value: "bachillerato", label: "Bachillerato" },
  { value: "tecnico", label: "Técnico" },
  { value: "universitario", label: "Universitario" },
  { value: "posgrado", label: "Posgrado" },
  { value: "otro", label: "Otro" },
];

export function OnboardingForm({
  defaultName,
}: {
  defaultName: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(defaultName);
  const [level, setLevel] = useState<EducationLevel | "">("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const showHints = useShowHints();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameError(null);
    if (!fullName.trim()) {
      setNameError("Por favor ingresá tu nombre completo.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        education_level: level || null,
        initial_interests: interests || null,
      })
      .eq("id", user.id);

    if (error) {
      setError("No se pudo guardar. Inténtalo de nuevo.");
      setLoading(false);
      return;
    }
    router.push("/test");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5"
      data-critical=""
      data-confirm-title="Guardar perfil"
      data-confirm-message="¿Quieres guardar tu perfil y continuar al test vocacional?"
      data-confirm-label="Guardar y continuar"
    >
      {error && (
        <p id="form-error" role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          ¿Cómo te llamas? <span className="text-danger" aria-hidden>*</span>
        </label>
        <input
          id="name"
          name="fullName"
          autoComplete="name"
          required
          aria-required="true"
          aria-invalid={nameError ? "true" : undefined}
          aria-describedby={
            [
              nameError ? "name-error" : null,
              error ? "form-error" : null,
              showHints ? "name-hint" : null,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); setNameError(null); }}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-base outline-none focus:border-primary"
        />
        {nameError && (
          <p id="name-error" role="alert" className="field-error-visible mt-1 text-sm text-danger">
            {nameError}
          </p>
        )}
        <p id="name-hint" className="field-hint text-xs text-muted" aria-hidden={showHints ? undefined : "true"}>
          Usa tu nombre real o el que prefieras ver en tus resultados.
        </p>
      </div>

      <fieldset aria-describedby={showHints ? "level-hint" : undefined}>
        <legend className="mb-1.5 block text-sm font-medium">
          ¿En qué nivel educativo estás?
        </legend>
        <p id="level-hint" className="field-hint mb-2 text-xs text-muted" aria-hidden={showHints ? undefined : "true"}>
          Elige la opción más cercana a tu situación actual. Puedes cambiarla más adelante.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LEVELS.map((l) => {
            const active = level === l.value;
            return (
              <button
                key={l.value}
                type="button"
                aria-pressed={active}
                onClick={() => setLevel(l.value)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "border-primary bg-primary text-primary-fg"
                    : "border-border bg-surface hover:border-primary"
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="interests" className="mb-1.5 block text-sm font-medium">
          ¿Qué te interesa o te gustaría explorar?{" "}
          <span className="font-normal text-muted">(opcional)</span>
        </label>
        <textarea
          id="interests"
          name="interests"
          autoComplete="off"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          rows={3}
          aria-describedby={showHints ? "interests-hint" : undefined}
          placeholder="Ej.: tecnología, ayudar a personas, arte, negocios…"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-base outline-none focus:border-primary"
        />
        <p id="interests-hint" className="field-hint text-xs text-muted" aria-hidden={showHints ? undefined : "true"}>
          Opcional. Escribe temas o actividades que te gustaría explorar en una carrera.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-fg shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        <span aria-live="polite" aria-atomic="true">
          {loading ? "Guardando…" : "Continuar al test"}
        </span>
      </button>
    </form>
  );
}
