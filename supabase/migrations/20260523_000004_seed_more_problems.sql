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
  'two-sum',
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Return any valid pair.',
  'EASY',
  '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
  'Store previously seen values in a hash map. For each value x, search for target - x.',
  array['array','hash-map'],
  true,
  1000,
  256
),
(
  'valid-parentheses',
  'Valid Parentheses',
  'Given a string containing just the characters ()[]{} determine if the input string is valid.',
  'EASY',
  '1 <= s.length <= 10^5',
  'Use a stack and match every closing bracket with the latest opening bracket.',
  array['stack','string'],
  true,
  1000,
  256
),
(
  'longest-substring-without-repeating-characters',
  'Longest Substring Without Repeating Characters',
  'Given a string s, find the length of the longest substring without repeating characters.',
  'MEDIUM',
  '0 <= s.length <= 5 * 10^4',
  'Use sliding window with last seen indices.',
  array['sliding-window','hash-map','string'],
  true,
  1000,
  256
),
(
  'merge-intervals',
  'Merge Intervals',
  'Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals and return an array of the non-overlapping intervals.',
  'MEDIUM',
  '1 <= intervals.length <= 10^4',
  'Sort by start point and greedily merge.',
  array['sorting','intervals','array'],
  true,
  1000,
  256
),
(
  'trapping-rain-water',
  'Trapping Rain Water',
  'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
  'HARD',
  '1 <= n <= 2 * 10^4',
  'Two-pointer or prefix/suffix max approach gives linear time.',
  array['two-pointers','array','dynamic-programming'],
  true,
  1500,
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
    'two-sum',
    'valid-parentheses',
    'longest-substring-without-repeating-characters',
    'merge-intervals',
    'trapping-rain-water'
  )
)
insert into public.test_cases (problem_id, input_data, expected_output, is_hidden, ordinal)
select p.id, t.input_data, t.expected_output, t.is_hidden, t.ordinal
from problem_ids p
join (
  values
    ('two-sum', '4\n2 7 11 15\n9\n', '0 1\n', false, 1),
    ('two-sum', '3\n3 2 4\n6\n', '1 2\n', false, 2),
    ('two-sum', '2\n3 3\n6\n', '0 1\n', false, 3),
    ('two-sum', '5\n1 5 8 2 9\n10\n', '2 3\n', true, 4),
    ('valid-parentheses', '()[]{}\n', 'true\n', false, 1),
    ('valid-parentheses', '(]\n', 'false\n', false, 2),
    ('valid-parentheses', '([{}])\n', 'true\n', false, 3),
    ('valid-parentheses', '([)]\n', 'false\n', true, 4),
    ('longest-substring-without-repeating-characters', 'abcabcbb\n', '3\n', false, 1),
    ('longest-substring-without-repeating-characters', 'bbbbb\n', '1\n', false, 2),
    ('longest-substring-without-repeating-characters', 'pwwkew\n', '3\n', false, 3),
    ('longest-substring-without-repeating-characters', 'dvdf\n', '3\n', true, 4),
    ('merge-intervals', '4\n1 3\n2 6\n8 10\n15 18\n', '1 6\n8 10\n15 18\n', false, 1),
    ('merge-intervals', '2\n1 4\n4 5\n', '1 5\n', false, 2),
    ('merge-intervals', '3\n1 2\n3 4\n5 6\n', '1 2\n3 4\n5 6\n', false, 3),
    ('merge-intervals', '5\n1 10\n2 3\n4 8\n11 12\n12 13\n', '1 10\n11 13\n', true, 4),
    ('trapping-rain-water', '12\n0 1 0 2 1 0 1 3 2 1 2 1\n', '6\n', false, 1),
    ('trapping-rain-water', '6\n4 2 0 3 2 5\n', '9\n', false, 2),
    ('trapping-rain-water', '3\n3 3 3\n', '0\n', false, 3),
    ('trapping-rain-water', '5\n5 4 1 2 1\n', '1\n', true, 4)
) as t(slug, input_data, expected_output, is_hidden, ordinal)
on p.slug = t.slug
on conflict (problem_id, ordinal) do update
set
  input_data = excluded.input_data,
  expected_output = excluded.expected_output,
  is_hidden = excluded.is_hidden;
