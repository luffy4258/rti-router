export async function POST() {
  // Persistence is deliberately not implemented in this prototype.
  // No filing data, and no applicant details, are stored or transmitted anywhere.
  return new Response(null, { status: 204 });
}
