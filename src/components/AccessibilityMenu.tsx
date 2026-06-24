"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY_PREFS,
  type AccessibilityPrefs,
  type Binary,
} from "@/lib/accessibility/preferences";

type Prefs = AccessibilityPrefs;

type SegmentedKey = "theme" | "contrast" | "text" | "spacing" | "motion";
type ToggleKey =
  | "colorHelp"
  | "transcripts"
  | "captions"
  | "mute"
  | "focus"
  | "targets"
  | "readable"
  | "calm";

type MediaStatus = {
  nativeMedia: number;
  embeddedVideos: number;
  captionTracks: number;
  descriptionTracks: number;
  transcripts: number;
};

const DEFAULTS = DEFAULT_ACCESSIBILITY_PREFS;
const STORAGE_KEY = ACCESSIBILITY_STORAGE_KEY;
const FOCUSABLE =
  'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';

function normalizePrefs(value: unknown): Prefs {
  const saved = value && typeof value === "object" ? value : {};
  return { ...DEFAULTS, ...saved } as Prefs;
}

function apply(prefs: Prefs) {
  const el = document.documentElement;
  el.dataset.theme = prefs.theme;
  el.dataset.contrast = prefs.contrast;
  el.dataset.text = prefs.text;
  el.dataset.spacing = prefs.spacing;
  el.dataset.colorHelp = prefs.colorHelp;
  el.dataset.transcripts = prefs.transcripts;
  el.dataset.captions = prefs.captions;
  el.dataset.mute = prefs.mute;
  el.dataset.focus = prefs.focus;
  el.dataset.targets = prefs.targets;
  el.dataset.readable = prefs.readable;
  el.dataset.motion = prefs.motion;
  el.dataset.calm = prefs.calm;
}

function syncMediaPrefs(prefs: Prefs) {
  const media = Array.from(document.querySelectorAll<HTMLMediaElement>("video, audio"));

  for (const item of media) {
    if (prefs.mute === "on") {
      item.muted = true;
      item.dataset.a11yMuted = "true";
    } else if (item.dataset.a11yMuted === "true") {
      item.muted = false;
      delete item.dataset.a11yMuted;
    }

    for (const track of Array.from(item.textTracks)) {
      if (track.kind === "captions" || track.kind === "subtitles") {
        if (prefs.captions === "on") {
          track.mode = "showing";
          item.dataset.a11yCaptions = "true";
        } else if (item.dataset.a11yCaptions === "true") {
          track.mode = "disabled";
        }
      }
      if (track.kind === "descriptions") {
        if (prefs.captions === "on") {
          track.mode = "showing";
          item.dataset.a11yCaptions = "true";
        } else if (item.dataset.a11yCaptions === "true") {
          track.mode = "disabled";
        }
      }
    }
    if (prefs.captions === "off" && item.dataset.a11yCaptions === "true") {
      delete item.dataset.a11yCaptions;
    }
  }

  const transcriptDetails = Array.from(
    document.querySelectorAll<HTMLDetailsElement>("details[data-a11y-transcript]")
  );
  for (const item of transcriptDetails) item.open = prefs.transcripts === "on";

  const transcriptBlocks = Array.from(
    document.querySelectorAll<HTMLElement>(".transcripcion, [data-transcription]")
  );
  for (const item of transcriptBlocks) {
    if (prefs.transcripts === "on") item.removeAttribute("hidden");
    else item.setAttribute("hidden", "");
  }
}

function readMediaStatus(): MediaStatus {
  const native = Array.from(document.querySelectorAll<HTMLMediaElement>("video, audio"));
  const embeddedVideos = document.querySelectorAll(
    'iframe[src*="youtube"], iframe[src*="youtu.be"], iframe[src*="vimeo"]'
  ).length;
  const captionTracks = document.querySelectorAll(
    'video track[kind="captions"], video track[kind="subtitles"], audio track[kind="captions"], audio track[kind="subtitles"]'
  ).length;
  const descriptionTracks = document.querySelectorAll(
    'video track[kind="descriptions"], audio track[kind="descriptions"]'
  ).length;
  const transcripts = document.querySelectorAll(
    "details[data-a11y-transcript], .transcripcion, [data-transcription]"
  ).length;

  return {
    nativeMedia: native.length,
    embeddedVideos,
    captionTracks,
    descriptionTracks,
    transcripts,
  };
}


