import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const submissionSchema = z.object({
  problemId: z.string().uuid(),
  language: z.enum(["cpp", "python", "javascript", "java"]),
  sourceCode: z.string().min(1).max(100000),
  action: z.enum(["run", "submit"]).default("submit"),
});

type ExecutorResponse = {
  status:
    | "accepted"
    | "compilation_error"
    | "runtime_error"
    | "time_limit_exceeded"
    | "internal_error";
  stdout: string;
  stderr: string;
  compileStdout?: string;
  compileStderr?: string;
  durationMs: number;
};

type JudgeVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR"
  | "SYSTEM_ERROR";

function normalizeOutput(value: string) {
  return value.replace(/\r\n/g, "\n").trimEnd();
}

function mapVerdict(status: ExecutorResponse["status"]): JudgeVerdict {
  switch (status) {
    case "accepted":
      return "ACCEPTED";
    case "compilation_error":
      return "COMPILATION_ERROR";
    case "time_limit_exceeded":
      return "TIME_LIMIT_EXCEEDED";
    case "runtime_error":
      return "RUNTIME_ERROR";
    default:
      return "SYSTEM_ERROR";
  }
}

function estimateComplexity(sourceCode: string) {
  const code = sourceCode.replace(/\s+/g, " ").toLowerCase();
  const forCount = (code.match(/\bfor\s*\(/g) ?? []).length;
  const whileCount = (code.match(/\bwhile\s*\(/g) ?? []).length;
  const nestedLoops = /for\s*\([^)]*\)\s*\{[^{}]*for\s*\(/s.test(code);
  const usesHashMap = /unordered_map|unordered_set|map<|set</.test(code);
  const usesSort = /\bsort\s*\(/.test(code);

  let timeComplexity = "O(n)";
  if (nestedLoops || forCount + whileCount >= 3) {
    timeComplexity = "O(n^2)";
  } else if (usesSort) {
    timeComplexity = "O(n log n)";
  }

  let spaceComplexity = "O(1)";
  if (usesHashMap || /vector<|string\s+/.test(code)) {
    spaceComplexity = "O(n)";
  }

  const suggestions: string[] = [];
  if (timeComplexity === "O(n^2)" && usesHashMap) {
    suggestions.push("Try reducing nested loops by reusing a single hash lookup pass.");
  } else if (timeComplexity === "O(n^2)") {
    suggestions.push("Consider hash-based lookups to reduce quadratic scans.");
  }
  if (!usesHashMap) {
    suggestions.push("For Two Sum style problems, unordered_map often gives O(n) time.");
  }
  if (usesSort) {
    suggestions.push("Sorting changes index order; ensure output requires original indices.");
  }

  return {
    timeComplexity,
    spaceComplexity,
    suggestions,
  };
}

export async function POST(req: Request) {
  const parsed = submissionSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { problemId, language, sourceCode, action } = parsed.data;

  let testCaseQuery = supabase
    .from("test_cases")
    .select("id,input_data,expected_output,is_hidden")
    .eq("problem_id", problemId)
    .order("ordinal", { ascending: true });

  if (action === "run") {
    testCaseQuery = testCaseQuery.eq("is_hidden", false).limit(3);
  }

  const { data: testCases, error: testError } = await testCaseQuery;

  if (testError) {
    return NextResponse.json({ error: testError.message }, { status: 500 });
  }

  const selectedCases = testCases ?? [];
  const totalTestCases = selectedCases.length;
  const executionServiceUrl = process.env.EXECUTION_SERVICE_URL ?? "http://localhost:4000";

  let submissionId: string | null = null;
  if (action === "submit") {
    const { data: createdSubmission, error: createSubmissionError } = await supabase
      .from("submissions")
      .insert({
        problem_id: problemId,
        user_id: user.id,
        language,
        source_code: sourceCode,
        verdict: "RUNNING",
        total_test_cases: totalTestCases,
        passed_test_cases: 0,
      })
      .select("id")
      .single();

    if (createSubmissionError || !createdSubmission) {
      return NextResponse.json(
        { error: createSubmissionError?.message ?? "Unable to create submission" },
        { status: 500 }
      );
    }

    submissionId = createdSubmission.id;
  }

  let passedTestCases = 0;
  let runtimeMs = 0;
  let verdict: JudgeVerdict = "ACCEPTED";
  let wrongAnswerSeen = false;
  let finalStdout = "";
  let finalStderr = "";
  let finalCompileStderr = "";

  for (const testCase of selectedCases) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const execRes = await fetch(`${executionServiceUrl}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          sourceCode,
          input: testCase.input_data,
        }),
        signal: controller.signal,
      });

      const execData = (await execRes.json()) as ExecutorResponse;
      runtimeMs += execData.durationMs;
      finalStdout = execData.stdout;
      finalStderr = execData.stderr;
      finalCompileStderr = execData.compileStderr ?? "";

      if (!execRes.ok) {
        verdict = "SYSTEM_ERROR";
        break;
      }

      if (execData.status !== "accepted") {
        verdict = mapVerdict(execData.status);
        break;
      }

      if (normalizeOutput(execData.stdout) !== normalizeOutput(testCase.expected_output)) {
        wrongAnswerSeen = true;
        continue;
      }

      passedTestCases += 1;
    } catch {
      verdict = "SYSTEM_ERROR";
      break;
    } finally {
      clearTimeout(timeout);
    }
  }

  if (verdict === "ACCEPTED" && wrongAnswerSeen) {
    verdict = "WRONG_ANSWER";
  }

  if (action === "submit" && submissionId) {
    await supabase
      .from("submissions")
      .update({
        verdict,
        passed_test_cases: passedTestCases,
        total_test_cases: totalTestCases,
        runtime_ms: runtimeMs,
        compile_output: finalCompileStderr,
        error_output: finalStderr,
      })
      .eq("id", submissionId);
  }

  const analysis = estimateComplexity(sourceCode);

  return NextResponse.json({
    action,
    submissionId,
    verdict,
    passedTestCases,
    totalTestCases,
    runtimeMs,
    stdout: finalStdout,
    stderr: finalStderr,
    compileStderr: finalCompileStderr,
    analysis,
  });
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const problemId = url.searchParams.get("problemId");

  let query = supabase
    .from("submissions")
    .select(
      "id,problem_id,language,verdict,passed_test_cases,total_test_cases,runtime_ms,compile_output,error_output,source_code,submitted_at,problems(title)"
    )
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false })
    .limit(20);

  if (problemId) {
    query = query.eq("problem_id", problemId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data ?? [] });
}
