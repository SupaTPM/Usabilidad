import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Database } from "./database.types";

/**
 * Cliente de Supabase para el servidor (Server Components, Route Handlers,
 * Server Actions). Lee/escribe la sesión desde las cookies de la request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Llamado desde un Server Component: lo maneja el middleware.
          }
        },
      },
    }
  );
}

/**
 * Usuario autenticado de la request, validado contra el servidor de Auth.
 * Envuelto en `cache()` de React: si el layout y la página (y cualquier
 * componente) lo piden en el mismo render, se hace UNA sola llamada de red.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Cliente con service role — SOLO para tareas administrativas en el
 * servidor (p. ej. generar reportes). Omite RLS: nunca exponer al cliente.
 */
export function createAdminClient() {
  const { createClient: createSbClient } = require("@supabase/supabase-js");
  return createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
