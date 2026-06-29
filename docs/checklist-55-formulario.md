# Checklist WCAG 2.2 A/AA — 55 criterios (FORMULARIO)

**Sistema:** Brújula — Sistema Inteligente de Orientación Vocacional  
**Referencia:** `checklist_a_presentar_1prueba.pdf`, `Menu_Accesibilidad_WCAG22-ultimo.docx`  
**Fecha:** 2026-06-28  
**Verificación automática:** `bun run test:a11y` (axe-core + Playwright)

---

## Cómo usar este documento

Copia el texto de **Evidencia para FORMULARIO** en la fila correspondiente del entregable del grupo.  
Estados: **Cumple** · **Parcial** · **N/A**

| Integrante (PDF) | Criterio asignado en checklist |
|------------------|-------------------------------|
| Jeremy Delgado | 2.4.1 |
| Lucas Justin Zambrano | 1.1.1 |
| César Arteaga + equipo | Resto de criterios del sistema |

---

## 1. Alternativas textuales y multimedia

| ID | Criterio | Nivel | Estado | Menú | Evidencia técnica |
|----|----------|-------|--------|------|-------------------|
| 1.1.1 | Contenido no textual | A | Cumple | — | `HollandHexagon.tsx` (`role="img"`, `aria-label`); `Brand.tsx` (SVG decorativo `aria-hidden`, enlace con `aria-label`); thumbnails de video con `aria-label` en botón padre (`VocationalVideoExamples.tsx`) |
| 1.2.1 | Transcripción audio y video | A | Cumple | Transcripciones | Archivos `.srt` en `public/transcripciones/`; `TranscriptVideo.tsx`; toggle en `AccessibilityMenu.tsx` |
| 1.2.2 | Subtítulos grabados | A | Cumple | Subtítulos | YouTube `cc_load_policy=1`; pistas `<track>` en `AccessibleMedia.tsx` |
| 1.2.3 | Audiodescripción | A | Cumple | Transcripciones / Subtítulos | `TranscriptVideo.tsx` con bloque de audiodescripción textual sincronizada (`data-a11y-transcript`); `AccessibleMedia.tsx` admite pista `descriptions` |
| 1.2.4 | Subtítulos en directo | AA | N/A | — | Sin streaming en vivo |
| 1.2.5 | Audiodescripción (grabado) | AA | Cumple | Transcripciones / Subtítulos | Transcripción sincronizada en `TranscriptVideo.tsx`; menú muestra bloques `data-a11y-transcript` |

### Texto FORMULARIO (ejemplos)

**1.1.1 — Cumple**  
Todo contenido no textual informativo tiene alternativa textual: gráficos RIASEC con `aria-label`, logotipo con nombre accesible, miniaturas de video dentro de botones etiquetados. No se usa imagen como único medio para transmitir información crítica.

**1.2.1 — Cumple**  
Los videos vocacionales incluyen transcripción sincronizada en `/videos-vocacionales`. El menú de accesibilidad permite mostrar transcripciones cuando existen en la página.

---

## 2. Adaptable — estructura e idioma

| ID | Criterio | Nivel | Estado | Menú | Evidencia técnica |
|----|----------|-------|--------|------|-------------------|
| 1.3.1 | Información y relaciones | A | Cumple | — | `<main>`, `<nav>`, `<header>`, `<fieldset>`, `<legend>`, headings jerárquicos |
| 1.3.2 | Secuencia significativa | A | Cumple | — | Orden DOM lógico en formularios y test por bloques |
| 1.3.3 | Características sensoriales | A | Cumple | Señales redundantes | Instrucciones no dependen solo de color/forma; Likert usa número + texto |
| 1.3.4 | Orientación de pantalla | AA | N/A | — | CSS responsive; sin bloqueo de orientación |
| 1.3.5 | Identificación propósito campo | AA | Cumple | — | `autocomplete` en auth (`email`, `name`, `current-password`, `new-password`); `name` en onboarding |
| 3.1.1 | Idioma de la página | A | Cumple | — | `lang="es"` en `layout.tsx` |
| 3.1.2 | Idioma de partes | AA | Cumple | — | `<span lang="en">Admin</span>` en `AppHeader.tsx` |

**1.3.1 — Cumple**  
La estructura semántica permite a tecnologías de asistencia interpretar relaciones: grupos de preguntas con `fieldset/legend`, navegación principal con `nav`, secciones con encabezados.

---

## 3. Distinguible — color, contraste y texto

