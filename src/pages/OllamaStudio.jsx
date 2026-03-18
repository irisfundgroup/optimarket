import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Cpu, Zap, ShoppingBag, Megaphone, MessageCircle, TrendingUp, Search,
  CheckCircle, XCircle, AlertTriangle, Loader2, RefreshCw, Settings,
  DollarSign, Shield, ArrowRight, Copy, ChevronDown, ChevronUp,
  Flame, BarChart3, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Coûts estimés ─────────────────────────────────────────────────────────────
const COST_DATA = [
  { action: 'Fiche produit',     callsPerDay: 20, costOpenAI: 0.004, costOllama: 0 },
  { action: 'Post marketing',    callsPerDay: 15, costOpenAI: 0.003, costOllama: 0 },
  { action: 'Analyse opportunité', callsPerDay: 30, costOpenAI: 0.005, costOllama: 0 },
  { action: 'Optimisation prix', callsPerDay: 25, costOpenAI: 0.004, costOllama: 0 },
  { action: 'Réponse client',    callsPerDay: 50, costOpenAI: 0.002, costOllama: 0 },
  { action: 'Détection arbitrage', callsPerDay: 10, costOpenAI: 0.006, costOllama: 0 },
];

// ── Étapes installation ───────────────────────────────────────────────────────
const INSTALL_STEPS = [
  {
    num: 1,
    title: 'Installer Ollama',
    cmd: 'curl -fsSL https://ollama.com/install.sh | sh',
    desc: 'Fonctionne sur Linux, Mac et Windows (WSL). Gratuit et open-source.',
    os: '🐧 Linux / 🍎 Mac',
  },
  {
    num: 2,
    title: 'Télécharger un modèle',
    cmd: 'ollama run llama3',
    desc: 'llama3 (4.7GB) est recommandé. Alternatives : mistral, gemma2, phi3.',
    os: '~4-8 GB espace disque',
  },
  {
    num: 3,
    title: 'Exposer via ngrok (si hébergé)',
    cmd: 'ngrok http 11434',
    desc: 'Si Ollama tourne en local mais l\'app est hébergée, utilisez ngrok pour exposer le port.',
    os: '🌐 Optionnel (hébergement)',
  },
  {
    num: 4,
    title: 'Configurer le secret OLLAMA_URL',
    cmd: 'http://localhost:11434  ou  https://xxxx.ngrok.io',
    desc: 'Dans Base44 → Paramètres → Secrets → OLLAMA_URL',
    os: '⚙️ Dashboard Base44',
  },
];

// ── Onglets ────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'product_sheet',        icon: ShoppingBag,  label: 'Fiche Produit' },
  { key: 'marketing_post',       icon: Megaphone,    label: 'Marketing' },
  { key: 'opportunity_analysis', icon: TrendingUp,   label: 'Analyse Opp.' },
  { key: 'price_optimization',   icon: Zap,          label: 'Prix Optimal' },
  { key: 'detect_arbitrage',     icon: Search,       label: 'Arbitrage' },
  { key: 'customer_response',    icon: MessageCircle, label: 'Réponse Client' },
  { key: 'free_prompt',          icon: Cpu,          label: 'Prompt Libre' },
];

// ── Statut Ollama ─────────────────────────────────────────────────────────────
function OllamaStatusBar({ status, pinging, onRefresh }) {
  if (!status) return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Vérification du moteur IA...
    </div>
  );
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold flex-wrap"
      style={{
        background: status.available ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
        border: `1px solid ${status.available ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
      }}>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.available ? 'bg-emerald-400' : 'bg-orange-400'} animate-pulse`} />
      <span style={{ color: status.available ? '#10b981' : '#f59e0b' }}>
        {status.available
          ? `🦙 Ollama actif · ${status.models?.length || 0} modèle(s) · ${status.url}`
          : '⚠️ Ollama hors ligne — OpenAI (cloud) actif'}
      </span>
      <button onClick={onRefresh} disabled={pinging}
        className="ml-auto opacity-60 hover:opacity-100 transition-opacity">
        <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} style={{ color: status.available ? '#10b981' : '#f59e0b' }} />
      </button>
    </div>
  );
}

