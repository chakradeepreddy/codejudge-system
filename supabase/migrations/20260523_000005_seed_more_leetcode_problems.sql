insert into public.problems (
  slug,
  title,
  statement,
  difficulty,
  constraints_text,
  sample_explanation,
  tags,
  is_published,
  time_limit_ms,
  memory_limit_mb
)
values
(
  'binary-search',
  'Binary Search',
  'Given a sorted array of integers nums and an integer target, return the index of target if present, otherwise return -1.',
  'EASY',
  '1 <= nums.length <= 10^5',
  'Use low/high pointers and shrink interval by comparing middle element.',
  array['binary-search','array'],
  true,
  1000,
  256
),
(
  'best-time-to-buy-and-sell-stock',
  'Best Time to Buy and Sell Stock',
  'Given prices[i] as stock price on day i, return the maximum profit from one buy and one sell. Return 0 if no profit is possible.',
  'EASY',
  '1 <= prices.length <= 10^5',
  'Track minimum so far and best difference.',
  array['array','greedy'],
  true,
  1000,
  256
),
(
  'maximum-subarray',
  'Maximum Subarray',
  'Given an integer array nums, find the contiguous subarray with the largest sum and return the sum.',
  'MEDIUM',
  '1 <= nums.length <= 10^5',
  'Kadane''s algorithm works in linear time.',
  array['dynamic-programming','array'],
  true,
  1000,
  256
),
(
  'product-of-array-except-self',
  'Product of Array Except Self',
  'Given an integer array nums, return an array answer such that answer[i] equals product of all nums[j] where j != i, without using division.',
  'MEDIUM',
  '2 <= nums.length <= 10^5',
  'Prefix and suffix products give O(n) time and O(1) extra space (excluding output).',
  array['array','prefix-sum'],
  true,
  1000,
  256
)
on conflict (slug) do update
set
  title = excluded.title,
  statement = excluded.statement,
  difficulty = excluded.difficulty,
  constraints_text = excluded.constraints_text,
  sample_explanation = excluded.sample_explanation,
  tags = excluded.tags,
  is_published = excluded.is_published,
  time_limit_ms = excluded.time_limit_ms,
  memory_limit_mb = excluded.memory_limit_mb;

with problem_ids as (
  select id, slug from public.problems
  where slug in (
    'binary-search',
    'best-time-to-buy-and-sell-stock',
    'maximum-subarray',
    'product-of-array-except-self'
  )
)
insert into public.test_cases (problem_id, input_data, expected_output, is_hidden, ordinal)
select p.id, t.input_data, t.expected_output, t.is_hidden, t.ordinal
from problem_ids p
join (
  values
    ('binary-search', '6\n-1 0 3 5 9 12\n9\n', '4\n', false, 1),
    ('binary-search', '6\n-1 0 3 5 9 12\n2\n', '-1\n', false, 2),
    ('binary-search', '1\n5\n5\n', '0\n', false, 3),
    ('binary-search', '7\n1 2 3 4 5 6 7\n1\n', '0\n', true, 4),
    ('best-time-to-buy-and-sell-stock', '6\n7 1 5 3 6 4\n', '5\n', false, 1),
    ('best-time-to-buy-and-sell-stock', '5\n7 6 4 3 1\n', '0\n', false, 2),
    ('best-time-to-buy-and-sell-stock', '5\n2 4 1 7 5\n', '6\n', false, 3),
    ('best-time-to-buy-and-sell-stock', '8\n3 2 6 5 0 3 1 4\n', '4\n', true, 4),
    ('maximum-subarray', '9\n-2 1 -3 4 -1 2 1 -5 4\n', '6\n', false, 1),
    ('maximum-subarray', '1\n1\n', '1\n', false, 2),
    ('maximum-subarray', '5\n5 4 -1 7 8\n', '23\n', false, 3),
    ('maximum-subarray', '4\n-1 -2 -3 -4\n', '-1\n', true, 4),
    ('product-of-array-except-self', '4\n1 2 3 4\n', '24 12 8 6\n', false, 1),
    ('product-of-array-except-self', '5\n-1 1 0 -3 3\n', '0 0 9 0 0\n', false, 2),
    ('product-of-array-except-self', '3\n2 3 4\n', '12 8 6\n', false, 3),
    ('product-of-array-except-self', '5\n2 0 4 0 5\n', '0 0 0 0 0\n', true, 4)
) as t(slug, input_data, expected_output, is_hidden, ordinal)
on p.slug = t.slug
on conflict (problem_id, ordinal) do update
set
  input_data = excluded.input_data,
  expected_output = excluded.expected_output,
  is_hidden = excluded.is_hidden;
