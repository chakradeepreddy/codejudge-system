"use client";

import { useMemo, useState } from "react";
import CodeEditor, {
  getStarterCode,
  type SupportedLanguage,
} from "@/app/components/code-editor";

type VerdictResponse = {
  action?: "run" | "submit";
  mode?: "custom-input";
  submissionId?: string | null;
  verdict: string;
  passedTestCases: number;
  totalTestCases: number;
  runtimeMs: number;
  stdout?: string;
  stderr?: string;
  compileStderr?: string;
  error?: string;
  analysis?: {
    timeComplexity: string;
    spaceComplexity: string;
    suggestions: string[];
  };
  testCaseResults?: {
    testCaseId: string;
    isHidden: boolean;
    passed: boolean;
    runtimeMs: number;
    status: string;
    input: string;
    expectedOutput: string | null;
    actualOutput: string;
    stderr: string;
    compileStderr: string;
  }[];
};

type SubmissionHistoryItem = {
  id: string;
  language: string;
  verdict: string;
  passed_test_cases: number;
  total_test_cases: number;
  runtime_ms: number | null;
  compile_output: string | null;
  error_output: string | null;
  source_code: string;
  submitted_at: string;
  problems: { title: string } | null;
  test_results?: {
    testCaseId: string;
    isHidden: boolean;
    passed: boolean;
    runtimeMs: number;
    status: string;
    input: string;
    expectedOutput: string | null;
    actualOutput: string;
    stderr: string;
    compileStderr: string;
  }[] | null;
  analysis?: {
    timeComplexity: string;
    spaceComplexity: string;
    suggestions: string[];
  } | null;
};

type ExampleCase = {
  id: string;
  input_data: string;
  expected_output: string;
};

type ProblemWorkspaceProps = {
  problemId: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  statement: string;
  constraintsText?: string | null;
  sampleExplanation?: string | null;
  tags: string[];
  examples: ExampleCase[];
  initialHistory?: SubmissionHistoryItem[];
};

const verdictStyles: Record<string, string> = {
  ACCEPTED: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  WRONG_ANSWER: "border-amber-400/25 bg-amber-500/10 text-amber-300",
  RUNTIME_ERROR: "border-rose-400/25 bg-rose-500/10 text-rose-300",
  COMPILATION_ERROR: "border-orange-400/25 bg-orange-500/10 text-orange-300",
  TIME_LIMIT_EXCEEDED: "border-violet-400/25 bg-violet-500/10 text-violet-300",
  SYSTEM_ERROR: "border-slate-400/25 bg-slate-500/10 text-slate-300",
};

const difficultyStyles: Record<ProblemWorkspaceProps["difficulty"], string> = {
  EASY: "text-emerald-300 bg-emerald-500/10 border-emerald-400/25",
  MEDIUM: "text-amber-300 bg-amber-500/10 border-amber-400/25",
  HARD: "text-rose-300 bg-rose-500/10 border-rose-400/25",
};

