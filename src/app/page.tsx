import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { HollandHexagon } from "@/components/HollandHexagon";
import { RIASEC, RIASEC_ORDER } from "@/lib/vocational/riasec";
import { VocationalVideoExamples } from "@/components/VocationalVideoExamples";

const STEPS = [
  { t: "Regístrate", d: "Cuéntanos quién eres y qué te interesa hoy." },
  { t: "Responde el test", d: "30 preguntas en bloques cortos. Menos de 10 minutos." },
  { t: "Conoce tu perfil", d: "Tus fortalezas e intereses en un mapa claro." },
  { t: "Recibe carreras", d: "Sugerencias con el porqué de cada recomendación." },
  { t: "Compara opciones", d: "Duración, costo, campo laboral y universidades." },
  { t: "Arma tu plan", d: "Pasos concretos para avanzar hacia tu meta." },
  { t: "Haz seguimiento", d: "Ajusta el rumbo cuando cambien tus intereses." },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="contenido">
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
              Orientación vocacional para estudiantes
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Encuentra el camino
              <br />
              que encaja{" "}
              <span className="text-primary">contigo</span>.
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">
              Un test breve, un perfil claro y carreras recomendadas con
              explicación. Sin presión: a tu ritmo y para todos.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-fg shadow-sm transition hover:opacity-90"
              >
                Comenzar mi test
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-border bg-surface px-6 py-3 text-base font-semibold transition hover:bg-surface-2"
              >
                Ya tengo cuenta
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">
              Gratis · 10 minutos · Tus resultados a 1 clic
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <HollandHexagon size={360} ambient />
            </div>
          </div>
        </section>

        {/* ── Proceso (secuencia real → numerada) ────────────── */}
        <section
          aria-labelledby="proceso"
          className="border-y border-border bg-surface"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2
              id="proceso"
              className="font-display text-3xl font-bold tracking-tight"
            >
              Cómo funciona
            </h2>
            <p className="mt-2 max-w-xl text-muted">
              Siete pasos, de la primera pregunta a tu plan de acción.
            </p>
            <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.t} className="bg-surface p-6">
                  <span className="font-mono text-sm font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-semibold">
                    {s.t}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{s.d}</p>
                </li>
              ))}
              <li className="flex items-center justify-center bg-primary p-6 text-primary-fg">
                <Link href="/register" className="text-center font-semibold">
                  Empezar ahora →
                </Link>
              </li>
            </ol>
          </div>
        </section>

        {/* ── Dimensiones RIASEC ─────────────────────────────── */}
        <section aria-labelledby="dimensiones" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="dimensiones" className="font-display text-3xl font-bold tracking-tight">
            Seis maneras de ser
          </h2>
          <p className="mt-2 max-w-xl text-muted">
            Tu perfil combina estas dimensiones del modelo de Holland. No hay
            respuestas buenas ni malas: solo lo que va contigo.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RIASEC_ORDER.map((dim) => {
              const m = RIASEC[dim];
              return (
                <article
                  key={dim}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-lg font-mono text-base font-bold text-white"
                      style={{ background: `rgb(var(${m.colorVar}))` }}
                      aria-hidden
                    >
                      {dim}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold leading-none">
                        {m.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted">{m.tagline}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted">{m.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <VocationalVideoExamples />

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
            <p>Brújula · Sistema Inteligente de Orientación Vocacional</p>
            <p>Diseñado para ser claro, motivador y accesible.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
