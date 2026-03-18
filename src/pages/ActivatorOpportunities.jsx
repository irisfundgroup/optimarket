import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { TrendingUp, Filter, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const RISK_CONFIG = {
  low:    { label: 'FAIBLE', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  medium: { label: 'MOYEN',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  high:   { label: 'ÉLEVÉ', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

function getRisk(score) {
  if (score >= 80) return 'low';
  if (score >= 60) return 'medium';
  return 'high';
}

function OppCard({ opp }) {
  const risk = getRisk(opp.score || 50);
  const rCfg = RISK_CONFIG[risk];
  const margin = opp.potential_margin || 12;

  return (
    <div className="rounded-2xl p-5 transition-all hover:border-orange-500/30"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-sm leading-snug">{opp.title}</h3>
          <p className="text-slate-500 text-xs mt-1 capitalize">{opp.category} {opp.location_city ? `· ${opp.location_city}` : ''}</p>
        </div>
        <span className="text-xs font-bold rounded-full px-2.5 py-1 flex-shrink-0"
          style={{ color: rCfg.color, background: rCfg.bg }}>
          Risque {rCfg.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <p className="text-emerald-400 font-black text-lg">+{margin}%</p>
          <p className="text-slate-500 text-[10px] mt-0.5">Commission</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-white font-bold text-sm">{opp.score}/100</p>
          <p className="text-slate-500 text-[10px] mt-0.5">Score IA</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-white font-bold text-sm">{opp.claims_count || 0}</p>
          <p className="text-slate-500 text-[10px] mt-0.5">Partenaires</p>
        </div>
      </div>

      {opp.description && (
        <p className="text-slate-400 text-xs mb-4 line-clamp-2">{opp.description}</p>
      )}

      <Link to={`/ActivatorActivate?opportunityId=${opp.id}`}>
        <Button className="w-full rounded-xl gap-2 font-bold" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}>
          <TrendingUp className="w-4 h-4" /> Rejoindre cette campagne
        </Button>
      </Link>
    </div>
  );
}

export default function ActivatorOpportunities() {
  const [filter, setFilter] = useState('all');

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['allOpportunities'],
    queryFn: () => base44.entities.Opportunity.filter({ status: 'active' }, '-score', 50),
  });

  const filtered = filter === 'all' ? opportunities
    : opportunities.filter(o => {
        if (filter === 'high_return') return (o.potential_margin || 0) >= 20;
        if (filter === 'low_risk') return (o.score || 0) >= 80;
        if (filter === 'new') return o.claims_count === 0;
        return true;
      });

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-400" /> Campagnes commerciales
        </h1>
        <p className="text-slate-400 text-sm mt-1">Rejoignez des campagnes e-commerce et recevez des commissions sur ventes réelles</p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'high_return', label: '🔥 +20% commission' },
          { key: 'low_risk', label: '🛡️ Score élevé' },
          { key: 'new', label: '✨ Nouvelles' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
            style={{
              background: filter === key ? '#f59e0b' : 'rgba(255,255,255,0.06)',
              color: filter === key ? '#000' : '#94a3b8',
              border: filter === key ? 'none' : '1px solid rgba(255,255,255,0.08)',
            }}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20 text-orange-400" />
          <p className="text-slate-400">Aucune campagne disponible pour l'instant</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map(opp => <OppCard key={opp.id} opp={opp} />)}
        </div>
      )}
    </div>
  );
}