// ── Résultat ───────────────────────────────────────────────────────────────────
function ResultBlock({ result, engine, model }) {
  if (!result) return null;
  return (
    <div className="rounded-2xl overflow-hidden mt-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold"
        style={{
          background: engine === 'ollama' ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          color: engine === 'ollama' ? '#fbbf24' : '#818cf8',
        }}>
        {engine === 'ollama'
          ? <><Cpu className="w-3.5 h-3.5" /> 🦙 Ollama · {model} · <span className="text-emerald-400">GRATUIT</span></>
          : <><Globe className="w-3.5 h-3.5" /> ✨ OpenAI · {model}</>}
      </div>
      <div className="p-4 space-y-4">
        {result.raw
          ? <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{result.raw}</pre>
          : Object.entries(result).map(([key, val]) => (
            <div key={key}>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">{key.replace(/_/g, ' ')}</p>
              {Array.isArray(val)
                ? <ul className="space-y-1.5">{val.map((v, i) => <li key={i} className="text-sm text-slate-200 flex gap-2"><span className="text-orange-400 flex-shrink-0">•</span>{v}</li>)}</ul>
                : typeof val === 'object'
                  ? <pre className="text-xs text-slate-300 bg-black/30 rounded-lg p-3 whitespace-pre-wrap">{JSON.stringify(val, null, 2)}</pre>
                  : <p className="text-sm text-slate-200 leading-relaxed">{String(val)}</p>}
            </div>
          ))}
      </div>
    </div>
  );
}

// ── Formulaire use-case ────────────────────────────────────────────────────────
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
      <div className="flex gap-2">
        <button onClick={() => setUseOpenAI(false)}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          style={{
            background: !useOpenAI ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${!useOpenAI ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
            color: !useOpenAI ? '#fbbf24' : '#64748b',
          }}>
          🦙 Ollama <span style={{ color: '#10b981', fontSize: '10px' }}>GRATUIT</span>
        </button>
        <button onClick={() => setUseOpenAI(true)}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          style={{
            background: useOpenAI ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${useOpenAI ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
            color: useOpenAI ? '#818cf8' : '#64748b',
          }}>
          ✨ OpenAI <span style={{ color: '#ef4444', fontSize: '10px' }}>PAYANT</span>
        </button>
      </div>

      {/* Formulaires */}
      <div className="space-y-3">
        {tab === 'product_sheet' && <>
          {inp('Nom du produit', 'name', 'Ex: Panneau solaire 200W')}
          {inp('Niche', 'niche', 'Ex: solar, beauty, electronics')}
          {inp("Prix d'achat (XOF)", 'buy_price', '45000', 'number')}
          {inp('Prix de vente cible (XOF)', 'sell_price_target', '120000', 'number')}
          {inp('Pays cible', 'country', "Côte d'Ivoire")}
        </>}

        {tab === 'marketing_post' && <>
          {inp('Nom du produit', 'name', 'Ex: Crème éclaircissante naturelle')}
          {inp('Niche', 'niche', 'Ex: beauty')}
          {inp('Prix de vente (XOF)', 'sell_price_target', '8500', 'number')}
        </>}

        {tab === 'opportunity_analysis' && <>
          {inp('Nom du produit', 'name', 'Ex: Ventilateur USB rechargeable')}
          {inp("Prix d'achat (XOF)", 'buy_price', '2000', 'number')}
          {inp('Frais de livraison (XOF)', 'shipping_cost', '500', 'number')}
          {inp('Prix de vente cible (XOF)', 'sell_price_target', '7500', 'number')}
          {inp('Score demande (0-10)', 'demand_score', '7', 'number')}
          {inp('Score concurrence (0-10)', 'competition_score', '4', 'number')}
        </>}

        {tab === 'price_optimization' && <>
          {inp('Nom du produit', 'name', 'Ex: Montre connectée')}
          {inp("Prix d'achat (XOF)", 'buy_price', '8000', 'number')}
          {inp('Frais de livraison (XOF)', 'shipping_cost', '1000', 'number')}
          {inp('Prix de vente actuel (XOF)', 'sell_price_target', '20000', 'number')}
          {inp('Marché', 'country', "Côte d'Ivoire")}
        </>}

        {tab === 'detect_arbitrage' && <>
          {inp('Nom du produit', 'product_name', 'Ex: iPhone 14 128Go')}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Prix sources (JSON)</label>
            <textarea rows={3}
              placeholder='[{"source":"AliExpress","price":120000},{"source":"Jumia","price":185000}]'
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
            <textarea rows={3}
              placeholder="Ex: Bonjour, est-ce que votre produit est disponible à Abidjan ?"
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
            <textarea rows={5}
              placeholder="Ex: Donne-moi 5 produits tendance à vendre en Afrique de l'Ouest avec les marges estimées..."
              value={form.prompt || ''}
              onChange={e => set('prompt', e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
        )}
      </div>

      <Button onClick={run} disabled={loading} className="w-full py-3 rounded-xl font-bold gap-2 text-sm"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}>
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyse en cours...</>
          : <><Zap className="w-4 h-4" /> Lancer l'analyse</>}
      </Button>

      <ResultBlock result={result} engine={engine} model={usedModel} />
    </div>
  );
}

