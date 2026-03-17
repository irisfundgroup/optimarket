import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Lock, MapPin, Flame, ArrowUpRight } from 'lucide-react';
import { t } from '@/lib/i18n';

const TYPE_CONFIG = {
  product_deal: { label: 'Deal Produit', gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  service_demand: { label: 'Demande Service', gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  flash_sale: { label: 'Vente Flash', gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  trending: { label: 'Tendance', gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  price_drop: { label: 'Baisse Prix', gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
};

function ScoreRing({ score }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f97316' : '#ef4444';

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-base font-black text-slate-900 leading-none">{score}</span>
        <Flame className="w-3 h-3 text-orange-400" />
      </div>
    </div>
  );
}

export default function OpportunityCard({ opportunity }) {
  const cfg = TYPE_CONFIG[opportunity.type] || TYPE_CONFIG.trending;

  return (
    <Link to={`/OpportunityDetail?id=${opportunity.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1">
        {/* Top accent */}
        <div className={`h-1 bg-gradient-to-r ${cfg.gradient}`} />

        <div className="p-4">
          {/* Type badge */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
              {cfg.label}
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 transition-colors" />
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{opportunity.title}</h3>
              {opportunity.location_city && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {opportunity.location_city}
                </p>
              )}
            </div>
            <ScoreRing score={opportunity.score} />
          </div>

          {/* Margin */}
          {opportunity.potential_margin && (
            <div className="mt-3 flex items-center gap-1.5 bg-emerald-50 rounded-lg px-3 py-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-700">+{opportunity.potential_margin}% marge potentielle</span>
            </div>
          )}

          {/* Premium lock */}
          {opportunity.is_premium && (
            <div className="mt-2 flex items-center gap-1.5 text-orange-500 text-xs font-semibold">
              <Lock className="w-3 h-3" /> Détails premium
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}