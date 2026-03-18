import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// KYC verification using document analysis via OpenAI Vision
// For production, replace with Sumsub or Onfido API
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, document_url, document_type } = await req.json();

    if (action === 'verify_document') {
      // Analyze document with AI vision
      const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: `Analyse ce document d'identité (${document_type}). Est-il valide et lisible? Réponds en JSON: {is_valid: bool, confidence: number (0-100), issues: string[]}` },
              { type: 'image_url', image_url: { url: document_url } }
            ]
          }],
          response_format: { type: 'json_object' }
        })
      });

      const data = await res.json();
      const result = JSON.parse(data.choices[0].message.content);

      // Log KYC attempt
      await base44.asServiceRole.entities.AdminLog.create({
        admin_email: 'system',
        action: 'kyc_verification',
        target_type: 'user',
        target_id: user.email,
        details: JSON.stringify({ document_type, is_valid: result.is_valid, confidence: result.confidence })
      });

      return Response.json({ success: true, verification: result });
    }

    if (action === 'get_verification_status') {
      const logs = await base44.asServiceRole.entities.AdminLog.filter({
        action: 'kyc_verification',
        target_id: user.email
      }, '-created_date', 1);

      if (logs.length === 0) return Response.json({ success: true, status: 'not_verified' });
      const last = JSON.parse(logs[0].details || '{}');
      return Response.json({ success: true, status: last.is_valid ? 'verified' : 'rejected', confidence: last.confidence });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});