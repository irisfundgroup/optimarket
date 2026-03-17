import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, target_users, alert_type, title, message, related_id, related_type, category, location_city } = await req.json();

    if (action === 'send_alert') {
      // Send alert to specific users or all users matching criteria
      const alerts = [];
      const emails = target_users || [user.email];

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
      // Notify all users about a new flash sale
      const { flash_sale } = await req.json();
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
      // Send email notification via Base44 Core
      const { to, subject, body } = await req.json();
      await base44.integrations.Core.SendEmail({ to, subject, body });
      return Response.json({ success: true });
    }

    if (action === 'mark_all_read') {
      const alerts = await base44.entities.Alert.filter({ user_email: user.email, is_read: false });
      for (const alert of alerts) {
        await base44.entities.Alert.update(alert.id, { is_read: true });
      }
      return Response.json({ success: true, updated: alerts.length });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});