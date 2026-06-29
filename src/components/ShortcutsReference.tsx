"use client";

import {
  KEYBOARD_SHORTCUTS,
  SHORTCUT_CATEGORY_LABELS,
  SHORTCUTS_HELP_TOGGLE_EVENT,
  type ShortcutCategory,
} from "@/lib/accessibility/shortcuts";

const CATEGORY_ORDER: ShortcutCategory[] = [
  "general",
  "navegacion",
  "visual",
  "auditiva",
  "motriz",
  "cognitiva",
];

export function ShortcutsReference() {
  return (
    <div className="mt-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Atajos de teclado
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Brújula incluye {KEYBOARD_SHORTCUTS.length} atajos con{" "}
            <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-xs">Alt+Shift</kbd>
            {" + tecla. Todos cumplen WCAG 2.1.4 porque no usan un solo carácter sin modificadores."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(SHORTCUTS_HELP_TOGGLE_EVENT))}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold transition hover:border-primary hover:bg-surface-2"
        >
          Abrir panel interactivo (Alt+Shift+?)
        </button>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const items = KEYBOARD_SHORTCUTS.filter((s) => s.category === category);
        if (!items.length) return null;
        return (
          <section key={category} aria-labelledby={`ayuda-shortcuts-${category}`}>
            <h3
              id={`ayuda-shortcuts-${category}`}
              className="font-display text-sm font-bold uppercase tracking-[0.14em] text-primary"
            >
              {SHORTCUT_CATEGORY_LABELS[category]}
            </h3>
            <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <span className="text-sm">{item.label}</span>
                  <kbd className="shrink-0 rounded-lg border border-border bg-bg px-2.5 py-1 font-mono text-xs font-semibold text-muted">
                    {item.keys}
                  </kbd>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
