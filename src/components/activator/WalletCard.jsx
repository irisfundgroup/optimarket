import React from 'react';
import { TrendingUp, Wallet, Clock } from 'lucide-react';

export default function WalletCard({ wallet }) {
  const available = wallet?.balance_available || 0;
  const inOpps = wallet?.balance_in_opportunities || 0;
  const pending = wallet?.balance_pending_withdrawal || 0;
  const total = available + inOpps + pending;

  return (
    <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(16,185,129,0.08))', border: '1px solid rgba(245,158,11,0.25)' }}>
      <p className="text-xs text-slate-400 mb-1">Solde total</p>
      <p className="text-3xl font-black text-white mb-4">{total.toLocaleString()} <span className="text-base font-normal text-slate-400">XOF</span></p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Wallet, label: 'Disponible', value: available, color: '#10b981' },
          { icon: TrendingUp, label: 'En cours', value: inOpps, color: '#f59e0b' },
          { icon: Clock, label: 'En retrait', value: pending, color: '#94a3b8' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Icon className="w-3.5 h-3.5 mb-1" style={{ color }} />
            <p className="text-xs text-slate-400 mb-0.5">{label}</p>
            <p className="text-sm font-bold text-white">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}