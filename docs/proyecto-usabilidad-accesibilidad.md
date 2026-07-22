# Documentacion del proyecto: usabilidad y accesibilidad

**Proyecto:** Brujula - Sistema Inteligente de Orientacion Vocacional  
**Tipo:** Aplicacion web para orientar a estudiantes en la eleccion de carreras  
**Stack principal:** Next.js, React, TypeScript, Tailwind CSS y Supabase  
**Enfoque de calidad:** usabilidad, accesibilidad y conformidad con WCAG 2.0 A/AA

---

## 1. Idea general del proyecto

Brujula es un sistema inteligente de orientacion vocacional pensado para estudiantes que necesitan tomar decisiones sobre su futuro academico y profesional. La aplicacion propone una experiencia guiada: el usuario se registra, completa un perfil inicial, responde un test vocacional y recibe resultados explicados con recomendaciones de carreras.

La idea central no es solo mostrar una lista de opciones, sino ayudar al estudiante a entender por que ciertas carreras pueden coincidir con sus intereses, aptitudes y preferencias. Para eso, el proyecto usa el modelo RIASEC o codigo de Holland, que clasifica el perfil vocacional en seis dimensiones: Realista, Investigador, Artistico, Social, Emprendedor y Convencional.

Desde el punto de vista de usabilidad, el sistema busca reducir la confusion durante el proceso de decision. Desde el punto de vista de accesibilidad, busca que personas con distintas necesidades visuales, auditivas, motrices o cognitivas puedan completar el flujo principal sin barreras.

---

## 2. Objetivo del sistema

El objetivo principal es ofrecer una herramienta digital clara, accesible y util para apoyar la orientacion vocacional.

Objetivos especificos:

- Permitir que el estudiante cree una cuenta e ingrese a su panel personal.
- Guiar al usuario por un test vocacional breve y dividido en bloques.
- Generar un perfil vocacional basado en el modelo RIASEC.
- Recomendar carreras de forma explicable, mostrando el motivo de cada sugerencia.
- Permitir explorar y comparar carreras.
- Conservar un historial de evaluaciones para consulta posterior.
- Incluir herramientas de accesibilidad configurables por el usuario.
- Verificar el cumplimiento de criterios WCAG mediante pruebas automatizadas y revision documental.

---

## 3. Usuarios principales

El sistema esta dirigido principalmente a:

- Estudiantes que necesitan apoyo para elegir una carrera.
- Orientadores que desean revisar informacion vocacional de estudiantes.
- Administradores responsables de gestionar cuestionarios, usuarios o catalogos.
- Personas con necesidades de accesibilidad visual, auditiva, motriz o cognitiva.

El diseno considera que el usuario puede estar indeciso, tener poca experiencia con plataformas digitales o necesitar apoyos adicionales para leer, navegar, escuchar contenido multimedia o completar formularios.

---

## 4. Flujo principal de uso

El recorrido principal del estudiante es:

1. Entrar a la pagina inicial.
2. Registrarse o iniciar sesion.
3. Completar el perfil inicial.
4. Responder el test vocacional.
5. Revisar los resultados.
6. Explorar carreras recomendadas.
7. Comparar opciones.
8. Volver al panel para consultar resultados anteriores.

Este flujo esta pensado para que el usuario avance de forma progresiva, sin recibir demasiada informacion al mismo tiempo. El test se divide en bloques cortos de seis preguntas, con progreso visible y validaciones antes de continuar.

---

## 5. Funcionalidades principales

### Registro e inicio de sesion

El proyecto usa Supabase Auth para manejar autenticacion. El usuario puede registrarse, iniciar sesion y acceder a una zona privada. La experiencia evita mecanismos que dificulten el acceso, como CAPTCHA o retos de memoria, y permite el uso de gestores de contrasenas.

### Onboarding o perfil inicial

Despues del registro, el estudiante completa informacion basica para personalizar la experiencia. Los formularios usan etiquetas, ayudas contextuales, validacion visible y mensajes de error comprensibles.

### Test vocacional

El test esta compuesto por preguntas tipo escala Likert de 1 a 5. Cada bloque muestra un conjunto reducido de preguntas para evitar fatiga y mejorar la concentracion. El usuario puede avanzar o retroceder entre bloques.

Decisiones de usabilidad aplicadas:

- Preguntas numeradas.
- Opciones de respuesta consistentes.
- Barra de progreso.
- Mensajes cuando faltan respuestas.
- Envio final con opcion de confirmacion accesible.

### Resultados vocacionales

Al finalizar el test, el sistema calcula el perfil RIASEC y muestra resultados comprensibles. Las recomendaciones no se presentan como respuestas absolutas, sino como sugerencias explicadas segun coincidencias entre el perfil del estudiante y el catalogo de carreras.

