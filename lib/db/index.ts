import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Use a direct Postgres connection so this works with Supabase or Vercel Postgres.
// Set POSTGRES_URL in your env (for Supabase, use the connection string).
// For Supabase, SSL is typically required; the URL often includes sslmode=require,
// but we also set ssl: "require" to be safe.
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "No Postgres connection string found. Set POSTGRES_URL or DATABASE_URL in your environment."
  );
}

const client = postgres(connectionString, {
  // Allow opting out via POSTGRES_DISABLE_SSL=true for local non-SSL servers
  ssl: process.env.POSTGRES_DISABLE_SSL === "true" ? false : "require",
});

export const db = drizzle(client);
