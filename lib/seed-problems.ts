import type { SupabaseClient } from "@supabase/supabase-js";

type SeedProblem = {
  slug: string;
  title: string;
  statement: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  constraints_text: string;
  sample_explanation: string;
  tags: string[];
  is_published: boolean;
  time_limit_ms: number;
  memory_limit_mb: number;
};

type SeedCase = {
  slug: string;
  input_data: string;
  expected_output: string;
  is_hidden: boolean;
  ordinal: number;
};

const SEED_PROBLEMS: SeedProblem[] = [
  {
    slug: "two-sum",
    title: "Two Sum",
    statement:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "EASY",
    constraints_text:
      "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
    sample_explanation:
      "Use a hash map from value to index while scanning once.",
    tags: ["array", "hash-map"],
    is_published: true,
    time_limit_ms: 1000,
    memory_limit_mb: 256,
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    statement:
      "Given a sorted array of integers nums and an integer target, return index of target if found, else -1.",
    difficulty: "EASY",
    constraints_text: "1 <= nums.length <= 10^5",
    sample_explanation: "Use low/high and check middle each step.",
    tags: ["binary-search", "array"],
    is_published: true,
    time_limit_ms: 1000,
    memory_limit_mb: 256,
  },
  {
    slug: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    statement:
      "Given prices[i], find max profit from one buy and one sell operation.",
    difficulty: "EASY",
    constraints_text: "1 <= prices.length <= 10^5",
    sample_explanation: "Track minimum so far and best profit.",
    tags: ["array", "greedy"],
    is_published: true,
    time_limit_ms: 1000,
    memory_limit_mb: 256,
  },
  {
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    statement:
      "Find the contiguous subarray with the largest sum and return the sum.",
    difficulty: "MEDIUM",
    constraints_text: "1 <= nums.length <= 10^5",
    sample_explanation: "Kadane's algorithm in O(n).",
    tags: ["dynamic-programming", "array"],
    is_published: true,
    time_limit_ms: 1000,
    memory_limit_mb: 256,
  },
  {
    slug: "product-of-array-except-self",
    title: "Product of Array Except Self",
    statement:
      "Return answer[i] as product of all elements except nums[i], without division.",
    difficulty: "MEDIUM",
    constraints_text: "2 <= nums.length <= 10^5",
    sample_explanation: "Use prefix and suffix products.",
    tags: ["array", "prefix-sum"],
    is_published: true,
    time_limit_ms: 1000,
    memory_limit_mb: 256,
  },
];

