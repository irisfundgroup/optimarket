import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ArrowDownCircle, Plus, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import WalletCard from '@/components/activator/WalletCard';

const STATUS_CFG = {
  pending:    { icon: Clock,        color: '#f59e0b', label: 'En attente' },
  processing: { icon: Clock,        color: '#38bdf8', label: 'En cours' },
  completed:  { icon: CheckCircle2, color: '#10b981', label: 'Complété' },
  rejected:   { icon: XCircle,      color: '#ef4444', label: 'Rejeté' },
};

export default function ActivatorWallet() {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [phone, setPhone] = useState('');
  const queryClient = useQueryClient();

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
    queryFn: () => base44.entities.ActivatorInvestment.filter({ activator_email: user?.email }, '-created_date', 20),
    enabled: !!user?.email,
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(withdrawAmount);
      await base44.entities.ActivatorWithdrawal.create({
        activator_email: user.email,
        amount,
        currency: 'XOF',
        method: 'mobile_money',
        phone_or_account: phone,
        status: 'pending',
      });
      if (wallet) {
        await base44.entities.ActivatorWallet.update(wallet.id, {
          balance_available: Math.max(0, (wallet.balance_available || 0) - amount),
          balance_pending_withdrawal: (wallet.balance_pending_withdrawal || 0) + amount,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myWallet'] });
      queryClient.invalidateQueries({ queryKey: ['myWithdrawals'] });
      setShowWithdraw(false);
      setWithdrawAmount('');
      setPhone('');
    },
  });

  // Historique combiné (investments + withdrawals)
  const transactions = [
    ...investments.map(inv => ({
    date: inv.created_date,
    label: `Participation: ${inv.opportunity_title}`,
    amount: -inv.amount_invested,
    color: '#ef4444',
    type: 'invest',
    })),
    ...investments.filter(i => i.status === 'completed').map(inv => ({
    date: inv.end_date,
    label: `Commission: ${inv.opportunity_title}`,
    amount: inv.actual_profit || inv.expected_return_amount,
    color: '#10b981',
    type: 'gain',
    })),
    ...withdrawals.map(w => ({
      date: w.created_date,
      label: `Retrait Mobile Money`,
      amount: -w.amount,
      color: '#f59e0b',
      type: 'withdraw',
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/ActivatorDashboard"><Button variant="ghost" size="icon" className="rounded-xl text-white"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-xl font-black text-white">Mon Wallet</h1>
      </div>

      {loadingWallet ? <Skeleton className="h-40 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} /> : (
        <WalletCard wallet={wallet} />
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button className="rounded-xl h-12 gap-2 font-bold" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}
          onClick={() => setShowWithdraw(!showWithdraw)}>
          <ArrowDownCircle className="w-4 h-4" /> Retirer mes gains
        </Button>
        <Link to="/ActivatorOpportunities" className="block">
          <Button variant="outline" className="w-full rounded-xl h-12 gap-2 border-white/15 text-white">
            <Plus className="w-4 h-4" /> Rejoindre une campagne
          </Button>
        </Link>
      </div>

      {/* Formulaire retrait */}
      {showWithdraw && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <h3 className="text-white font-bold">Demande de retrait</h3>
          <div>
            <Label className="text-slate-300 text-sm mb-1.5 block">Montant (XOF)</Label>
            <Input type="number" placeholder="Ex: 50000" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
              className="rounded-xl text-white bg-white/5 border-white/15" />
            <p className="text-xs text-slate-500 mt-1">Disponible: {(wallet?.balance_available || 0).toLocaleString()} XOF</p>
          </div>
          <div>
            <Label className="text-slate-300 text-sm mb-1.5 block">Numéro Mobile Money</Label>
            <Input type="tel" placeholder="+225 07 00 00 00" value={phone} onChange={e => setPhone(e.target.value)}
              className="rounded-xl text-white bg-white/5 border-white/15" />
          </div>
          <p className="text-xs text-slate-400">Délai de traitement: 24-48h ouvrables</p>
          <Button className="w-full rounded-xl font-bold" style={{ background: '#f59e0b', color: '#000' }}
            onClick={() => withdrawMutation.mutate()}
            disabled={!withdrawAmount || !phone || parseFloat(withdrawAmount) <= 0 || withdrawMutation.isPending}>
            {withdrawMutation.isPending ? 'Envoi...' : 'Confirmer le retrait'}
          </Button>
        </div>
      )}

      {/* Historique */}
      <div>
        <h2 className="text-white font-bold mb-3">Historique des transactions</h2>
        {loadingW ? (
          <div className="space-y-2">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }} />)}</div>
        ) : transactions.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">Aucune transaction</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-white text-sm font-medium">{tx.label}</p>
                  <p className="text-slate-500 text-xs">{tx.date ? new Date(tx.date).toLocaleDateString('fr-FR') : '—'}</p>
                </div>
                <span className="font-bold text-sm" style={{ color: tx.amount >= 0 ? '#10b981' : '#ef4444' }}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount?.toLocaleString()} XOF
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}