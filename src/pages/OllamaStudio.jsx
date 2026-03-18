import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Cpu, Zap, ShoppingBag, Megaphone, MessageCircle, TrendingUp, Search, CheckCircle, XCircle, AlertTriangle, Loader2, ChevronRight, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Statut Ollama ────────────────────────────────────────────────────────────
function OllamaStatus({ status, onRefresh }) {
  if (!status) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold"
      style={{
        background: status.available ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${status.available ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        color: status.available ? '#10b981' : '#ef4444',
      }}>
      {status.available
        ? <CheckCircle className="w-4 h-4" />
        : <XCircle className="w-4 h-4" />}
      {status.available
        ? `Ollama actif · ${status.models?.length || 0} modèle(s)`
        : 'Ollama hors ligne → OpenAI actif'}
      <button onClick={onRefresh} className="ml-auto opacity-60 hover:opacity-100">
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Résultat affiché ─────────────────────────────────────────────────────────
function ResultBlock({ result, engine, model }) {
  if (!result) return null;
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold"
        style={{
          background: engine === 'ollama' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          color: engine === 'ollama' ? '#fbbf24' : '#818cf8',
        }}>
        <Cpu className="w-3.5 h-3.5" />
        {engine === 'ollama' ? `🦙 Ollama · ${model}` : `✨ OpenAI · ${model}`}
      </div>
      <div className="p-4 space-y-3">
        {result.raw
          ? <pre className="text-xs text-slate-300 whitespace-pre-wrap">{result.raw}</pre>
          : Object.entries(result).map(([key, val]) => (
            <div key={key}>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{key.replace(/_/g, ' ')}</p>
              {Array.isArray(val)
                ? <ul className="space-y-1">{val.map((v, i) => <li key={i} className="text-sm text-slate-200 flex gap-2"><span className="text-orange-400">•</span>{v}</li>)}</ul>
                : typeof val === 'object'
                  ? <pre className="text-xs text-slate-300 bg-black/20 rounded-lg p-3 whitespace-pre-wrap">{JSON.stringify(val, null, 2)}</pre>
                  : <p className="text-sm text-slate-200">{String(val)}</p>}
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── Onglets use-cases ────────────────────────────────────────────────────────
const TABS = [
  { key: 'product_sheet',       icon: ShoppingBag,    label: 'Fiche Produit' },
  { key: 'marketing_post',      icon: Megaphone,      label: 'Marketing' },
  { key: 'opportunity_analysis',icon: TrendingUp,     label: 'Analyse Opp.' },
  { key: 'price_optimization',  icon: Zap,            label: 'Prix Optimal' },
  { key: 'detect_arbitrage',    icon: Search,         label: 'Arbitrage' },
  { key: 'customer_response',   icon: MessageCircle,  label: 'Réponse Client' },
  { key: 'free_prompt',         icon: Cpu,            label: 'Prompt Libre' },
];

// ── Formulaires par use-case ─────────────────────────────────────────────────
function UseCase({ tab, ollamaStatus, selectedModel }) {
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [engine, setEngine] = useState(null);
  const [usedModel, setUsedModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useOpenAI, setUseOpenAI] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const run = async () => {
    setLoading(true);
    setResult(null);
    const res = await base44.functions.invoke('ollamaEngine', {
      action: tab,
      data: form,
      model: selectedModel,
      use_openai: useOpenAI || !ollamaStatus?.available,
    });
    setResult(res.data.result);
    setEngine(res.data.engine);
    setUsedModel(res.data.model);
    setLoading(false);
  };

  const inp = (label, key, placeholder, type = 'text') => (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      <input type={type} placeholder={placeholder} value={form[key] || ''}
        onChange={e => set(key, type === 'number' ? parseFloat(e.target.value) : e.target.value)}
        className="w-full px-3 py-2 rounded-xl text-sm text-white"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Moteur switch */}
      <div className="flex items-center gap-3">
        <button onClick={() => setUseOpenAI(false)}
          className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
          style={{
            background: !useOpenAI ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${!useOpenAI ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: !useOpenAI ? '#fbbf24' : '#64748b',
          }}>
          🦙 Ollama (local)
        </button>
        <button onClick={() => setUseOpenAI(true)}
          className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
          style={{
            background: useOpenAI ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${useOpenAI ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: useOpenAI ? '#818cf8' : '#64748b',
          }}>
          ✨ OpenAI (cloud)
        </button>
      </div>

      {/* Formulaire */}
      <div className="space-y-3">
        {tab === 'product_sheet' && <>
          {inp('Nom du produit', 'name', 'Ex: Panneau solaire 200W')}
          {inp('Niche', 'niche', 'Ex: solar, beauty, electronics')}
          {inp("Prix d'achat", 'buy_price', '5000', 'number')}
          {inp('Prix de vente cible', 'sell_price_target', '15000', 'number')}
          {inp('Pays cible', 'country', 'Côte d\'Ivoire')}
        </>}

        {tab === 'marketing_post' && <>
          {inp('Nom du produit', 'name', 'Ex: Crème éclaircissante naturelle')}
          {inp('Niche', 'niche', 'Ex: beauty')}
          {inp('Prix de vente', 'sell_price_target', '8500', 'number')}
        </>}

        {tab === 'opportunity_analysis' && <>
          {inp('Nom du produit', 'name', 'Ex: Ventilateur USB rechargeable')}
          {inp("Prix d'achat", 'buy_price', '2000', 'number')}
          {inp('Frais de livraison', 'shipping_cost', '500', 'number')}
          {inp('Prix de vente cible', 'sell_price_target', '7500', 'number')}
          {inp('Score demande (0-10)', 'demand_score', '7', 'number')}
          {inp('Score concurrence (0-10)', 'competition_score', '4', 'number')}
        </>}

        {tab === 'price_optimization' && <>
          {inp('Nom du produit', 'name', 'Ex: Montre connectée')}
          {inp("Prix d'achat", 'buy_price', '8000', 'number')}
          {inp('Frais de livraison', 'shipping_cost', '1000', 'number')}
          {inp('Prix de vente actuel', 'sell_price_target', '20000', 'number')}
          {inp('Marché', 'country', 'Côte d\'Ivoire')}
        </>}

        {tab === 'detect_arbitrage' && <>
          {inp('Nom du produit', 'product_name', 'Ex: iPhone 14 128Go')}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Prix sources (JSON)</label>
            <textarea rows={3} placeholder='[{"source":"AliExpress","price":120000},{"source":"Jumia","price":185000}]'
              value={form.prices ? JSON.stringify(form.prices) : ''}
              onChange={e => { try { set('prices', JSON.parse(e.target.value)); } catch (_) {} }}
              className="w-full px-3 py-2 rounded-xl text-sm text-white font-mono"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          {inp('Marché cible', 'target_market', "Afrique de l'Ouest")}
        </>}

        {tab === 'customer_response' && <>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Message du client</label>
            <textarea rows={3} placeholder="Ex: Bonjour, est-ce que votre produit est disponible à Abidjan ?"
              value={form.message || ''}
              onChange={e => set('message', e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          {inp('Produit concerné', 'product', 'Ex: Ventilateur USB')}
          {inp('Langue', 'lang', 'Français')}
        </>}

        {tab === 'free_prompt' && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Ton prompt</label>
            <textarea rows={5} placeholder="Ex: Donne-moi 5 produits tendance à vendre en Afrique de l'Ouest avec les marges estimées..."
              value={form.prompt || ''}
              onChange={e => set('prompt', e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
        )}
      </div>

      <Button onClick={run} disabled={loading} className="w-full py-3 rounded-xl font-bold gap-2"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyse en cours...</> : <><Cpu className="w-4 h-4" /> Lancer l'analyse</>}
      </Button>

      {result && <ResultBlock result={result} engine={engine} model={usedModel} />}
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function OllamaStudio() {
  const [activeTab, setActiveTab] = useState('product_sheet');
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [selectedModel, setSelectedModel] = useState('llama3');
  const [pinging, setPinging] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const pingOllama = async () => {
    setPinging(true);
    const res = await base44.functions.invoke('ollamaEngine', { action: 'ping', data: {} });
    setOllamaStatus(res.data);
    if (res.data?.models?.length) setSelectedModel(res.data.models[0]);
    setPinging(false);
  };

  useEffect(() => { pingOllama(); }, []);

  return (
    <div className="min-h-screen" style={{ background: '#060c18' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4 max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.2)' }}>
                <Cpu className="w-4 h-4 text-orange-400" />
              </div>
              <h1 className="text-xl font-black text-white">Ollama Studio</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>IA Locale + OpenAI</span>
            </div>
            <p className="text-xs text-slate-400">Moteur hybride : Ollama gratuit en priorité, OpenAI en fallback</p>
          </div>
        </div>

        {/* Status + Modèle */}
        <div className="space-y-3">
          <OllamaStatus status={ollamaStatus} onRefresh={pingOllama} />

          {ollamaStatus?.available && ollamaStatus?.models?.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Settings className="w-3.5 h-3.5" />
              Modèle actif :
              <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}
                className="bg-transparent text-white border-none outline-none cursor-pointer font-semibold">
                {ollamaStatus.models.map(m => <option key={m} value={m} style={{ background: '#0f1929' }}>{m}</option>)}
              </select>
            </div>
          )}

          {/* Guide install */}
          {ollamaStatus && !ollamaStatus.available && (
            <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <p className="text-xs font-bold text-orange-400 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Ollama non détecté — Mode OpenAI actif</p>
              <p className="text-[11px] text-slate-400">Pour activer Ollama gratuitement :</p>
              <div className="space-y-1">
                {[
                  'curl -fsSL https://ollama.com/install.sh | sh',
                  'ollama run llama3',
                  `Ajouter OLLAMA_URL dans les secrets de l'app`,
                ].map((step, i) => (
                  <div key={i} className="flex gap-2 text-[11px]">
                    <span className="text-orange-400 font-bold flex-shrink-0">{i + 1}.</span>
                    <code className="text-slate-300 bg-black/30 px-2 py-0.5 rounded">{step}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 max-w-4xl mx-auto">
        <div className="flex overflow-x-auto gap-2 pb-2">
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all"
                style={{
                  background: isActive ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActive ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  color: isActive ? '#fbbf24' : '#64748b',
                }}>
                <Icon className="w-3.5 h-3.5" />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu */}
      <div className="px-4 pt-4 pb-10 max-w-4xl mx-auto">
        <UseCase key={activeTab} tab={activeTab} ollamaStatus={ollamaStatus} selectedModel={selectedModel} />
      </div>
    </div>
  );
}