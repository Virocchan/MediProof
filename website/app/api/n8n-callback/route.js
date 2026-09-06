// Next.js App Router route handler for n8n callback
// Location: app/api/n8n-callback/route.js

export async function POST(request) {
  try {
    const body = await request.json();
    const claimId = body.claim_id || body.claimId || body.id || null;
    const aiResponse = body.response !== undefined ? body.response : (body.text || body);

    console.log('\n========================================');
    console.log('⚡ [MediProof Next.js] Received AI Output from n8n:');
    if (claimId) console.log(`📌 Claim ID: ${claimId}`);
    console.log(typeof aiResponse === 'object' ? JSON.stringify(aiResponse, null, 2) : aiResponse);
    console.log('========================================\n');

    return Response.json({
      status: 'Success',
      message: 'Received AI Output from n8n',
      claim_id: claimId,
      receivedId: claimId || `N8N-${Math.floor(1000 + Math.random() * 9000)}`
    }, { status: 200 });
  } catch (err) {
    return Response.json({ status: 'Error', message: err.message }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
