import ministries from '../../../data/ministries.json';

const stateTerms = ['municipal', 'municipality', 'garbage', 'street light', 'streetlight', 'land record', 'mutation', 'birth certificate', 'death certificate', 'caste certificate', 'income certificate', 'fir', 'local police', 'state school', 'state electricity', 'electricity board', 'rto', 'property tax', 'international driving permit', 'international driving licence', 'international driving license', 'driving licence', 'driving license', 'learner licence', 'learner license', 'transport office', 'idp'];

function draftFor(text, authority) {
  const topic = text.replace(/\s+/g, ' ').trim();
  return {
    subject: `Information regarding ${authority ? authority.name : 'my request'}`.slice(0, 90),
    requests: [
      `Provide certified copies of records, orders and correspondence concerning: ${topic}.`,
      'Provide the dates on which the matter was received, examined and acted upon, with copies of file notings.',
      'Provide the names and designations of officials who handled the matter and the action taken by each.',
      'Provide the prescribed timeline for this service and copies of any delay-related records.'
    ]
  };
}

function offlineMatch(text) {
  const query = text.toLowerCase();
  if (stateTerms.some((term) => query.includes(term))) {
    return { jurisdiction: 'state', note: 'This sounds like a state or local-government matter. The central RTI portal cannot accept it.', authorities: [], confidence: 0, offline: true, ...draftFor(text) };
  }
  const scored = ministries.map((ministry) => ({ ...ministry, score: ministry.keywords.filter((word) => query.includes(word.toLowerCase())).length }))
    .filter((ministry) => ministry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const authorities = (scored.length ? scored : ministries.slice(0, 1)).map((ministry, index) => ({
    id: ministry.id,
    why: scored.length ? `${ministry.name} covers ${ministry.covers.toLowerCase()}` : 'Your description needs more detail to identify a central authority.',
    confidence: scored.length ? Math.max(0.45, Math.min(0.9, 0.48 + ministry.score * 0.18 - index * 0.08)) : 0.35
  }));
  return { jurisdiction: 'central', authorities, confidence: authorities[0].confidence, clarifying_question: scored.length ? null : 'What service, scheme, document, or central organisation is involved?', offline: true, ...draftFor(text, scored[0]) };
}

function safeResult(result, text) {
  if (result.jurisdiction === 'state') return { ...offlineMatch(text), jurisdiction: 'state', note: result.note || 'This appears to be a state or local-government matter.', authorities: [], offline: false };
  const authorities = (result.authorities || []).filter((item) => ministries.some((ministry) => ministry.id === item.id)).slice(0, 3).map((item) => ({
    id: item.id,
    why: String(item.why || 'This authority appears to handle the matter.').slice(0, 260),
    confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0.4))
  }));
  if (!authorities.length) return offlineMatch(text);
  return { jurisdiction: 'central', authorities, confidence: authorities[0].confidence, clarifying_question: result.clarifying_question || null, offline: false, subject: String(result.subject || draftFor(text, ministries.find((m) => m.id === authorities[0].id)).subject), requests: Array.isArray(result.requests) && result.requests.length ? result.requests.slice(0, 5).map(String) : draftFor(text, ministries.find((m) => m.id === authorities[0].id)).requests };
}

export async function POST(request) {
  const { text } = await request.json();
  if (!text || typeof text !== 'string' || text.trim().length < 5) return Response.json({ error: 'Please describe the problem in a little more detail.' }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return Response.json(offlineMatch(text));
  const system = `You route Indian central RTI applications. Return JSON only with jurisdiction, note, authorities, clarifying_question, subject and requests. Decide jurisdiction first: municipal roads, garbage, street lights, land records/mutations, birth/death/caste/income certificates, local police FIRs, state schools, state electricity boards, driving licences and international driving permits (issued by state RTOs), vehicle registration and property tax are STATE subjects; return jurisdiction state and a short note. For central matters choose 1–3 catalogue IDs only, ranked. Every authority needs id, why (one plain sentence naming the specific trigger), confidence 0–1. Vague descriptions: top confidence below .55 and ask one clarifying question. Draft a subject under 15 words and 3–5 numbered-style requests for records, dates, file notings, officials or timelines, never why, opinions or hypotheticals. Catalogue: ${JSON.stringify(ministries)}`;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: system }, { role: 'user', content: text }]
      })
    });
    if (!response.ok) throw new Error('OpenAI request failed');
    const data = await response.json();
    return Response.json(safeResult(JSON.parse(data.choices[0].message.content), text));
  } catch {
    return Response.json({ ...offlineMatch(text), fallback_reason: 'The AI service was unavailable, so the offline matcher was used.' });
  }
}
