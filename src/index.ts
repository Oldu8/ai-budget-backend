import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(databaseUrl, { prepare: false });
const db = drizzle(client);

const allUsers = await db.select().from(users);
void allUsers;
