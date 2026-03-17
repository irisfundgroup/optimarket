import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, data } = await req.json();

    let prompt = '';
    let responseSchema = null;

    if (action === 'generate_description') {
      prompt = `Tu es un expert e-commerce. Génère une description commerciale attractive et concise (max 150 mots) pour ce produit/service: "${data.title}". Catégorie: ${data.category}. Prix: ${data.price} ${data.currency || 'EUR'}. Langue: français.`;
    } else if (action === 'analyze_opportunity') {
      prompt = `Tu es un analyste marché expert. Analyse cette opportunité commerciale et donne un score et une recommandation. Titre: "${data.title}". Catégorie: ${data.category}. Prix: ${data.price}. Localisation: ${data.location_city || 'non spécifiée'}.`;
      responseSchema = {
        type: 'object',
        properties: {
          score: { type: 'number', description: 'Score opportunité 0-100' },
          potential_margin: { type: 'number', description: 'Marge potentielle en %' },
          recommendation: { type: 'string', description: 'Recommandation courte' },
          type: { type: 'string', enum: ['product_deal', 'service_demand', 'flash_sale', 'trending', 'price_drop'] }
        }
      };
    } else if (action === 'detect_opportunities') {
      prompt = `Tu es un expert marché africain et européen. Analyse ces données de marché et identifie 3 opportunités commerciales à fort potentiel. Données: ${JSON.stringify(data)}. Retourne des opportunités concrètes et actionnables.`;
      responseSchema = {
        type: 'object',
        properties: {
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                type: { type: 'string', enum: ['product_deal', 'service_demand', 'flash_sale', 'trending', 'price_drop'] },
                score: { type: 'number' },
                potential_margin: { type: 'number' },
                category: { type: 'string' }
              }
            }
          }
        }
      };
    } else if (action === 'classify_viral') {
      prompt = `Analyse ce produit et détermine s'il a un potentiel viral. Titre: "${data.title}". Catégorie: ${data.category}. Évalue sa viralité sur les réseaux sociaux.`;
      responseSchema = {
        type: 'object',
        properties: {
          viral_score: { type: 'number', description: '0-100' },
          platforms: { type: 'array', items: { type: 'string' }, description: 'Plateformes recommandées (TikTok, Instagram, etc.)' },
          hashtags: { type: 'array', items: { type: 'string' } },
          reason: { type: 'string' }
        }
      };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      ...(responseSchema ? { response_format: { type: 'json_object' } } : {})
    });

    const content = completion.choices[0].message.content;
    const result = responseSchema ? JSON.parse(content) : { text: content };

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});