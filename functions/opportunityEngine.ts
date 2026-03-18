import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

// Poids du score d'opportunité
const WEIGHTS = {
  margin: 0.40,
  demand: 0.30,
  competition: 0.20,
  logistics: 0.10,
};

function calcScore(product) {
  const totalCost = (product.buy_price || 0) + (product.shipping_cost || 0);
  const sellPrice = product.sell_price_target || 0;
  const netMargin = sellPrice > 0 ? ((sellPrice - totalCost) / sellPrice) * 10 : 0;
  const marginScore = Math.min(10, Math.max(0, netMargin));

  const demandScore = Math.min(10, Math.max(0, product.demand_score || 5));
  const compScore = Math.min(10, Math.max(0, 10 - (product.competition_score || 5))); // Inverser : moins de concurrence = mieux
  const logisticsScore = Math.min(10, Math.max(0, 10 - (product.logistics_risk || 3)));

  const raw =
    marginScore * WEIGHTS.margin +
    demandScore * WEIGHTS.demand +
    compScore * WEIGHTS.competition +
    logisticsScore * WEIGHTS.logistics;

  return Math.round(raw * 10); // 0-100
}

async function generateAISheet(product, totalCost, netMargin) {
  const prompt = `Tu es un expert en e-commerce africain et en marketing produit. Analyse ce produit et génère une fiche commerciale complète.

Produit : ${product.name}
Niche : ${product.niche}
Coût total (achat + livraison) : ${totalCost} ${product.currency}
Prix de revente cible : ${product.sell_price_target} ${product.currency}
Marge nette estimée : ${netMargin.toFixed(0)} ${product.currency} (${product.sell_price_target > 0 ? (((product.sell_price_target - totalCost) / product.sell_price_target) * 100).toFixed(1) : 0}%)
Pays cible : ${product.country || 'Afrique de l\'Ouest'}
Score demande : ${product.demand_score || 5}/10
Score concurrence : ${product.competition_score || 5}/10

Génère en JSON :
{
  "category": "catégorie courte (ex: Maison / Énergie)",
  "summary": "résumé du potentiel en 2 phrases max",
  "product_sheet": "fiche produit complète avec titre accrocheur, description vendeuse (3-4 phrases), points forts (liste), et appel à l'action",
  "marketing_angle": "angle marketing principal en 1 phrase percutante",
  "target_audience": "cible recommandée en 1 phrase"
}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(res.choices[0].message.content);
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (user?.role !== 'admin') {
    return Response.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
  }

  const { action, product_id, products_data } = await req.json();

  // Action : scorer un produit existant
  if (action === 'score_one' && product_id) {
    const products = await base44.asServiceRole.entities.ProductSource.filter({ id: product_id });
    const product = products[0];
    if (!product) return Response.json({ error: 'Produit non trouvé' }, { status: 404 });

    const score = calcScore(product);
    const totalCost = (product.buy_price || 0) + (product.shipping_cost || 0);
    const netMargin = (product.sell_price_target || 0) - totalCost;

    let aiData = {};
    if (score >= 50) {
      // Top 50%+ → génération IA
      aiData = await generateAISheet(product, totalCost, netMargin);
    }

    await base44.asServiceRole.entities.ProductSource.update(product_id, {
      opportunity_score: score,
      status: 'scored',
      ai_category: aiData.category || null,
      ai_summary: aiData.summary || null,
      ai_product_sheet: aiData.product_sheet || null,
      ai_marketing_angle: aiData.marketing_angle || null,
      ai_target_audience: aiData.target_audience || null,
    });

    return Response.json({ success: true, score, ai: aiData });
  }

  // Action : scorer tous les produits en draft
  if (action === 'score_all') {
    const products = await base44.asServiceRole.entities.ProductSource.filter({ status: 'draft' });
    const results = [];

    for (const product of products) {
      const score = calcScore(product);
      const totalCost = (product.buy_price || 0) + (product.shipping_cost || 0);
      const netMargin = (product.sell_price_target || 0) - totalCost;

      let aiData = {};
      if (score >= 60) {
        // Seulement le top 40% → OpenAI
        aiData = await generateAISheet(product, totalCost, netMargin);
      }

      await base44.asServiceRole.entities.ProductSource.update(product.id, {
        opportunity_score: score,
        status: 'scored',
        ai_category: aiData.category || null,
        ai_summary: aiData.summary || null,
        ai_product_sheet: aiData.product_sheet || null,
        ai_marketing_angle: aiData.marketing_angle || null,
        ai_target_audience: aiData.target_audience || null,
      });

      results.push({ id: product.id, name: product.name, score, ai_generated: score >= 60 });
    }

    return Response.json({ success: true, processed: results.length, results });
  }

  // Action : publier une opportunité depuis un produit scoré
  if (action === 'publish' && product_id) {
    const products = await base44.asServiceRole.entities.ProductSource.filter({ id: product_id });
    const product = products[0];
    if (!product) return Response.json({ error: 'Produit non trouvé' }, { status: 404 });

    const totalCost = (product.buy_price || 0) + (product.shipping_cost || 0);
    const netMargin = (product.sell_price_target || 0) - totalCost;

    const opportunity = await base44.asServiceRole.entities.Opportunity.create({
      title: product.ai_product_sheet
        ? product.ai_product_sheet.split('\n')[0].replace(/[#*]/g, '').trim().substring(0, 80)
        : `Opportunité: ${product.name}`,
      description: product.ai_summary || `${product.name} — ${product.ai_marketing_angle || ''}`,
      type: 'product_deal',
      score: product.opportunity_score,
      potential_margin: Math.round((netMargin / (product.sell_price_target || 1)) * 100),
      category: product.ai_category || product.niche,
      location_country: product.country || 'CI',
      status: 'active',
      is_premium: product.opportunity_score >= 75,
    });

    await base44.asServiceRole.entities.ProductSource.update(product_id, {
      status: 'published',
      published_opportunity_id: opportunity.id,
    });

    return Response.json({ success: true, opportunity_id: opportunity.id });
  }

  // Action : créer des produits en batch
  if (action === 'create_batch' && products_data) {
    const created = [];
    for (const p of products_data) {
      const prod = await base44.asServiceRole.entities.ProductSource.create({ ...p, status: 'draft' });
      created.push(prod.id);
    }
    return Response.json({ success: true, created });
  }

  return Response.json({ error: 'Action non reconnue' }, { status: 400 });
});