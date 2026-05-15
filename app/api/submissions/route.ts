import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const submissionSchema = z.object({
  problemId: z.string().uuid(),
  language: z.enum(["cpp"]),
  sourceCode: z.string().min(1).max(100000),
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

function normalizeOutput(value: string) {
  return value.replace(/\r\n/g, "\n").trimEnd();
}

function mapVerdict(status: ExecutorResponse["status"]) {
  switch (status) {
    case "accepted":
      return "ACCEPTED" as const;
    case "compilation_error":
      return "COMPILATION_ERROR" as const;
    case "time_limit_exceeded":
      return "TIME_LIMIT_EXCEEDED" as const;
    case "runtime_error":
      return "RUNTIME_ERROR" as const;
    default:
      return "SYSTEM_ERROR" as const;
  }
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

  const { problemId, language, sourceCode } = parsed.data;

  const { data: testCases, error: testError } = await supabase
    .from("test_cases")
    .select("id,input_data,expected_output,is_hidden")
    .eq("problem_id", problemId)
    .order("ordinal", { ascending: true });

  if (testError) {
    return NextResponse.json({ error: testError.message }, { status: 500 });
  }

  const totalTestCases = testCases?.length ?? 0;

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

  const executionServiceUrl = process.env.EXECUTION_SERVICE_URL ?? "http://localhost:4000";

  let passedTestCases = 0;
  let runtimeMs = 0;
  let verdict:
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "TIME_LIMIT_EXCEEDED"
    | "RUNTIME_ERROR"
    | "COMPILATION_ERROR"
    | "SYSTEM_ERROR" = "ACCEPTED";
  let finalStdout = "";
  let finalStderr = "";
  let finalCompileStderr = "";

  for (const testCase of testCases ?? []) {
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
        verdict = "WRONG_ANSWER";
        break;
      }

      passedTestCases += 1;
    } catch {
      verdict = "SYSTEM_ERROR";
      break;
    } finally {
      clearTimeout(timeout);
    }
  }

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
    .eq("id", createdSubmission.id);

  return NextResponse.json({
    submissionId: createdSubmission.id,
    verdict,
    passedTestCases,
    totalTestCases,
    runtimeMs,
    stdout: finalStdout,
    stderr: finalStderr,
    compileStderr: finalCompileStderr,
  });
}
