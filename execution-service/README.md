# Execution Service (Secure C++ Runner)

## Overview
This service exposes a single API endpoint `POST /execute` for running untrusted C++ code safely in Docker.

It does **not** execute code directly on the host. Instead, it:
1. Validates request payload.
2. Writes source + input to a per-request temp directory.
3. Runs a Docker container (`gcc:14`) with strict limits.
4. Compiles and executes inside container.
5. Returns stdout/stderr and verdict-like status.
6. Deletes all temp files.

## API
### `POST /execute`
Request body:
```json
{
  "language": "cpp",
  "sourceCode": "#include <iostream> ...",
  "input": "1 2\n"
}
```

Response fields:
- `status`: `accepted | compilation_error | runtime_error | time_limit_exceeded | internal_error`
- `stdout`
- `stderr`
- `compileStdout`
- `compileStderr`
- `exitCode`
- `durationMs`

## Docker Execution Flow
For each request:
1. Host creates temp workspace.
2. Host writes:
   - `main.cpp`
   - `input.txt`
   - `run.sh`
3. Service launches Docker with:
   - `--network none` (no internet)
   - memory cap (`--memory` + `--memory-swap`)
   - CPU cap (`--cpus`)
   - `--pids-limit 128`
   - `--read-only`
   - `--tmpfs /tmp`
   - `--cap-drop ALL`
   - `--security-opt no-new-privileges`
4. Inside container:
   - compile with `g++`
   - run binary with `timeout`
5. Service reads output files and maps result to status.
6. Workspace is deleted.

## Security Considerations
- Untrusted code always runs in a container.
- Internet is disabled (`--network none`).
- CPU and memory are constrained.
- Process count is limited.
- Linux capabilities are dropped.
- Root filesystem is read-only.
- Request payload size is bounded by JSON/body and byte checks.
- Temp data is deleted after execution.

## Local Setup
### 1) Install deps
```bash
cd execution-service
npm install
```

### 2) Start service
```bash
npm run dev
```

### 3) Ensure Docker daemon is running
```bash
docker ps
```

### 4) Health check
```bash
curl http://localhost:4000/health
```

### 5) Run a success case
```bash
curl -X POST http://localhost:4000/execute \
  -H 'Content-Type: application/json' \
  -d '{
    "language":"cpp",
    "sourceCode":"#include <bits/stdc++.h>\\nusing namespace std;\\nint main(){int a,b;cin>>a>>b;cout<<a+b<<"\\n";}",
    "input":"2 3\\n"
  }'
```

### 6) Run a compilation error case
```bash
curl -X POST http://localhost:4000/execute \
  -H 'Content-Type: application/json' \
  -d '{
    "language":"cpp",
    "sourceCode":"int main( { return 0; }",
    "input":""
  }'
```

### 7) Run a timeout case
```bash
curl -X POST http://localhost:4000/execute \
  -H 'Content-Type: application/json' \
  -d '{
    "language":"cpp",
    "sourceCode":"int main(){while(true){} return 0;}",
    "input":""
  }'
```

## Notes
- This is a secure baseline, not a complete production sandbox.
- For stronger isolation, run containers with gVisor/Kata or dedicated sandbox hosts.
