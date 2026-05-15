export type Language = "cpp" | "python" | "javascript" | "java";

export type ExecuteRequest = {
  language: Language;
  sourceCode: string;
  input: string;
};

export type ExecuteResponse = {
  status: "accepted" | "compilation_error" | "runtime_error" | "time_limit_exceeded" | "internal_error";
  stdout: string;
  stderr: string;
  compileStdout?: string;
  compileStderr?: string;
  exitCode?: number | null;
  durationMs: number;
};
