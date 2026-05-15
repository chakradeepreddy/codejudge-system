alter table public.problems
add column if not exists tags text[] not null default '{}';

create index if not exists idx_problems_tags_gin
on public.problems
using gin (tags);