// ── Tableau de coûts ───────────────────────────────────────────────────────────
function CostTable() {
  const totalOpenAI = COST_DATA.reduce((sum, r) => sum + r.callsPerDay * r.costOpenAI * 30, 0);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-4 py-3 flex items-center gap-2"
        style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <BarChart3 className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-bold text-white">Économies estimées / mois</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th className="text-left px-4 py-2 text-slate-400 font-medium">Action IA</th>
              <th className="text-right px-3 py-2 text-slate-400 font-medium">Appels/j</th>
              <th className="text-right px-3 py-2 text-red-400 font-medium">OpenAI/mois</th>
              <th className="text-right px-3 py-2 text-emerald-400 font-medium">Ollama/mois</th>
            </tr>
          </thead>
          <tbody>
            {COST_DATA.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td className="px-4 py-2.5 text-slate-300">{row.action}</td>
                <td className="px-3 py-2.5 text-right text-slate-400">{row.callsPerDay}</td>
                <td className="px-3 py-2.5 text-right text-red-400 font-mono">
                  ${(row.callsPerDay * row.costOpenAI * 30).toFixed(2)}
                </td>
                <td className="px-3 py-2.5 text-right text-emerald-400 font-bold">$0.00</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: 'rgba(16,185,129,0.06)', borderTop: '1px solid rgba(16,185,129,0.2)' }}>
              <td className="px-4 py-3 text-white font-bold" colSpan={2}>TOTAL MENSUEL</td>
              <td className="px-3 py-3 text-right text-red-400 font-bold font-mono">${totalOpenAI.toFixed(2)}</td>
              <td className="px-3 py-3 text-right text-emerald-400 font-black">$0.00 🎉</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="px-4 py-3 flex items-center gap-2"
        style={{ background: 'rgba(16,185,129,0.06)', borderTop: '1px solid rgba(16,185,129,0.12)' }}>
        <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <p className="text-xs text-emerald-300">
          <strong>Avec Ollama :</strong> économie estimée de <strong className="text-emerald-400">${totalOpenAI.toFixed(0)}/mois</strong> · 0 donnée envoyée à des tiers · indépendance totale des API externes
        </p>
      </div>
    </div>
  );
}

