import { z } from "zod";

export const executeSchema = z.object({
  language: z.enum(["cpp", "python", "javascript", "java"]),
  sourceCode: z.string().min(1),
  input: z.string().default("")
});

export type ExecuteInput = z.infer<typeof executeSchema>;
