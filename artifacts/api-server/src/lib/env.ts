import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().url("Must be a valid database URL").optional(),
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters long").default("fallback_secret_for_development"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = envSchema.parse(process.env);
