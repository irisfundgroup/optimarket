import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Trophy, BarChart2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import InvestmentCard from '@/components/activator/InvestmentCard';

export default function ActivatorHistory() {
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: investments = [], isLoading } = useQuery({
    queryKey: ['myInvestmentsAll', user?.email],
    queryFn: () => base44.entities.ActivatorInvestment.filter({ activator_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const completed = investments.filter(i => i.status === 'completed');
  const active = investments.filter(i => i.status === 'active');
  const failed = investments.filter(i => i.status === 'failed');
  const totalInvested = investments.reduce((s, i) => s + (i.amount_invested || 0), 0);
  const totalGains = completed.reduce((s, i) => s + (i.actual_profit || i.expected_return_amount || 0), 0);
  const successRate = investments.length ? Math.round((completed.length / investments.length) * 100) : 0;

  const stats = [
    { label: 'Total investi', value: `${totalInvested.toLocaleString()}`, unit: 'XOF', icon: BarChart2, color: '#f59e0b' },
    { label: 'Gains réalisés', value: `${totalGains.toLocaleString()}`, unit: 'XOF', icon: TrendingUp, color: '#10b981' },
    { label: 'Réussites', value: completed.length, unit: 'opps', icon: CheckCircle2, color: '#a78bfa' },
    { label: 'Taux de succès', value: `${successRate}`, unit: '%', icon: Trophy, color: '#38bdf8' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/ActivatorDashboard"><Button variant="ghost" size="icon" className="rounded-xl text-white"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-xl font-black text-white">Historique & Stats</h1>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ label, value, unit, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Icon className="w-4 h-4 mb-2" style={{ color }} />
            <p className="text-xl font-black text-white">{value}<span className="text-sm font-normal text-slate-400 ml-1">{unit}</span></p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtres par statut */}
      {isLoading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />)}</div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" /> En cours ({active.length})
              </h2>
              <div className="space-y-3">{active.map(inv => <InvestmentCard key={inv.id} investment={inv} />)}</div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Complétées ({completed.length})
              </h2>
              <div className="space-y-3">{completed.map(inv => <InvestmentCard key={inv.id} investment={inv} />)}</div>
            </div>
          )}

          {failed.length > 0 && (
            <div>
              <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" /> Échouées ({failed.length})
              </h2>
              <div className="space-y-3">{failed.map(inv => <InvestmentCard key={inv.id} investment={inv} />)}</div>
            </div>
          )}

          {investments.length === 0 && (
            <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20 text-orange-400" />
              <p className="text-slate-400">Aucun investissement trouvé</p>
              <Link to="/ActivatorOpportunities">
                <Button className="mt-4 rounded-xl" style={{ background: '#f59e0b', color: '#000' }}>Explorer les opportunités</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}