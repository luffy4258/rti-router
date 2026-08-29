import Link from 'next/link';
import { listFilings } from '../../lib/filings';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const filings = await listFilings();
  return <main className="shell admin-page">
    <header className="compact-header"><p className="eyebrow">CITIZEN ROUTING TOOL</p><p className="disclaimer">Independent prototype, not a government service.</p></header>
    <section><p className="eyebrow">DEMO VIEW</p><h1>Recent filings</h1><p className="helper">Prototype view with no authentication and no personal data. Name and reply address are never stored.</p>
      {filings.length ? <div className="table-wrap"><table><thead><tr><th>Reference</th><th>Created</th><th>Authority</th><th>Engine</th><th>Match</th><th>Complaint</th></tr></thead><tbody>{filings.map((filing) => <tr key={filing.refId}><td><Link href={`/status/${encodeURIComponent(filing.refId)}`}>{filing.refId}</Link></td><td>{new Date(filing.createdAt).toLocaleDateString('en-IN')}</td><td>{filing.authorityName}</td><td>{filing.engine}</td><td>{Math.round((filing.confidence || 0) * 100)}%</td><td>{filing.complaint}</td></tr>)}</tbody></table></div> : <p className="offline">No logged filings yet. Configure a Postgres connection to begin recording mock filings.</p>}
    </section>
    <footer><strong>Prototype view:</strong> this page has no authentication and displays no applicant name or reply address.</footer>
  </main>;
}
