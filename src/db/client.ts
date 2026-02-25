import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set / client.ts");
}

const pg = postgres(databaseUrl, { prepare: false });
export const sql = pg;
export const db = drizzle(pg);
