import { db, ensureTable } from "../../lib/db";

export const dynamic = "force-dynamic";

function plus(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function Status({ searchParams }) {
  const ref = searchParams?.ref || "";
  const sql = db();
  let row = null;
  if (sql && ref) {
    try {
      await ensureTable(sql);
      const r = await sql`SELECT * FROM filings WHERE ref_id = ${ref} LIMIT 1`;
      row = r[0] || null;
    } catch {}
  }

  if (!row) {
    return (
      <main style={{ maxWidth: 620, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: 22 }}>No filing found</h1>
        <p>Check the reference number, or <a href="/">start a new request</a>.</p>
      </main>
    );
  }

  const t = row.created_at;
  const steps = [
    ["Application received", plus(t, 0), "Filed"],
    ["Transfer deadline if wrongly addressed", plus(t, 5), "Section 6(3)"],
    ["Reply due from the Public Information Officer", plus(t, 30), "Section 7(1)"],
    ["First appeal opens, free of cost", plus(t, 31), "Section 19(1)"],
    ["Second appeal to the Information Commission", plus(t, 60), "Section 19(3)"],
  ];

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <p style={{ fontSize: 12, letterSpacing: ".1em", color: "#8a4a12" }}>MOCK FILING</p>
      <h1 style={{ fontSize: 22 }}>{row.authority_name}</h1>
      <p style={{ fontFamily: "monospace", fontSize: 18 }}>{row.ref_id}</p>
      <p style={{ fontSize: 15, color: "#555" }}>Filed {plus(t, 0)}</p>
      <h2 style={{ fontSize: 17, marginTop: 24 }}>What happens now</h2>
      <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
        {steps.map(([label, date, section]) => (
          <li key={label} style={{ marginBottom: 10 }}>
            {label}
            <br />
            <small style={{ color: "#555" }}>{date} · {section}</small>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 24, fontSize: 14, color: "#555" }}>
        Simulated. Nothing was sent to any government body. Your name and address were never stored.
      </p>
      <p><a href="/">File another request</a></p>
    </main>
  );
}
