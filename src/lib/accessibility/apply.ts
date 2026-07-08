import {
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY_PREFS,
  type AccessibilityPrefs,
  type Binary,
} from "./preferences";

export const A11Y_CHANGE_EVENT = "brujula:a11y-change";

export function normalizePrefs(value: unknown): AccessibilityPrefs {
  const saved = value && typeof value === "object" ? value : {};
  return { ...DEFAULT_ACCESSIBILITY_PREFS, ...saved } as AccessibilityPrefs;
}

/** Mezcla preferencias guardadas con defaults y respeta ajustes del sistema en la primera visita. */
export function loadStoredPrefs(): AccessibilityPrefs {
  if (typeof window === "undefined") return DEFAULT_ACCESSIBILITY_PREFS;

  try {
    const raw = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : {};
    const prefs = normalizePrefs(saved);

    if (saved.motion === undefined && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      prefs.motion = "reduced";
    }
    if (saved.contrast === undefined && window.matchMedia("(prefers-contrast: more)").matches) {
      prefs.contrast = "high";
    }
    if (saved.theme === undefined && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      prefs.theme = "auto";
    }

    return prefs;
  } catch {
    return DEFAULT_ACCESSIBILITY_PREFS;
  }
}

export function applyAccessibilityPrefs(prefs: AccessibilityPrefs) {
  const el = document.documentElement;
  el.dataset.theme = prefs.theme;
  el.dataset.contrast = prefs.contrast;
  el.dataset.text = prefs.text;
  el.dataset.spacing = prefs.spacing;
  el.dataset.lineSpacing = prefs.lineSpacing;
  el.dataset.colorHelp = prefs.colorHelp;
  el.dataset.softColors = prefs.softColors;
  el.dataset.boldText = prefs.boldText;
  el.dataset.transcripts = prefs.transcripts;
  el.dataset.captions = prefs.captions;
  el.dataset.mute = prefs.mute;
  el.dataset.focus = prefs.focus;
  el.dataset.targets = prefs.targets;
  el.dataset.largeCursor = prefs.largeCursor;
  el.dataset.readable = prefs.readable;
  el.dataset.readingGuide = prefs.readingGuide;
  el.dataset.motion = prefs.motion;
  el.dataset.calm = prefs.calm;
  el.dataset.showHints = prefs.showHints;
  el.dataset.validationVisible = prefs.validationVisible;
  el.dataset.confirmSubmit = prefs.confirmSubmit;
}

function syncFieldHints(showHints: Binary) {
  for (const hint of document.querySelectorAll<HTMLElement>(".field-hint")) {
    if (showHints === "on") hint.removeAttribute("aria-hidden");
    else hint.setAttribute("aria-hidden", "true");
  }
}

function syncNativeMedia(prefs: AccessibilityPrefs) {
  for (const item of document.querySelectorAll<HTMLMediaElement>("video, audio")) {
    if (prefs.mute === "on") {
      item.muted = true;
      item.dataset.a11yMuted = "true";
    } else if (item.dataset.a11yMuted === "true") {
      item.muted = false;
      delete item.dataset.a11yMuted;
    }

    for (const track of Array.from(item.textTracks)) {
      const isCaption =
        track.kind === "captions" || track.kind === "subtitles" || track.kind === "descriptions";
      if (!isCaption) continue;

      if (prefs.captions === "on") {
        track.mode = "showing";
        item.dataset.a11yCaptions = "true";
      } else if (item.dataset.a11yCaptions === "true") {
        track.mode = "disabled";
      }
    }

    if (prefs.captions === "off" && item.dataset.a11yCaptions === "true") {
      delete item.dataset.a11yCaptions;
    }
  }
}

function syncEmbeddedIframes(prefs: AccessibilityPrefs) {
  for (const iframe of document.querySelectorAll<HTMLIFrameElement>(
    'iframe[src*="youtube"], iframe[src*="youtu.be"], iframe[src*="vimeo"]'
  )) {
    try {
      const url = new URL(iframe.src);
      url.searchParams.set("cc_load_policy", prefs.captions === "on" ? "1" : "0");
      url.searchParams.set("cc_lang_pref", "es");
      url.searchParams.set("autoplay", "0");
      if (prefs.mute === "on") url.searchParams.set("mute", "1");
      else url.searchParams.delete("mute");

      const next = url.toString();
      if (iframe.src !== next) iframe.src = next;
    } catch {
      /* iframe sin src válido aún */
    }
  }
}

function setTranscriptVisibility(el: HTMLElement, visible: boolean) {
  if (visible) el.removeAttribute("hidden");
  else el.setAttribute("hidden", "");
}

function syncTranscripts(prefs: AccessibilityPrefs) {
  for (const item of document.querySelectorAll<HTMLElement>(
    "details[data-a11y-transcript], [data-a11y-transcript-panel], .transcripcion, [data-transcription]"
  )) {
    if (item instanceof HTMLDetailsElement) {
      item.open = prefs.transcripts === "on";
      continue;
    }
    setTranscriptVisibility(item, prefs.transcripts === "on");
  }
}

/** Aplica efectos secundarios en el DOM (medios, hints, iframes). */
export function syncAccessibilityRuntime(prefs: AccessibilityPrefs) {
  syncNativeMedia(prefs);
  syncEmbeddedIframes(prefs);
  syncTranscripts(prefs);
  syncFieldHints(prefs.showHints);
}

export function persistAccessibilityPrefs(prefs: AccessibilityPrefs) {
  localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(prefs));
}

export function saveAccessibilityPrefs(prefs: AccessibilityPrefs) {
  applyAccessibilityPrefs(prefs);
  syncAccessibilityRuntime(prefs);
  persistAccessibilityPrefs(prefs);
  window.dispatchEvent(new CustomEvent(A11Y_CHANGE_EVENT, { detail: prefs }));
}
