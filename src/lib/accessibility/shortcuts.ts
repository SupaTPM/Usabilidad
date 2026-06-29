import {
  loadStoredPrefs,
  saveAccessibilityPrefs,
} from "./apply";
import {
  DEFAULT_ACCESSIBILITY_PREFS,
  type AccessibilityPrefs,
  type Binary,
} from "./preferences";

export const A11Y_MENU_TOGGLE_EVENT = "brujula:a11y-menu-toggle";
export const SHORTCUTS_HELP_TOGGLE_EVENT = "brujula:shortcuts-help-toggle";

export type ShortcutCategory =
  | "general"
  | "navegacion"
  | "visual"
  | "auditiva"
  | "motriz"
  | "cognitiva";

export type ShortcutAction =
  | { type: "toggle-menu" }
  | { type: "toggle-help" }
  | { type: "skip-content" }
  | { type: "navigate"; href: string }
  | { type: "cycle-text"; direction: 1 | -1 }
  | { type: "cycle-theme" }
  | { type: "toggle-pref"; key: keyof AccessibilityPrefs; on: string; off: string; label: string }
  | { type: "toggle-binary"; key: keyof AccessibilityPrefs; label: string }
  | { type: "reset-prefs" };

export type ShortcutDef = {
  id: string;
  keys: string;
  label: string;
  category: ShortcutCategory;
  action: ShortcutAction;
};

export const SHORTCUT_CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  general: "General",
  navegacion: "Navegación",
  visual: "Visual",
  auditiva: "Auditiva",
  motriz: "Motriz",
  cognitiva: "Cognitiva",
};

const TEXT_SCALE: AccessibilityPrefs["text"][] = [
  "normal",
  "large",
  "xlarge",
  "max",
];

const THEME_CYCLE: AccessibilityPrefs["theme"][] = ["light", "dark", "auto"];

