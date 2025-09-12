// server/src/config/env.ts
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("4000"),
  MONGO_URI: z.string().url(),
  JWT_SECRET: z.string(),
  CORS_ORIGIN: z.string().url(),
});

export const env = envSchema.parse(process.env);