| ID | Criterio | Nivel | Estado | Menú | Evidencia técnica |
|----|----------|-------|--------|------|-------------------|
| 1.4.1 | Uso del color | A | Cumple | Señales redundantes | `[data-color-help="on"]` subraya enlaces y refuerza estados; errores con texto + icono |
| 1.4.2 | Control del audio | A | Cumple | Silenciar medios | Toggle `mute`; sin autoplay en `TranscriptVideo.tsx` |
| 1.4.3 | Contraste mínimo (4,5:1) | AA | Cumple | Contraste / Tema | Tokens en `globals.css`; modo alto contraste |
| 1.4.4 | Cambio tamaño texto (200%) | AA | Cumple | Tamaño texto | `--font-scale` hasta 2× |
| 1.4.5 | Imágenes de texto | AA | Cumple | — | Texto real en HTML; thumbnails solo decorativas |
| 1.4.10 | Reajuste de elementos | AA | Cumple | Tamaño texto | Layout responsive; reflujo en videos con transcripción |
| 1.4.11 | Contraste no textual | AA | Cumple | Contraste | Bordes de controles; `:focus-visible` en menú |
| 1.4.12 | Espaciado de texto | AA | Cumple | Espaciado / Lectura clara | `[data-spacing="relaxed"]`, `[data-readable="on"]` |
| 1.4.13 | Contenido al pasar cursor o foco | AA | Cumple | — | Sin tooltips que oculten información esencial; panel menú dismissible |

**1.4.3 — Cumple**  
El menú ofrece tema claro/oscuro y modo de alto contraste. Paleta definida con tokens CSS verificables con WebAIM Contrast Checker.

---

## 4. Operable — teclado y navegación

| ID | Criterio | Nivel | Estado | Menú | Evidencia técnica |
|----|----------|-------|--------|------|-------------------|
| 2.1.1 | Teclado | A | Cumple | — | `e2e/keyboard.spec.ts`; menú 100% operable por teclado |
| 2.1.2 | Sin trampa de foco | A | Cumple | — | Focus trap solo en dialogs (`AccessibilityMenu`, `AccessibilityConfirmProvider`) con Escape |
| 2.1.4 | Atajos de teclado | A | Cumple | Ayuda y atajos | 28 atajos `Alt+Shift+tecla` en `shortcuts.ts`; guía interactiva `Alt+Shift+?`; documentados en `/ayuda` |
| 2.4.1 | Evitar bloques repetitivos | A | Cumple | Saltar contenido | `.skip-link` → `#contenido` en `layout.tsx` |
| 2.4.2 | Titulado de páginas | A | Cumple | — | `metadata.title` por ruta |
| 2.4.3 | Orden del foco | A | Cumple | — | Orden DOM coherente; foco devuelto al trigger al cerrar menú |
| 2.4.4 | Propósito de los enlaces | A | Cumple | — | Texto descriptivo en nav y CTAs |
| 2.4.5 | Múltiples vías de navegación | A | Cumple | Ayuda | Nav principal + dashboard + `/ayuda` + skip-link |
| 2.4.6 | Encabezados y etiquetas | A | Cumple | Instrucciones | `<label htmlFor>`, `legend`, hints con `aria-describedby` |
| 2.4.7 | Foco visible | AA | Cumple | Foco reforzado | Outline global + toggle amarillo |
| 2.4.11 | Foco no oculto (mínimo) | AA | Cumple | Foco reforzado | Panel menú anclado abajo en móvil |

**2.4.1 — Cumple (Jeremy)**  
Enlace “Saltar al contenido” visible al recibir foco, permite omitir cabecera repetitiva y acceder directo al `<main id="contenido">`.

---

## 5. Tiempo, movimiento y orientación

| ID | Criterio | Nivel | Estado | Menú | Evidencia técnica |
|----|----------|-------|--------|------|-------------------|
| 2.2.1 | Tiempo ajustable | A | Cumple | — | Test sin límite de tiempo |
| 2.2.2 | Pausar, detener, ocultar | A | Cumple | Animaciones / Calma | `[data-motion="reduced"]`, `prefers-reduced-motion` |
| 2.3.1 | Umbral de tres destellos | A | Cumple | — | Sin contenidos que destellen >3/s |

---

## 6. Operable — puntero y táctil

| ID | Criterio | Nivel | Estado | Menú | Evidencia técnica |
|----|----------|-------|--------|------|-------------------|
| 2.5.1 | Gestos del puntero | A | Cumple | — | Sin gestos multipunto obligatorios |
| 2.5.2 | Cancelación del puntero | A | Cumple | — | Activación en `click`/`submit`, no en `pointerdown` |
| 2.5.3 | Etiqueta de nombre | A | Cumple | — | Texto visible coincide con nombre accesible en botones |
| 2.5.4 | Actuación por movimiento | A | N/A | — | Sin funciones por agitar/inclinar |
| 2.5.7 | Movimiento de arrastre | AA | N/A | — | Sin drag & drop |
| 2.5.8 | Tamaño área interacción (24px) | AA | Cumple | Controles grandes | `min-h-11` (44px) en controles clave; toggle amplía targets |

