import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles, Loader2, Zap, TrendingUp, Tag, Package,
  DollarSign, Megaphone, Flame, CheckCircle, ChevronRight, RotateCcw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const MODES = [
  { key: 'find_opportunity',   icon: Sparkles,   label: 'Trouver une opportunité',  color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', desc: 'Produits à revendre, arbitrage, tendances locales' },
  { key: 'auto_pricing',       icon: DollarSign, label: 'Pricing automatique',       color: '#10b981', bg: 'rgba(16,185,129,0.12)',  desc: 'Prix optimal, calcul de marge, positionnement' },
  { key: 'copywriting',        icon: Megaphone,  label: 'Copywriting auto',           color: '#818cf8', bg: 'rgba(99,102,241,0.12)',  desc: 'Description produit, pub Facebook/TikTok, SMS client' },
  { key: 'viral_detection',    icon: Flame,      label: 'Détection virale',           color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   desc: 'Produits tendances, analyse réseaux sociaux' },
];

const NICHES = ['electronics', 'beauty', 'home', 'solar', 'auto', 'viral_tiktok', 'fashion', 'food'];

// ── Prompts spécialisés par mode ─────────────────────────────────────────────
function buildPrompt(mode, form) {
  switch (mode) {
    case 'find_opportunity':
      return {
        action: 'opportunity_analysis',
        data: {
          name: form.product_name || 'Produit générique',
          buy_price: parseFloat(form.buy_price) || 0,
          shipping_cost: parseFloat(form.shipping_cost) || 0,
          sell_price_target: parseFloat(form.sell_price) || 0,
          demand_score: parseFloat(form.demand_score) || 6,
          competition_score: parseFloat(form.competition_score) || 4,
        }
      };
    case 'auto_pricing':
      return {
        action: 'price_optimization',
        data: {
          name: form.product_name || 'Produit',
          buy_price: parseFloat(form.buy_price) || 0,
          shipping_cost: parseFloat(form.shipping_cost) || 0,
          sell_price_target: parseFloat(form.sell_price) || 0,
          country: form.country || "Côte d'Ivoire",
        }
      };
    case 'copywriting':
      return {
        action: 'product_sheet',
        data: {
          name: form.product_name || 'Produit',
          niche: form.niche || 'other',
          buy_price: parseFloat(form.buy_price) || 0,
          sell_price_target: parseFloat(form.sell_price) || 0,
          country: form.country || "Côte d'Ivoire",
        }
      };
    case 'viral_detection':
      return {
        action: 'free_prompt',
        data: {
          prompt: `Tu es un expert en tendances e-commerce africaines. Analyse le potentiel viral de ce produit :
Produit: ${form.product_name}
Niche: ${form.niche || 'général'}
Marché cible: ${form.country || "Afrique de l'Ouest"}
Prix cible: ${form.sell_price || 'inconnu'} XOF

Retourne une analyse structurée avec :
- Score viral (0-100)
- Réseau le plus adapté (TikTok / Facebook / WhatsApp)
- 3 idées de contenu viral
- Estimation de portée organique
- Meilleur moment pour publier
- Produits complémentaires tendances`
        }
      };
    default:
      return null;
  }
}

// ── Affichage résultat enrichi ────────────────────────────────────────────────
function ResultDisplay({ mode, result, engine, form, onReset }) {
  const queryClient = useQueryClient();
  const [published, setPublished] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const marketPrice = parseFloat(form.sell_price) || 0;
  const flashPrice = Math.round(marketPrice * 0.75);
  const totalCost = (parseFloat(form.buy_price) || 0) + (parseFloat(form.shipping_cost) || 0);

  const publishFlash = useMutation({
    mutationFn: () => base44.entities.FlashSale.create({
      title: `🔥 ${form.product_name}`,
      description: result?.summary || result?.description || result?.response || '',
      original_price: marketPrice,
      flash_price: flashPrice,
      discount_percent: 25,
      currency: 'XOF',
      ends_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      quantity_total: 10,
      quantity_sold: 0,
      status: 'active',
      is_auto_generated: true,
    }),
    onSuccess: () => { setPublished(true); queryClient.invalidateQueries({ queryKey: ['adminFlashSales'] }); },
  });

  const claimOpportunity = useMutation({
    mutationFn: () => base44.entities.Opportunity.create({
      title: `Opportunité : ${form.product_name}`,
      description: result?.summary || result?.recommendation || '',
      type: 'product_deal',
      score: result?.verdict === 'EXCELLENT' ? 90 : result?.verdict === 'BON' ? 75 : 60,
      potential_margin: Math.round(((flashPrice - totalCost) / (totalCost || 1)) * 100),
      status: 'active',
    }),
    onSuccess: () => { setClaimed(true); queryClient.invalidateQueries({ queryKey: ['adminOpps'] }); },
  });

  if (!result) return null;

  return (
    <div className="space-y-4 mt-4">
      {/* En-tête moteur */}
      <div className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl"
        style={{
          background: engine === 'ollama' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
          border: `1px solid ${engine === 'ollama' ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)'}`,
          color: engine === 'ollama' ? '#fbbf24' : '#818cf8',
        }}>
        {engine === 'ollama' ? '🦙 Ollama local · GRATUIT' : '✨ OpenAI cloud'} · Analyse terminée
      </div>

      {/* Résultats */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="p-4 space-y-3">
          {result.raw ? (
            <pre className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{result.raw}</pre>
          ) : (
            Object.entries(result).map(([key, val]) => (
              <div key={key}>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{key.replace(/_/g, ' ')}</p>
                {Array.isArray(val)
                  ? <ul className="space-y-1">{val.map((v, i) => <li key={i} className="text-sm text-slate-200 flex gap-2"><span className="text-orange-400">•</span>{v}</li>)}</ul>
                  : typeof val === 'object'
                    ? <pre className="text-xs text-slate-300 bg-black/20 rounded-lg p-2 whitespace-pre-wrap">{JSON.stringify(val, null, 2)}</pre>
                    : <p className="text-sm text-slate-100 leading-relaxed font-medium">{String(val)}</p>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions contextuelles */}
      {(mode === 'find_opportunity' || mode === 'auto_pricing') && marketPrice > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.06)' }}>
          <div className="px-4 py-2 text-xs font-bold text-indigo-300 flex items-center gap-2"
            style={{ background: 'rgba(99,102,241,0.12)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
            <Sparkles className="w-3.5 h-3.5" /> Que faire avec cette opportunité ?
          </div>
          <div className="p-4 space-y-3">
            {/* Prix recap */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-slate-500 mb-0.5">Coût total</p>
                <p className="font-bold text-slate-300">{totalCost.toLocaleString()} XOF</p>
              </div>
              <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-slate-500 mb-0.5">Prix marché</p>
                <p className="font-bold text-white">{marketPrice.toLocaleString()} XOF</p>
              </div>
              <div className="rounded-xl p-2" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <p className="text-orange-400 mb-0.5">Flash −25%</p>
                <p className="font-bold text-orange-300">{flashPrice.toLocaleString()} XOF</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {claimed ? (
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-emerald-400" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <CheckCircle className="w-4 h-4" /> Enregistrée !
                </div>
              ) : (
                <button onClick={() => claimOpportunity.mutate()} disabled={claimOpportunity.isPending}
                  className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                  {claimOpportunity.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                  <span className="text-xs font-bold">Récupérer</span>
                  <span className="text-[10px] text-slate-500">Mes opportunités</span>
                </button>
              )}

              {published ? (
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-orange-400" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <CheckCircle className="w-4 h-4" /> Flash publiée !
                </div>
              ) : (
                <button onClick={() => publishFlash.mutate()} disabled={publishFlash.isPending}
                  className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24' }}>
                  {publishFlash.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                  <span className="text-xs font-bold">Publier Flash −25%</span>
                  <span className="text-[10px] text-slate-500">{flashPrice.toLocaleString()} XOF · 48h</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <button onClick={onReset} className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5" /> Nouvelle analyse
      </button>
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────────
export default function OpportunityFinder({ ollamaAvailable }) {
  const [mode, setMode] = useState(null);
  const [form, setForm] = useState({ country: "Côte d'Ivoire" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [engine, setEngine] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inp = (label, key, placeholder, type = 'text') => (
    <div>
      <label className="text-[11px] text-slate-400 mb-1 block">{label}</label>
      <input type={type} placeholder={placeholder} value={form[key] || ''}
        onChange={e => set(key, e.target.value)}
        className="w-full px-3 py-2 rounded-xl text-sm text-white"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
    </div>
  );

  const run = async () => {
    if (!form.product_name) return;
    const payload = buildPrompt(mode, form);
    if (!payload) return;
    setLoading(true);
    setResult(null);
    const res = await base44.functions.invoke('ollamaEngine', {
      ...payload,
      model: 'llama3',
      use_openai: !ollamaAvailable,
    });
    setResult(res.data.result);
    setEngine(res.data.engine);
    setLoading(false);
  };

  const reset = () => { setResult(null); setForm({ country: "Côte d'Ivoire" }); setMode(null); };

  // ── Sélection de mode ──────────────────────────────────────────────────────
  if (!mode) return (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <p className="text-sm font-bold text-white mb-1">Que veux-tu faire ?</p>
        <p className="text-xs text-slate-500">Choisir un mode pour lancer le moteur IA</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {MODES.map(m => {
          const Icon = m.icon;
          return (
            <button key={m.key} onClick={() => setMode(m.key)}
              className="flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all hover:scale-[1.02]"
              style={{ background: m.bg, border: `1px solid ${m.color}40` }}>
              <Icon className="w-5 h-5" style={{ color: m.color }} />
              <p className="text-sm font-bold text-white leading-tight">{m.label}</p>
              <p className="text-[10px] text-slate-400 leading-snug">{m.desc}</p>
              <ChevronRight className="w-3.5 h-3.5 self-end" style={{ color: m.color }} />
            </button>
          );
        })}
      </div>
    </div>
  );

  const currentMode = MODES.find(m => m.key === mode);

  // ── Formulaire + résultat ──────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Mode sélectionné */}
      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: currentMode.bg, border: `1px solid ${currentMode.color}40` }}>
        <currentMode.icon className="w-5 h-5 flex-shrink-0" style={{ color: currentMode.color }} />
        <div className="flex-1">
          <p className="text-sm font-bold text-white">{currentMode.label}</p>
          <p className="text-[10px] text-slate-400">{currentMode.desc}</p>
        </div>
        <button onClick={reset} className="text-slate-500 hover:text-slate-300 text-xs">Changer</button>
      </div>

      {/* Champs communs */}
      <div className="space-y-3">
        {inp('Nom du produit *', 'product_name', 'Ex: Ventilateur USB rechargeable')}

        {(mode === 'find_opportunity' || mode === 'auto_pricing' || mode === 'copywriting') && <>
          {inp("Prix d'achat (XOF)", 'buy_price', '3000', 'number')}
          {inp('Frais de livraison (XOF)', 'shipping_cost', '500', 'number')}
          {inp('Prix de vente cible (XOF)', 'sell_price', '9000', 'number')}
        </>}

        {mode === 'find_opportunity' && <>
          {inp('Score demande (0-10)', 'demand_score', '7', 'number')}
          {inp('Score concurrence (0-10)', 'competition_score', '3', 'number')}
        </>}

        {(mode === 'copywriting' || mode === 'viral_detection') && (
          <div>
            <label className="text-[11px] text-slate-400 mb-1 block">Niche</label>
            <select value={form.niche || ''} onChange={e => set('niche', e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <option value="" style={{ background: '#0f172a' }}>Choisir une niche</option>
              {NICHES.map(n => <option key={n} value={n} style={{ background: '#0f172a' }}>{n}</option>)}
            </select>
          </div>
        )}

        {inp('Marché cible', 'country', "Côte d'Ivoire")}
      </div>

      {!result && (
        <button onClick={run} disabled={loading || !form.product_name}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ background: loading ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}>
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyse IA en cours...</>
            : <><Zap className="w-4 h-4" /> Trouver opportunité</>}
        </button>
      )}

      <ResultDisplay mode={mode} result={result} engine={engine} form={form} onReset={reset} />
    </div>
  );
}