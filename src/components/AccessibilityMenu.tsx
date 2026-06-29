"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  countActivePrefs,
  DEFAULT_ACCESSIBILITY_PREFS,
  type AccessibilityPrefs,
} from "@/lib/accessibility/preferences";
import {
  applyAccessibilityPrefs,
  loadStoredPrefs,
  saveAccessibilityPrefs,
  syncAccessibilityRuntime,
  A11Y_CHANGE_EVENT,
} from "@/lib/accessibility/apply";
import { A11Y_MENU_TOGGLE_EVENT, SHORTCUTS_HELP_TOGGLE_EVENT } from "@/lib/accessibility/shortcuts";

type Prefs = AccessibilityPrefs;

type SegmentedKey = "theme" | "contrast" | "text" | "spacing" | "motion";
type ToggleKey =
  | "colorHelp"
  | "softColors"
  | "boldText"
  | "transcripts"
  | "captions"
  | "mute"
  | "focus"
  | "targets"
  | "largeCursor"
  | "readable"
  | "readingGuide"
  | "calm"
  | "showHints"
  | "validationVisible"
  | "confirmSubmit";

const SECTIONS = [
  { id: "visual", label: "Visual" },
  { id: "auditiva", label: "Auditiva" },
  { id: "motriz", label: "Motriz" },
  { id: "cognitiva", label: "Cognitiva" },
  { id: "ayuda", label: "Ayuda" },
] as const;

type MediaStatus = {
  nativeMedia: number;
  embeddedVideos: number;
  captionTracks: number;
  descriptionTracks: number;
  transcripts: number;
};

const DEFAULTS = DEFAULT_ACCESSIBILITY_PREFS;
const FOCUSABLE =
  'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';

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
    "details[data-a11y-transcript], [data-a11y-transcript-panel], .transcripcion, [data-transcription]"
  ).length;

  return {
    nativeMedia: native.length,
    embeddedVideos,
    captionTracks,
    descriptionTracks,
    transcripts,
  };
}

function mediaStatusMessage(status: MediaStatus): string {
  const hasMedia =
    status.nativeMedia > 0 || status.embeddedVideos > 0 || status.transcripts > 0;

  if (!hasMedia) {
    return "Esta página no tiene videos ni audios. Puedes activar subtítulos y transcripciones aquí; se aplicarán al visitar páginas con medios.";
  }

  const parts: string[] = [];
  if (status.nativeMedia > 0) {
    parts.push(
      `${status.nativeMedia} video${status.nativeMedia === 1 ? "" : "s"} o audio${status.nativeMedia === 1 ? "" : "s"}`
    );
  }
  if (status.embeddedVideos > 0) {
    parts.push(
      `${status.embeddedVideos} video${status.embeddedVideos === 1 ? "" : "s"} incrustado${status.embeddedVideos === 1 ? "" : "s"}`
    );
  }
  if (status.transcripts > 0) {
    parts.push(
      `${status.transcripts} transcripción${status.transcripts === 1 ? "" : "es"}`
    );
  }

  let message = `En esta página hay ${parts.join(", ")}.`;
  if (status.embeddedVideos > 0) {
    message += " Los subtítulos de YouTube se activan con el interruptor o con CC del reproductor.";
  }
  return message;
}

const VISUAL_CONTROLS: {
  key: SegmentedKey;
  label: string;
  hint: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "theme",
    label: "Tema",
    hint: "Claro, oscuro o según la configuración de tu dispositivo.",
    options: [
      { value: "auto", label: "Sistema" },
      { value: "light", label: "Claro" },
      { value: "dark", label: "Oscuro" },
    ],
  },
  {
    key: "contrast",
    label: "Contraste",
    hint: "Hace el texto y los bordes más marcados.",
    options: [
      { value: "normal", label: "Normal" },
      { value: "high", label: "Alto" },
    ],
  },
  {
    key: "text",
    label: "Tamaño del texto",
    hint: "Aumenta el tamaño hasta el doble.",
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
    hint: "Deja más espacio entre letras y líneas.",
    options: [
      { value: "normal", label: "Normal" },
      { value: "relaxed", label: "Amplio" },
    ],
  },
];

const MOTOR_CONTROLS: { key: ToggleKey; label: string; hint: string }[] = [
  {
    key: "focus",
    label: "Resaltar foco",
    hint: "Marca con más claridad el elemento seleccionado al usar el teclado.",
  },
  {
    key: "targets",
    label: "Botones más grandes",
    hint: "Aumenta el área táctil de botones y enlaces (excepto escalas compactas).",
  },
  {
    key: "largeCursor",
    label: "Cursor más grande",
    hint: "Muestra un puntero más visible al mover el mouse.",
  },
];

