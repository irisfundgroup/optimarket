import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://localhost:11434";
const DEFAULT_MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";

// ── Appel Ollama local ───────────────────────────────────────────────────────
async function callOllama(prompt, model = DEFAULT_MODEL) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.response || "";
}

// ── Fallback OpenAI ──────────────────────────────────────────────────────────
async function callOpenAI(prompt, jsonMode = false) {
  const opts = {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  };
  if (jsonMode) opts.response_format = { type: "json_object" };
  const res = await openai.chat.completions.create(opts);
  return res.choices[0].message.content;
}

// ── Moteur hybride : Ollama d'abord, fallback OpenAI ───────────────────────
async function callAI(prompt, { jsonMode = false, preferOllama = true, model } = {}) {
  if (preferOllama) {
    try {
      const raw = await callOllama(prompt, model || DEFAULT_MODEL);
      return { text: raw, engine: "ollama", model: model || DEFAULT_MODEL };
    } catch (e) {
      console.log("[Ollama unavailable, fallback OpenAI]", e.message);
    }
  }
  const text = await callOpenAI(prompt, jsonMode);
  return { text, engine: "openai", model: "gpt-4o-mini" };
}

// ── Parseur JSON robuste ─────────────────────────────────────────────────────
function parseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (_) {}
  return null;
}

// ── Prompts spécialisés ──────────────────────────────────────────────────────
const PROMPTS = {
  product_sheet: (p) => `Tu es un expert e-commerce africain. Génère une fiche produit JSON pour :
Produit: ${p.name} | Niche: ${p.niche} | Prix achat: ${p.buy_price} | Prix vente: ${p.sell_price_target} | Pays: ${p.country || "Afrique de l'Ouest"}
Retourne UNIQUEMENT un JSON : { "title": "titre accrocheur", "description": "description vendeuse 3-4 phrases", "benefits": ["avantage1","avantage2","avantage3"], "cta": "appel à l'action", "category": "catégorie" }`,

  marketing_post: (p) => `Tu es un expert marketing digital africain. Crée un post Facebook/TikTok viral pour :
Produit: ${p.name} | Niche: ${p.niche} | Prix: ${p.sell_price_target} XOF
Retourne UNIQUEMENT un JSON : { "facebook_post": "post Facebook engageant avec emojis", "tiktok_script": "script TikTok 30 secondes", "hashtags": ["#tag1","#tag2","#tag3"] }`,

  opportunity_analysis: (p) => `Tu es un analyste d'arbitrage commercial pour l'Afrique. Analyse cette opportunité :
Produit: ${p.name} | Achat: ${p.buy_price} | Livraison: ${p.shipping_cost || 0} | Vente cible: ${p.sell_price_target} | Demande (0-10): ${p.demand_score} | Concurrence (0-10): ${p.competition_score}
Retourne UNIQUEMENT un JSON : { "verdict": "EXCELLENT|BON|MOYEN|RISQUE", "summary": "analyse en 2 phrases", "risks": ["risque1","risque2"], "opportunities": ["opportunité1","opportunité2"], "recommendation": "action recommandée" }`,

  price_optimization: (p) => `Tu es un expert en pricing e-commerce africain. Optimise le prix pour :
Produit: ${p.name} | Coût total: ${(p.buy_price || 0) + (p.shipping_cost || 0)} | Prix actuel: ${p.sell_price_target} | Marché: ${p.country || "CI"}
Retourne UNIQUEMENT un JSON : { "optimal_price": nombre, "min_price": nombre, "premium_price": nombre, "rationale": "explication courte", "margin_at_optimal": "X%" }`,

  customer_response: (context) => `Tu es un assistant commercial pour une marketplace africaine. Réponds au client de manière professionnelle et chaleureuse.
Message client: "${context.message}" | Produit concerné: ${context.product || "non spécifié"} | Langue: ${context.lang || "Français"}
Retourne UNIQUEMENT un JSON : { "response": "réponse au client", "tone": "ton utilisé", "next_action": "prochaine action suggérée" }`,

  detect_arbitrage: (data) => `Tu es un détecteur d'arbitrage commercial. Analyse ces prix pour identifier des opportunités :
Produit: ${data.product_name}
Prix sources: ${JSON.stringify(data.prices)}
Marché cible: ${data.target_market || "Afrique de l'Ouest"}
Retourne UNIQUEMENT un JSON : { "best_buy": { "source": "...", "price": 0 }, "best_sell_price": 0, "margin_percent": 0, "arbitrage_viable": true/false, "strategy": "stratégie en 1 phrase" }`,
};