/** Catálogo completo — todos usan Alt+Shift (WCAG 2.1.4: no son atajos de un solo carácter). */
export const KEYBOARD_SHORTCUTS: ShortcutDef[] = [
  {
    id: "help",
    keys: "Alt+Shift+?",
    label: "Mostrar u ocultar esta guía de atajos",
    category: "general",
    action: { type: "toggle-help" },
  },
  {
    id: "menu",
    keys: "Alt+Shift+A",
    label: "Abrir o cerrar menú de accesibilidad",
    category: "general",
    action: { type: "toggle-menu" },
  },
  {
    id: "skip",
    keys: "Alt+Shift+0",
    label: "Saltar al contenido principal",
    category: "general",
    action: { type: "skip-content" },
  },
  {
    id: "reset",
    keys: "Alt+Shift+Backspace",
    label: "Restablecer preferencias de accesibilidad",
    category: "general",
    action: { type: "reset-prefs" },
  },
  {
    id: "home",
    keys: "Alt+Shift+I",
    label: "Ir al inicio",
    category: "navegacion",
    action: { type: "navigate", href: "/" },
  },
  {
    id: "login",
    keys: "Alt+Shift+L",
    label: "Ir a iniciar sesión",
    category: "navegacion",
    action: { type: "navigate", href: "/login" },
  },
  {
    id: "register",
    keys: "Alt+Shift+R",
    label: "Ir a registro",
    category: "navegacion",
    action: { type: "navigate", href: "/register" },
  },
  {
    id: "ayuda",
    keys: "Alt+Shift+H",
    label: "Ir al centro de ayuda",
    category: "navegacion",
    action: { type: "navigate", href: "/ayuda" },
  },
  {
    id: "dashboard",
    keys: "Alt+Shift+P",
    label: "Ir al panel",
    category: "navegacion",
    action: { type: "navigate", href: "/dashboard" },
  },
  {
    id: "test",
    keys: "Alt+Shift+T",
    label: "Ir al test vocacional",
    category: "navegacion",
    action: { type: "navigate", href: "/test" },
  },
  {
    id: "carreras",
    keys: "Alt+Shift+C",
    label: "Ir al explorador de carreras",
    category: "navegacion",
    action: { type: "navigate", href: "/carreras" },
  },
  {
    id: "comparar",
    keys: "Alt+Shift+M",
    label: "Ir a comparar carreras",
    category: "navegacion",
    action: { type: "navigate", href: "/comparar" },
  },
  {
    id: "videos",
    keys: "Alt+Shift+V",
    label: "Ir a videos vocacionales",
    category: "navegacion",
    action: { type: "navigate", href: "/videos-vocacionales" },
  },
  {
    id: "text-up",
    keys: "Alt+Shift+=",
    label: "Aumentar tamaño del texto",
    category: "visual",
    action: { type: "cycle-text", direction: 1 },
  },
  {
    id: "text-down",
    keys: "Alt+Shift+-",
    label: "Disminuir tamaño del texto",
    category: "visual",
    action: { type: "cycle-text", direction: -1 },
  },
  {
    id: "theme",
    keys: "Alt+Shift+O",
    label: "Ciclar tema (claro, oscuro, sistema)",
    category: "visual",
    action: { type: "cycle-theme" },
  },
  {
    id: "contrast",
    keys: "Alt+Shift+X",
    label: "Alternar contraste alto",
    category: "visual",
    action: {
      type: "toggle-pref",
      key: "contrast",
      on: "high",
      off: "normal",
      label: "Contraste",
    },
  },
  {
    id: "bold",
    keys: "Alt+Shift+B",
    label: "Alternar texto en negrita",
    category: "visual",
    action: { type: "toggle-binary", key: "boldText", label: "Texto en negrita" },
  },
  {
    id: "captions",
    keys: "Alt+Shift+S",
    label: "Alternar subtítulos",
    category: "auditiva",
    action: { type: "toggle-binary", key: "captions", label: "Subtítulos" },
  },
  {
    id: "transcripts",
    keys: "Alt+Shift+N",
    label: "Alternar transcripciones",
    category: "auditiva",
    action: { type: "toggle-binary", key: "transcripts", label: "Transcripciones" },
  },
  {
    id: "focus",
    keys: "Alt+Shift+F",
    label: "Alternar resaltado de foco",
    category: "motriz",
    action: { type: "toggle-binary", key: "focus", label: "Resaltar foco" },
  },
  {
    id: "targets",
    keys: "Alt+Shift+U",
    label: "Alternar botones más grandes",
    category: "motriz",
    action: { type: "toggle-binary", key: "targets", label: "Botones más grandes" },
  },
  {
    id: "cursor",
    keys: "Alt+Shift+D",
    label: "Alternar cursor grande",
    category: "motriz",
    action: { type: "toggle-binary", key: "largeCursor", label: "Cursor grande" },
  },
  {
    id: "motion",
    keys: "Alt+Shift+E",
    label: "Alternar animaciones reducidas",
    category: "motriz",
    action: {
      type: "toggle-pref",
      key: "motion",
      on: "reduced",
      off: "normal",
      label: "Animaciones",
    },
  },
  {
    id: "reading-guide",
    keys: "Alt+Shift+G",
    label: "Alternar guía de lectura",
    category: "cognitiva",
    action: { type: "toggle-binary", key: "readingGuide", label: "Guía de lectura" },
  },
  {
    id: "hints",
    keys: "Alt+Shift+J",
    label: "Alternar más ayuda en formularios",
    category: "cognitiva",
    action: { type: "toggle-binary", key: "showHints", label: "Más ayuda en formularios" },
  },
  {
    id: "validation",
    keys: "Alt+Shift+W",
    label: "Alternar errores más claros",
    category: "cognitiva",
    action: {
      type: "toggle-binary",
      key: "validationVisible",
      label: "Errores más claros",
    },
  },
  {
    id: "confirm",
    keys: "Alt+Shift+K",
    label: "Alternar confirmación al enviar",
    category: "cognitiva",
    action: {
      type: "toggle-binary",
      key: "confirmSubmit",
      label: "Confirmación al enviar",
    },
  },
];

function parseCombo(combo: string) {
  const parts = combo.split("+");
  const key = parts[parts.length - 1];
  return {
    alt: parts.includes("Alt"),
    shift: parts.includes("Shift"),
    ctrl: parts.includes("Control") || parts.includes("Ctrl"),
    key: key.toLowerCase(),
  };
}

