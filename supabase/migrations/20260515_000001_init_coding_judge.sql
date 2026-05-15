-- Coding Judge Core Schema
-- Tables: problems, test_cases, submissions

create extension if not exists "pgcrypto";

-- 1) Verdict tracking enum for submissions
create type submission_verdict as enum (
  'QUEUED',
  'RUNNING',
  'ACCEPTED',
  'WRONG_ANSWER',
  'TIME_LIMIT_EXCEEDED',
  'MEMORY_LIMIT_EXCEEDED',
  'RUNTIME_ERROR',
  'COMPILATION_ERROR',
  'SYSTEM_ERROR'
);

-- 2) Reusable trigger function for updated_at
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3) Problems
create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  statement text not null,
  difficulty text not null check (difficulty in ('EASY', 'MEDIUM', 'HARD')),
  input_format text,
  output_format text,
  constraints_text text,
  sample_explanation text,
  time_limit_ms integer not null default 1000 check (time_limit_ms > 0),
  memory_limit_mb integer not null default 256 check (memory_limit_mb > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_problems_updated_at
before update on public.problems
for each row
execute function set_updated_at();

-- 4) Test cases
create table if not exists public.test_cases (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  input_data text not null,
  expected_output text not null,
  is_hidden boolean not null default true,
  ordinal integer not null default 1 check (ordinal > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (problem_id, ordinal)
);

create trigger trg_test_cases_updated_at
before update on public.test_cases
for each row
execute function set_updated_at();

-- 5) Submissions
-- user_id references Supabase auth.users
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  language text not null,
  source_code text not null,
  verdict submission_verdict not null default 'QUEUED',
  passed_test_cases integer not null default 0 check (passed_test_cases >= 0),
  total_test_cases integer not null default 0 check (total_test_cases >= 0),
  runtime_ms integer check (runtime_ms is null or runtime_ms >= 0),
  memory_kb integer check (memory_kb is null or memory_kb >= 0),
  compile_output text,
  error_output text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (passed_test_cases <= total_test_cases)
);

create trigger trg_submissions_updated_at
before update on public.submissions
for each row
execute function set_updated_at();

-- 6) Performance indexes
create index if not exists idx_problems_difficulty on public.problems(difficulty);
create index if not exists idx_problems_published on public.problems(is_published);
create index if not exists idx_test_cases_problem_id on public.test_cases(problem_id);
create index if not exists idx_submissions_problem_id on public.submissions(problem_id);
create index if not exists idx_submissions_user_id on public.submissions(user_id);
create index if not exists idx_submissions_verdict on public.submissions(verdict);
create index if not exists idx_submissions_submitted_at on public.submissions(submitted_at desc);
