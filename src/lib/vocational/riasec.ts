import type { RiasecDim } from "@/lib/supabase/database.types";

export const RIASEC_ORDER: RiasecDim[] = ["R", "I", "A", "S", "E", "C"];

export interface RiasecMeta {
  key: RiasecDim;
  name: string;
  tagline: string;
  description: string;
  /** Token de color CSS (variable definida en globals.css). */
  colorVar: string;
}

/**
 * Metadatos de las seis dimensiones del modelo de Holland (RIASEC).
 * El color SIEMPRE se acompaña de letra + nombre (no se usa color solo) → WCAG.
 */
export const RIASEC: Record<RiasecDim, RiasecMeta> = {
  R: {
    key: "R",
    name: "Realista",
    tagline: "Hacer",
    description:
      "Te gusta el trabajo práctico, manual o técnico: construir, reparar y resolver problemas concretos.",
    colorVar: "--riasec-r",
  },
  I: {
    key: "I",
    name: "Investigador",
    tagline: "Pensar",
    description:
      "Disfrutas analizar, investigar y entender el porqué de las cosas con lógica y método.",
    colorVar: "--riasec-i",
  },
  A: {
    key: "A",
    name: "Artístico",
    tagline: "Crear",
    description:
      "Te expresas a través de la creatividad, el diseño y las ideas originales.",
    colorVar: "--riasec-a",
  },
  S: {
    key: "S",
    name: "Social",
    tagline: "Ayudar",
    description:
      "Te motiva enseñar, acompañar y contribuir al bienestar de otras personas.",
    colorVar: "--riasec-s",
  },
  E: {
    key: "E",
    name: "Emprendedor",
    tagline: "Liderar",
    description:
      "Te atraen el liderazgo, la persuasión, los negocios y tomar la iniciativa.",
    colorVar: "--riasec-e",
  },
  C: {
    key: "C",
    name: "Convencional",
    tagline: "Organizar",
    description:
      "Prefieres el orden, los datos y los procedimientos claros y bien definidos.",
    colorVar: "--riasec-c",
  },
};

export function riasecName(key: RiasecDim): string {
  return RIASEC[key].name;
}

export function riasecColor(key: RiasecDim): string {
  return `rgb(var(${RIASEC[key].colorVar}))`;
}
