import { db, ensureTable } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const sql = db();
  if (!sql) return new Response(null, { status: 204 });
  try {
    const b = await request.json();
    await ensureTable(sql);
    const draftText =
      typeof b.draft === "string" ? b.draft : JSON.stringify(b.draft ?? "");
    await sql`
      INSERT INTO filings (ref_id, authority_id, authority_name, confidence, jurisdiction, engine, complaint, draft)
      VALUES (${b.refId}, ${b.authorityId}, ${b.authorityName}, ${String(b.confidence ?? "")},
              ${b.jurisdiction}, ${b.engine}, ${b.complaint}, ${draftText})
      ON CONFLICT (ref_id) DO NOTHING`;
  } catch {
    // Logging must never affect a citizen's simulated filing.
  }
  return new Response(null, { status: 204 });
}
