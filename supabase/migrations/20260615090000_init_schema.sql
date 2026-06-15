-- ════════════════════════════════════════════════════════════════════
-- Sistema Inteligente de Orientación Vocacional — Esquema inicial
-- Cubre RF1–RF10. Modelo de matching: RIASEC (código Holland).
-- ════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─── Enumeraciones ────────────────────────────────────────────────────
create type public.user_role as enum ('student', 'admin');
create type public.riasec_dim as enum ('R', 'I', 'A', 'S', 'E', 'C');
create type public.assessment_status as enum ('in_progress', 'completed');
create type public.demand_level as enum ('low', 'medium', 'high');
create type public.education_level as enum (
  'secundaria', 'bachillerato', 'tecnico', 'universitario', 'posgrado', 'otro'
);

-- ─── profiles (RF1) ───────────────────────────────────────────────────
-- Extiende auth.users con datos personales, nivel educativo, intereses
-- iniciales y preferencias de accesibilidad (RNF usabilidad).
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  full_name           text,
  email               text,
  education_level     public.education_level,
  birth_date          date,
  initial_interests   text,
  role                public.user_role not null default 'student',
  accessibility_prefs jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table public.profiles is 'Perfil del estudiante; 1-1 con auth.users.';

-- ─── questionnaires (RF10) ────────────────────────────────────────────
create table public.questionnaires (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── questions (RF2, RF3, RF10) ───────────────────────────────────────
-- category: intereses | aptitudes | habilidades | preferencias
-- dimension: dimensión RIASEC a la que aporta el ítem.
create table public.questions (
  id               uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references public.questionnaires (id) on delete cascade,
  text             text not null,
  dimension        public.riasec_dim not null,
  category         text not null default 'intereses',
  order_index      int not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);
create index questions_questionnaire_idx on public.questions (questionnaire_id, order_index);

-- ─── careers (RF5) ────────────────────────────────────────────────────
create table public.careers (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  description         text,
  riasec_code         text not null,                 -- p.ej. 'SIA'
  field               text,                          -- área de conocimiento
  avg_duration_years  numeric(3, 1),
  academic_demand     public.demand_level default 'medium',
  job_demand          public.demand_level default 'medium',
  avg_monthly_cost    numeric(10, 2),
  job_market_outlook  text,
  university_examples jsonb not null default '[]'::jsonb,
  key_skills          jsonb not null default '[]'::jsonb,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

-- ─── assessments (RF2, RF7) ───────────────────────────────────────────
create table public.assessments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  questionnaire_id uuid references public.questionnaires (id) on delete set null,
  status           public.assessment_status not null default 'in_progress',
  scores           jsonb not null default '{}'::jsonb,  -- {"R":.., "I":.., ...}
  holland_code     text,
  started_at       timestamptz not null default now(),
  completed_at     timestamptz
);
create index assessments_user_idx on public.assessments (user_id, started_at desc);

-- ─── assessment_responses (RF3) ───────────────────────────────────────
create table public.assessment_responses (
  id            uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  question_id   uuid not null references public.questions (id) on delete cascade,
  value         smallint not null check (value between 1 and 5),  -- Likert 1-5
  created_at    timestamptz not null default now(),
  unique (assessment_id, question_id)
);
create index responses_assessment_idx on public.assessment_responses (assessment_id);

-- ─── recommendations (RF5, RF6) ───────────────────────────────────────
create table public.recommendations (
  id            uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  career_id     uuid not null references public.careers (id) on delete cascade,
  score         numeric(5, 2) not null,   -- afinidad 0-100
  rank          int not null,
  explanation   text,                     -- por qué se recomienda (RF6)
  created_at    timestamptz not null default now(),
  unique (assessment_id, career_id)
);
create index recommendations_assessment_idx on public.recommendations (assessment_id, rank);

-- ─── action_plans (Plan de acción) ────────────────────────────────────
create table public.action_plans (
  id            uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  title         text not null default 'Mi plan de acción',
  steps         jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── reports (RF9) ────────────────────────────────────────────────────
-- Metadatos; el archivo vive en Storage (bucket 'reports').
create table public.reports (
  id            uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  storage_path  text,
  format        text not null default 'pdf',
  created_at    timestamptz not null default now()
);

-- ─── saved_comparisons (RF8) ──────────────────────────────────────────
create table public.saved_comparisons (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  career_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════
-- Funciones y triggers
-- ════════════════════════════════════════════════════════════════════

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_questionnaires_updated
  before update on public.questionnaires
  for each row execute function public.set_updated_at();

create trigger trg_action_plans_updated
  before update on public.action_plans
  for each row execute function public.set_updated_at();

-- Crea automáticamente el profile al registrarse un usuario (RF1)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper para políticas RLS: ¿el usuario actual es admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
