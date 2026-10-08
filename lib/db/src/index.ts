import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const isRds = process.env.DATABASE_URL?.includes("rds.amazonaws.com") || process.env.NODE_ENV === "production";

export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isRds ? { rejectUnauthorized: false } : undefined,
    })
  : (null as any);

export const db: ReturnType<typeof drizzle<typeof schema>> = process.env.DATABASE_URL
  ? drizzle(pool, { schema })
  : (new Proxy({} as any, {
      get(_target, prop) {
        throw new Error(
          "DATABASE_URL must be set. Did you forget to provision a database?",
        );
      },
    }) as any);

export * from "./schema";
