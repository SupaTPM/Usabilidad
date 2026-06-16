# Declaración de Conformidad WCAG 2.2

**Sistema:** Brújula — Sistema Inteligente de Orientación Vocacional  
**Nivel objetivo:** WCAG 2.2 A/AA  
**Fecha de revisión:** 2026-06-15  

---

## Criterios No Aplicables (N/A)

Estos criterios no aplican porque el sistema no posee el tipo de contenido que regulan. Se documenta la justificación para que la auditoría quede completa.

| ID | Criterio | Justificación | Nivel |
|----|----------|---------------|-------|
| 1.2.4 | Subtítulos en directo | La aplicación no emite contenido audiovisual en tiempo real (streaming en vivo). | AA |
| 2.1.4 | Atajos de teclado de un solo carácter | No se implementan atajos de teclado de un único carácter alfanumérico. | A |
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
| Predecible / Navegación (3.2.x) | ✅ Completo |
| Entrada de usuario / Formularios (3.3.x) | ✅ `aria-invalid`, `aria-describedby`, `autocomplete` |
| Compatible / ARIA (4.1.x) | ✅ Completo |

---

## Notas sobre multimedia (1.2.x)

El sistema no incluye audio ni video actualmente. Cuando se agreguen:

- Usar el componente `src/components/AccessibleMedia.tsx` que provee:
  - `<track kind="captions">` para subtítulos grabados (1.2.2)
  - `<track kind="descriptions">` para audiodescripción (1.2.3, 1.2.5)
  - Sección de transcripción colapsable (1.2.1)
  - `controls` nativos del navegador para pausa/silencio (1.4.2)
- Proveer archivos `.vtt` para cada pista.
- 1.2.4 (subtítulos en directo) seguirá siendo N/A salvo que se implemente streaming.
