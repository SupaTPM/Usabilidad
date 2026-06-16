-- Paso 2/2: Función helper, tabla de asignaciones y políticas RLS.
-- Requiere que 'orientador' ya exista en el enum (migración 090400).

-- ─── Función helper ───────────────────────────────────────────────────
create or replace function public.is_orientador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'orientador'
  );
$$;

-- ─── Tabla de asignaciones orientador ↔ estudiante ────────────────────
create table if not exists public.student_assignments (
  id             uuid primary key default gen_random_uuid(),
  orientador_id  uuid not null references public.profiles (id) on delete cascade,
  student_id     uuid not null references public.profiles (id) on delete cascade,
  assigned_at    timestamptz not null default now(),
  unique (orientador_id, student_id)
);

comment on table public.student_assignments is
  'Asignación orientador ↔ estudiante. Gestionada por admin.';

create index if not exists student_assignments_orientador_idx
  on public.student_assignments (orientador_id);

create index if not exists student_assignments_student_idx
  on public.student_assignments (student_id);

-- ─── RLS para student_assignments ─────────────────────────────────────
alter table public.student_assignments enable row level security;

create policy "asignaciones: orientador ve las suyas"
  on public.student_assignments for select
  using (orientador_id = auth.uid() or public.is_admin());

create policy "asignaciones: admin gestiona"
  on public.student_assignments for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─── Ampliar políticas existentes ─────────────────────────────────────
create policy "perfil: orientador ve asignados"
  on public.profiles for select
  using (
    public.is_orientador() and exists (
      select 1 from public.student_assignments sa
      where sa.orientador_id = auth.uid()
        and sa.student_id = profiles.id
    )
  );

create policy "evaluaciones: orientador ve asignados"
  on public.assessments for select
  using (
    public.is_orientador() and exists (
      select 1 from public.student_assignments sa
      where sa.orientador_id = auth.uid()
        and sa.student_id = assessments.user_id
    )
  );

create policy "recomendaciones: orientador ve asignados"
  on public.recommendations for select
  using (
    public.is_orientador() and exists (
      select 1 from public.assessments a
      join public.student_assignments sa on sa.student_id = a.user_id
      where a.id = recommendations.assessment_id
        and sa.orientador_id = auth.uid()
    )
  );

create policy "reportes: orientador ve asignados"
  on public.reports for select
  using (
    public.is_orientador() and exists (
      select 1 from public.student_assignments sa
      where sa.orientador_id = auth.uid()
        and sa.student_id = reports.user_id
    )
  );
