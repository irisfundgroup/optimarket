import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { period_days = 30 } = await req.json();
    const since = new Date(Date.now() - period_days * 24 * 3600 * 1000).toISOString();

    // Fetch all data in parallel
    const [products, services, opportunities, flashSales, payments, subscriptions, alerts] = await Promise.all([
      base44.asServiceRole.entities.Product.list('-created_date', 200),
      base44.asServiceRole.entities.Service.list('-created_date', 200),
      base44.asServiceRole.entities.Opportunity.list('-created_date', 100),
      base44.asServiceRole.entities.FlashSale.list('-created_date', 100),
      base44.asServiceRole.entities.Payment.list('-created_date', 200),
      base44.asServiceRole.entities.Subscription.list('-created_date', 200),
      base44.asServiceRole.entities.Alert.list('-created_date', 500)
    ]);

    // Revenue by plan
    const revenueByPlan = {};
    payments.filter(p => p.status === 'completed').forEach(p => {
      revenueByPlan[p.type] = (revenueByPlan[p.type] || 0) + p.amount;
    });

    // Products by category
    const productsByCategory = {};
    products.forEach(p => {
      productsByCategory[p.category] = (productsByCategory[p.category] || 0) + 1;
    });

    // Daily revenue (last 7 days)
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(Date.now() - i * 24 * 3600 * 1000);
      const label = day.toLocaleDateString('fr-FR', { weekday: 'short' });
      const dayStr = day.toISOString().split('T')[0];
      const revenue = payments
        .filter(p => p.status === 'completed' && p.created_date?.startsWith(dayStr))
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      dailyRevenue.push({ day: label, revenue });
    }

    // Alert engagement rate
    const totalAlerts = alerts.length;
    const readAlerts = alerts.filter(a => a.is_read).length;

    return Response.json({
      success: true,
      summary: {
        total_products: products.length,
        active_products: products.filter(p => p.status === 'active').length,
        total_services: services.length,
        active_opportunities: opportunities.filter(o => o.status === 'active').length,
        active_flash_sales: flashSales.filter(f => f.status === 'active').length,
        total_revenue: payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0),
        active_subscriptions: subscriptions.filter(s => s.status === 'active').length,
        alert_engagement_rate: totalAlerts > 0 ? Math.round((readAlerts / totalAlerts) * 100) : 0
      },
      revenue_by_plan: revenueByPlan,
      products_by_category: productsByCategory,
      daily_revenue: dailyRevenue
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});