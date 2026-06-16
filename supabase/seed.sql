-- ════════════════════════════════════════════════════════════════════
-- Usuarios de prueba para desarrollo local
-- Se aplica automáticamente con: npx supabase db reset
-- ════════════════════════════════════════════════════════════════════
--
-- Credenciales:
--   admin@brujula.dev     / Admin2026!
--   orientador@brujula.dev / Orientador2026!
--   estudiante@brujula.dev / Estudiante2026!
-- ════════════════════════════════════════════════════════════════════

-- ─── Usuarios en auth.users ───────────────────────────────────────────
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  -- Admin
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@brujula.dev',
    crypt('Admin2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Administrador Demo"}',
    now(),
    now(),
    '', '', '', ''
  ),
  -- Orientador
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'orientador@brujula.dev',
    crypt('Orientador2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Orientador Demo"}',
    now(),
    now(),
    '', '', '', ''
  ),
  -- Estudiante
  (
    '00000000-0000-0000-0000-000000000000',
    'cccccccc-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'estudiante@brujula.dev',
    crypt('Estudiante2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Estudiante Demo"}',
    now(),
    now(),
    '', '', '', ''
  )
on conflict (id) do nothing;

-- ─── Identidades (obligatorio para login con email) ───────────────────
insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    gen_random_uuid(),
    'aaaaaaaa-0000-0000-0000-000000000001',
    'admin@brujula.dev',
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","email":"admin@brujula.dev"}',
    'email',
    now(), now(), now()
  ),
  (
    gen_random_uuid(),
    'bbbbbbbb-0000-0000-0000-000000000002',
    'orientador@brujula.dev',
    '{"sub":"bbbbbbbb-0000-0000-0000-000000000002","email":"orientador@brujula.dev"}',
    'email',
    now(), now(), now()
  ),
  (
    gen_random_uuid(),
    'cccccccc-0000-0000-0000-000000000003',
    'estudiante@brujula.dev',
    '{"sub":"cccccccc-0000-0000-0000-000000000003","email":"estudiante@brujula.dev"}',
    'email',
    now(), now(), now()
  )
on conflict do nothing;

-- ─── Roles en profiles ────────────────────────────────────────────────
-- El trigger handle_new_user() ya crea el perfil; solo actualizamos el rol.
update public.profiles set role = 'admin',      full_name = 'Administrador Demo'
  where id = 'aaaaaaaa-0000-0000-0000-000000000001';

update public.profiles set role = 'orientador', full_name = 'Orientador Demo'
  where id = 'bbbbbbbb-0000-0000-0000-000000000002';

update public.profiles set role = 'student',    full_name = 'Estudiante Demo'
  where id = 'cccccccc-0000-0000-0000-000000000003';

-- ─── Asignar el estudiante al orientador (demo) ───────────────────────
insert into public.student_assignments (orientador_id, student_id)
values (
  'bbbbbbbb-0000-0000-0000-000000000002',
  'cccccccc-0000-0000-0000-000000000003'
)
on conflict do nothing;