### Explorador y comparador de carreras

El usuario puede revisar carreras disponibles y comparar opciones como duracion, costo, campo laboral y universidades. Esta funcionalidad ayuda a transformar el resultado del test en una decision mas informada.

### Panel del estudiante

El panel permite revisar evaluaciones anteriores y volver a consultar resultados. Esto mejora la continuidad del proceso, porque la orientacion vocacional no se limita a una sola sesion.

### Modulos de administracion y orientador

El proyecto incluye areas para administracion y orientacion. Estas se encuentran protegidas por roles y reglas de seguridad en Supabase, lo que permite separar funciones segun el tipo de usuario.

### Videos vocacionales

La aplicacion incluye una seccion de videos vocacionales con soporte para subtitulos, transcripciones y descripcion textual cuando corresponde. Esto permite que el contenido multimedia no dependa solo del audio o de la imagen.

---

## 6. Usabilidad en el proyecto

La usabilidad se trabaja desde la estructura, los flujos y la forma de presentar la informacion.

Principales decisiones:

- Navegacion consistente entre paginas.
- Textos claros y orientados a la accion.
- Flujo del test dividido en partes pequenas.
- Indicador de progreso durante la evaluacion.
- Botones principales visibles y con proposito claro.
- Mensajes de error especificos.
- Confirmacion opcional antes de enviar acciones importantes.
- Centro de ayuda disponible desde el menu de accesibilidad.
- Resultados explicados, no solo calculados.

Estas decisiones reducen la carga cognitiva y ayudan a que el usuario entienda que debe hacer en cada pantalla.

---

## 7. Accesibilidad en el proyecto

La accesibilidad esta integrada como parte funcional del sistema, no como un agregado visual. El proyecto incluye un menu de accesibilidad que permite ajustar la experiencia segun las necesidades del usuario.

Opciones disponibles:

- Tema claro, oscuro o automatico.
- Alto contraste.
- Aumento del tamano de texto hasta 200%.
- Espaciado de lectura e interlineado ampliado.
- Enlaces subrayados y senales redundantes.
- Colores mas suaves.
- Texto en negrita.
- Subtitulos y transcripciones.
- Silenciar medios.
- Resaltado de foco.
- Botones y areas tactiles mas grandes.
- Cursor mas visible.
- Animaciones reducidas.
- Texto mas legible.
- Lineas de lectura mas cortas.
- Modo calma.
- Mas ayuda en formularios.
- Errores mas visibles.
- Confirmacion antes de enviar formularios.

Las preferencias se guardan en el dispositivo mediante `localStorage`, usando la clave `ov:a11y`, y se aplican al cargar la aplicacion.

---

## 8. Relacion con WCAG 2.0

WCAG 2.0 significa Web Content Accessibility Guidelines 2.0. Es un conjunto de pautas internacionales para hacer que el contenido web sea mas accesible para personas con discapacidad. WCAG 2.0 se organiza alrededor de cuatro principios:

1. **Perceptible:** la informacion debe poder percibirse de distintas formas.
2. **Operable:** la interfaz debe poder usarse con teclado, mouse, tactil u otras tecnologias.
3. **Comprensible:** el contenido y las acciones deben ser claras y predecibles.
4. **Robusto:** el sistema debe ser compatible con tecnologias de asistencia.

El proyecto toma estos principios como base para sus decisiones de diseno y desarrollo.

### Principio 1: Perceptible

El sistema ofrece alternativas para que la informacion no dependa de un solo sentido.

Aplicaciones en el proyecto:

- Textos reales en HTML en lugar de imagenes con texto.
- Contraste configurable.
- Tamano de texto ajustable.
- Transcripciones para videos.
- Subtitulos en contenido multimedia.
- Graficos con etiquetas accesibles cuando transmiten informacion.
- Color acompanado de texto, bordes o iconos para evitar que sea el unico medio de comunicacion.

### Principio 2: Operable

La interfaz se puede usar sin depender exclusivamente del mouse.

Aplicaciones en el proyecto:

- Navegacion por teclado.
- Foco visible.
- Enlace para saltar al contenido principal.
- Atajos con combinaciones `Alt+Shift`, evitando atajos de una sola tecla.
- Dialogos con control de foco y cierre con Escape.
- Botones con areas de interaccion ampliables.
- Test vocacional navegable mediante controles nativos.

### Principio 3: Comprensible

El sistema intenta que las pantallas, formularios y mensajes sean faciles de entender.

Aplicaciones en el proyecto:

- Idioma principal definido como espanol.
- Formularios con etiquetas e instrucciones.
- Mensajes de error claros.
- Confirmacion antes de acciones importantes.
- Flujo por pasos.
- Navegacion consistente.
- Centro de ayuda y referencia de atajos.