// ── Guide installation ─────────────────────────────────────────────────────────
function InstallGuide() {
  const [copied, setCopied] = useState(null);
  const copy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-3">
      {INSTALL_STEPS.map((step) => (
        <div key={step.num} className="rounded-2xl p-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
              {step.num}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-white">{step.title}</p>
                <span className="text-[10px] text-slate-500 flex-shrink-0">{step.os}</span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <code className="flex-1 text-xs px-3 py-1.5 rounded-lg font-mono text-orange-300 truncate"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  {step.cmd}
                </code>
                <button onClick={() => copy(step.cmd, step.num)}
                  className="p-1.5 rounded-lg transition-all flex-shrink-0 hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {copied === step.num
                    ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function OllamaStudio() {
  const [activeTab, setActiveTab] = useState('product_sheet');
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [selectedModel, setSelectedModel] = useState('llama3');
  const [pinging, setPinging] = useState(false);
  const [showCosts, setShowCosts] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [activeSection, setActiveSection] = useState('studio'); // 'studio' | 'costs' | 'install'

  useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const pingOllama = async () => {
    setPinging(true);
    const res = await base44.functions.invoke('ollamaEngine', { action: 'ping', data: {} });
    setOllamaStatus(res.data);
    if (res.data?.models?.length) setSelectedModel(res.data.models[0]);
    setPinging(false);
  };

  useEffect(() => { pingOllama(); }, []);

  const ollamaActive = ollamaStatus?.available;

  return (
    <div className="min-h-screen pb-10" style={{ background: '#060c18' }}>

      {/* ── Hero header ── */}
      <div className="px-4 pt-6 pb-4 max-w-4xl mx-auto">
        <div className="rounded-2xl p-5 mb-4"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(16,185,129,0.05))', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(245,158,11,0.1))', border: '1px solid rgba(245,158,11,0.3)' }}>
              <Cpu className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl font-black text-white">Ollama Studio</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: ollamaActive ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: ollamaActive ? '#10b981' : '#fbbf24', border: `1px solid ${ollamaActive ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}` }}>
                  {ollamaActive ? '🟢 IA LOCALE ACTIVE' : '🟡 MODE CLOUD ACTIF'}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-3">Ton cerveau IA local — <strong className="text-emerald-400">100% gratuit</strong>, <strong className="text-blue-400">100% privé</strong>, indépendant d'OpenAI</p>

              {/* KPIs */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: DollarSign, label: 'Coût / appel IA', value: ollamaActive ? '$0.00' : '~$0.004', color: ollamaActive ? '#10b981' : '#ef4444' },
                  { icon: Shield, label: 'Données privées', value: ollamaActive ? '100%' : 'Envoyées cloud', color: ollamaActive ? '#10b981' : '#f59e0b' },
                  { icon: Flame, label: 'Indépendance', value: ollamaActive ? 'Totale' : 'Partielle', color: ollamaActive ? '#10b981' : '#f59e0b' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                    <span className="text-[11px] text-slate-400">{label} :</span>
                    <span className="text-xs font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statut */}
        <OllamaStatusBar status={ollamaStatus} pinging={pinging} onRefresh={pingOllama} />

        {/* Sélecteur modèle */}
        {ollamaActive && ollamaStatus?.models?.length > 0 && (
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <Settings className="w-3.5 h-3.5" /> Modèle actif :
            <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}
              className="bg-transparent text-white border-none outline-none cursor-pointer font-semibold text-xs">
              {ollamaStatus.models.map(m => <option key={m} value={m} style={{ background: '#0f1929' }}>{m}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* ── Sections nav ── */}
      <div className="px-4 max-w-4xl mx-auto mb-4">
        <div className="flex gap-2">
          {[
            { key: 'studio', label: '⚡ Studio IA', desc: 'Lancer des analyses' },
            { key: 'costs',  label: '💰 Économies', desc: 'Tableau des coûts' },
            { key: 'install', label: '🛠️ Installation', desc: 'Guide Ollama' },
          ].map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className="flex-1 py-2.5 px-3 rounded-xl text-left transition-all"
              style={{
                background: activeSection === s.key ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeSection === s.key ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.07)'}`,
              }}>
              <p className="text-xs font-bold" style={{ color: activeSection === s.key ? '#fbbf24' : '#64748b' }}>{s.label}</p>
              <p className="text-[10px] text-slate-500 hidden sm:block">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 max-w-4xl mx-auto">

        {/* ── Studio ── */}
        {activeSection === 'studio' && (
          <>
            <div className="flex overflow-x-auto gap-2 pb-2 mb-4">
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
            <UseCase key={activeTab} tab={activeTab} ollamaStatus={ollamaStatus} selectedModel={selectedModel} />
          </>
        )}

        {/* ── Économies ── */}
        {activeSection === 'costs' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <DollarSign className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-white font-bold">Pourquoi Ollama = 0€/mois ?</p>
                <p className="text-xs text-slate-400">Ollama fait tourner les modèles IA sur <strong className="text-white">ton propre serveur</strong>. Zéro appel API externe, zéro facture. Les modèles open-source (Llama 3, Mistral...) sont aussi puissants que GPT-3.5.</p>
              </div>
            </div>
            <CostTable />
          </div>
        )}

        {/* ── Installation ── */}
        {activeSection === 'install' && (
          <div className="space-y-4">
            {!ollamaActive && (
              <div className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-300 mb-0.5">Ollama non détecté</p>
                  <p className="text-xs text-slate-400">Chaque appel IA utilise actuellement <strong className="text-red-400">OpenAI (payant)</strong>. Suis le guide ci-dessous pour passer en mode local <strong className="text-emerald-400">gratuit</strong>.</p>
                </div>
              </div>
            )}
            {ollamaActive && (
              <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <p className="text-sm text-emerald-300"><strong>Ollama est actif ✓</strong> — Tu utilises déjà l'IA locale gratuite !</p>
              </div>
            )}
            <InstallGuide />
          </div>
        )}
      </div>
    </div>
  );
}