-- ════════════════════════════════════════════════════════════════════
-- Storage — buckets y políticas de acceso.
--   reports : privado, guarda los PDF de evaluación (RF9)
--   avatars : público (lectura), cada usuario gestiona el suyo
-- ════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values
  ('reports', 'reports', false),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- ─── reports: el usuario solo accede a archivos bajo su carpeta {uid}/ ──
create policy "reportes storage: dueño lee"
  on storage.objects for select
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "reportes storage: dueño sube"
  on storage.objects for insert
  with check (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "reportes storage: dueño borra"
  on storage.objects for delete
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── avatars: lectura pública, escritura del dueño ────────────────────
create policy "avatars storage: lectura pública"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars storage: dueño gestiona"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars storage: dueño actualiza"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
