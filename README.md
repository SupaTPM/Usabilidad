# Brújula · Sistema Inteligente de Orientación Vocacional

MVP de orientación vocacional para estudiantes. **Next.js** (frontend + capa
server) sobre **Supabase** (Postgres, Auth, Storage y REST/PostgREST).

El motor de recomendación usa el modelo **RIASEC (código de Holland)**: un
algoritmo explicable que construye el perfil de intereses y lo compara con un
catálogo de carreras, justificando cada sugerencia.

---

## Stack

| Capa        | Tecnología                                            |
| ----------- | ----------------------------------------------------- |
| Frontend    | Next.js 15 (App Router), React 19, Tailwind CSS       |
| Backend     | Supabase: Postgres + Auth + Storage + REST            |
| Tipos       | TypeScript en todo el proyecto                        |
| Diseño      | Sistema propio accesible (WCAG 2.2 AA), tema y A11y    |

---

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores (los obtienes en
**Project Settings → API** de tu proyecto en https://app.supabase.com):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # solo servidor
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Base de datos

**Opción A — local (recomendada para desarrollar):** requiere Docker.

```bash
npm run db:start     # levanta Supabase local (Postgres, Auth, Studio…)
npm run db:reset     # aplica migraciones + seed
```

**Opción B — proyecto en la nube:**

```bash
npx supabase link --project-ref <TU_REF>
npm run db:push                          # aplica migraciones + catálogo (seed)
```

El cuestionario y el catálogo de carreras se versionan como migración
(`…_seed_catalog.sql`), así que `db:push` los carga automáticamente. No hace
falta correr nada manual.

### 4. Arrancar la app

```bash
npm run dev          # http://localhost:3000
```

---

## Estructura

```
supabase/
  config.toml                 Configuración del proyecto Supabase
  migrations/
    …_init_schema.sql         Tablas, enums, funciones y triggers
    …_rls_policies.sql        Row Level Security (seguridad del REST)
    …_storage_buckets.sql     Buckets 'reports' y 'avatars' + políticas
    …_seed_catalog.sql        Cuestionario RIASEC + catálogo de carreras

src/
  app/
    page.tsx                  Landing
    login/  register/         Autenticación (RF1)
    auth/callback/            Intercambio de sesión OAuth/magic link
    (app)/                    Zona autenticada (layout con guardia de sesión)
      onboarding/             Completar perfil (RF1)
      test/                   Test vocacional + server action (RF2–RF4)
      resultados/[id]/        Perfil + recomendaciones (RF5–RF7, RF9)
      carreras/               Explorar carreras
      comparar/               Comparar opciones (RF8)
      dashboard/              Panel e historial (RF7)
      admin/                  Administración, rol admin (RF10)
  components/                 UI (hexágono, A11y, formularios, tarjetas…)
  lib/
    supabase/                 Clientes browser/server + middleware + tipos
    vocational/               Modelo RIASEC y algoritmo de matching
```

---

## Cobertura de requisitos

### Funcionales

| RF   | Dónde |
| ---- | ----- |
| RF1  | `login` / `register` / `onboarding` + Auth de Supabase |
| RF2  | `test` (cuestionario en bloques cortos) |
| RF3  | Ítems con categoría: intereses, aptitudes, habilidades, preferencias |
| RF4  | `lib/vocational/matching.ts` + `test/actions.ts` (reglas RIASEC) |
| RF5  | `recommendations` + página de resultados |
| RF6  | Explicación generada por recomendación (`buildExplanation`) |
| RF7  | `dashboard` lista evaluaciones; resultados consultables por id |
| RF8  | `comparar` (tabla comparativa de carreras) |
| RF9  | Reporte imprimible a PDF (estilos `@media print`) |
| RF10 | `admin` (gestión gated por rol; RLS de escritura solo admin) |

### No funcionales (usabilidad)

- **WCAG 2.2 A/AA:** foco visible, navegación por teclado, roles ARIA,
  `prefers-reduced-motion`, skip-link, contraste, color nunca como único medio.
- **Menú de accesibilidad** (tema, alto contraste, tamaño de texto,
  animaciones) — `components/AccessibilityMenu.tsx`.
- **≤ 3 clics a resultados:** al finalizar el test se navega directo al perfil.
- **Tiempo en tarea:** 30 ítems en bloques de 6, pensados para < 10 min.
- **Tasa de finalización / error:** progreso visible, validación por bloque y
  mensajes de error claros y específicos.

#### Verificación automatizada (Playwright + axe-core)

```bash
npm run test:a11y
```

Audita 6 estados de pantalla (landing, login, registro, panel, test, resultados)
contra WCAG 2.0/2.1/2.2 **A y AA**, más pruebas de **teclado y foco** (skip-link,
foco visible, envío de formularios con Enter, navegación del test con flechas).
Estado actual: **0 violaciones**. Las pruebas están en `e2e/`.

> Nota honesta: axe cubre de forma fiable ~30–55 % de los criterios WCAG. Pasar
> sin violaciones es necesario pero no suficiente; para certificar el 95 %
> conviene además una revisión manual con lector de pantalla (NVDA/VoiceOver).

---

## Crear un administrador (RF10)

Tras registrar un usuario, promuévelo a admin desde el editor SQL de Supabase:

```sql
update public.profiles set role = 'admin' where email = 'tu-correo@ejemplo.com';
```

---

## Scripts

| Script             | Acción                                          |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Servidor de desarrollo                          |
| `npm run build`    | Build de producción                             |
| `npm run typecheck`| Verificación de tipos                           |
| `npm run db:reset` | Reaplica migraciones + seed (local)             |
| `npm run db:push`  | Aplica migraciones a la nube                    |
| `npm run db:types` | Regenera `database.types.ts` desde la BD        |

> **Nota:** los tipos en `src/lib/supabase/database.types.ts` están escritos a
> mano para el MVP. Una vez tengas la BD en marcha, regenéralos con
> `npm run db:types` para mantenerlos sincronizados con el esquema real.
