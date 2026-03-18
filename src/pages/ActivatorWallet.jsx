import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  ArrowLeft, ArrowDownCircle, Plus, Clock, CheckCircle2, XCircle,
  Wallet, TrendingUp, Gift, ShoppingBag, AlertCircle, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_CFG = {
  pending:    { icon: Clock,        color: '#f59e0b', label: 'En attente' },
  processing: { icon: Clock,        color: '#38bdf8', label: 'En cours' },
  completed:  { icon: CheckCircle2, color: '#10b981', label: 'Validé' },
  rejected:   { icon: XCircle,      color: '#ef4444', label: 'Rejeté' },
};

function BalanceCard({ wallet }) {
  const available = wallet?.balance_available || 0;
  const pending   = wallet?.balance_pending_withdrawal || 0;
  const inCampaign = wallet?.balance_in_opportunities || 0;
  const total     = wallet?.total_earned || 0;

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f1a2e 0%, #1a2744 100%)', border: '1px solid rgba(245,158,11,0.2)' }}>
      {/* En-tête */}
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-4 h-4 text-orange-400" />
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Solde de récompenses</p>
        </div>
        <p className="text-4xl font-black text-white">{available.toLocaleString()} <span className="text-xl text-slate-400">XOF</span></p>
        <p className="text-xs text-emerald-400 mt-1">Total cumulé: {total.toLocaleString()} XOF</p>
      </div>

      {/* Détails */}
      <div className="grid grid-cols-2 divide-x px-0" style={{ '--divide-color': 'rgba(255,255,255,0.06)' }}>
        <div className="px-5 py-4">
          <p className="text-[10px] text-slate-500 uppercase mb-1">En campagne active</p>
          <p className="text-lg font-bold text-orange-300">{inCampaign.toLocaleString()} XOF</p>
        </div>
        <div className="px-5 py-4 border-l border-white/5">
          <p className="text-[10px] text-slate-500 uppercase mb-1">En attente retrait</p>
          <p className="text-lg font-bold text-blue-300">{pending.toLocaleString()} XOF</p>
        </div>
      </div>

      {/* Légal note */}
      <div className="px-5 py-3 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.06)', borderTop: '1px solid rgba(245,158,11,0.1)' }}>
        <Gift className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Vos <strong className="text-orange-300">récompenses commerciales</strong> sont issues de participations réelles à des campagnes de revente. 
          Les points sont convertibles en retrait encadré sur votre mobile money.
        </p>
      </div>
    </div>
  );
}

function WithdrawForm({ wallet, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const queryClient = useQueryClient();

  const available = wallet?.balance_available || 0;
  const amountNum = parseFloat(amount) || 0;
  const isValid = amountNum >= 1000 && amountNum <= available && phone.trim().length >= 8;

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ActivatorWithdrawal.create({
        activator_email: wallet.user_email,
        amount: amountNum,
        currency: 'XOF',
        method: 'mobile_money',
        phone_or_account: phone,
        status: 'pending',
      });
      await base44.entities.ActivatorWallet.update(wallet.id, {
        balance_available: Math.max(0, available - amountNum),
        balance_pending_withdrawal: (wallet.balance_pending_withdrawal || 0) + amountNum,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myWallet'] });
      queryClient.invalidateQueries({ queryKey: ['myWithdrawals'] });
      onSuccess?.();
    },
  });

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <ArrowDownCircle className="w-4 h-4 text-orange-400" /> Convertir mes récompenses
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
      </div>

      <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-300">
          Vos points de récompense sont convertis en XOF et transférés sur votre mobile money (Wave, Orange Money, MTN). Minimum: 1 000 XOF.
        </p>
      </div>

      <div>
        <Label className="text-slate-300 text-sm mb-1.5 block">Montant à convertir (XOF)</Label>
        <Input type="number" placeholder="Ex: 10000" value={amount} onChange={e => setAmount(e.target.value)}
          className="rounded-xl text-white bg-white/5 border-white/15" />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-slate-500">Minimum: 1 000 XOF</p>
          <button className="text-xs text-orange-400" onClick={() => setAmount(String(available))}>
            Max: {available.toLocaleString()} XOF
          </button>
        </div>
      </div>

      <div>
        <Label className="text-slate-300 text-sm mb-1.5 block">Numéro Mobile Money</Label>
        <Input type="tel" placeholder="+225 07 00 00 00 00" value={phone} onChange={e => setPhone(e.target.value)}
          className="rounded-xl text-white bg-white/5 border-white/15" />
        <p className="text-xs text-slate-500 mt-1">Wave, Orange Money, MTN Money — Côte d'Ivoire</p>
      </div>

      <p className="text-xs text-slate-400">⏱ Délai de traitement: 24-48h ouvrables. Votre demande sera vérifiée avant validation.</p>

      <Button className="w-full rounded-xl font-bold h-11 gap-2"
        style={{ background: isValid ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)', color: isValid ? '#000' : '#475569' }}
        onClick={() => withdrawMutation.mutate()}
        disabled={!isValid || withdrawMutation.isPending}>
        {withdrawMutation.isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</>
          : <><ArrowDownCircle className="w-4 h-4" /> Confirmer le retrait</>}
      </Button>
    </div>
  );
}