const VISUAL_CONTROLS: {
  key: SegmentedKey;
  label: string;
  hint: string;
  wcag: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "theme",
    label: "Tema",
    hint: "Reduce fatiga visual",
    wcag: "1.4.3",
    options: [
      { value: "light", label: "Claro" },
      { value: "dark", label: "Oscuro" },
    ],
  },
  {
    key: "contrast",
    label: "Contraste",
    hint: "Bordes y texto más fuertes",
    wcag: "1.4.3 / 1.4.11",
    options: [
      { value: "normal", label: "Normal" },
      { value: "high", label: "Alto" },
    ],
  },
  {
    key: "text",
    label: "Tamaño del texto",
    hint: "Escala hasta 200%",
    wcag: "1.4.4 / 1.4.10",
    options: [
      { value: "normal", label: "100%" },
      { value: "large", label: "125%" },
      { value: "xlarge", label: "150%" },
      { value: "max", label: "200%" },
    ],
  },
  {
    key: "spacing",
    label: "Espaciado de lectura",
    hint: "Más aire entre letras y líneas",
    wcag: "1.4.12",
    options: [
      { value: "normal", label: "Normal" },
      { value: "relaxed", label: "Amplio" },
    ],
  },
];

const MOTOR_CONTROLS: { key: ToggleKey; label: string; hint: string; wcag: string }[] = [
  {
    key: "focus",
    label: "Foco reforzado",
    hint: "Anillo grueso para navegar con teclado",
    wcag: "2.4.7 / 2.4.11",
  },
  {
    key: "targets",
    label: "Controles grandes",
    hint: "Áreas táctiles mínimas de 44 px",
    wcag: "2.5.8",
  },
];

const COGNITIVE_CONTROLS: ({ key: ToggleKey; label: string; hint: string; wcag: string } | {
  key: SegmentedKey;
  label: string;
  hint: string;
  wcag: string;
  options: { value: string; label: string }[];
})[] = [
  {
    key: "motion",
    label: "Animaciones",
    hint: "Evita movimiento automático",
    wcag: "2.2.2 / 2.3.3",
    options: [
      { value: "normal", label: "Activas" },
      { value: "reduced", label: "Reducidas" },
    ],
  },
  {
    key: "readable",
    label: "Lectura clara",
    hint: "Tipografía y ritmo más legibles",
    wcag: "1.4.12",
  },
  {
    key: "calm",
    label: "Modo calma",
    hint: "Menos brillos, sombras y ruido visual",
    wcag: "3.2.1 / 3.2.6",
  },
];

function hasOptions(
  control: (typeof COGNITIVE_CONTROLS)[number]
): control is Extract<(typeof COGNITIVE_CONTROLS)[number], { options: { value: string; label: string }[] }> {
  return "options" in control;
}

