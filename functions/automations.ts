import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import OpenAI from 'npm:openai';

Deno.serve(async (req) => {
  const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
  try {
    const base44 = createClientFromRequest(req);

    // This function is called by automations (entity triggers or scheduled)
    // It may run without a user session (service role)
    const body = await req.json();
    const { event, data, action } = body;

    // --- Automation: new product created → detect opportunity + send alert ---
    if (event?.type === 'create' && event?.entity_name === 'Product') {
      const product = data;

      // Use AI to analyze if this product is an opportunity
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Analyse ce produit et dis si c'est une opportunité commerciale intéressante (score > 65). Produit: "${product.title}", prix: ${product.price} ${product.currency}, catégorie: ${product.category}, ville: ${product.location_city}. Réponds en JSON avec: {is_opportunity: bool, score: number, type: string, potential_margin: number}`
        }],
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(completion.choices[0].message.content);

      if (analysis.is_opportunity && analysis.score > 65) {
        await base44.asServiceRole.entities.Opportunity.create({
          title: `Opportunité: ${product.title}`,
          description: `Nouveau produit détecté avec fort potentiel. Prix: ${product.price} ${product.currency}.`,
          type: analysis.type || 'product_deal',
          score: analysis.score,
          potential_margin: analysis.potential_margin,
          category: product.category,
          location_city: product.location_city,
          location_country: product.location_country,
          related_product_id: product.id,
          status: 'active',
          expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
        });
      }

      // Send alert to users interested in this category
      const allUsers = await base44.asServiceRole.entities.User.list();
      for (const u of allUsers.slice(0, 50)) { // limit to 50
        await base44.asServiceRole.entities.Alert.create({
          user_email: u.email,
          type: 'new_product',
          title: `Nouveau produit: ${product.title}`,
          message: `${product.price} ${product.currency} à ${product.location_city || 'en ligne'}`,
          related_id: product.id,
          related_type: 'product',
          category: product.category,
          is_read: false
        });
      }

      return Response.json({ success: true, opportunity_created: analysis.is_opportunity && analysis.score > 65 });
    }

    // --- Automation: new service request → find matching providers ---
    if (event?.type === 'create' && event?.entity_name === 'ServiceRequest') {
      const request = data;
      const providers = await base44.asServiceRole.entities.Service.filter({
        category: request.category,
        status: 'active',
        availability: 'available'
      }, '-rating', 10);

      for (const provider of providers) {
        await base44.asServiceRole.entities.Alert.create({
          user_email: provider.provider_email,
          type: 'service_request_match',
          title: `Nouvelle demande: ${request.title}`,
          message: `Budget: ${request.budget_min}-${request.budget_max} ${request.currency}. Urgence: ${request.urgency}`,
          related_id: request.id,
          related_type: 'service_request',
          category: request.category,
          is_read: false
        });
      }

      return Response.json({ success: true, notified: providers.length });
    }

    // --- Manual action: generate flash sales from trending products ---
    if (action === 'auto_generate_flash_sales') {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      const products = await base44.asServiceRole.entities.Product.list('-views', 20);
      const topProducts = products.filter(p => p.views > 10 && p.status === 'active').slice(0, 5);

      const created = [];
      for (const product of topProducts) {
        const discount = Math.floor(Math.random() * 20) + 10; // 10-30%
        const flashPrice = product.price * (1 - discount / 100);
        const sale = await base44.asServiceRole.entities.FlashSale.create({
          title: `Flash Sale: ${product.title}`,
          description: product.description,
          product_id: product.id,
          original_price: product.price,
          flash_price: Math.round(flashPrice * 100) / 100,
          discount_percent: discount,
          currency: product.currency || 'EUR',
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          quantity_total: 10,
          quantity_sold: 0,
          category: product.category,
          image_url: product.images?.[0],
          location_city: product.location_city,
          status: 'active',
          seller_email: product.seller_email,
          is_auto_generated: true
        });
        created.push(sale);
      }

      return Response.json({ success: true, flash_sales_created: created.length });
    }

    return Response.json({ success: true, message: 'No matching automation' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});