function eventKey(e: KeyboardEvent): string {
  if (e.key === "Backspace") return "backspace";
  if (e.key === "?" || (e.key === "/" && e.shiftKey)) return "?";
  if (e.key === "=" || e.key === "+") return "=";
  if (e.key === "-") return "-";
  if (e.key === "0" || e.code === "Digit0") return "0";
  return e.key.toLowerCase();
}

/** Comprueba si el evento coincide con la combinación declarada. */
export function matchesShortcut(e: KeyboardEvent, combo: string): boolean {
  const spec = parseCombo(combo);
  if (e.altKey !== spec.alt || e.shiftKey !== spec.shift || e.ctrlKey !== spec.ctrl) {
    return false;
  }
  const pressed = eventKey(e);
  if (spec.key === "?") return pressed === "?";
  if (spec.key === "=") return pressed === "=";
  if (spec.key === "backspace") return pressed === "backspace";
  return pressed === spec.key;
}

export function findShortcut(e: KeyboardEvent): ShortcutDef | undefined {
  if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey) return undefined;
  return KEYBOARD_SHORTCUTS.find((s) => matchesShortcut(e, s.keys));
}

function toggleBinaryPref(key: keyof AccessibilityPrefs, label: string): string {
  const prefs = loadStoredPrefs();
  const current = prefs[key] as Binary;
  const next = current === "on" ? "off" : "on";
  saveAccessibilityPrefs({ ...prefs, [key]: next });
  return `${label} ${next === "on" ? "activado" : "desactivado"}.`;
}

function togglePref(
  key: keyof AccessibilityPrefs,
  on: string,
  off: string,
  label: string
): string {
  const prefs = loadStoredPrefs();
  const current = prefs[key] as string;
  const next = current === on ? off : on;
  saveAccessibilityPrefs({ ...prefs, [key]: next });
  return `${label} actualizado.`;
}

function cycleText(direction: 1 | -1): string {
  const prefs = loadStoredPrefs();
  const idx = TEXT_SCALE.indexOf(prefs.text);
  const nextIdx = Math.max(0, Math.min(TEXT_SCALE.length - 1, idx + direction));
  const next = TEXT_SCALE[nextIdx];
  saveAccessibilityPrefs({ ...prefs, text: next });
  const labels: Record<AccessibilityPrefs["text"], string> = {
    normal: "100%",
    large: "125%",
    xlarge: "150%",
    max: "200%",
  };
  return `Tamaño del texto: ${labels[next]}.`;
}

function cycleTheme(): string {
  const prefs = loadStoredPrefs();
  const idx = THEME_CYCLE.indexOf(prefs.theme);
  const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
  saveAccessibilityPrefs({ ...prefs, theme: next });
  const labels: Record<AccessibilityPrefs["theme"], string> = {
    light: "claro",
    dark: "oscuro",
    auto: "sistema",
  };
  return `Tema ${labels[next]}.`;
}

export type ShortcutHandlerContext = {
  navigate: (href: string) => void;
  announce: (message: string) => void;
};

export function runShortcutAction(
  action: ShortcutAction,
  ctx: ShortcutHandlerContext
): void {
  switch (action.type) {
    case "toggle-menu":
      window.dispatchEvent(new Event(A11Y_MENU_TOGGLE_EVENT));
      ctx.announce("Menú de accesibilidad.");
      break;
    case "toggle-help":
      window.dispatchEvent(new Event(SHORTCUTS_HELP_TOGGLE_EVENT));
      break;
    case "skip-content": {
      const main = document.getElementById("contenido");
      if (main) {
        if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: false });
        main.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      ctx.announce("Saltando al contenido principal.");
      break;
    }
    case "navigate":
      ctx.navigate(action.href);
      break;
    case "cycle-text":
      ctx.announce(cycleText(action.direction));
      break;
    case "cycle-theme":
      ctx.announce(cycleTheme());
      break;
    case "toggle-pref":
      ctx.announce(togglePref(action.key, action.on, action.off, action.label));
      break;
    case "toggle-binary":
      ctx.announce(toggleBinaryPref(action.key, action.label));
      break;
    case "reset-prefs":
      saveAccessibilityPrefs({ ...DEFAULT_ACCESSIBILITY_PREFS });
      ctx.announce("Preferencias de accesibilidad restablecidas.");
      break;
  }
}