export default function ActivatorWallet() {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: wallet, isLoading: loadingWallet } = useQuery({
    queryKey: ['myWallet', user?.email],
    queryFn: () => base44.entities.ActivatorWallet.filter({ user_email: user?.email }, '-created_date', 1).then(r => r[0]),
    enabled: !!user?.email,
  });

  const { data: withdrawals = [], isLoading: loadingW } = useQuery({
    queryKey: ['myWithdrawals', user?.email],
    queryFn: () => base44.entities.ActivatorWithdrawal.filter({ activator_email: user?.email }, '-created_date', 20),
    enabled: !!user?.email,
  });

  const { data: investments = [] } = useQuery({
    queryKey: ['myInvestments', user?.email],
    queryFn: () => base44.entities.ActivatorInvestment.filter({ activator_email: user?.email }, '-created_date', 30),
    enabled: !!user?.email,
  });

  // Historique combiné — terminologie commerciale
  const transactions = [
    ...investments.map(inv => ({
      date: inv.created_date,
      label: `Participation campagne: ${inv.opportunity_title}`,
      amount: -inv.amount_invested,
      color: '#ef4444',
      icon: ShoppingBag,
      tag: 'Engagement commercial',
    })),
    ...investments.filter(i => i.status === 'completed').map(inv => ({
      date: inv.end_date || inv.updated_date,
      label: `Récompense: ${inv.opportunity_title}`,
      amount: inv.actual_profit || inv.expected_return_amount,
      color: '#10b981',
      icon: Gift,
      tag: 'Récompense commerciale',
    })),
    ...withdrawals.map(w => {
      const cfg = STATUS_CFG[w.status] || STATUS_CFG.pending;
      const StatusIcon = cfg.icon;
      return {
        date: w.created_date,
        label: `Retrait Mobile Money — ${w.phone_or_account || ''}`,
        amount: -w.amount,
        color: cfg.color,
        icon: ArrowDownCircle,
        tag: cfg.label,
        status: w.status,
      };
    }),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/ActivatorDashboard">
          <Button variant="ghost" size="icon" className="rounded-xl text-white"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-black text-white">Mon Wallet Récompenses</h1>
          <p className="text-xs text-slate-500">Récompenses issues d'activations commerciales réelles</p>
        </div>
      </div>

      {/* Balance card */}
      {loadingWallet
        ? <Skeleton className="h-48 rounded-3xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
        : <BalanceCard wallet={wallet} />
      }

      {/* Actions */}
      {!showWithdraw && (
        <div className="grid grid-cols-2 gap-3">
          <Button className="rounded-xl h-12 gap-2 font-bold"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}
            onClick={() => { setShowWithdraw(true); setWithdrawSuccess(false); }}
            disabled={!wallet || (wallet?.balance_available || 0) < 1000}>
            <ArrowDownCircle className="w-4 h-4" /> Retirer mes gains
          </Button>
          <Link to="/ActivatorOpportunities" className="block">
            <Button variant="outline" className="w-full rounded-xl h-12 gap-2 border-white/15 text-white">
              <Plus className="w-4 h-4" /> Rejoindre une campagne
            </Button>
          </Link>
        </div>
      )}

      {/* Message si solde insuffisant */}
      {!showWithdraw && wallet && (wallet?.balance_available || 0) < 1000 && (
        <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400">Minimum 1 000 XOF requis pour un retrait. Participez à des campagnes pour accumuler des récompenses.</p>
        </div>
      )}

      {/* Succès retrait */}
      {withdrawSuccess && (
        <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-300">Demande de retrait envoyée ✓</p>
            <p className="text-xs text-slate-400">Traitement sous 24-48h ouvrables.</p>
          </div>
        </div>
      )}

      {/* Formulaire retrait */}
      {showWithdraw && wallet && (
        <WithdrawForm
          wallet={wallet}
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => { setShowWithdraw(false); setWithdrawSuccess(true); }}
        />
      )}

      {/* Historique */}
      <div>
        <h2 className="text-white font-bold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-400" /> Historique des transactions
        </h2>

        {loadingW ? (
          <div className="space-y-2">{Array(4).fill(0).map((_, i) =>
            <Skeleton key={i} className="h-16 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
          )}</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <Gift className="w-8 h-8 mx-auto mb-2 opacity-20 text-orange-400" />
            <p className="text-slate-500 text-sm">Aucune transaction pour l'instant</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, i) => {
              const Icon = tx.icon;
              return (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${tx.color}18` }}>
                      <Icon className="w-4 h-4" style={{ color: tx.color }} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium leading-tight">{tx.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-slate-500 text-xs">{tx.date ? new Date(tx.date).toLocaleDateString('fr-FR') : '—'}</p>
                        {tx.tag && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{ background: `${tx.color}18`, color: tx.color }}>
                            {tx.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-sm flex-shrink-0" style={{ color: tx.amount >= 0 ? '#10b981' : '#94a3b8' }}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount?.toLocaleString()} XOF
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Note légale bas de page */}
      <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-400">Modèle économique</strong> — Vous êtes un <em>activateur commercial</em> qui participe à des campagnes de revente de produits réels. 
          Vos récompenses sont des commissions sur ventes effectives, pas des rendements financiers. 
          Aucune promesse de gain garantie.
        </p>
      </div>
    </div>
  );
}