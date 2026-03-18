import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { TrendingUp, Wallet, Plus, History, ArrowRight, Trophy, BarChart2, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import WalletCard from '@/components/activator/WalletCard';
import InvestmentCard from '@/components/activator/InvestmentCard';
import LevelBadge, { LEVELS, getLevelFromEarnings } from '@/components/activator/LevelBadge';

export default function ActivatorDashboard() {
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: wallet, isLoading: loadingWallet } = useQuery({
    queryKey: ['myWallet', user?.email],
    queryFn: () => base44.entities.ActivatorWallet.filter({ user_email: user?.email }, '-created_date', 1).then(r => r[0]),
    enabled: !!user?.email,
  });

  const { data: investments = [], isLoading: loadingInvs } = useQuery({
    queryKey: ['myInvestments', user?.email],
    queryFn: () => base44.entities.ActivatorInvestment.filter({ activator_email: user?.email }, '-created_date', 10),
    enabled: !!user?.email,
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['activeOpportunities'],
    queryFn: () => base44.entities.Opportunity.filter({ status: 'active' }, '-score', 3),
  });

  const activeInvs = investments.filter(i => i.status === 'active');
  const completedInvs = investments.filter(i => i.status === 'completed');
  const totalEarned = wallet?.total_earned || 0;
  const level = getLevelFromEarnings(totalEarned);
  const lvlConfig = LEVELS[level];

  // Calcul progression vers niveau suivant
  const levelThresholds = [0, 50000, 150000, 400000, 1000000];
  const levelNames = ['bronze', 'silver', 'gold', 'platinum', 'elite'];
  const currentIdx = levelNames.indexOf(level);
  const nextThreshold = levelThresholds[currentIdx + 1];
  const currentThreshold = levelThresholds[currentIdx];
  const progressPercent = nextThreshold
    ? Math.min(100, ((totalEarned - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    : 100;

  const stats = [
    { label: 'Commissions reçues', value: `${totalEarned.toLocaleString()} XOF`, icon: BarChart2, color: '#10b981' },
    { label: 'Campagnes actives', value: activeInvs.length, icon: TrendingUp, color: '#f59e0b' },
    { label: 'Complétées', value: completedInvs.length, icon: Trophy, color: '#a78bfa' },
    { label: 'Taux succès', value: investments.length ? `${Math.round((completedInvs.length / investments.length) * 100)}%` : '—', icon: Zap, color: '#38bdf8' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Mon Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-slate-400 text-sm">Bonjour, {user?.full_name?.split(' ')[0]} 👋</span>
            <LevelBadge level={level} />
          </div>
        </div>
        <Link to="/ActivatorOpportunities">
          <Button className="rounded-xl gap-2" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>
            <Plus className="w-4 h-4" /> Rejoindre
          </Button>
        </Link>
      </div>

      {/* Wallet */}
      {loadingWallet ? <Skeleton className="h-40 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} /> : (
        <WalletCard wallet={wallet} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Icon className="w-4 h-4 mb-2" style={{ color }} />
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Progression niveau */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <LevelBadge level={level} />
            {nextThreshold && <span className="text-xs text-slate-500">→ vers {levelNames[currentIdx + 1]?.toUpperCase()}</span>}
          </div>
          <span className="text-xs text-slate-400">{progressPercent.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-2 rounded-full transition-all" style={{ width: `${progressPercent}%`, background: `linear-gradient(90deg, ${lvlConfig.color.replace('text-', '')}, #f59e0b)`, backgroundColor: '#f59e0b' }} />
        </div>
        {nextThreshold && (
          <p className="text-xs text-slate-500 mt-1.5">
            Encore {(nextThreshold - totalEarned).toLocaleString()} XOF de commissions pour le niveau suivant
          </p>
        )}
        <div className="mt-3 flex gap-4 text-xs text-slate-400">
          <span>✅ Commission plateforme: {lvlConfig.fees}%</span>
          <span>✅ Pack max: {(lvlConfig.maxInvest / 1000).toFixed(0)}K XOF</span>
          <span>✅ Retrait/j: {(lvlConfig.maxWithdraw / 1000).toFixed(0)}K XOF</span>
        </div>
      </div>

      {/* Investissements actifs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-orange-400" /> Mes participations</h2>
          <Link to="/ActivatorHistory" className="text-xs text-orange-400 flex items-center gap-1">Tout voir <ArrowRight className="w-3 h-3" /></Link>
        </div>
        {loadingInvs ? (
          <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />)}</div>
        ) : investments.length === 0 ? (
          <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-20 text-orange-400" />
            <p className="text-slate-400 text-sm">Aucune participation active pour l'instant</p>
            <Link to="/ActivatorOpportunities">
              <Button className="mt-4 rounded-xl" size="sm" style={{ background: '#f59e0b', color: '#000' }}>Voir les campagnes</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">{investments.slice(0, 5).map(inv => <InvestmentCard key={inv.id} investment={inv} />)}</div>
        )}
      </div>

      {/* Opportunités suggérées */}
      {opportunities.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-400" /> Campagnes recommandées</h2>
            <Link to="/ActivatorOpportunities" className="text-xs text-orange-400 flex items-center gap-1">Tout voir <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="grid gap-3">
            {opportunities.map(opp => (
              <Link key={opp.id} to={`/ActivatorActivate?opportunityId=${opp.id}`}>
                <div className="flex items-center justify-between p-4 rounded-2xl transition-all hover:border-orange-500/30"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div>
                    <p className="text-white font-semibold text-sm">{opp.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{opp.category} · Score IA: {opp.score}/100</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-sm">+{opp.potential_margin || 15}%</p>
                    <Button size="sm" className="mt-1 rounded-lg text-xs h-7" style={{ background: '#f59e0b', color: '#000' }}>Rejoindre</Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Campagnes', to: '/ActivatorOpportunities', icon: TrendingUp, color: '#f59e0b' },
          { label: 'Mon Wallet', to: '/ActivatorWallet', icon: Wallet, color: '#10b981' },
          { label: 'Historique', to: '/ActivatorHistory', icon: History, color: '#a78bfa' },
        ].map(({ label, to, icon: Icon, color }) => (
          <Link key={to} to={to}>
            <div className="rounded-2xl p-4 text-center transition-all hover:scale-105" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
              <p className="text-xs text-slate-300 font-medium">{label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}