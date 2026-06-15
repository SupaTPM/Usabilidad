"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { submitAssessment } from "@/app/(app)/test/actions";

export interface TestQuestion {
  id: string;
  text: string;
  category: string;
}

const SCALE = [
  { value: 1, label: "Nada" },
  { value: 2, label: "Poco" },
  { value: 3, label: "Algo" },
  { value: 4, label: "Bastante" },
  { value: 5, label: "Mucho" },
];

const BLOCK_SIZE = 6;

export function TestRunner({ questions }: { questions: TestQuestion[] }) {
  const router = useRouter();
  const blocks = useMemo(() => chunk(questions, BLOCK_SIZE), [questions]);
  const [block, setBlock] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMissing, setShowMissing] = useState(false);

  const current = blocks[block];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);
  const blockComplete = current.every((q) => answers[q.id] != null);
  const isLast = block === blocks.length - 1;

  function setAnswer(id: string, value: number) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function next() {
    if (!blockComplete) {
      setShowMissing(true);
      return;
    }
    setShowMissing(false);
    setBlock((b) => b + 1);
    window.scrollTo({ top: 0 });
  }

  function back() {
    setShowMissing(false);
    setBlock((b) => Math.max(0, b - 1));
    window.scrollTo({ top: 0 });
  }

  async function finish() {
    if (!blockComplete) {
      setShowMissing(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));
    const res = await submitAssessment(payload);
    if (res.ok && res.assessmentId) {
      router.push(`/resultados/${res.assessmentId}`);
    } else {
      setError(res.error ?? "Algo salió mal.");
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Progreso */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-mono font-semibold text-primary">
            Bloque {block + 1} de {blocks.length}
          </span>
          <span className="text-muted" aria-live="polite">
            {answeredCount} / {questions.length} respondidas
          </span>
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso del test"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-6 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* Preguntas del bloque */}
      <ol className="space-y-5">
        {current.map((q, i) => {
          const missing = showMissing && answers[q.id] == null;
          return (
            <li
              key={q.id}
              className={`rounded-xl border bg-surface p-5 ${
                missing ? "border-danger" : "border-border"
              }`}
            >
              <fieldset>
                <legend className="text-base font-medium">
                  <span className="mr-2 font-mono text-sm text-muted">
                    {block * BLOCK_SIZE + i + 1}.
                  </span>
                  {q.text}
                </legend>
                <div
                  role="radiogroup"
                  aria-label={q.text}
                  className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2"
                >
                  {SCALE.map((s) => {
                    const active = answers[q.id] === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setAnswer(q.id, s.value)}
                        className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2.5 text-center transition ${
                          active
                            ? "border-primary bg-primary text-primary-fg"
                            : "border-border bg-surface-2 hover:border-primary"
                        }`}
                      >
                        <span className="font-mono text-base font-bold">
                          {s.value}
                        </span>
                        <span className="text-[11px] leading-tight">
                          {s.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {missing && (
                  <p className="mt-2 text-sm text-danger">
                    Elige una opción para continuar.
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {/* Navegación */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={block === 0}
          className="rounded-lg border border-border bg-surface px-5 py-2.5 font-medium transition hover:bg-surface-2 disabled:opacity-40"
        >
          Atrás
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={finish}
            disabled={submitting}
            className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-fg shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Analizando…" : "Ver mis resultados"}
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-fg shadow-sm transition hover:opacity-90"
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
