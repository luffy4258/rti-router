import { db, ensureTable } from "../../lib/db";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const sql = db();
  let rows = [];
  if (sql) {
    try {
      await ensureTable(sql);
      rows = await sql`SELECT * FROM filings ORDER BY created_at DESC LIMIT 50`;
    } catch {}
  }
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24 }}>Recent filings</h1>
      <p style={{ color: "#555", fontSize: 15, lineHeight: 1.5 }}>
        Prototype inspection view. No authentication, by design, because it holds no personal
        data: applicant names and reply addresses are never stored. Every filing here is
        simulated — nothing was sent to any government body.
      </p>
      {rows.length === 0 && <p>No filings recorded yet.</p>}
      {rows.map((r) => (
        <div key={r.ref_id} style={{ borderTop: "1px solid #ddd", padding: "14px 0" }}>
          <div style={{ fontFamily: "monospace", fontSize: 14 }}>
            <a href={`/status?ref=${encodeURIComponent(r.ref_id)}`}>{r.ref_id}</a>
          </div>
          <div style={{ fontWeight: 600 }}>{r.authority_name}</div>
          <div style={{ fontSize: 14, color: "#555" }}>
            {r.jurisdiction} · {r.engine} · confidence {r.confidence} ·{" "}
            {new Date(r.created_at).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 14, marginTop: 6 }}>{r.complaint}</div>
        </div>
      ))}
    </main>
  );
}