const COGNITIVE_CONTROLS: (
  | { key: ToggleKey; label: string; hint: string }
  | {
      key: SegmentedKey;
      label: string;
      hint: string;
      options: { value: string; label: string }[];
    }
)[] = [
  {
    key: "motion",
    label: "Animaciones",
    hint: "Reduce movimientos automáticos en la página.",
    options: [
      { value: "normal", label: "Activas" },
      { value: "reduced", label: "Reducidas" },
    ],
  },
  {
    key: "readable",
    label: "Texto más legible",
    hint: "Usa una tipografía diseñada para facilitar la lectura.",
  },
  {
    key: "readingGuide",
    label: "Líneas más cortas",
    hint: "Limita el ancho del texto para seguirlo con menos esfuerzo.",
  },
  {
    key: "calm",
    label: "Modo calma",
    hint: "Reduce brillos, sombras y efectos visuales.",
  },
  {
    key: "showHints",
    label: "Más ayuda en formularios",
    hint: "Muestra instrucciones extra junto a cada campo.",
  },
  {
    key: "validationVisible",
    label: "Errores más claros",
    hint: "Resalta los campos con error con borde y texto, no solo con color.",
  },
  {
    key: "confirmSubmit",
    label: "Pedir confirmación al enviar",
    hint: "Te pide revisar antes de registrar datos o enviar el test.",
  },
];

function hasOptions(
  control: (typeof COGNITIVE_CONTROLS)[number]
): control is Extract<(typeof COGNITIVE_CONTROLS)[number], { options: { value: string; label: string }[] }> {
  return "options" in control;
}

