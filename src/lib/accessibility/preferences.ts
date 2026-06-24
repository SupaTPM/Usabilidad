export type Binary = "off" | "on";

export type AccessibilityPrefs = {
  theme: "light" | "dark";
  contrast: "normal" | "high";
  text: "normal" | "large" | "xlarge" | "max";
  spacing: "normal" | "relaxed";
  colorHelp: Binary;
  transcripts: Binary;
  captions: Binary;
  mute: Binary;
  focus: Binary;
  targets: Binary;
  readable: Binary;
  motion: "normal" | "reduced";
  calm: Binary;
};

export const ACCESSIBILITY_STORAGE_KEY = "ov:a11y";

export const DEFAULT_ACCESSIBILITY_PREFS: AccessibilityPrefs = {
  theme: "light",
  contrast: "normal",
  text: "normal",
  spacing: "normal",
  colorHelp: "off",
  transcripts: "off",
  captions: "off",
  mute: "off",
  focus: "off",
  targets: "off",
  readable: "off",
  motion: "normal",
  calm: "off",
};
