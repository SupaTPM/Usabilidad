-- ════════════════════════════════════════════════════════════════════
-- Row Level Security (RLS) — el REST de Supabase (PostgREST) respeta
-- estas políticas. Catálogos = lectura pública; datos del usuario =
-- privados a su dueño; administración = rol admin (RF10).
-- ════════════════════════════════════════════════════════════════════

alter table public.profiles            enable row level security;
alter table public.questionnaires      enable row level security;
alter table public.questions           enable row level security;
alter table public.careers             enable row level security;
alter table public.assessments         enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.recommendations     enable row level security;
alter table public.action_plans        enable row level security;
alter table public.reports             enable row level security;
alter table public.saved_comparisons   enable row level security;

-- ─── profiles ─────────────────────────────────────────────────────────
create policy "perfil: leer propio o admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "perfil: actualizar propio"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── questionnaires (catálogo) ────────────────────────────────────────
create policy "cuestionarios: lectura pública"
  on public.questionnaires for select
  using (is_active or public.is_admin());

create policy "cuestionarios: admin gestiona"
  on public.questionnaires for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─── questions (catálogo) ─────────────────────────────────────────────
create policy "preguntas: lectura pública"
  on public.questions for select
  using (is_active or public.is_admin());

create policy "preguntas: admin gestiona"
  on public.questions for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─── careers (catálogo) ───────────────────────────────────────────────
create policy "carreras: lectura pública"
  on public.careers for select
  using (is_active or public.is_admin());

create policy "carreras: admin gestiona"
  on public.careers for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─── assessments (privado al dueño) ───────────────────────────────────
create policy "evaluaciones: dueño o admin lee"
  on public.assessments for select
  using (auth.uid() = user_id or public.is_admin());

create policy "evaluaciones: dueño crea"
  on public.assessments for insert
  with check (auth.uid() = user_id);

create policy "evaluaciones: dueño actualiza"
  on public.assessments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "evaluaciones: dueño elimina"
  on public.assessments for delete
  using (auth.uid() = user_id);

-- ─── assessment_responses (vía evaluación del dueño) ──────────────────
create policy "respuestas: dueño lee"
  on public.assessment_responses for select
  using (exists (
    select 1 from public.assessments a
    where a.id = assessment_id and (a.user_id = auth.uid() or public.is_admin())
  ));

create policy "respuestas: dueño escribe"
  on public.assessment_responses for insert
  with check (exists (
    select 1 from public.assessments a
    where a.id = assessment_id and a.user_id = auth.uid()
  ));

create policy "respuestas: dueño actualiza"
  on public.assessment_responses for update
  using (exists (
    select 1 from public.assessments a
    where a.id = assessment_id and a.user_id = auth.uid()
  ));

-- ─── recommendations (privado al dueño) ───────────────────────────────
create policy "recomendaciones: dueño lee"
  on public.recommendations for select
  using (exists (
    select 1 from public.assessments a
    where a.id = assessment_id and (a.user_id = auth.uid() or public.is_admin())
  ));

create policy "recomendaciones: dueño escribe"
  on public.recommendations for insert
  with check (exists (
    select 1 from public.assessments a
    where a.id = assessment_id and a.user_id = auth.uid()
  ));

-- ─── action_plans (privado al dueño) ──────────────────────────────────
create policy "planes: dueño gestiona"
  on public.action_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── reports (privado al dueño) ───────────────────────────────────────
create policy "reportes: dueño lee"
  on public.reports for select
  using (auth.uid() = user_id or public.is_admin());

create policy "reportes: dueño escribe"
  on public.reports for insert
  with check (auth.uid() = user_id);

-- ─── saved_comparisons (privado al dueño) ─────────────────────────────
create policy "comparaciones: dueño gestiona"
  on public.saved_comparisons for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
