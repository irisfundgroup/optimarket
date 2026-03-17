import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Lock, MapPin, Flame, ArrowUpRight } from 'lucide-react';

const TYPE_CONFIG = {
  product_deal: { label: 'Deal Produit', accent: '#818cf8', bg: 'rgba(99,102,241,0.1)', bar: 'linear-gradient(90deg, #6366f1, #818cf8)' },
  service_demand: { label: 'Demande Service', accent: '#c084fc', bg: 'rgba(192,132,252,0.1)', bar: 'linear-gradient(90deg, #a855f7, #c084fc)' },
  flash_sale: { label: 'Vente Flash', accent: '#f59e0b', bg: 'rgba(245,158,11,0.1)', bar: 'linear-gradient(90deg, #f59e0b, #fbbf24)' },
  trending: { label: 'Tendance IA', accent: '#34d399', bg: 'rgba(52,211,153,0.1)', bar: 'linear-gradient(90deg, #10b981, #34d399)' },
  price_drop: { label: 'Baisse Prix', accent: '#22d3ee', bg: 'rgba(34,211,238,0.1)', bar: 'linear-gradient(90deg, #06b6d4, #22d3ee)' },
};

function ScoreRing({ score }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#34d399' : score >= 60 ? '#f59e0b' : '#f87171';

  return (
    <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="text-sm font-black leading-none" style={{ color: '#e2e8f0' }}>{score}</span>
        <Flame className="w-3 h-3" style={{ color }} />
      </div>
    </div>
  );
}

export default function OpportunityCard({ opportunity }) {
  const cfg = TYPE_CONFIG[opportunity.type] || TYPE_CONFIG.trending;

  return (
    <Link to={`/OpportunityDetail?id=${opportunity.id}`} className="group block">
      <div className="rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(10, 18, 38, 0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.border = `1px solid ${cfg.accent}40`;
          e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.5), 0 0 20px ${cfg.accent}15`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        }}>

        {/* Top accent bar */}
        <div className="h-0.5" style={{ background: cfg.bar }} />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: cfg.bg, color: cfg.accent }}>
              {cfg.label}
            </span>
            <ArrowUpRight className="w-4 h-4 transition-colors" style={{ color: '#334155' }}
              ref={el => el && (el.closest('.group:hover') && (el.style.color = cfg.accent))} />
          </div>

          {/* Title + Score */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm leading-snug line-clamp-2" style={{ color: '#e2e8f0' }}>
                {opportunity.title}
              </h3>
              {opportunity.location_city && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#475569' }}>
                  <MapPin className="w-3 h-3" /> {opportunity.location_city}
                </p>
              )}
            </div>
            <ScoreRing score={opportunity.score} />
          </div>

          {/* Margin */}
          {opportunity.potential_margin && (
            <div className="flex items-center gap-1.5 rounded-xl px-3 py-2"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
              <span className="text-xs font-bold" style={{ color: '#34d399' }}>+{opportunity.potential_margin}% marge</span>
            </div>
          )}

          {opportunity.is_premium && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#f59e0b' }}>
              <Lock className="w-3 h-3" /> Détails premium
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}