---

## 7. Comprensible — predecible y ayuda

| ID | Criterio | Nivel | Estado | Menú | Evidencia técnica |
|----|----------|-------|--------|------|-------------------|
| 3.2.1 | Al recibir el foco | A | Cumple | Calma | Foco no dispara navegación ni diálogos automáticos |
| 3.2.2 | Al recibir entrada | A | Cumple | — | Sin envío automático al escribir; acciones explícitas |
| 3.2.3 | Navegación coherente | A | Cumple | — | `AppHeader` / `SiteHeader` consistentes |
| 3.2.4 | Identificación consistente | A | Cumple | — | Mismos componentes para mismas funciones |
| 3.2.6 | Ayuda consistente | A | Cumple | Ayuda / Soporte | Enlace fijo en menú → `/ayuda` |

**3.2.6 — Cumple**  
El menú de accesibilidad incluye siempre el enlace “Ayuda y soporte” en la misma posición, apuntando al centro de ayuda del sistema.

---

## 8. Comprensible — formularios y errores

| ID | Criterio | Nivel | Estado | Menú | Evidencia técnica |
|----|----------|-------|--------|------|-------------------|
| 3.3.1 | Identificación de errores | A | Cumple | Validación visible | `aria-invalid`, `role="alert"`, toggle refuerza borde |
| 3.3.2 | Etiquetas e instrucciones | A | Cumple | Instrucciones expandidas | `label`, `fieldset`, `.field-hint`, `aria-describedby` |
| 3.3.3 | Sugerencias antes de errores | A | Cumple | Instrucciones | Hints proactivos (contraseña, test, onboarding) |
| 3.3.4 | Prevención de errores | AA | Cumple | Confirmar envíos | `AccessibilityConfirmProvider` + `data-critical` |
| 3.3.7 | Entrada redundante | A | Cumple | Datos guardados | No se repide email/contraseña; indicador en menú |
| 3.3.8 | Autenticación accesible | AA | Cumple | Nota informativa | Sin CAPTCHA; paste permitido; texto en menú |

**3.3.4 — Cumple**  
Con “Confirmar envíos” activo, registro, onboarding y envío del test muestran diálogo accesible de revisión antes de procesar datos.

---

## 9. Robusto — compatible

| ID | Criterio | Nivel | Estado | Menú | Evidencia técnica |
|----|----------|-------|--------|------|-------------------|
| 4.1.2 | Nombre, función, valor | A | Cumple | — | ARIA en menú, radios, progressbar, dialogs |
| 4.1.3 | Mensaje de estado | AA | Cumple | — | `aria-live`, `role="status"`, `role="alert"` |

---

## Resumen numérico

| Estado | Cantidad |
|--------|----------|
| Cumple | 52 |
| Parcial | 0 |
| N/A | 3 (1.2.4, 2.5.4, 2.5.7) |
| **Total** | **55** |

---

## Capturas recomendadas para evidencia

1. Menú abierto — categorías Visual, Auditiva, Motriz, Cognitiva  
2. Toggle alto contraste + texto 200%  
3. Sección Ayuda / Soporte con enlace a `/ayuda`  
4. Toggles cognitivos activos + formulario con hints  
5. Diálogo “Confirmar envíos” en test o registro  
6. `/videos-vocacionales` con transcripción sincronizada  
7. Skip-link visible con Tab en landing  

Ruta sugerida: capturar en navegador con `npm run dev` o exportar con Playwright (`page.screenshot`).

---

## Comandos de verificación

```bash
npm run typecheck
npm run build
npx playwright install chromium
npm run test:a11y
npm run test:a11y:evidence   # capturas en docs/evidencia/
npm run formularios          # Word en docs/formularios/
```

## Documentos de entrega

| Archivo | Uso |
|---------|-----|
| `docs/formularios/FORMULARIO_Completo_55criterios.docx` | Entrega grupal completa |
| `docs/formularios/FORMULARIO_jeremy.docx` | Jeremy — 2.4.1 |
| `docs/formularios/FORMULARIO_justin.docx` | Justin — 1.1.1 |
| `docs/formularios/FORMULARIO_cesar.docx` | César + equipo — resto |
| `docs/evidencia/*.png` | Capturas embebidas en los Word |
