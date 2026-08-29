export async function POST(request) {
  if (!process.env.SHEET_WEBHOOK_URL) return new Response(null, { status: 204 });

  try {
    const body = await request.json();
    const filing = {
      refId: body.refId,
      authorityId: body.authorityId,
      authorityName: body.authorityName,
      confidence: body.confidence,
      jurisdiction: body.jurisdiction,
      engine: body.engine,
      complaint: body.complaint,
      draft: body.draft
    };

    await fetch(process.env.SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filing)
    });
  } catch {
    // Logging must never affect a citizen's simulated filing.
  }

  return new Response(null, { status: 204 });
}
