import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("WARNING: DATABASE_URL is not set. Database connections will fail when executed.");
}

export const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;
export const db = (pool ? drizzle(pool, { schema }) : null) as unknown as NodePgDatabase<typeof schema>;

export * from "./schema";


