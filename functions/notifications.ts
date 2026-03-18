import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    if (action === 'send_alert') {
      const { target_users, alert_type, title, message, related_id, related_type, category, location_city } = body;
      const emails = target_users || [user.email];
      const alerts = [];
      for (const email of emails) {
        const alert = await base44.asServiceRole.entities.Alert.create({
          user_email: email,
          type: alert_type || 'new_product',
          title,
          message,
          related_id,
          related_type,
          category,
          location_city,
          is_read: false,
          is_vip: alert_type === 'vip'
        });
        alerts.push(alert);
      }
      return Response.json({ success: true, sent: alerts.length });
    }

    if (action === 'broadcast_flash_sale') {
      const { flash_sale } = body;
      const allUsers = await base44.asServiceRole.entities.User.list();
      for (const u of allUsers) {
        await base44.asServiceRole.entities.Alert.create({
          user_email: u.email,
          type: 'flash_sale',
          title: `🔥 Vente Flash: ${flash_sale.title}`,
          message: `${flash_sale.discount_percent}% de réduction — Il ne reste que ${flash_sale.quantity_total - flash_sale.quantity_sold} unités !`,
          related_id: flash_sale.id,
          related_type: 'flash_sale',
          is_read: false
        });
      }
      return Response.json({ success: true, sent: allUsers.length });
    }

    if (action === 'send_email_alert') {
      const { to, subject, emailBody } = body;
      await base44.integrations.Core.SendEmail({ to, subject, body: emailBody });
      return Response.json({ success: true });
    }

    if (action === 'mark_all_read') {
      const alerts = await base44.entities.Alert.filter({ user_email: user.email, is_read: false });
      for (const alert of alerts) {
        await base44.entities.Alert.update(alert.id, { is_read: true });
      }
      return Response.json({ success: true, updated: alerts.length });
    }

    // ─── Activator: Commission received notification ───
    if (action === 'notify_commission') {
      const { activator_email, opportunity_title, commission_amount, investment_id } = body;
      if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      await base44.asServiceRole.entities.Alert.create({
        user_email: activator_email,
        type: 'opportunity',
        title: `💰 Commission reçue — ${opportunity_title}`,
        message: `Votre participation à la campagne "${opportunity_title}" a généré une commission de ${commission_amount?.toLocaleString()} XOF. Le montant a été crédité sur votre wallet.`,
        related_id: investment_id,
        related_type: 'opportunity',
        is_read: false,
        is_vip: false,
      });

      return Response.json({ success: true });
    }

    // ─── Activator: New high-score campaign notification ───
    if (action === 'notify_new_campaign') {
      const { opportunity_id, opportunity_title, score, potential_margin } = body;
      if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      // Get all activator users
      const allUsers = await base44.asServiceRole.entities.User.list();
      const activators = allUsers.filter(u => u.role === 'activator');

      for (const activator of activators) {
        await base44.asServiceRole.entities.Alert.create({
          user_email: activator.email,
          type: 'opportunity',
          title: `🚀 Nouvelle campagne · Score ${score}/100 — ${opportunity_title}`,
          message: `Une nouvelle campagne commerciale à fort potentiel vient d'être publiée. Commission estimée: +${potential_margin}%. Rejoignez-la avant qu'elle soit complète !`,
          related_id: opportunity_id,
          related_type: 'opportunity',
          is_read: false,
          is_vip: score >= 85,
        });
      }

      return Response.json({ success: true, sent: activators.length });
    }

    // ─── Activator: Batch notify all activators about multiple new campaigns ───
    if (action === 'notify_all_activators_new_campaigns') {
      const { campaigns } = body; // array of { id, title, score, potential_margin }
      if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      const allUsers = await base44.asServiceRole.entities.User.list();
      const activators = allUsers.filter(u => u.role === 'activator');
      let total = 0;

      for (const campaign of (campaigns || [])) {
        if (campaign.score < 70) continue; // Only high-score campaigns
        for (const activator of activators) {
          await base44.asServiceRole.entities.Alert.create({
            user_email: activator.email,
            type: 'opportunity',
            title: `🚀 Campagne ${campaign.score >= 85 ? 'VIP ' : ''}· Score ${campaign.score}/100 — ${campaign.title}`,
            message: `Commission estimée: +${campaign.potential_margin || 0}%. Rejoignez cette campagne à fort potentiel !`,
            related_id: campaign.id,
            related_type: 'opportunity',
            is_read: false,
            is_vip: campaign.score >= 85,
          });
          total++;
        }
      }

      return Response.json({ success: true, sent: total });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});