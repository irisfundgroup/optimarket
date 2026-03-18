import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, Send, Loader2, ChevronDown, ChevronUp, Globe } from 'lucide-react';

const NICHE_EMOJI = {
  electronics: '🔌', auto: '🚗', beauty: '💄',
  home: '🏠', solar: '☀️', viral_tiktok: '🎵', other: '📦'
};

const STATUS_STYLE = {
  draft: { label: 'Brouillon', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  scored: { label: 'Scoré', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  published: { label: 'Publié', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  rejected: { label: 'Rejeté', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

function ScoreRing({ score }) {
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${2 * Math.PI * 22}`}
            strokeDashoffset={`${2 * Math.PI * 22 * (1 - score / 100)}`}
            strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">{score}</span>
      </div>
      <span className="text-[10px] text-slate-500 mt-0.5">score</span>
    </div>
  );
}

export default function ProductSourceCard({ product, onScore, onPublish }) {
  const [expanded, setExpanded] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const totalCost = (product.buy_price || 0) + (product.shipping_cost || 0);
  const netMargin = (product.sell_price_target || 0) - totalCost;
  const marginPct = product.sell_price_target > 0 ? ((netMargin / product.sell_price_target) * 100).toFixed(1) : 0;
  const st = STATUS_STYLE[product.status] || STATUS_STYLE.draft;

  const handleScore = async () => {
    setScoring(true);
    await onScore(product.id);
    setScoring(false);
  };

  const handlePublish = async () => {
    setPublishing(true);
    await onPublish(product.id);
    setPublishing(false);
  };

  return (
    <div className="rounded-2xl p-4 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{NICHE_EMOJI[product.niche] || '📦'}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-bold text-sm truncate">{product.name}</p>
            <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ color: st.color, background: st.bg }}>{st.label}</span>
          </div>

          {product.ai_category && <p className="text-[11px] text-slate-500 mt-0.5">{product.ai_category}</p>}

          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <p className="text-[10px] text-slate-500">Coût total</p>
              <p className="text-xs font-bold text-white">{totalCost.toLocaleString()} {product.currency}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Prix vente</p>
              <p className="text-xs font-bold text-white">{(product.sell_price_target || 0).toLocaleString()} {product.currency}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Marge nette</p>
              <p className={`text-xs font-bold ${netMargin > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {netMargin.toLocaleString()} ({marginPct}%)
              </p>
            </div>
          </div>
        </div>

        {product.opportunity_score > 0 && <ScoreRing score={product.opportunity_score} />}
      </div>

      {/* AI summary */}
      {product.ai_summary && (
        <p className="text-xs text-slate-400 mt-3 italic border-l-2 border-orange-500/40 pl-2">{product.ai_summary}</p>
      )}

      {product.ai_marketing_angle && (
        <p className="text-xs text-orange-300 mt-1 font-medium">💡 {product.ai_marketing_angle}</p>
      )}

      {/* AI fiche (expandable) */}
      {product.ai_product_sheet && (
        <>
          <button onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Voir la fiche produit générée
          </button>
          {expanded && (
            <div className="mt-2 rounded-xl p-3 text-xs text-slate-300 whitespace-pre-wrap"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {product.ai_product_sheet}
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        {product.status === 'draft' && (
          <Button size="sm" className="rounded-xl text-xs gap-1 flex-1" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
            onClick={handleScore} disabled={scoring}>
            {scoring ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            {scoring ? 'Scoring...' : 'Scorer + IA'}
          </Button>
        )}
        {product.status === 'scored' && (
          <>
            <Button size="sm" className="rounded-xl text-xs gap-1" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
              onClick={handleScore} disabled={scoring}>
              {scoring ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              Re-scorer
            </Button>
            {product.opportunity_score >= 40 && (
              <Button size="sm" className="rounded-xl text-xs gap-1 flex-1" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' }}
                onClick={handlePublish} disabled={publishing}>
                {publishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                {publishing ? 'Publication...' : 'Publier opportunité'}
              </Button>
            )}
          </>
        )}
        {product.status === 'published' && (
          <div className="flex items-center gap-1 text-xs text-emerald-400">
            <Globe className="w-3 h-3" /> Publié sur le marketplace
          </div>
        )}
      </div>
    </div>
  );
}