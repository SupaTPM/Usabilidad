export type Binary = "off" | "on";

export type AccessibilityPrefs = {
  theme: "light" | "dark" | "auto";
  contrast: "normal" | "high";
  text: "normal" | "large" | "xlarge" | "max";
  spacing: "normal" | "relaxed";
  colorHelp: Binary;
  softColors: Binary;
  boldText: Binary;
  transcripts: Binary;
  captions: Binary;
  mute: Binary;
  focus: Binary;
  targets: Binary;
  largeCursor: Binary;
  readable: Binary;
  readingGuide: Binary;
  motion: "normal" | "reduced";
  calm: Binary;
  showHints: Binary;
  validationVisible: Binary;
  confirmSubmit: Binary;
};

export const ACCESSIBILITY_STORAGE_KEY = "ov:a11y";

export const DEFAULT_ACCESSIBILITY_PREFS: AccessibilityPrefs = {
  theme: "auto",
  contrast: "normal",
  text: "normal",
  spacing: "normal",
  colorHelp: "off",
  softColors: "off",
  boldText: "off",
  transcripts: "off",
  captions: "off",
  mute: "off",
  focus: "off",
  targets: "off",
  largeCursor: "off",
  readable: "off",
  readingGuide: "off",
  motion: "normal",
  calm: "off",
  showHints: "off",
  validationVisible: "off",
  confirmSubmit: "off",
};

/** Lee si la confirmación de envíos está activa (cliente). */
export function isConfirmSubmitEnabled(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.confirmSubmit === "on";
}

/** Cuenta cuántas preferencias difieren del default (para badge en el botón). */
export function countActivePrefs(prefs: AccessibilityPrefs): number {
  return Object.entries(DEFAULT_ACCESSIBILITY_PREFS).filter(
    ([key, value]) => prefs[key as keyof AccessibilityPrefs] !== value
  ).length;
}