export default function ProblemWorkspace({
  problemId,
  title,
  difficulty,
  statement,
  constraintsText,
  sampleExplanation,
  tags,
  examples,
  initialHistory = [],
}: ProblemWorkspaceProps) {
  const [language, setLanguage] = useState<SupportedLanguage>("cpp");
  const [code, setCode] = useState(getStarterCode("cpp", title));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerdictResponse | null>(null);
  const [history, setHistory] = useState<SubmissionHistoryItem[]>(initialHistory);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionHistoryItem | null>(null);
  const [leftTab, setLeftTab] = useState<"problem" | "submissions" | "hints" | "topics">("problem");
  const [customInput, setCustomInput] = useState("");

  const hints = useMemo(() => {
    const base = [
      "Think about how to find the complement in O(1) time.",
      "Store seen values with their indices while iterating once.",
      "Avoid nested loops to reduce time complexity.",
    ];

    if (tags.includes("hash-map")) {
      base.push("unordered_map is usually the best fit for this pattern.");
    }

    return base;
  }, [tags]);

  async function loadHistory() {
    try {
      const response = await fetch(`/api/submissions?problemId=${problemId}`);
      if (!response.ok) return;
      const payload = (await response.json()) as { submissions?: SubmissionHistoryItem[] };
      setHistory(payload.submissions ?? []);
    } catch {
      setHistory([]);
    }
  }

  async function judge(action: "run" | "submit") {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          language,
          sourceCode: code,
          action,
          customInput,
        }),
      });

      const payload = (await response.json()) as VerdictResponse;

      if (!response.ok) {
        setResult({
          verdict: "SYSTEM_ERROR",
          passedTestCases: 0,
          totalTestCases: 0,
          runtimeMs: 0,
          error: payload.error ?? "Failed to execute code",
        });
        return;
      }

      setResult(payload);

      if (action === "submit") {
        setLeftTab("submissions");
        void loadHistory();
      }
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
    <div className="grid w-full gap-4 lg:h-[calc(100vh-4rem)] lg:grid-cols-5">
      <section className="panel overflow-auto lg:col-span-2">
        <div className="panel-header">
          <h1 className="text-lg font-semibold text-token-primary">{title}</h1>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${difficultyStyles[difficulty]}`}>
            {difficulty}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => setLeftTab("problem")} className="rounded-md border border-token px-2 py-1 text-xs text-token-secondary hover:text-token-primary">Problem</button>
          <button onClick={() => setLeftTab("submissions")} className="rounded-md border border-token px-2 py-1 text-xs text-token-secondary hover:text-token-primary">Submissions</button>
          <button onClick={() => setLeftTab("hints")} className="rounded-md border border-token px-2 py-1 text-xs text-token-secondary hover:text-token-primary">Hints</button>
          <button onClick={() => setLeftTab("topics")} className="rounded-md border border-token px-2 py-1 text-xs text-token-secondary hover:text-token-primary">Topics</button>
        </div>

        {leftTab === "problem" ? (
          <div className="mt-5 space-y-5 text-sm leading-7 text-token-secondary">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-token-primary">Statement</h2>
              <p className="whitespace-pre-wrap">{statement}</p>
            </div>
            {examples.length > 0 ? (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-token-primary">Examples</h2>
                <div className="space-y-3">
                  {examples.map((example, index) => (
                    <pre key={example.id} className="overflow-auto rounded-lg border border-token bg-black/10 p-3 text-xs text-token-secondary">
{`Example ${index + 1}\nInput:\n${example.input_data}\nOutput:\n${example.expected_output}`}
                    </pre>
                  ))}
                </div>
              </div>
            ) : null}
            {constraintsText ? (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-token-primary">Constraints</h2>
                <p className="whitespace-pre-wrap">{constraintsText}</p>
              </div>
            ) : null}
            {sampleExplanation ? (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-token-primary">Explanation</h2>
                <p className="whitespace-pre-wrap">{sampleExplanation}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {leftTab === "submissions" ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="text-token-secondary">
                <tr className="border-b border-token">
                  <th className="px-2 py-2">Problem</th>
                  <th className="px-2 py-2">Verdict</th>
                  <th className="px-2 py-2">Language</th>
                  <th className="px-2 py-2">Time</th>
                  <th className="px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td className="px-2 py-3 text-token-secondary" colSpan={5}>No submissions yet.</td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="border-b border-token/60">
                      <td className="px-2 py-2 text-token-primary">{item.problems?.title ?? "Unknown"}</td>
                      <td className="px-2 py-2">
                        <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${verdictStyles[item.verdict] ?? verdictStyles.SYSTEM_ERROR}`}>
                          {item.verdict}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-token-secondary">{item.language}</td>
                      <td className="px-2 py-2 text-token-secondary">{new Date(item.submitted_at).toLocaleString()}</td>
                      <td className="px-2 py-2">
                        <button onClick={() => setSelectedSubmission(item)} className="rounded-md border border-token px-2 py-1 text-token-secondary hover:text-token-primary">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {leftTab === "hints" ? (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-token-secondary">
            {hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
            {result?.analysis ? (
              <>
                <li>Estimated Time Complexity: {result.analysis.timeComplexity}</li>
                <li>Estimated Space Complexity: {result.analysis.spaceComplexity}</li>
                {result.analysis.suggestions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </>
            ) : null}
          </ul>
        ) : null}

        {leftTab === "topics" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.length === 0 ? (
              <span className="text-sm text-token-secondary">No topics available.</span>
            ) : (
              tags.map((tag) => (
                <span key={tag} className="rounded-md border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-200">{tag}</span>
              ))
            )}
          </div>
        ) : null}
      </section>

      <section className="panel lg:col-span-3 lg:flex lg:min-h-0 lg:flex-col">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(event) => {
                const nextLanguage = event.target.value as SupportedLanguage;
                setLanguage(nextLanguage);
                setCode(getStarterCode(nextLanguage, title));
              }}
              className="rounded-md border border-token bg-black/10 px-2 py-1 text-xs text-token-secondary"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
            </select>
            <span className="hidden text-xs text-token-secondary sm:inline">
              {language === "cpp"
                ? "Main.cpp"
                : language === "python"
                  ? "main.py"
                  : language === "javascript"
                    ? "main.js"
                    : "Main.java"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCode(getStarterCode(language, title))}
              className="rounded-md border border-token px-3 py-1.5 text-xs text-token-secondary transition hover:text-token-primary"
            >
              Reset
            </button>
            <button onClick={() => judge("run")} disabled={loading} className="rounded-md border border-token px-3 py-1.5 text-xs text-token-secondary transition hover:text-token-primary disabled:opacity-60">{loading ? "Running..." : "Run Code"}</button>
            <button onClick={() => judge("submit")} disabled={loading} className="rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60">{loading ? "Submitting..." : "Submit"}</button>
          </div>
        </div>

        <div className="editor-shell mt-4 lg:min-h-0 lg:flex-1">
          <CodeEditor language={language} problemTitle={title} value={code} onChange={setCode} />
        </div>

        <div className="mt-4 rounded-lg border border-token bg-black/10 p-3 text-xs text-token-secondary">
          {!result ? (
            <p>Console: Ready to run or submit your solution.</p>
          ) : (
            <div className="space-y-2">
              <p>{result.action === "run" ? "Run" : "Submit"} Verdict: <span className="font-semibold text-token-primary">{result.verdict}</span></p>
              {result.mode === "custom-input" ? (
                <p>Custom input execution | Runtime: {result.runtimeMs} ms</p>
              ) : (
                <p>Passed: {result.passedTestCases}/{result.totalTestCases} | Runtime: {result.runtimeMs} ms</p>
              )}
              {result.error ? <p className="text-rose-400">Error: {result.error}</p> : null}
              {result.compileStderr ? <pre className="max-h-32 overflow-auto rounded border border-token bg-black/20 p-2">{result.compileStderr}</pre> : null}
              {result.stderr ? <pre className="max-h-32 overflow-auto rounded border border-token bg-black/20 p-2">{result.stderr}</pre> : null}
              {result.stdout ? <pre className="max-h-32 overflow-auto rounded border border-token bg-black/20 p-2">{result.stdout}</pre> : null}
              {result.testCaseResults && result.testCaseResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="mt-2 w-full min-w-[560px] text-left text-[11px]">
                    <thead className="text-token-secondary">
                      <tr className="border-b border-token">
                        <th className="px-2 py-1.5">Case</th>
                        <th className="px-2 py-1.5">Type</th>
                        <th className="px-2 py-1.5">Status</th>
                        <th className="px-2 py-1.5">Result</th>
                        <th className="px-2 py-1.5">Runtime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.testCaseResults.map((tc, index) => (
                        <tr key={`${tc.testCaseId}-${index}`} className="border-b border-token/40">
                          <td className="px-2 py-1.5 text-token-primary">#{index + 1}</td>
                          <td className="px-2 py-1.5 text-token-secondary">{tc.isHidden ? "Hidden" : "Sample"}</td>
                          <td className="px-2 py-1.5 text-token-secondary">{tc.status}</td>
                          <td className={`px-2 py-1.5 font-semibold ${tc.passed ? "text-emerald-300" : "text-amber-300"}`}>{tc.passed ? "Pass" : "Fail"}</td>
                          <td className="px-2 py-1.5 text-token-secondary">{tc.runtimeMs} ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-4 rounded-lg border border-token bg-black/10 p-3">
          <label className="mb-2 block text-xs font-medium text-token-primary">Custom Input (used by Run Code only)</label>
          <textarea
            value={customInput}
            onChange={(event) => setCustomInput(event.target.value)}
            placeholder={`Example:\n4\n2 7 11 15\n9`}
            className="min-h-24 w-full resize-y rounded-md border border-token bg-black/20 p-2 text-xs text-token-secondary outline-none focus:border-cyan-400/60"
          />
          <p className="mt-2 text-[11px] text-token-secondary">
            Keep empty to run against up to 3 sample test cases. Submit always runs against full hidden set.
          </p>
        </div>
      </section>

      {selectedSubmission ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-token bg-[var(--panel-bg-a)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-token-primary">Submission Details</h4>
              <button onClick={() => setSelectedSubmission(null)} className="rounded-md border border-token px-2 py-1 text-xs text-token-secondary">Close</button>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs text-token-secondary sm:grid-cols-2">
              <p>Problem: {selectedSubmission.problems?.title ?? "Unknown"}</p>
              <p>Language: {selectedSubmission.language}</p>
              <p>Verdict: {selectedSubmission.verdict}</p>
              <p>Passed: {selectedSubmission.passed_test_cases}/{selectedSubmission.total_test_cases}</p>
              <p>Runtime: {selectedSubmission.runtime_ms ?? 0} ms</p>
              <p>{new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
            </div>
            {selectedSubmission.compile_output ? <pre className="mt-3 max-h-28 overflow-auto rounded border border-token bg-black/20 p-2 text-xs text-token-secondary">{selectedSubmission.compile_output}</pre> : null}
            {selectedSubmission.error_output ? <pre className="mt-3 max-h-28 overflow-auto rounded border border-token bg-black/20 p-2 text-xs text-token-secondary">{selectedSubmission.error_output}</pre> : null}
            {selectedSubmission.analysis ? (
              <div className="mt-3 rounded border border-token bg-black/20 p-2 text-xs text-token-secondary">
                <p className="font-medium text-token-primary">Complexity Analysis</p>
                <p>Time: {selectedSubmission.analysis.timeComplexity}</p>
                <p>Space: {selectedSubmission.analysis.spaceComplexity}</p>
                {selectedSubmission.analysis.suggestions.length > 0 ? (
                  <ul className="mt-1 list-disc pl-4">
                    {selectedSubmission.analysis.suggestions.map((suggestion) => (
                      <li key={suggestion}>{suggestion}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
            {selectedSubmission.test_results && selectedSubmission.test_results.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-[11px]">
                  <thead className="text-token-secondary">
                    <tr className="border-b border-token">
                      <th className="px-2 py-1.5">Case</th>
                      <th className="px-2 py-1.5">Type</th>
                      <th className="px-2 py-1.5">Status</th>
                      <th className="px-2 py-1.5">Result</th>
                      <th className="px-2 py-1.5">Runtime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSubmission.test_results.map((tc, index) => (
                      <tr key={`${tc.testCaseId}-${index}`} className="border-b border-token/40">
                        <td className="px-2 py-1.5 text-token-primary">#{index + 1}</td>
                        <td className="px-2 py-1.5 text-token-secondary">{tc.isHidden ? "Hidden" : "Sample"}</td>
                        <td className="px-2 py-1.5 text-token-secondary">{tc.status}</td>
                        <td className={`px-2 py-1.5 font-semibold ${tc.passed ? "text-emerald-300" : "text-amber-300"}`}>{tc.passed ? "Pass" : "Fail"}</td>
                        <td className="px-2 py-1.5 text-token-secondary">{tc.runtimeMs} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <pre className="mt-3 max-h-56 overflow-auto rounded border border-token bg-black/20 p-2 text-xs text-token-secondary">{selectedSubmission.source_code}</pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