const SEED_CASES: SeedCase[] = [
  { slug: "two-sum", input_data: "4\n2 7 11 15\n9\n", expected_output: "0 1\n", is_hidden: false, ordinal: 1 },
  { slug: "two-sum", input_data: "3\n3 2 4\n6\n", expected_output: "1 2\n", is_hidden: false, ordinal: 2 },
  { slug: "two-sum", input_data: "2\n3 3\n6\n", expected_output: "0 1\n", is_hidden: false, ordinal: 3 },
  { slug: "two-sum", input_data: "5\n1 5 8 2 9\n10\n", expected_output: "2 3\n", is_hidden: true, ordinal: 4 },
  { slug: "two-sum", input_data: "6\n-3 4 3 90 0 -4\n0\n", expected_output: "0 2\n", is_hidden: true, ordinal: 5 },
  { slug: "two-sum", input_data: "4\n1000000 -1000000 5 -5\n0\n", expected_output: "0 1\n", is_hidden: true, ordinal: 6 },
  { slug: "two-sum", input_data: "7\n9 8 7 6 5 4 3\n10\n", expected_output: "3 4\n", is_hidden: true, ordinal: 7 },
  { slug: "two-sum", input_data: "5\n0 4 3 0 1\n0\n", expected_output: "0 3\n", is_hidden: true, ordinal: 8 },
  { slug: "two-sum", input_data: "8\n11 15 2 7 1 5 3 9\n8\n", expected_output: "4 6\n", is_hidden: true, ordinal: 9 },
  { slug: "two-sum", input_data: "5\n1 2 3 4 5\n9\n", expected_output: "3 4\n", is_hidden: true, ordinal: 10 },
  { slug: "two-sum", input_data: "6\n-10 -5 0 5 10 15\n5\n", expected_output: "0 5\n", is_hidden: true, ordinal: 11 },
  { slug: "two-sum", input_data: "6\n2 1 5 3 6 4\n7\n", expected_output: "0 4\n", is_hidden: true, ordinal: 12 },
  { slug: "two-sum", input_data: "9\n1 9 8 2 7 3 6 4 5\n10\n", expected_output: "0 1\n", is_hidden: true, ordinal: 13 },
  { slug: "binary-search", input_data: "6\n-1 0 3 5 9 12\n9\n", expected_output: "4\n", is_hidden: false, ordinal: 1 },
  { slug: "binary-search", input_data: "6\n-1 0 3 5 9 12\n2\n", expected_output: "-1\n", is_hidden: false, ordinal: 2 },
  { slug: "binary-search", input_data: "1\n5\n5\n", expected_output: "0\n", is_hidden: false, ordinal: 3 },
  { slug: "binary-search", input_data: "7\n1 2 3 4 5 6 7\n1\n", expected_output: "0\n", is_hidden: true, ordinal: 4 },
  { slug: "binary-search", input_data: "7\n1 2 3 4 5 6 7\n7\n", expected_output: "6\n", is_hidden: true, ordinal: 5 },
  { slug: "binary-search", input_data: "7\n1 2 3 4 5 6 7\n4\n", expected_output: "3\n", is_hidden: true, ordinal: 6 },
  { slug: "binary-search", input_data: "6\n-10 -3 0 2 8 15\n-3\n", expected_output: "1\n", is_hidden: true, ordinal: 7 },
  { slug: "binary-search", input_data: "6\n-10 -3 0 2 8 15\n14\n", expected_output: "-1\n", is_hidden: true, ordinal: 8 },
  { slug: "binary-search", input_data: "5\n2 4 6 8 10\n2\n", expected_output: "0\n", is_hidden: true, ordinal: 9 },
  { slug: "binary-search", input_data: "5\n2 4 6 8 10\n10\n", expected_output: "4\n", is_hidden: true, ordinal: 10 },
  { slug: "binary-search", input_data: "5\n2 4 6 8 10\n7\n", expected_output: "-1\n", is_hidden: true, ordinal: 11 },
  { slug: "binary-search", input_data: "8\n1 3 5 7 9 11 13 15\n11\n", expected_output: "5\n", is_hidden: true, ordinal: 12 },
  { slug: "binary-search", input_data: "8\n1 3 5 7 9 11 13 15\n16\n", expected_output: "-1\n", is_hidden: true, ordinal: 13 },
  { slug: "best-time-to-buy-and-sell-stock", input_data: "6\n7 1 5 3 6 4\n", expected_output: "5\n", is_hidden: false, ordinal: 1 },
  { slug: "best-time-to-buy-and-sell-stock", input_data: "5\n7 6 4 3 1\n", expected_output: "0\n", is_hidden: false, ordinal: 2 },
  { slug: "best-time-to-buy-and-sell-stock", input_data: "8\n3 2 6 5 0 3 1 4\n", expected_output: "4\n", is_hidden: false, ordinal: 3 },
  { slug: "best-time-to-buy-and-sell-stock", input_data: "1\n5\n", expected_output: "0\n", is_hidden: true, ordinal: 4 },
  { slug: "best-time-to-buy-and-sell-stock", input_data: "5\n1 2 3 4 5\n", expected_output: "4\n", is_hidden: true, ordinal: 5 },
  { slug: "best-time-to-buy-and-sell-stock", input_data: "5\n5 4 3 2 1\n", expected_output: "0\n", is_hidden: true, ordinal: 6 },
  { slug: "best-time-to-buy-and-sell-stock", input_data: "6\n2 1 2 1 0 1\n", expected_output: "1\n", is_hidden: true, ordinal: 7 },
  { slug: "best-time-to-buy-and-sell-stock", input_data: "7\n2 4 1 7 5 3 6\n", expected_output: "6\n", is_hidden: true, ordinal: 8 },
  { slug: "best-time-to-buy-and-sell-stock", input_data: "7\n9 1 4 10 2 12 1\n", expected_output: "11\n", is_hidden: true, ordinal: 9 },
  { slug: "best-time-to-buy-and-sell-stock", input_data: "4\n2 2 2 2\n", expected_output: "0\n", is_hidden: true, ordinal: 10 },
  { slug: "best-time-to-buy-and-sell-stock", input_data: "6\n8 6 5 4 7 3\n", expected_output: "3\n", is_hidden: true, ordinal: 11 },
  { slug: "best-time-to-buy-and-sell-stock", input_data: "8\n1 3 2 8 4 9 0 10\n", expected_output: "10\n", is_hidden: true, ordinal: 12 },
  { slug: "best-time-to-buy-and-sell-stock", input_data: "8\n10 9 8 7 6 5 4 3\n", expected_output: "0\n", is_hidden: true, ordinal: 13 },
  { slug: "maximum-subarray", input_data: "9\n-2 1 -3 4 -1 2 1 -5 4\n", expected_output: "6\n", is_hidden: false, ordinal: 1 },
  { slug: "maximum-subarray", input_data: "1\n1\n", expected_output: "1\n", is_hidden: false, ordinal: 2 },
  { slug: "maximum-subarray", input_data: "4\n-1 -2 -3 -4\n", expected_output: "-1\n", is_hidden: false, ordinal: 3 },
  { slug: "maximum-subarray", input_data: "5\n5 4 -1 7 8\n", expected_output: "23\n", is_hidden: true, ordinal: 4 },
  { slug: "maximum-subarray", input_data: "6\n1 2 3 4 5 6\n", expected_output: "21\n", is_hidden: true, ordinal: 5 },
  { slug: "maximum-subarray", input_data: "6\n-5 -4 -3 -2 -1 -6\n", expected_output: "-1\n", is_hidden: true, ordinal: 6 },
  { slug: "maximum-subarray", input_data: "8\n3 -2 5 -1 6 -3 2 7\n", expected_output: "17\n", is_hidden: true, ordinal: 7 },
  { slug: "maximum-subarray", input_data: "8\n-2 -1 2 3 4 -5 2 2\n", expected_output: "9\n", is_hidden: true, ordinal: 8 },
  { slug: "maximum-subarray", input_data: "8\n0 0 0 0 0 0 0 0\n", expected_output: "0\n", is_hidden: true, ordinal: 9 },
  { slug: "maximum-subarray", input_data: "7\n2 -1 2 3 4 -5 10\n", expected_output: "15\n", is_hidden: true, ordinal: 10 },
  { slug: "maximum-subarray", input_data: "10\n1 -1 1 -1 1 -1 1 -1 1 -1\n", expected_output: "1\n", is_hidden: true, ordinal: 11 },
  { slug: "maximum-subarray", input_data: "5\n100 -1 -2 -3 50\n", expected_output: "144\n", is_hidden: true, ordinal: 12 },
  { slug: "maximum-subarray", input_data: "2\n-2 1\n", expected_output: "1\n", is_hidden: true, ordinal: 13 },
  { slug: "product-of-array-except-self", input_data: "4\n1 2 3 4\n", expected_output: "24 12 8 6\n", is_hidden: false, ordinal: 1 },
  { slug: "product-of-array-except-self", input_data: "5\n-1 1 0 -3 3\n", expected_output: "0 0 9 0 0\n", is_hidden: false, ordinal: 2 },
  { slug: "product-of-array-except-self", input_data: "5\n2 0 4 0 5\n", expected_output: "0 0 0 0 0\n", is_hidden: false, ordinal: 3 },
  { slug: "product-of-array-except-self", input_data: "3\n2 3 4\n", expected_output: "12 8 6\n", is_hidden: true, ordinal: 4 },
  { slug: "product-of-array-except-self", input_data: "4\n1 1 1 1\n", expected_output: "1 1 1 1\n", is_hidden: true, ordinal: 5 },
  { slug: "product-of-array-except-self", input_data: "4\n-1 -2 -3 -4\n", expected_output: "-24 -12 -8 -6\n", is_hidden: true, ordinal: 6 },
  { slug: "product-of-array-except-self", input_data: "4\n0 1 2 3\n", expected_output: "6 0 0 0\n", is_hidden: true, ordinal: 7 },
  { slug: "product-of-array-except-self", input_data: "4\n0 0 2 3\n", expected_output: "0 0 0 0\n", is_hidden: true, ordinal: 8 },
  { slug: "product-of-array-except-self", input_data: "5\n9 8 7 6 5\n", expected_output: "1680 1890 2160 2520 3024\n", is_hidden: true, ordinal: 9 },
  { slug: "product-of-array-except-self", input_data: "5\n-1 2 -3 4 -5\n", expected_output: "120 -60 40 -30 24\n", is_hidden: true, ordinal: 10 },
  { slug: "product-of-array-except-self", input_data: "6\n1 2 0 4 5 6\n", expected_output: "0 0 240 0 0 0\n", is_hidden: true, ordinal: 11 },
  { slug: "product-of-array-except-self", input_data: "6\n1 2 3 4 5 6\n", expected_output: "720 360 240 180 144 120\n", is_hidden: true, ordinal: 12 },
  { slug: "product-of-array-except-self", input_data: "6\n-1 -1 -1 -1 -1 -1\n", expected_output: "1 1 1 1 1 1\n", is_hidden: true, ordinal: 13 },
];

export async function ensureSeedProblems(supabase: SupabaseClient) {
  await supabase
    .from("problems")
    .upsert(SEED_PROBLEMS, { onConflict: "slug", ignoreDuplicates: false });

  const { data: allSeededProblems } = await supabase
    .from("problems")
    .select("id,slug")
    .in(
      "slug",
      SEED_PROBLEMS.map((problem) => problem.slug)
    );

  const idBySlug = new Map((allSeededProblems ?? []).map((row) => [row.slug, row.id]));
  const casesToInsert = SEED_CASES.map((testCase) => ({
    problem_id: idBySlug.get(testCase.slug),
    input_data: testCase.input_data,
    expected_output: testCase.expected_output,
    is_hidden: testCase.is_hidden,
    ordinal: testCase.ordinal,
  })).filter((testCase) => Boolean(testCase.problem_id));

  if (casesToInsert.length > 0) {
    await supabase
      .from("test_cases")
      .upsert(casesToInsert, { onConflict: "problem_id,ordinal", ignoreDuplicates: false });
  }
}
