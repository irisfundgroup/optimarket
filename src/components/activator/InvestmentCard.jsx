import React from 'react';
import { TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  active:    { icon: TrendingUp,   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'En cours' },
  completed: { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Commission reçue' },
  failed:    { icon: XCircle,      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Non aboutie' },
  paused:    { icon: Clock,        color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', label: 'En pause' },
};

export default function InvestmentCard({ investment }) {
  const cfg = STATUS_CONFIG[investment.status] || STATUS_CONFIG.active;
  const Icon = cfg.icon;
  const gainPercent = investment.expected_return_percent || 0;
  const gainAmount = investment.actual_profit || investment.expected_return_amount || 0;
  const endDate = investment.end_date ? new Date(investment.end_date) : null;
  const daysLeft = endDate ? Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <div className="rounded-2xl p-4 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{investment.opportunity_title || 'Opportunité'}</p>
          <p className="text-xs text-slate-500 mt-0.5">Pack: <span className="text-slate-300">{investment.amount_invested?.toLocaleString()} XOF</span></p>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 flex-shrink-0"
          style={{ color: cfg.color, background: cfg.bg }}>
          <Icon className="w-3 h-3" /> {cfg.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="text-center">
          <p className="text-xs text-slate-500">Commission %</p>
          <p className="text-sm font-bold text-emerald-400">+{gainPercent}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">Commission XOF</p>
          <p className="text-sm font-bold text-emerald-400">+{gainAmount.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">{investment.status === 'active' ? 'J. restants' : 'Durée'}</p>
          <p className="text-sm font-bold text-white">{investment.status === 'active' && daysLeft !== null ? `${daysLeft}j` : `${investment.duration_days || 0}j`}</p>
        </div>
      </div>
    </div>
  );
}