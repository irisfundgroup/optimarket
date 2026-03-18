import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { TrendingUp, Wallet, History, ArrowRight, Zap, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import WalletCard from '@/components/activator/WalletCard';
import InvestmentCard from '@/components/activator/InvestmentCard';
import LevelBadge, { getLevelFromEarnings } from '@/components/activator/LevelBadge';

export default function ActivatorHome() {
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: wallet, isLoading: loadingWallet } = useQuery({
    queryKey: ['myWallet', user?.email],
    queryFn: () => base44.entities.ActivatorWallet.filter({ user_email: user?.email }, '-created_date', 1).then(r => r[0]),
    enabled: !!user?.email,
  });

  const { data: investments = [], isLoading: loadingInvs } = useQuery({
    queryKey: ['myInvestments', user?.email],
    queryFn: () => base44.entities.ActivatorInvestment.filter({ activator_email: user?.email }, '-created_date', 5),
    enabled: !!user?.email,
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['topOpportunities'],
    queryFn: () => base44.entities.Opportunity.filter({ status: 'active' }, '-score', 4),
  });

  const level = getLevelFromEarnings(wallet?.total_earned || 0);

  return (
    <div className="min-h-screen" style={{ background: '#060c18' }}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Header Hero */}
        <div className="rounded-3xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(16,185,129,0.08))', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-slate-400 text-sm">👋 Bonjour, {user?.full_name?.split(' ')[0]}</span>
              <LevelBadge level={level} />
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Activateur d'Opportunités</h1>
            <p className="text-slate-400 text-sm mb-5">Investissez dans des opportunités vérifiées et gagnez automatiquement</p>
            <Link to="/ActivatorOpportunities">
              <Button className="gap-2 rounded-xl font-bold" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}>
                <Zap className="w-4 h-4" /> Explorer les opportunités
              </Button>
            </Link>
          </div>
          {/* Décoration */}
          <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
        </div>

        {/* Wallet */}
        {loadingWallet ? <Skeleton className="h-40 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} /> : (
          <WalletCard wallet={wallet} />
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Opportunités', to: '/ActivatorOpportunities', icon: TrendingUp, color: '#f59e0b', desc: 'Investir' },
            { label: 'Mon Wallet', to: '/ActivatorWallet', icon: Wallet, color: '#10b981', desc: 'Solde & Retrait' },
            { label: 'Historique', to: '/ActivatorHistory', icon: History, color: '#a78bfa', desc: 'Mes gains' },
          ].map(({ label, to, icon: Icon, color, desc }) => (
            <Link key={to} to={to}>
              <div className="rounded-2xl p-4 text-center transition-all hover:scale-105 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${color}15` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="text-white text-xs font-bold">{label}</p>
                <p className="text-slate-500 text-[10px]">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Investissements actifs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" /> Mes investissements
            </h2>
            <Link to="/ActivatorHistory" className="text-xs text-orange-400 flex items-center gap-1 hover:text-orange-300">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loadingInvs ? (
            <div className="space-y-3">{Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />)}</div>
          ) : investments.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-20 text-orange-400" />
              <p className="text-slate-400 text-sm">Activez votre première opportunité</p>
              <Link to="/ActivatorOpportunities">
                <Button className="mt-3 rounded-xl" size="sm" style={{ background: '#f59e0b', color: '#000' }}>C'est parti 🚀</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">{investments.map(inv => <InvestmentCard key={inv.id} investment={inv} />)}</div>
          )}
        </div>

        {/* Top Opportunités */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" /> Meilleures opportunités
            </h2>
            <Link to="/ActivatorOpportunities" className="text-xs text-orange-400 flex items-center gap-1 hover:text-orange-300">
              Tout voir <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {opportunities.map(opp => (
              <Link key={opp.id} to={`/ActivatorActivate?opportunityId=${opp.id}`}>
                <div className="p-4 rounded-2xl transition-all hover:border-orange-500/30 hover:scale-[1.01]"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{opp.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 capitalize">{opp.category}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-emerald-400 font-black">+{opp.potential_margin || 15}%</p>
                      <p className="text-xs text-slate-500">Score: {opp.score}/100</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {opportunities.length === 0 && (
              <p className="text-slate-500 text-sm col-span-2 text-center py-4">Aucune opportunité disponible</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}