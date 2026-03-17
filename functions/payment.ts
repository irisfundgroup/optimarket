import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const GENIUSPAY_KEY = Deno.env.get('GENIUSPAY_API_KEY');
const GENIUSPAY_BASE = 'https://api.geniuspay.ci/v1';

const PLANS = {
  single_action: { label: '1 Action', price: 500, currency: 'XOF', credits: 1 },
  pack_10:       { label: 'Pack 10 crédits', price: 3500, currency: 'XOF', credits: 10 },
  pass_24h:      { label: 'Pass 24h illimité', price: 2000, currency: 'XOF', credits: 999 },
  monthly:       { label: 'Abonnement mensuel', price: 9900, currency: 'XOF', credits: 9999 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── 1. Initiate payment via GeniusPay ─────────────────────────────────────
    if (action === 'create_payment') {
      const { plan } = body;
      const planData = PLANS[plan];
      if (!planData) return Response.json({ error: 'Plan invalide' }, { status: 400 });

      const origin = req.headers.get('origin') || 'https://optimarket.app';
      const callbackUrl = `${origin}/Subscription?payment_status=success&plan=${plan}`;
      const cancelUrl = `${origin}/Subscription?payment_status=cancelled`;

      const res = await fetch(`${GENIUSPAY_BASE}/payments/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GENIUSPAY_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: planData.price,
          currency: planData.currency,
          description: planData.label,
          customer_email: user.email,
          customer_name: user.full_name || user.email,
          callback_url: callbackUrl,
          cancel_url: cancelUrl,
          metadata: { user_email: user.email, plan },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return Response.json({ error: data.message || 'Erreur GeniusPay' }, { status: 400 });
      }

      // Log pending payment in DB
      await base44.entities.Payment.create({
        user_email: user.email,
        amount: planData.price,
        currency: planData.currency,
        type: plan === 'monthly' ? 'subscription' : 'single_action',
        status: 'pending',
        description: planData.label,
        related_id: data.id || data.payment_id || '',
      });

      return Response.json({ success: true, payment_url: data.payment_url || data.checkout_url, payment_id: data.id || data.payment_id });
    }

    // ── 2. Verify payment & activate subscription ─────────────────────────────
    if (action === 'verify_payment') {
      const { payment_id, plan } = body;

      const res = await fetch(`${GENIUSPAY_BASE}/payments/${payment_id}`, {
        headers: { 'Authorization': `Bearer ${GENIUSPAY_KEY}` },
      });
      const data = await res.json();

      const isPaid = data.status === 'completed' || data.status === 'success' || data.status === 'paid';

      if (isPaid) {
        const planData = PLANS[plan];
        const expiresAt = plan === 'pass_24h'
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : plan === 'monthly'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null;

        await base44.entities.Subscription.create({
          user_email: user.email,
          plan,
          credits_remaining: planData.credits,
          status: 'active',
          amount_paid: planData.price,
          currency: planData.currency,
          ...(expiresAt && { expires_at: expiresAt }),
        });

        // Update payment status
        const payments = await base44.entities.Payment.filter({ user_email: user.email, related_id: payment_id });
        if (payments[0]) {
          await base44.entities.Payment.update(payments[0].id, { status: 'completed' });
        }
      }

      return Response.json({ success: true, paid: isPaid, status: data.status });
    }

    // ── 3. Buy product / flash sale via GeniusPay ────────────────────────────
    if (action === 'buy_item') {
      const { item_type, item_id, item_title, amount, currency } = body;

      const origin = req.headers.get('origin') || 'https://optimarket.app';
      const callbackUrl = `${origin}/${item_type === 'flash_sale' ? 'FlashSaleDetail' : 'ProductDetail'}?id=${item_id}&payment_status=success`;
      const cancelUrl = `${origin}/${item_type === 'flash_sale' ? 'FlashSaleDetail' : 'ProductDetail'}?id=${item_id}&payment_status=cancelled`;

      const res = await fetch(`${GENIUSPAY_BASE}/payments/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GENIUSPAY_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: currency || 'XOF',
          description: item_title,
          customer_email: user.email,
          customer_name: user.full_name || user.email,
          callback_url: callbackUrl,
          cancel_url: cancelUrl,
          metadata: { user_email: user.email, item_type, item_id },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return Response.json({ error: data.message || 'Erreur GeniusPay' }, { status: 400 });
      }

      await base44.entities.Payment.create({
        user_email: user.email,
        amount,
        currency: currency || 'XOF',
        type: 'product_purchase',
        status: 'pending',
        description: item_title,
        related_id: item_id,
      });

      return Response.json({ success: true, payment_url: data.payment_url || data.checkout_url });
    }

    // ── 4. Register referral on signup ────────────────────────────────────────
    if (action === 'register_referral') {
      const { ref_code } = body;
      if (!ref_code) return Response.json({ error: 'Code manquant' }, { status: 400 });

      // Find the referrer by code (code = first 6 chars of email prefix + hash)
      const allUsers = await base44.asServiceRole.entities.User.list();
      const referrer = allUsers.find(u => {
        const base = u.email?.split('@')[0]?.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6) || 'USER';
        const suffix = Math.abs(u.email?.split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 0) % 9000 + 1000;
        return `${base}${suffix}` === ref_code;
      });

      if (!referrer || referrer.email === user.email) {
        return Response.json({ error: 'Code invalide' }, { status: 400 });
      }

      // Avoid duplicate
      const existing = await base44.asServiceRole.entities.Referral.filter({ referrer_email: referrer.email, referred_email: user.email });
      if (existing.length > 0) return Response.json({ success: true, already: true });

      // Create referral record
      await base44.asServiceRole.entities.Referral.create({
        referrer_email: referrer.email,
        referrer_name: referrer.full_name,
        referred_email: user.email,
        referred_name: user.full_name,
        referral_code: ref_code,
        status: 'registered',
        reward_credits: 3,
        type: 'referral',
      });

      // Grant 3 credits to referrer
      const refSubs = await base44.asServiceRole.entities.Subscription.filter({ user_email: referrer.email, status: 'active' }, '-created_date', 1);
      if (refSubs[0]) {
        await base44.asServiceRole.entities.Subscription.update(refSubs[0].id, {
          credits_remaining: (refSubs[0].credits_remaining || 0) + 3,
        });
      } else {
        await base44.asServiceRole.entities.Subscription.create({
          user_email: referrer.email,
          plan: 'free',
          credits_remaining: 3,
          status: 'active',
        });
      }

      // Grant 1 credit to new user (filleul)
      const newUserSubs = await base44.entities.Subscription.filter({ user_email: user.email, status: 'active' }, '-created_date', 1);
      if (newUserSubs[0]) {
        await base44.entities.Subscription.update(newUserSubs[0].id, {
          credits_remaining: (newUserSubs[0].credits_remaining || 0) + 1,
        });
      } else {
        await base44.entities.Subscription.create({
          user_email: user.email,
          plan: 'free',
          credits_remaining: 1,
          status: 'active',
        });
      }

      return Response.json({ success: true, referrer_name: referrer.full_name });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});