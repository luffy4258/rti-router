import { saveFiling } from '../../../lib/filings';

export async function POST(request) {
  try {
    const body = await request.json();
    await saveFiling({
      refId: body.refId,
      authorityId: body.authorityId,
      authorityName: body.authorityName,
      confidence: body.confidence,
      jurisdiction: body.jurisdiction,
      engine: body.engine,
      complaint: body.complaint,
      draft: body.draft
    });
  } catch {
    // Storage must never affect a citizen's simulated filing.
  }

  return new Response(null, { status: 204 });
}
