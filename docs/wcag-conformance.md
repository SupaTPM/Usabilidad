# Declaración de Conformidad WCAG 2.2

**Sistema:** Brújula — Sistema Inteligente de Orientación Vocacional  
**Nivel objetivo:** WCAG 2.2 A/AA  
**Fecha de revisión:** 2026-06-28  

---

## Opciones del menú flotante (Menu_Accesibilidad)

| Categoría | Preferencias | Criterios |
|-----------|--------------|-----------|
| Visual | tema, contraste, texto, espaciado, señales redundantes | 1.4.1, 1.4.3, 1.4.4, 1.4.10–1.4.12 |
| Auditiva | transcripciones, subtítulos, silencio | 1.2.1, 1.2.2, 1.2.5, 1.4.2 |
| Motriz | foco reforzado, controles grandes | 2.1.1, 2.1.2, 2.4.7, 2.4.11, 2.5.8 |
| Cognitiva | animaciones, lectura clara, calma, instrucciones, validación, confirmación | 2.2.2, 3.2.1, 3.3.1–3.3.4, 3.3.7–3.3.8 |
| Ayuda | enlace fijo Ayuda / Soporte → `/ayuda` | 3.2.6 |

Persistencia: `localStorage` clave `ov:a11y`. Script anti-FOUC: `AccessibilityScript.tsx`.  
Confirmación de envíos: `AccessibilityConfirmProvider` (opt-in vía `confirmSubmit`).

---

## Criterios No Aplicables (N/A)

Estos criterios no aplican porque el sistema no posee el tipo de contenido que regulan. Se documenta la justificación para que la auditoría quede completa.

| ID | Criterio | Justificación | Nivel |
|----|----------|---------------|-------|
| 1.2.4 | Subtítulos en directo | La aplicación no emite contenido audiovisual en tiempo real (streaming en vivo). | AA |
| 2.1.4 | Atajos de teclado de un solo carácter | 28 atajos globales con `Alt+Shift+tecla`; guía en `Alt+Shift+?` y `/ayuda`. Ningún atajo usa solo una letra. | A |
| 2.5.4 | Actuación por movimiento | Ninguna función se activa agitando o inclinando el dispositivo. | A |
| 2.5.7 | Movimiento de arrastre | La interfaz no contiene interacciones de arrastrar y soltar (drag & drop). | AA |

---

## Estado general por categoría

| Categoría | Estado |
|-----------|--------|
| Alternativas textuales y multimedia (1.1.x, 1.2.x) | ✅ Implementado (SVG con role/aria-label; infra `AccessibleMedia` lista para video) |
| Adaptable / Estructura semántica (1.3.x) | ✅ Completo |
| Distinguible / Color y contraste (1.4.x) | ✅ Verificado en 4 modos de tema |
| Teclado y foco (2.1.x, 2.4.x) | ✅ Completo (focus trap en dialog, foco devuelto al trigger) |
| Tiempo y movimiento (2.2.x, 2.3.x) | ✅ Completo |
| Puntero y táctil (2.5.x) | ✅ Completo |
| Legible / Idioma (3.1.x) | ✅ `lang="es"` en raíz |
| Predecible / Navegación (3.2.x) | ✅ Completo — enlace fijo Ayuda / Soporte en menú (`/ayuda`, 3.2.6) |
| Entrada de usuario / Formularios (3.3.x) | ✅ Toggles: validación visible, instrucciones expandidas, confirmación opt-in |
| Compatible / ARIA (4.1.x) | ✅ Completo |

---

## Notas sobre multimedia (1.2.x)

El sistema incluye videos vocacionales con transcripción sincronizada en `/videos-vocacionales`. Para medios HTML nativos:

- Usar el componente `src/components/AccessibleMedia.tsx` que provee:
  - `<track kind="captions">` para subtítulos grabados (1.2.2)
  - `<track kind="descriptions">` para audiodescripción (1.2.3, 1.2.5)
  - Sección de transcripción colapsable (1.2.1)
  - `controls` nativos del navegador para pausa/silencio (1.4.2)
- Proveer archivos `.vtt` para cada pista.
- 1.2.4 (subtítulos en directo) seguirá siendo N/A salvo que se implemente streaming.

---

## Documentación del checklist (55 criterios)

Matriz completa para llenar el FORMULARIO del grupo: [`checklist-55-formulario.md`](./checklist-55-formulario.md)

Capturas de evidencia (generar con `npm run test:a11y:evidence`): `docs/evidencia/`

Documentos Word para entrega (generar con `npm run formularios`):

| Archivo | Contenido |
|---------|-----------|
| `docs/formularios/FORMULARIO_Completo_55criterios.docx` | Los 55 criterios + capturas |
| `docs/formularios/FORMULARIO_jeremy.docx` | 2.4.1 (Delgado Solorzano) |
| `docs/formularios/FORMULARIO_justin.docx` | 1.1.1 (Zambrano Lucas) |
| `docs/formularios/FORMULARIO_cesar.docx` | Resto del checklist (Arteaga + equipo) |
