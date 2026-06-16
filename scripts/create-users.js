// @ts-check
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE_KEY) {
  console.error("Faltan variables de entorno:");
  if (!URL) console.error("  · NEXT_PUBLIC_SUPABASE_URL");
  if (!SERVICE_KEY) console.error("  · SUPABASE_SERVICE_ROLE_KEY");
  console.error("\nCorré: node --env-file=.env.local scripts/create-users.js");
  process.exit(1);
}

const supabase = createClient(URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  {
    email: "admin@brujula.dev",
    password: "Admin2026!",
    full_name: "Administrador Demo",
    role: "admin",
  },
  {
    email: "orientador@brujula.dev",
    password: "Orientador2026!",
    full_name: "Orientador Demo",
    role: "orientador",
  },
  {
    email: "estudiante@brujula.dev",
    password: "Estudiante2026!",
    full_name: "Estudiante Demo",
    role: "student",
  },
];

async function run() {
  console.log("Creando usuarios en Supabase Cloud...\n");

  const createdIds = {};

  for (const u of USERS) {
    process.stdout.write(`  · ${u.email} (${u.role})... `);

    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    });

    if (error) {
      if (error.message.includes("already been registered")) {
        console.log("ya existe, actualizando rol...");
        // Buscar el usuario existente
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users?.find((x) => x.email === u.email);
        if (existing) createdIds[u.role] = existing.id;
      } else {
        console.log(`ERROR: ${error.message}`);
        continue;
      }
    } else {
      console.log("OK");
      createdIds[u.role] = data.user.id;
    }

    // Actualizar el rol en profiles
    const uid = createdIds[u.role];
    if (uid) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: u.role, full_name: u.full_name })
        .eq("id", uid);

      if (profileError) {
        console.warn(`    ⚠ No se pudo actualizar el rol: ${profileError.message}`);
      }
    }
  }

  // Asignar estudiante al orientador (demo)
  const orientadorId = createdIds["orientador"];
  const studentId = createdIds["student"];
  if (orientadorId && studentId) {
    process.stdout.write("\n  · Asignando estudiante al orientador... ");
    const { error } = await supabase
      .from("student_assignments")
      .upsert({ orientador_id: orientadorId, student_id: studentId });
    console.log(error ? `ERROR: ${error.message}` : "OK");
  }

  console.log("\n✓ Listo. Credenciales:\n");
  console.log("  Rol          Email                      Contraseña");
  console.log("  ───────────  ─────────────────────────  ──────────────────");
  console.log("  Admin        admin@brujula.dev          Admin2026!");
  console.log("  Orientador   orientador@brujula.dev     Orientador2026!");
  console.log("  Estudiante   estudiante@brujula.dev     Estudiante2026!");
}

run().catch((e) => {
  console.error("Error inesperado:", e);
  process.exit(1);
});
