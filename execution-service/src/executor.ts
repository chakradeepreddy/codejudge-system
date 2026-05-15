import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { performance } from "node:perf_hooks";
import { config } from "./config.js";
import type { ExecuteRequest, ExecuteResponse } from "./types.js";

type ProcessResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
};

async function runCommand(command: string[], timeoutMs: number): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command[0], command.slice(1), { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGKILL");
    }, timeoutMs);

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);
      resolve({ stdout, stderr, exitCode: code, timedOut });
    });
  });
}

function executionTimeoutSec(): number {
  return Math.max(1, Math.ceil(config.executionTimeoutMs / 1000));
}

function dockerCommand(workspaceDir: string, timeoutSec: number): string[] {
  const mem = `${config.memoryLimitMb}m`;
  const cpus = String(config.cpus);

  return [
    "docker",
    "run",
    "--rm",
    "--network",
    "none",
    "--memory",
    mem,
    "--memory-swap",
    mem,
    "--cpus",
    cpus,
    "--pids-limit",
    "128",
    "--read-only",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,size=64m",
    "--security-opt",
    "no-new-privileges",
    "--cap-drop",
    "ALL",
    "-v",
    `${workspaceDir}:/workspace:rw`,
    "-w",
    "/workspace",
    config.image,
    "bash",
    "-lc",
    `timeout ${timeoutSec}s bash /workspace/run.sh`
  ];
}

export async function executeCode(payload: ExecuteRequest): Promise<ExecuteResponse> {
  if (payload.language !== "cpp") {
    return {
      status: "internal_error",
      stdout: "",
      stderr: "Unsupported language",
      durationMs: 0
    };
  }

  const baseDir = await fs.mkdtemp(path.join(os.tmpdir(), `judge-${randomUUID()}-`));
  const started = performance.now();

  try {
    const sourcePath = path.join(baseDir, "main.cpp");
    const inputPath = path.join(baseDir, "input.txt");
    const runPath = path.join(baseDir, "run.sh");

    await fs.writeFile(sourcePath, payload.sourceCode, { encoding: "utf8", mode: 0o600 });
    await fs.writeFile(inputPath, payload.input, { encoding: "utf8", mode: 0o600 });
    const runTimeoutSec = executionTimeoutSec();

    await fs.writeFile(
      runPath,
      [
        "#!/usr/bin/env bash",
        "set -euo pipefail",
        "g++ -std=c++17 -O2 -pipe -o /workspace/main /workspace/main.cpp > /workspace/compile.stdout 2> /workspace/compile.stderr || exit 2",
        `timeout ${runTimeoutSec}s /workspace/main < /workspace/input.txt > /workspace/stdout.txt 2> /workspace/stderr.txt`
      ].join("\n"),
      { encoding: "utf8", mode: 0o700 }
    );

    const docker = dockerCommand(baseDir, runTimeoutSec + 1);
    const processResult = await runCommand(docker, config.executionTimeoutMs + 1500);

    const compileStdout = await fs.readFile(path.join(baseDir, "compile.stdout"), "utf8").catch(() => "");
    const compileStderr = await fs.readFile(path.join(baseDir, "compile.stderr"), "utf8").catch(() => "");
    const stdout = await fs.readFile(path.join(baseDir, "stdout.txt"), "utf8").catch(() => processResult.stdout);
    const stderr = await fs.readFile(path.join(baseDir, "stderr.txt"), "utf8").catch(() => processResult.stderr);

    const durationMs = Math.round(performance.now() - started);

    if (processResult.timedOut || processResult.exitCode === 124) {
      return {
        status: "time_limit_exceeded",
        stdout,
        stderr,
        compileStdout,
        compileStderr,
        exitCode: processResult.exitCode,
        durationMs
      };
    }

    if (processResult.exitCode === 2) {
      return {
        status: "compilation_error",
        stdout: "",
        stderr: "",
        compileStdout,
        compileStderr,
        exitCode: processResult.exitCode,
        durationMs
      };
    }

    if (processResult.exitCode !== 0) {
      return {
        status: "runtime_error",
        stdout,
        stderr,
        compileStdout,
        compileStderr,
        exitCode: processResult.exitCode,
        durationMs
      };
    }

    return {
      status: "accepted",
      stdout,
      stderr,
      compileStdout,
      compileStderr,
      exitCode: processResult.exitCode,
      durationMs
    };
  } catch (error) {
    const durationMs = Math.round(performance.now() - started);
    return {
      status: "internal_error",
      stdout: "",
      stderr: error instanceof Error ? error.message : "Unknown execution error",
      durationMs
    };
  } finally {
    await fs.rm(baseDir, { recursive: true, force: true });
  }
}
