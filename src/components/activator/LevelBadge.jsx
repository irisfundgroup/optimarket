import React from 'react';

export const LEVELS = {
  bronze: { label: 'BRONZE', icon: '🥉', color: 'text-amber-700', bg: 'rgba(180,83,9,0.15)', border: 'rgba(180,83,9,0.3)', fees: 2.0, maxInvest: 100000, maxWithdraw: 200000 },
  silver: { label: 'SILVER', icon: '🥈', color: 'text-slate-400', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', fees: 1.75, maxInvest: 250000, maxWithdraw: 350000 },
  gold:   { label: 'GOLD',   icon: '🥇', color: 'text-yellow-400', bg: 'rgba(250,204,21,0.15)', border: 'rgba(250,204,21,0.3)', fees: 1.5, maxInvest: 500000, maxWithdraw: 500000 },
  platinum: { label: 'PLATINUM', icon: '💎', color: 'text-cyan-400', bg: 'rgba(34,211,238,0.15)', border: 'rgba(34,211,238,0.3)', fees: 1.0, maxInvest: 1000000, maxWithdraw: 1000000 },
  elite:  { label: 'ELITE',  icon: '👑', color: 'text-orange-400', bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.3)', fees: 0.5, maxInvest: 5000000, maxWithdraw: 2000000 },
};

export const getLevelFromEarnings = (totalEarned = 0) => {
  if (totalEarned >= 1000000) return 'elite';
  if (totalEarned >= 400000) return 'platinum';
  if (totalEarned >= 150000) return 'gold';
  if (totalEarned >= 50000) return 'silver';
  return 'bronze';
};

export default function LevelBadge({ level = 'bronze', size = 'sm' }) {
  const lvl = LEVELS[level] || LEVELS.bronze;
  const sizeClass = size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2 py-0.5';
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full ${sizeClass} ${lvl.color}`}
      style={{ background: lvl.bg, border: `1px solid ${lvl.border}` }}
    >
      {lvl.icon} {lvl.label}
    </span>
  );
}