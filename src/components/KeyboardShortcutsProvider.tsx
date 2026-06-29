"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  A11Y_MENU_TOGGLE_EVENT,
  findShortcut,
  KEYBOARD_SHORTCUTS,
  runShortcutAction,
  SHORTCUT_CATEGORY_LABELS,
  SHORTCUTS_HELP_TOGGLE_EVENT,
  type ShortcutCategory,
} from "@/lib/accessibility/shortcuts";

const FOCUSABLE =
  'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';

const CATEGORY_ORDER: ShortcutCategory[] = [
  "general",
  "navegacion",
  "visual",
  "auditiva",
  "motriz",
  "cognitiva",
];

export function KeyboardShortcutsProvider() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const announce = useCallback((message: string) => {
    setAnnouncement("");
    window.setTimeout(() => setAnnouncement(message), 30);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      router.push(href as never);
    },
    [router]
  );

  useEffect(() => {
    function onToggleHelp() {
      setOpen((v) => !v);
    }
    window.addEventListener(SHORTCUTS_HELP_TOGGLE_EVENT, onToggleHelp);
    return () => window.removeEventListener(SHORTCUTS_HELP_TOGGLE_EVENT, onToggleHelp);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const shortcut = findShortcut(e);
      if (!shortcut) return;
      e.preventDefault();
      runShortcutAction(shortcut.action, { navigate, announce });
      if (shortcut.action.type === "toggle-help") return;
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navigate, announce]);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => closeRef.current?.focus(), 0);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
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

  return (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-4 sm:items-center"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
            className="max-h-[min(90dvh,40rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-surface shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-surface/95 p-5 backdrop-blur">
              <div>
                <h2 id="shortcuts-title" className="font-display text-2xl font-extrabold tracking-tight">
                  Atajos de teclado
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Todas las combinaciones usan <kbd className="rounded bg-bg px-1.5 py-0.5 font-mono text-xs">Alt</kbd>
                  {" + "}
                  <kbd className="rounded bg-bg px-1.5 py-0.5 font-mono text-xs">Shift</kbd>
                  {" + tecla. Funcionan en cualquier página."}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar guía de atajos"
                className="grid min-h-11 min-w-11 shrink-0 place-items-center rounded-full border border-border bg-bg text-lg font-bold text-muted transition-colors hover:border-primary hover:text-fg"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-5">
              {CATEGORY_ORDER.map((category) => {
                const items = KEYBOARD_SHORTCUTS.filter((s) => s.category === category);
                if (!items.length) return null;
                return (
                  <section key={category} aria-labelledby={`shortcuts-${category}`}>
                    <h3
                      id={`shortcuts-${category}`}
                      className="font-display text-sm font-bold uppercase tracking-[0.14em] text-primary"
                    >
                      {SHORTCUT_CATEGORY_LABELS[category]}
                    </h3>
                    <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-bg">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                        >
                          <span className="text-sm text-fg">{item.label}</span>
                          <kbd className="shrink-0 rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-xs font-semibold text-muted">
                            {item.keys}
                          </kbd>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>

            <div className="border-t border-border px-5 py-4 text-xs leading-relaxed text-muted">
              Cumplimos WCAG 2.1.4: no hay atajos de un solo carácter; siempre se requiere Alt+Shift.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