function CategoryShell({
  id,
  title,
  summary,
  children,
}: {
  id: string;
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 rounded-2xl border border-border bg-bg/80 p-4">
      <div className="mb-3 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-1 h-8 w-1 shrink-0 rounded-full bg-primary/35"
        />
        <div>
          <h3 id={`${id}-title`} className="text-sm font-bold text-fg">{title}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{summary}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ToggleStatus({ active }: { active: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active ? "bg-primary-fg/15 text-primary-fg" : "bg-surface-2 text-muted"
      }`}
    >
      {active ? "Activado" : "Desactivado"}
    </span>
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
  const [sessionHint, setSessionHint] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadStoredPrefs();
    setPrefs(saved);
    applyAccessibilityPrefs(saved);
    syncAccessibilityRuntime(saved);
  }, []);

  useEffect(() => {
    function onToggle() {
      setOpen((v) => !v);
    }
    function onPrefsChange(event: Event) {
      const detail = (event as CustomEvent).detail;
      if (detail) setPrefs(detail);
    }
    window.addEventListener(A11Y_MENU_TOGGLE_EVENT, onToggle);
    window.addEventListener(A11Y_CHANGE_EVENT, onPrefsChange);
    return () => {
      window.removeEventListener(A11Y_MENU_TOGGLE_EVENT, onToggle);
      window.removeEventListener(A11Y_CHANGE_EVENT, onPrefsChange);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        setSessionHint(
          user
            ? "Ya iniciaste sesión. No volveremos a pedir tu correo ni contraseña en los siguientes pasos."
            : "Aún no has iniciado sesión. Regístrate una vez y luego solo entra con tu correo."
        );
      })
      .catch(() => setSessionHint(null));
  }, [open]);

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

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    }

    const observer = new MutationObserver(() => setMediaStatus(readMediaStatus()));
    observer.observe(document.body, { childList: true, subtree: true });

    const frame = window.requestAnimationFrame(() => {
      document.addEventListener("pointerdown", onPointerDown);
    });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onPointerDown);
      observer.disconnect();
    };
  }, [open]);

  function save(next: Prefs, label: string) {
    setPrefs(next);
    saveAccessibilityPrefs(next);
    setAnnouncement(
      label.includes("restablecido")
        ? "Preferencias de accesibilidad restablecidas."
        : `${label} actualizado. Preferencia guardada.`
    );
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
    options: { value: string; label: string }[];
  }) {
    return (
      <fieldset key={control.key} className="min-w-0">
        <legend className="mb-1.5 block text-sm font-semibold">{control.label}</legend>
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

  function renderToggle(control: { key: ToggleKey; label: string; hint: string }) {
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
        <ToggleStatus active={active} />
      </button>
    );
  }

  const hasNativeMedia = mediaStatus.nativeMedia > 0;
  const hasTranscripts = mediaStatus.transcripts > 0;
  const activeCount = countActivePrefs(prefs);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="a11y-panel"
        aria-keyshortcuts="Alt+Shift+A"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-bold text-fg shadow-sm transition-colors hover:border-primary hover:bg-surface-2"
      >
        <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-primary text-xs text-primary-fg">
          ✦
        </span>
        Accesibilidad
        {activeCount > 0 && (
          <span
            className="grid min-h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[0.65rem] font-bold text-white"
            aria-label={`${activeCount} ajustes activos`}
          >
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          id="a11y-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-title"
          aria-describedby="a11y-description"
          className="fixed inset-x-4 bottom-4 z-50 max-h-[min(85dvh,calc(100dvh-5rem))] overflow-y-auto overscroll-contain rounded-3xl border border-border bg-surface p-0 shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-3 sm:max-h-[calc(100dvh-6rem)] sm:w-[min(28rem,calc(100vw-2rem))]"
        >
          <div className="sticky top-0 z-10 border-b border-border bg-surface/95 p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="a11y-title" className="font-display text-xl font-extrabold tracking-tight text-fg text-balance">
                  Ajusta tu brújula
                </h2>
                <p id="a11y-description" className="mt-1 text-sm leading-relaxed text-muted">
                  Personaliza cómo ves, escuchas y usas la plataforma. Los cambios se aplican al instante.
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
            <nav
              aria-label="Ir a sección"
              className="mt-4 flex gap-1.5 overflow-x-auto pb-1"
            >
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(`a11y-${section.id}`)}
                  className="shrink-0 rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-semibold text-fg transition-colors hover:border-primary hover:bg-surface-2"
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            <CategoryShell
              id="a11y-visual"
              title="Visual"
              summary="Colores, tamaño del texto y enlaces más fáciles de distinguir."
            >
              {VISUAL_CONTROLS.map(renderSegmented)}
              {renderToggle({
                key: "colorHelp",
                label: "Enlaces subrayados",
                hint: "Subraya enlaces y refuerza estados con bordes, además del color.",
              })}
              {renderToggle({
                key: "softColors",
                label: "Colores más suaves",
                hint: "Reduce la intensidad de colores e imágenes para menos fatiga visual.",
              })}
              {renderToggle({
                key: "boldText",
                label: "Texto en negrita",
                hint: "Hace el texto principal más grueso y fácil de leer.",
              })}
            </CategoryShell>

            <CategoryShell
              id="a11y-auditiva"
              title="Auditiva"
              summary="Subtítulos, transcripciones y volumen cuando hay videos o audios."
            >
              <div className="rounded-xl border border-border bg-surface px-3 py-2 text-xs leading-relaxed text-muted">
                {mediaStatusMessage(mediaStatus)}
              </div>
              {renderToggle({
                key: "transcripts",
                label: "Mostrar transcripciones",
                hint: hasTranscripts
                  ? "Abre los textos alternativos disponibles junto a cada medio."
                  : "Se activará cuando la página incluya transcripciones.",
              })}
              {renderToggle({
                key: "captions",
                label: "Activar subtítulos",
                hint: hasNativeMedia || mediaStatus.embeddedVideos > 0
                  ? "Activa subtítulos en videos HTML y recarga YouTube con CC en español."
                  : "Disponible cuando la página incluya videos.",
              })}
              {renderToggle({
                key: "mute",
                label: "Silenciar sonidos",
                hint: "Silencia audio y video HTML, y pide silencio en videos de YouTube.",
              })}
            </CategoryShell>

            <CategoryShell
              id="a11y-motriz"
              title="Motriz"
              summary="Teclado y botones más fáciles de usar."
            >
              {MOTOR_CONTROLS.map(renderToggle)}
            </CategoryShell>

            <CategoryShell
              id="a11y-cognitiva"
              title="Cognitiva"
              summary="Menos distracciones y más ayuda al completar formularios."
            >
              {COGNITIVE_CONTROLS.map((control) =>
                hasOptions(control) ? renderSegmented(control) : renderToggle(control)
              )}
              <div className="rounded-xl border border-dashed border-border bg-bg px-3 py-2.5 text-xs leading-relaxed text-muted">
                <p className="font-semibold text-fg">Inicio de sesión sencillo</p>
                <p className="mt-1">
                  Puedes pegar tu contraseña y usar un gestor de contraseñas. No pedimos captchas ni
                  acertijos de memoria.
                </p>
              </div>
              {sessionHint && (
                <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-xs leading-relaxed text-muted">
                  <p className="font-semibold text-fg">Tu sesión</p>
                  <p className="mt-1">{sessionHint}</p>
                </div>
              )}
            </CategoryShell>

            <div id="a11y-ayuda" className="scroll-mt-24 rounded-2xl border border-border bg-bg/80 p-4">
              <h3 className="text-sm font-bold text-fg">Ayuda y atajos</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Enlaces útiles, atajos de teclado y opción para volver a la configuración inicial.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    window.dispatchEvent(new Event(SHORTCUTS_HELP_TOGGLE_EVENT));
                  }}
                  className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-left text-sm font-semibold text-primary transition-colors hover:bg-primary/10 sm:col-span-2"
                >
                  Ver todos los atajos
                  <span className="mt-0.5 block font-mono text-xs font-normal text-muted">Alt+Shift+?</span>
                </button>
                <Link
                  href={"/ayuda" as never}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-primary underline underline-offset-4 transition-colors hover:bg-surface-2"
                >
                  Centro de ayuda
                </Link>
                <a
                  href="#contenido"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-primary underline underline-offset-4 transition-colors hover:bg-surface-2"
                >
                  Saltar al contenido
                </a>
                <Link
                  href={"/videos-vocacionales" as never}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-primary underline underline-offset-4 transition-colors hover:bg-surface-2 sm:col-span-2"
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
                Tus preferencias se guardan solo en este dispositivo. Atajos principales: Alt+Shift+A (menú) y Alt+Shift+? (guía completa).
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
