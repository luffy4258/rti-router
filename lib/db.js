import { neon } from "@neondatabase/serverless";

export function db() {
  if (!process.env.DATABASE_URL) return null;
  return neon(process.env.DATABASE_URL);
}

export async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS filings (
      id SERIAL PRIMARY KEY,
      ref_id TEXT UNIQUE NOT NULL,
      authority_id TEXT,
      authority_name TEXT,
      confidence TEXT,
      jurisdiction TEXT,
      engine TEXT,
      complaint TEXT,
      draft TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;
}
