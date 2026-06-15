"use client";

import { useEffect, useRef, useState } from "react";

type Prefs = {
  theme: "light" | "dark";
  contrast: "normal" | "high";
  text: "normal" | "large" | "xlarge";
  motion: "normal" | "reduced";
};

const DEFAULTS: Prefs = {
  theme: "light",
  contrast: "normal",
  text: "normal",
  motion: "normal",
};

const STORAGE_KEY = "ov:a11y";

function apply(prefs: Prefs) {
  const el = document.documentElement;
  el.dataset.theme = prefs.theme;
  el.dataset.contrast = prefs.contrast;
  el.dataset.text = prefs.text;
  el.dataset.motion = prefs.motion;
}

/** Script que aplica las preferencias guardadas antes del primer pintado. */
export function AccessibilityScript() {
  const code = `(function(){try{var p=JSON.parse(localStorage.getItem('${STORAGE_KEY}')||'{}');var e=document.documentElement;e.dataset.theme=p.theme||'light';e.dataset.contrast=p.contrast||'normal';e.dataset.text=p.text||'normal';e.dataset.motion=p.motion||'normal';}catch(_){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

const OPTION_GROUPS: {
  key: keyof Prefs;
  label: string;
  hint: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "theme",
    label: "Tema",
    hint: "Visual",
    options: [
      { value: "light", label: "Claro" },
      { value: "dark", label: "Oscuro" },
    ],
  },
  {
    key: "contrast",
    label: "Contraste",
    hint: "Baja visión",
    options: [
      { value: "normal", label: "Normal" },
      { value: "high", label: "Alto" },
    ],
  },
  {
    key: "text",
    label: "Tamaño del texto",
    hint: "Visual",
    options: [
      { value: "normal", label: "A" },
      { value: "large", label: "A+" },
      { value: "xlarge", label: "A++" },
    ],
  },
  {
    key: "motion",
    label: "Animaciones",
    hint: "Motriz / vestibular",
    options: [
      { value: "normal", label: "Activas" },
      { value: "reduced", label: "Reducidas" },
    ],
  },
];

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setPrefs({ ...DEFAULTS, ...saved });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function update(key: keyof Prefs, value: string) {
    const next = { ...prefs, [key]: value } as Prefs;
    setPrefs(next);
    apply(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-fg shadow-sm transition hover:bg-surface-2"
      >
        <span aria-hidden>♿</span>
        Accesibilidad
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Opciones de accesibilidad"
          className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-border bg-surface p-4 shadow-xl"
        >
          <p className="mb-3 font-display text-base font-semibold">
            Ajusta la experiencia
          </p>
          <div className="space-y-4">
            {OPTION_GROUPS.map((group) => (
              <fieldset key={group.key}>
                <legend className="mb-1.5 flex items-baseline justify-between text-sm font-medium">
                  <span>{group.label}</span>
                  <span className="text-xs text-muted">{group.hint}</span>
                </legend>
                <div
                  role="radiogroup"
                  aria-label={group.label}
                  className="flex gap-1.5"
                >
                  {group.options.map((opt) => {
                    const active = prefs[group.key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => update(group.key, opt.value)}
                        className={`flex-1 rounded-md border px-2 py-2 text-sm font-medium transition ${
                          active
                            ? "border-primary bg-primary text-primary-fg"
                            : "border-border bg-surface-2 text-fg hover:border-primary"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            Tus preferencias se guardan en este dispositivo.
          </p>
        </div>
      )}
    </div>
  );
}
