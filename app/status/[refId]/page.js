import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFiling } from '../../../lib/filings';

export const dynamic = 'force-dynamic';

function dateFrom(createdAt, days) {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function FilingStatus({ params }) {
  const filing = await getFiling(params.refId);
  if (!filing) notFound();

  return <main className="shell status-page">
    <header className="compact-header"><p className="eyebrow">CITIZEN ROUTING TOOL</p><p className="disclaimer">Independent prototype, not a government service.</p></header>
    <section>
      <p className="eyebrow">MOCK RECEIPT</p>
      <h1>Receipt and status</h1>
      <div className="receipt"><p>Registration number</p><code>{filing.refId}</code><p className="offline">This is a simulated filing. Nothing has been sent to a public authority.</p></div>
      <p className="status-authority">Routed to <strong>{filing.authorityName}</strong></p>
      <div className="timeline"><p><b>{dateFrom(filing.createdAt, 0)}</b><span>Received <span className="mock">MOCK</span></span></p><p><b>{dateFrom(filing.createdAt, 5)}</b><span>Transfer deadline · §6(3)</span></p><p><b>{dateFrom(filing.createdAt, 30)}</b><span>Reply due · §7(1)</span></p><p><b>{dateFrom(filing.createdAt, 31)}</b><span>First appeal opens free of cost · §19(1)</span></p><p><b>{dateFrom(filing.createdAt, 60)}</b><span>Second appeal to the Information Commission · §19(3)</span></p></div>
      <Link className="secondary link-button" href="/">Start another request</Link>
    </section>
    <footer><strong>What is real:</strong> RTI rights, routing information, fee and deadlines. <strong>What is simulated:</strong> matching, drafting, payment, filing and receipt. <strong>What may be recorded:</strong> the mock reference, routing choice, complaint and draft. <strong>What is not recorded or sent:</strong> your name and reply address; they stay in this browser.</footer>
  </main>;
}
