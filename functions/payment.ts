import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const GENIUSPAY_KEY = Deno.env.get('GENIUSPAY_API_KEY');
const GENIUSPAY_BASE = 'https://api.geniuspay.ci/v1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, amount, currency, description, plan, callback_url } = await req.json();

    if (action === 'create_payment') {
      // Create a payment intent with GeniusPay CI
      const res = await fetch(`${GENIUSPAY_BASE}/payments/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GENIUSPAY_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          currency: currency || 'XOF',
          description,
          customer_email: user.email,
          customer_name: user.full_name,
          callback_url: callback_url || `${req.headers.get('origin')}/Subscription`,
          metadata: { user_email: user.email, plan }
        })
      });
      const data = await res.json();
      return Response.json({ success: true, payment: data });
    }

    if (action === 'verify_payment') {
      const { payment_id } = await req.json();
      const res = await fetch(`${GENIUSPAY_BASE}/payments/${payment_id}`, {
        headers: { 'Authorization': `Bearer ${GENIUSPAY_KEY}` }
      });
      const data = await res.json();
      return Response.json({ success: true, payment: data });
    }

    if (action === 'get_plans') {
      // Return available subscription plans with pricing
      const plans = [
        { id: 'single_action', label: '1 Action', price: 500, currency: 'XOF', credits: 1, description: 'Débloquer 1 contenu premium' },
        { id: 'pack_10', label: 'Pack 10 crédits', price: 3500, currency: 'XOF', credits: 10, description: 'Économisez 30%', badge: 'Populaire' },
        { id: 'pass_24h', label: 'Pass 24h illimité', price: 2000, currency: 'XOF', credits: 999, description: 'Accès illimité pendant 24h' },
        { id: 'monthly', label: 'Abonnement mensuel', price: 9900, currency: 'XOF', credits: 999, description: 'Accès illimité 30 jours', badge: 'Meilleur prix' }
      ];
      return Response.json({ success: true, plans });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});