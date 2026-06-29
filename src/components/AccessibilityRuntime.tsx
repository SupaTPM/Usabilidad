"use client";

import { useEffect } from "react";
import {
  A11Y_CHANGE_EVENT,
  applyAccessibilityPrefs,
  loadStoredPrefs,
  syncAccessibilityRuntime,
} from "@/lib/accessibility/apply";

/** Mantiene medios e hints sincronizados al navegar o cuando cambia el DOM. */
export function AccessibilityRuntime() {
  useEffect(() => {
    const prefs = loadStoredPrefs();
    applyAccessibilityPrefs(prefs);
    syncAccessibilityRuntime(prefs);

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail) syncAccessibilityRuntime(detail);
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => syncAccessibilityRuntime(loadStoredPrefs()), 150);
    });

    window.addEventListener(A11Y_CHANGE_EVENT, onChange);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener(A11Y_CHANGE_EVENT, onChange);
      observer.disconnect();
    };
  }, []);

  return null;
}