// ─────────────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) {
    return Response.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const body = await req.json();
  const { action, data, model, use_openai } = body;

  const preferOllama = !use_openai;

  // ── Ping Ollama ──────────────────────────────────────────────────────────
  if (action === "ping") {
    try {
      const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error("not ok");
      const tags = await res.json();
      const models = (tags.models || []).map(m => m.name);
      return Response.json({ available: true, url: OLLAMA_URL, models, default_model: DEFAULT_MODEL });
    } catch (e) {
      return Response.json({ available: false, url: OLLAMA_URL, error: e.message });
    }
  }

  // ── Fiche produit ────────────────────────────────────────────────────────
  if (action === "product_sheet") {
    const prompt = PROMPTS.product_sheet(data);
    const { text, engine, model: usedModel } = await callAI(prompt, { preferOllama, model, jsonMode: true });
    const parsed = parseJSON(text);
    return Response.json({ success: true, result: parsed || { raw: text }, engine, model: usedModel });
  }

  // ── Post marketing ───────────────────────────────────────────────────────
  if (action === "marketing_post") {
    const prompt = PROMPTS.marketing_post(data);
    const { text, engine, model: usedModel } = await callAI(prompt, { preferOllama, model, jsonMode: true });
    const parsed = parseJSON(text);
    return Response.json({ success: true, result: parsed || { raw: text }, engine, model: usedModel });
  }

  // ── Analyse d'opportunité ────────────────────────────────────────────────
  if (action === "opportunity_analysis") {
    const prompt = PROMPTS.opportunity_analysis(data);
    const { text, engine, model: usedModel } = await callAI(prompt, { preferOllama, model, jsonMode: true });
    const parsed = parseJSON(text);
    return Response.json({ success: true, result: parsed || { raw: text }, engine, model: usedModel });
  }

  // ── Optimisation prix ────────────────────────────────────────────────────
  if (action === "price_optimization") {
    const prompt = PROMPTS.price_optimization(data);
    const { text, engine, model: usedModel } = await callAI(prompt, { preferOllama, model, jsonMode: true });
    const parsed = parseJSON(text);
    return Response.json({ success: true, result: parsed || { raw: text }, engine, model: usedModel });
  }

  // ── Réponse client ───────────────────────────────────────────────────────
  if (action === "customer_response") {
    const prompt = PROMPTS.customer_response(data);
    const { text, engine, model: usedModel } = await callAI(prompt, { preferOllama, model, jsonMode: true });
    const parsed = parseJSON(text);
    return Response.json({ success: true, result: parsed || { raw: text }, engine, model: usedModel });
  }

  // ── Détection arbitrage ──────────────────────────────────────────────────
  if (action === "detect_arbitrage") {
    const prompt = PROMPTS.detect_arbitrage(data);
    const { text, engine, model: usedModel } = await callAI(prompt, { preferOllama, model, jsonMode: true });
    const parsed = parseJSON(text);
    return Response.json({ success: true, result: parsed || { raw: text }, engine, model: usedModel });
  }

  // ── Prompt libre ─────────────────────────────────────────────────────────
  if (action === "free_prompt") {
    const { text, engine, model: usedModel } = await callAI(data.prompt, { preferOllama, model });
    return Response.json({ success: true, result: { response: text }, engine, model: usedModel });
  }

  return Response.json({ error: 'Action non reconnue', available_actions: ["ping","product_sheet","marketing_post","opportunity_analysis","price_optimization","customer_response","detect_arbitrage","free_prompt"] }, { status: 400 });
});