function CategoryShell({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-bg/80 p-4">
      <div className="mb-3 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-1 h-3 w-3 rounded-full bg-primary shadow-[0_0_0_4px_rgb(var(--primary)/0.12)]"
        />
        <div>
          <h3 className="text-sm font-bold text-fg">{title}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{summary}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [announcement, setAnnouncement] = useState("");
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>({
    nativeMedia: 0,
    embeddedVideos: 0,
    captionTracks: 0,
    descriptionTracks: 0,
    transcripts: 0,
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    try {
      const saved = normalizePrefs(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
      setPrefs(saved);
      apply(saved);
      syncMediaPrefs(saved);
    } catch {
      apply(DEFAULTS);
    }
  }, []);

  // Mueve el foco al panel al abrir y lo devuelve al trigger al cerrar, sin robar foco al cargar la página.
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      setMediaStatus(readMediaStatus());
      window.setTimeout(() => {
        const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
        first?.focus();
      }, 0);
    } else if (wasOpenRef.current) {
      triggerRef.current?.focus();
    }
  }, [open]);

  // Escape + focus trap dentro del panel.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Cierra al hacer clic fuera y actualiza disponibilidad de medios si cambia el DOM.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    }

    const observer = new MutationObserver(() => setMediaStatus(readMediaStatus()));
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      observer.disconnect();
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function save(next: Prefs, label: string) {
    setPrefs(next);
    apply(next);
    syncMediaPrefs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAnnouncement(
      label.includes("restablecido")
        ? "Preferencias de accesibilidad restablecidas."
        : `${label} actualizado. Preferencia guardada.`
    );
    window.dispatchEvent(new CustomEvent("brujula:a11y-change", { detail: next }));
  }

  function update(key: keyof Prefs, value: string, label: string) {
    save({ ...prefs, [key]: value } as Prefs, label);
  }

  function toggle(key: ToggleKey, label: string) {
    const nextValue = prefs[key] === "on" ? "off" : "on";
    save({ ...prefs, [key]: nextValue } as Prefs, label);
  }

  function reset() {
    save(DEFAULTS, "Menú de accesibilidad restablecido");
  }

  function renderSegmented(control: {
    key: SegmentedKey;
    label: string;
    hint: string;
    wcag: string;
    options: { value: string; label: string }[];
  }) {
    return (
      <fieldset key={control.key} className="min-w-0">
        <legend className="mb-1.5 flex w-full items-start justify-between gap-3 text-sm font-semibold">
          <span>{control.label}</span>
          <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[0.68rem] text-muted">
            {control.wcag}
          </span>
        </legend>
        <p className="mb-2 text-xs leading-relaxed text-muted">{control.hint}</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={control.label}>
          {control.options.map((opt) => {
            const active = prefs[control.key] === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={() => update(control.key, opt.value, control.label)}
                className={`min-h-11 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-fg shadow-sm"
                    : "border-border bg-surface text-fg hover:border-primary hover:bg-surface-2"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }

  function renderToggle(control: { key: ToggleKey; label: string; hint: string; wcag: string }) {
    const active = prefs[control.key] === "on";
    return (
      <button
        key={control.key}
        type="button"
        aria-pressed={active}
        onClick={() => toggle(control.key, control.label)}
        className={`flex min-h-12 w-full items-start justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
          active
            ? "border-primary bg-primary text-primary-fg"
            : "border-border bg-surface text-fg hover:border-primary hover:bg-surface-2"
        }`}
      >
        <span>
          <span className="block text-sm font-semibold">{control.label}</span>
          <span className={`mt-0.5 block text-xs leading-relaxed ${active ? "text-primary-fg/85" : "text-muted"}`}>
            {control.hint}
          </span>
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.68rem] ${
            active ? "bg-primary-fg/15 text-primary-fg" : "bg-surface-2 text-muted"
          }`}
        >
          {control.wcag}
        </span>
      </button>
    );
  }

  const hasNativeMedia = mediaStatus.nativeMedia > 0;
  const hasEmbeddedVideo = mediaStatus.embeddedVideos > 0;
  const hasTranscripts = mediaStatus.transcripts > 0;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="a11y-panel"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-bold text-fg shadow-sm transition-colors hover:border-primary hover:bg-surface-2"
      >
        <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-primary text-xs text-primary-fg">
          ✦
        </span>
        Accesibilidad
      </button>

      {open && (
        <div
          ref={panelRef}
          id="a11y-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-title"
          aria-describedby="a11y-description"
          className="fixed inset-x-4 top-20 z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain rounded-3xl border border-border bg-surface p-0 shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[min(28rem,calc(100vw-2rem))]"
        >
          <div className="sticky top-0 z-10 border-b border-border bg-surface/95 p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary">
                  WCAG 2.2 · A/AA
                </p>
                <h2 id="a11y-title" className="mt-1 font-display text-xl font-extrabold tracking-tight text-fg text-balance">
                  Ajusta tu brújula
                </h2>
                <p id="a11y-description" className="mt-1 text-sm leading-relaxed text-muted">
                  Opciones visuales, auditivas, motrices y cognitivas sin recargar la página.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú de accesibilidad"
                className="grid min-h-11 min-w-11 place-items-center rounded-full border border-border bg-bg text-lg font-bold text-muted transition-colors hover:border-primary hover:text-fg"
              >
                ×
              </button>
            </div>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            <CategoryShell
              title="Visual"
              summary="Contraste, tamaño, espaciado y señales que no dependan solo del color."
            >
              {VISUAL_CONTROLS.map(renderSegmented)}
              {renderToggle({
                key: "colorHelp",
                label: "Señales redundantes",
                hint: "Subraya enlaces y refuerza estados con bordes además del color",
                wcag: "1.4.1",
              })}
            </CategoryShell>

            <CategoryShell
              title="Auditiva"
              summary="Controles que aparecen según los medios disponibles en esta vista."
            >
              <div className="rounded-xl border border-border bg-surface px-3 py-2 text-xs leading-relaxed text-muted">
                {hasNativeMedia || hasEmbeddedVideo || hasTranscripts ? (
                  <>
                    Detectado: {mediaStatus.nativeMedia} medio(s) nativo(s), {mediaStatus.embeddedVideos} video(s) incrustado(s), {mediaStatus.transcripts} transcripción(es).
                    {hasEmbeddedVideo ? " En videos de YouTube, los CC dependen del reproductor." : ""}
                  </>
                ) : (
                  "No detecto audio, video ni transcripciones en esta vista. Estas opciones se activan cuando existan medios."
                )}
              </div>
              {renderToggle({
                key: "transcripts",
                label: "Mostrar transcripciones",
                hint: hasTranscripts
                  ? "Abre los textos alternativos disponibles junto a cada medio"
                  : "Quedará listo para transcripciones marcadas en la página",
                wcag: "1.2.1",
              })}
              {renderToggle({
                key: "captions",
                label: "Activar subtítulos",
                hint: hasNativeMedia
                  ? `${mediaStatus.captionTracks} pista(s) de subtítulos y ${mediaStatus.descriptionTracks} de descripción detectada(s)`
                  : "Disponible para videos HTML con pistas <track>; YouTube conserva sus controles CC",
                wcag: "1.2.2 / 1.2.5",
              })}
              {renderToggle({
                key: "mute",
                label: "Silenciar medios",
                hint: "Aplica silencio global a audio y video HTML de esta página",
                wcag: "1.4.2",
              })}
            </CategoryShell>

            <CategoryShell
              title="Motriz"
              summary="Mejora la navegación por teclado y aumenta el área de interacción."
            >
              {MOTOR_CONTROLS.map(renderToggle)}
            </CategoryShell>

            <CategoryShell
              title="Cognitiva"
              summary="Reduce movimiento, carga visual y esfuerzo de lectura."
            >
              {COGNITIVE_CONTROLS.map((control) =>
                hasOptions(control) ? renderSegmented(control) : renderToggle(control)
              )}
            </CategoryShell>

            <div className="rounded-2xl border border-border bg-bg/80 p-4">
              <h3 className="text-sm font-bold text-fg">Ayuda rápida</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <a
                  href="#contenido"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-primary underline underline-offset-4 transition-colors hover:bg-surface-2"
                >
                  Saltar al contenido
                </a>
                <Link
                  href="/videos-vocacionales"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-primary underline underline-offset-4 transition-colors hover:bg-surface-2"
                >
                  Videos con transcripción
                </Link>
              </div>
              <button
                type="button"
                onClick={reset}
                className="mt-3 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-bold text-fg transition-colors hover:border-primary hover:bg-surface-2"
              >
                Restablecer preferencias
              </button>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Tus preferencias se guardan solo en este dispositivo.
              </p>
              <p className="sr-only" aria-live="polite">
                {announcement}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
