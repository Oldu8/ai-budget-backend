import "dotenv/config";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set / client.ts");
}

// Disable prepared statements for Supabase pooler compatibility.
export const sql = postgres(databaseUrl, { prepare: false });
