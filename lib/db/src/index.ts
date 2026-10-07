import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isRds = process.env.DATABASE_URL?.includes("rds.amazonaws.com") || process.env.NODE_ENV === "production";
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRds ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
