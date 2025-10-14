// server/src/config/env.ts
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("4000"),
  MONGO_URI: z.string(),
  CORS_ORIGIN: z.string(),
  SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  JWT_SECRET: z.string(), 
});

export const env = envSchema.parse(process.env);
