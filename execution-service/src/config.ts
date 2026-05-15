export const config = {
  port: Number(process.env.PORT ?? 4000),
  maxSourceBytes: Number(process.env.MAX_SOURCE_BYTES ?? 100_000),
  maxInputBytes: Number(process.env.MAX_INPUT_BYTES ?? 100_000),
  executionTimeoutMs: Number(process.env.EXECUTION_TIMEOUT_MS ?? 2000),
  memoryLimitMb: Number(process.env.MEMORY_LIMIT_MB ?? 256),
  cpus: Number(process.env.CPUS ?? 0.5),
  image: process.env.EXECUTOR_IMAGE ?? "gcc:14"
};
