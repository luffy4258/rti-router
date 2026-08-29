import { neon } from '@neondatabase/serverless';

function database() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  return connectionString ? neon(connectionString) : null;
}

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS rti_filings (
      ref_id TEXT PRIMARY KEY,
      authority_id TEXT,
      authority_name TEXT,
      confidence DOUBLE PRECISION,
      jurisdiction TEXT,
      engine TEXT,
      complaint TEXT,
      draft JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function normalise(row) {
  if (!row) return null;
  return {
    refId: row.ref_id,
    authorityId: row.authority_id,
    authorityName: row.authority_name,
    confidence: row.confidence,
    jurisdiction: row.jurisdiction,
    engine: row.engine,
    complaint: row.complaint,
    draft: typeof row.draft === 'string' ? JSON.parse(row.draft) : row.draft,
    createdAt: row.created_at
  };
}

export async function saveFiling(filing) {
  const sql = database();
  if (!sql) return false;
  await ensureTable(sql);
  await sql`
    INSERT INTO rti_filings
      (ref_id, authority_id, authority_name, confidence, jurisdiction, engine, complaint, draft)
    VALUES
      (${filing.refId}, ${filing.authorityId}, ${filing.authorityName}, ${filing.confidence}, ${filing.jurisdiction}, ${filing.engine}, ${filing.complaint}, ${JSON.stringify(filing.draft || {})}::jsonb)
    ON CONFLICT (ref_id) DO NOTHING
  `;
  return true;
}

export async function getFiling(refId) {
  const sql = database();
  if (!sql) return null;
  await ensureTable(sql);
  const rows = await sql`SELECT * FROM rti_filings WHERE ref_id = ${refId} LIMIT 1`;
  return normalise(rows[0]);
}

export async function listFilings() {
  const sql = database();
  if (!sql) return [];
  await ensureTable(sql);
  const rows = await sql`SELECT * FROM rti_filings ORDER BY created_at DESC LIMIT 100`;
  return rows.map(normalise);
}
