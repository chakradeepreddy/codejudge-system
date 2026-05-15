"use client";

import { useState } from "react";
import CodeEditor, { getStarterCode } from "@/app/components/code-editor";

type VerdictResponse = {
  submissionId?: string;
  verdict: string;
  passedTestCases: number;
  totalTestCases: number;
  runtimeMs: number;
  stdout?: string;
  stderr?: string;
  compileStderr?: string;
  error?: string;
};

type ProblemWorkspaceProps = {
  problemId: string;
};

export default function ProblemWorkspace({ problemId }: ProblemWorkspaceProps) {
  const starterCode = getStarterCode("cpp");
  const [code, setCode] = useState(starterCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerdictResponse | null>(null);

  async function submitCode() {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          language: "cpp",
          sourceCode: code,
        }),
      });

      const payload = (await response.json()) as VerdictResponse;

      if (!response.ok) {
        setResult({
          verdict: "SYSTEM_ERROR",
          passedTestCases: 0,
          totalTestCases: 0,
          runtimeMs: 0,
          error: payload.error ?? "Failed to submit code",
        });
        return;
      }

      setResult(payload);
    } catch (error) {
      setResult({
        verdict: "SYSTEM_ERROR",
        passedTestCases: 0,
        totalTestCases: 0,
        runtimeMs: 0,
        error: error instanceof Error ? error.message : "Unknown network error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel lg:col-span-3 lg:flex lg:min-h-0 lg:flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-token bg-black/10 px-2 py-1 text-xs text-token-secondary">
            C++
          </span>
          <span className="hidden text-xs text-token-secondary sm:inline">main.cpp</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCode(starterCode)}
            className="rounded-md border border-token px-3 py-1.5 text-xs text-token-secondary transition hover:text-token-primary"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={submitCode}
            disabled={loading}
            className="rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      <div className="editor-shell mt-4 lg:min-h-0 lg:flex-1">
        <CodeEditor language="cpp" value={code} onChange={setCode} />
      </div>

      <div className="mt-4 rounded-lg border border-token bg-black/10 p-3 text-xs text-token-secondary">
        {!result ? (
          <p>Console: Ready.</p>
        ) : (
          <div className="space-y-2">
            <p>
              Verdict: <span className="font-semibold text-token-primary">{result.verdict}</span>
            </p>
            <p>
              Passed: {result.passedTestCases}/{result.totalTestCases} | Runtime: {result.runtimeMs} ms
            </p>
            {result.error ? <p className="text-rose-400">Error: {result.error}</p> : null}
            {result.compileStderr ? (
              <pre className="max-h-36 overflow-auto rounded border border-token bg-black/20 p-2">
                {result.compileStderr}
              </pre>
            ) : null}
            {result.stderr ? (
              <pre className="max-h-36 overflow-auto rounded border border-token bg-black/20 p-2">
                {result.stderr}
              </pre>
            ) : null}
            {result.stdout ? (
              <pre className="max-h-36 overflow-auto rounded border border-token bg-black/20 p-2">
                {result.stdout}
              </pre>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
