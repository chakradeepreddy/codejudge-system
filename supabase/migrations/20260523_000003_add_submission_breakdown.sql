alter table public.submissions
add column if not exists test_results jsonb,
add column if not exists analysis jsonb;
