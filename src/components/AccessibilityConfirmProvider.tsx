"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ConfirmRequest = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type PendingAction =
  | { kind: "form"; form: HTMLFormElement }
  | { kind: "callback"; run: () => void | Promise<void> };

type ConfirmContextValue = {
  confirmIfEnabled: (req: ConfirmRequest) => Promise<boolean>;
  runCriticalAction: (req: ConfirmRequest, action: () => void | Promise<void>) => Promise<void>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

const FOCUSABLE =
  'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';

export function AccessibilityConfirmProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOpen(false);
    setRequest(null);
    setPending(null);
  }, []);

  const confirmIfEnabled = useCallback((req: ConfirmRequest) => {
    if (typeof document === "undefined") return Promise.resolve(true);
    if (document.documentElement.dataset.confirmSubmit !== "on") {
      return Promise.resolve(true);
    }
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setRequest(req);
      setPending(null);
      setOpen(true);
    });
  }, []);

  const runCriticalAction = useCallback(
    async (req: ConfirmRequest, action: () => void | Promise<void>) => {
      const ok = await confirmIfEnabled(req);
      if (ok) await action();
    },
    [confirmIfEnabled]
  );

  useEffect(() => {
    function onSubmit(e: Event) {
      if (document.documentElement.dataset.confirmSubmit !== "on") return;
      const form = e.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.hasAttribute("data-critical")) return;
      if (form.dataset.a11yConfirmed === "true") {
        delete form.dataset.a11yConfirmed;
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();

      resolveRef.current = null;
      setRequest({
        title: form.dataset.confirmTitle || "Confirmar envío",
        message:
          form.dataset.confirmMessage ||
          "Revisa que los datos sean correctos antes de continuar.",
        confirmLabel: form.dataset.confirmLabel || "Confirmar y enviar",
        cancelLabel: form.dataset.cancelLabel || "Cancelar",
      });
      setPending({ kind: "form", form });
      setOpen(true);
    }

    document.addEventListener("submit", onSubmit, true);
    return () => document.removeEventListener("submit", onSubmit, true);
  }, []);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>(FOCUSABLE)
        ?.focus();
    }, 0);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
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
  }, [open, close]);

  async function handleConfirm() {
    if (pending?.kind === "form") {
      pending.form.dataset.a11yConfirmed = "true";
      pending.form.requestSubmit();
      close(true);
      return;
    }
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
      setOpen(false);
      setRequest(null);
    }
  }

  function handleCancel() {
    close(false);
  }

  return (
    <ConfirmContext.Provider value={{ confirmIfEnabled, runCriticalAction }}>
      {children}
      {open && request && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="presentation"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) handleCancel();
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="a11y-confirm-title"
            aria-describedby="a11y-confirm-desc"
            className="w-full max-w-md rounded-3xl border border-border bg-surface p-5 shadow-2xl"
          >
            <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary">
              Revisión antes de enviar
            </p>
            <h2
              id="a11y-confirm-title"
              className="mt-2 font-display text-xl font-extrabold tracking-tight text-fg"
            >
              {request.title}
            </h2>
            <p id="a11y-confirm-desc" className="mt-2 text-sm leading-relaxed text-muted">
              {request.message}
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="min-h-11 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-surface-2"
              >
                {request.cancelLabel || "Cancelar"}
              </button>
              <button
                type="button"
                onClick={() => void handleConfirm()}
                className="min-h-11 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition hover:opacity-90"
              >
                {request.confirmLabel || "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useAccessibilityConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useAccessibilityConfirm debe usarse dentro de AccessibilityConfirmProvider");
  }
  return ctx;
}
