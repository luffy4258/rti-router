'use client';

import { useState } from 'react';
import ministries from '../data/ministries.json';

const examples = ['My PF withdrawal has been pending for months.', 'My passport application has not moved since verification.', 'I did not receive my PM-KISAN payment.', 'My train was cancelled but I have not received a refund.'];
const screens = ['Describe', 'Department', 'Draft', 'Your details', 'Fee', 'Receipt'];

function authority(id) { return ministries.find((item) => item.id === id); }
function meterLabel(value) { return value >= .75 ? 'Strong match' : value >= .55 ? 'Likely match — read the reason' : 'Uncertain — consider adding detail'; }
function tag() { return <span className="mock">MOCK</span>; }

export default function RouterApp() {
  const [screen, setScreen] = useState(0);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [draft, setDraft] = useState(null);
  const [paid, setPaid] = useState(false);

  async function analyse() {
    setLoading(true);
    try {
      const response = await fetch('/api/match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data); setDraft(data); setScreen(1);
    } catch (error) { alert(error.message || 'Could not read that problem. Please try again.'); }
    finally { setLoading(false); }
  }
  function next() { setScreen((current) => Math.min(5, current + 1)); }
  const current = result?.authorities?.[0] && authority(result.authorities[0].id);
  const today = new Date();
  const date = (days) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + days).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const registration = `MOCK/${String(today.getFullYear()).slice(2)}${String(today.getMonth()+1).padStart(2,'0')}-${(text.length * 137 + 20491).toString(36).toUpperCase()}`;

  return <main className="shell">
    <header><p className="eyebrow">CITIZEN ROUTING TOOL</p><h1>Find the right public authority.</h1><p className="disclaimer">Independent prototype, not a government service.</p></header>
    <nav aria-label="Progress">{screens.map((item, index) => <span key={item} className={index === screen ? 'active' : index < screen ? 'done' : ''}><b>{index + 1}</b><i>{item}</i></span>)}</nav>

    {screen === 0 && <section><h2>What went wrong?</h2><p className="helper">Plain language is fine. You don’t need to know any department or scheme name.</p><textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="For example: My PF claim has been pending since March..." autoFocus />
      <p className="examples-label">Try an example</p><div className="examples">{examples.map((example) => <button className="example" key={example} onClick={() => setText(example)}>{example}</button>)}</div>
      <button className="primary" disabled={loading || text.trim().length < 5} onClick={analyse}>{loading ? 'Reading your problem…' : 'Find the authority'}</button></section>}

    {screen === 1 && result && <section><h2>Where to send it</h2>{result.offline && <p className="offline">Offline matcher in use — no AI key is configured{result.fallback_reason ? ', or the AI service was unavailable' : ''}.</p>}
      {result.jurisdiction === 'state' ? <><div className="state"><strong>This belongs with your state or local government.</strong><p>{result.note}</p><p>This is the most common reason ordinary filings get rejected by the central portal.</p></div><button className="primary" onClick={() => setScreen(0)}>Describe another problem</button></> : <>
      {result.authorities.map((match, index) => { const item = authority(match.id); return <article className="authority" key={match.id}><p className="rank">MATCH {index + 1}</p><code>{item.id}</code><h3>{item.name}</h3><p>{match.why}</p><div className="meter" aria-label={`${Math.round(match.confidence * 100)}% confidence`}>{[0,1,2,3,4].map((part) => <span className={match.confidence * 5 > part ? 'filled' : ''} key={part} />)}</div><small>{meterLabel(match.confidence)}</small></article>})}
      <p className="legal-note">If it is wrongly addressed, Section 6(3) requires a transfer within five days and the citizen must be informed. Choosing wrong costs nothing.</p>
      {result.clarifying_question && <div className="question"><strong>{result.clarifying_question}</strong><button className="secondary" onClick={() => setScreen(0)}>Add detail</button></div>}
      <button className="primary" onClick={next}>Use this authority</button></>}</section>}

    {screen === 2 && draft && <section><h2>Your draft application</h2><p className="helper">These questions ask for records, rather than opinions, because opinion questions can be refused.</p><div className="paper"><p>To<br />The Central Public Information Officer<br />{current?.name || 'Relevant public authority'}</p><label>Subject<input value={draft.subject || ''} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} /></label><p>Under Section 6(1) of the Right to Information Act, 2005, I request the following information:</p><ol>{(draft.requests || []).map((request, index) => <li key={index}><textarea value={request} onChange={(e) => { const requests = [...draft.requests]; requests[index] = e.target.value; setDraft({ ...draft, requests }); }} /></li>)}</ol><p>Background: {text}</p><p>I am enclosing the statutory RTI application fee of ₹10. If this information belongs to another public authority, please transfer this application under Section 6(3) of the Act and inform me.</p><p>Yours faithfully,<br />{name || '[Your name]'}</p></div><button className="primary" onClick={next}>Add your details</button></section>}

    {screen === 3 && <section><h2>Your details {tag()}</h2><p className="helper">Stores nothing, sends nothing. Never enter a real Aadhaar, PAN or phone number.</p><label>Your name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name for this mock application" /></label><label>Reply address<textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address for this mock application" /></label><button className="primary" onClick={next}>Continue to fee</button></section>}

    {screen === 4 && <section><h2>Fee and filing {tag()}</h2><div className="fee"><p><span>Authority</span><strong>{current?.name || 'Public authority'}</strong></p><p><span>Statutory fee</span><strong>₹10</strong></p><p><span>BPL applicants</span><strong>No fee</strong></p><p><span>Reply due</span><strong>Within 30 days</strong></p></div><p className="helper">No money moves. The ₹10 fee is fixed by the RTI Rules.</p><button className="primary" onClick={() => { setPaid(true); next(); }}>Pay ₹10 and file {tag()}</button></section>}

    {screen === 5 && <section><h2>Receipt and status {tag()}</h2><div className="receipt"><p>Registration number</p><code>{registration}</code><p className="offline">This is a simulated filing. Nothing has been sent.</p></div><div className="timeline"><p><b>{date(0)}</b><span>Received {tag()}</span></p><p><b>{date(5)}</b><span>Transfer deadline · §6(3)</span></p><p><b>{date(30)}</b><span>Reply due · §7(1)</span></p><p><b>{date(31)}</b><span>First appeal opens free of cost · §19(1)</span></p><p><b>{date(60)}</b><span>Second appeal to the Information Commission · §19(3)</span></p></div><button className="secondary" onClick={() => { setScreen(0); setText(''); setResult(null); }}>Start another request</button></section>}
    <footer><strong>What is real:</strong> RTI rights, routing information, fee and deadlines. <strong>What is simulated:</strong> matching, drafting, payment, filing and receipt.</footer>
  </main>;
}
