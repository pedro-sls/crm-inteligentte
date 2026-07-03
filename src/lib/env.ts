import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  WEBHOOK_SIGNING_SECRET: z.string().min(32).optional(),
  API_KEY_PEPPER: z.string().min(32).optional(),
});

export const serverEnv = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  WEBHOOK_SIGNING_SECRET: process.env.WEBHOOK_SIGNING_SECRET,
  API_KEY_PEPPER: process.env.API_KEY_PEPPER,
});