### Principio 4: Robusto

El proyecto usa estructura semantica y atributos ARIA cuando son necesarios para mejorar la compatibilidad con lectores de pantalla y otras tecnologias de asistencia.

Aplicaciones en el proyecto:

- Uso de `main`, `header`, `nav`, `fieldset`, `legend` y controles nativos.
- Estados anunciados mediante `aria-live`, `role="status"` y `role="alert"`.
- Dialogos con `role="dialog"` y nombres accesibles.
- Barras de progreso con atributos ARIA.
- Botones con estados `aria-pressed` cuando funcionan como interruptores.

---

## 9. Criterios WCAG destacados

Aunque la documentacion del proyecto tambien menciona WCAG 2.2, las decisiones implementadas cubren criterios que ya existen en WCAG 2.0 A/AA.

Ejemplos relevantes:

| Criterio WCAG 2.0 | Aplicacion en el proyecto |
| --- | --- |
| 1.1.1 Contenido no textual | Graficos y elementos visuales informativos con alternativas textuales. |
| 1.2.1 Solo audio y solo video | Transcripciones para contenido multimedia cuando aplica. |
| 1.2.2 Subtitulos | Soporte de subtitulos para videos. |
| 1.3.1 Informacion y relaciones | Uso de estructura semantica, encabezados, formularios agrupados y etiquetas. |
| 1.4.1 Uso del color | La informacion no depende solo del color. |
| 1.4.3 Contraste minimo | Tema y modo de alto contraste. |
| 1.4.4 Cambio de tamano del texto | Texto escalable hasta 200%. |
| 2.1.1 Teclado | Interfaz y menu accesibles por teclado. |
| 2.1.2 Sin trampas de teclado | Dialogos cerrables y foco controlado. |
| 2.4.1 Evitar bloques repetitivos | Enlace "Saltar al contenido". |
| 2.4.3 Orden del foco | Orden de navegacion coherente. |
| 2.4.7 Foco visible | Estilos de foco reforzados. |
| 3.1.1 Idioma de la pagina | Documento definido en espanol. |
| 3.2.3 Navegacion coherente | Cabeceras y rutas consistentes. |
| 3.3.1 Identificacion de errores | Errores visibles con texto y alerta. |
| 3.3.2 Etiquetas o instrucciones | Campos de formulario con etiquetas y ayudas. |
| 4.1.2 Nombre, funcion, valor | Uso de controles nativos y atributos ARIA. |

---

## 10. Evidencia y pruebas

El proyecto incluye pruebas automatizadas con Playwright y axe-core para revisar accesibilidad y navegacion por teclado.

Comandos principales:

```bash
npm run typecheck
npm run build
npm run test:a11y
```

Archivos relacionados:

- `e2e/a11y.spec.ts`
- `e2e/keyboard.spec.ts`
- `e2e/keyboard-shortcuts.spec.ts`
- `e2e/wcag-x-audit.spec.ts`
- `docs/wcag-conformance.md`
- `docs/checklist-55-formulario.md`

Las pruebas automatizadas ayudan a detectar problemas comunes, pero no sustituyen por completo una revision manual con lector de pantalla, teclado real y validacion de contraste en contexto.

---

## 11. Estructura tecnica resumida

| Carpeta o archivo | Proposito |
| --- | --- |
| `src/app` | Rutas principales de la aplicacion. |
| `src/app/(app)` | Zona autenticada del sistema. |
| `src/components` | Componentes reutilizables de interfaz, accesibilidad, formularios y resultados. |
| `src/lib/accessibility` | Preferencias, aplicacion de ajustes y atajos de accesibilidad. |
| `src/lib/vocational` | Modelo RIASEC y algoritmo de recomendaciones. |
| `src/lib/supabase` | Clientes y tipos de Supabase. |
| `supabase/migrations` | Esquema de base de datos, politicas RLS y datos iniciales. |
| `e2e` | Pruebas automatizadas de accesibilidad y teclado. |
| `docs` | Documentacion de conformidad WCAG y formularios de evidencia. |

---

## 12. Conclusion

Brujula es un proyecto de orientacion vocacional que combina funcionalidad, explicabilidad y accesibilidad. Su valor principal esta en acompanar al estudiante durante una decision importante mediante un flujo claro, resultados comprensibles y recomendaciones justificadas.

El enfoque de usabilidad se refleja en la simplicidad del recorrido, la division del test en bloques, los mensajes claros y la disponibilidad de ayuda. El enfoque de accesibilidad se refleja en el menu de preferencias, la navegacion por teclado, el soporte multimedia accesible, los formularios robustos y la alineacion con los principios de WCAG 2.0: perceptible, operable, comprensible y robusto.
