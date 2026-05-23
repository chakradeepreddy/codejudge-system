import express from "express";
import { config } from "./config.js";
import { executeCode } from "./executor.js";
import { executeSchema } from "./validation.js";

const app = express();

app.use(express.json({ limit: "200kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/execute", async (req, res) => {
  const parsed = executeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid payload",
      details: parsed.error.flatten()
    });
  }

  if (Buffer.byteLength(parsed.data.sourceCode, "utf8") > config.maxSourceBytes) {
    return res.status(413).json({ error: "sourceCode too large" });
  }

  if (Buffer.byteLength(parsed.data.input, "utf8") > config.maxInputBytes) {
    return res.status(413).json({ error: "input too large" });
  }

  const result = await executeCode(parsed.data);
  return res.json(result);
});

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
);

app.listen(config.port, () => {
  console.log(`Execution service listening on :${config.port}`);
});
