import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, CreditCard, Wallet, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LEVELS, getLevelFromEarnings } from '@/components/activator/LevelBadge';

export default function ActivatorActivate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const opportunityId = urlParams.get('opportunityId');

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [confirmed, setConfirmed] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: opportunity } = useQuery({
    queryKey: ['opportunity', opportunityId],
    queryFn: () => base44.entities.Opportunity.filter({ id: opportunityId }).then(r => r[0]),
    enabled: !!opportunityId,
  });

  const { data: wallet } = useQuery({
    queryKey: ['myWallet', user?.email],
    queryFn: () => base44.entities.ActivatorWallet.filter({ user_email: user?.email }, '-created_date', 1).then(r => r[0]),
    enabled: !!user?.email,
  });

  const totalEarned = wallet?.total_earned || 0;
  const level = getLevelFromEarnings(totalEarned);
  const lvlConfig = LEVELS[level];
  const feeRate = lvlConfig.fees / 100;

  const amountNum = parseFloat(amount) || 0;
  const returnPercent = opportunity?.potential_margin || 15;
  const durationDays = 14;
  const fees = amountNum * feeRate;
  const gains = (amountNum - fees) * (returnPercent / 100);
  const totalReturn = amountNum + gains;

  const MIN_INVEST = 25000;
  const MAX_INVEST = lvlConfig.maxInvest;

  const activateMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      // Créer l'investissement
      await base44.entities.ActivatorInvestment.create({
        activator_email: user.email,
        opportunity_id: opportunity.id,
        opportunity_title: opportunity.title,
        amount_invested: amountNum,
        currency: 'XOF',
        expected_return_percent: returnPercent,
        expected_return_amount: gains,
        duration_days: durationDays,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
        payment_method: paymentMethod,
        fees_paid: fees,
      });

      // Mettre à jour ou créer le wallet
      if (wallet) {
        await base44.entities.ActivatorWallet.update(wallet.id, {
          balance_in_opportunities: (wallet.balance_in_opportunities || 0) + amountNum,
          balance_available: Math.max(0, (wallet.balance_available || 0) - amountNum),
          lifetime_investments: (wallet.lifetime_investments || 0) + 1,
        });
      } else {
        await base44.entities.ActivatorWallet.create({
          user_email: user.email,
          balance_in_opportunities: amountNum,
          balance_available: 0,
          lifetime_investments: 1,
        });
      }

      // Mettre à jour le compteur d'opportunité
      await base44.entities.Opportunity.update(opportunity.id, {
        claims_count: (opportunity.claims_count || 0) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myWallet'] });
      queryClient.invalidateQueries({ queryKey: ['myInvestments'] });
      setConfirmed(true);
    },
  });

  if (confirmed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981' }}>
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Participation confirmée !</h2>
        <p className="text-slate-400 mb-2">Pack de participation: <span className="text-white font-bold">{amountNum.toLocaleString()} XOF</span></p>
        <p className="text-slate-400 mb-6">Commission estimée dans {durationDays} jours: <span className="text-emerald-400 font-bold">+{gains.toFixed(0)} XOF</span> <span className="text-slate-500 text-xs">(variable selon ventes)</span></p>
        <div className="flex gap-3 justify-center">
          <Link to="/ActivatorDashboard"><Button className="rounded-xl" style={{ background: '#f59e0b', color: '#000' }}>Mon Dashboard</Button></Link>
          <Link to="/ActivatorOpportunities"><Button variant="outline" className="rounded-xl text-white border-white/20">Autres opportunités</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ActivatorOpportunities"><Button variant="ghost" size="icon" className="rounded-xl text-white"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-lg font-bold text-white">Rejoindre la campagne</h1>
      </div>

      {opportunity && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <h2 className="text-white font-bold mb-1">{opportunity.title}</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-emerald-400 font-bold">+{returnPercent}% de commission</span>
            <span className="text-slate-400">sur {durationDays} jours</span>
            <span className="text-slate-400">Score: {opportunity.score}/100</span>
          </div>
        </div>
      )}

      {/* Montant */}
      <div className="space-y-4 mb-6">
        <div>
          <Label className="text-white text-sm mb-2 block">Montant du pack de participation (XOF)</Label>
          <Input
            type="number"
            placeholder={`Min ${MIN_INVEST.toLocaleString()} — Max ${MAX_INVEST.toLocaleString()}`}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="rounded-xl text-white bg-white/5 border-white/15 text-lg font-bold"
          />
          <p className="text-xs text-slate-500 mt-1">Niveau {level.toUpperCase()}: pack max {MAX_INVEST.toLocaleString()} XOF · Commission plateforme: {lvlConfig.fees}%</p>
        </div>

        {/* Calcul */}
        {amountNum >= MIN_INVEST && (
          <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Pack de participation</span>
              <span className="text-white font-medium">{amountNum.toLocaleString()} XOF</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Commission plateforme ({lvlConfig.fees}%)</span>
              <span className="text-red-400">-{fees.toFixed(0)} XOF</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Commission estimée (+{returnPercent}%)*</span>
              <span className="text-emerald-400 font-bold">+{gains.toFixed(0)} XOF</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between">
              <span className="text-slate-300 font-semibold">Total estimé après {durationDays}j</span>
              <span className="text-white font-black text-lg">{totalReturn.toFixed(0)} XOF</span>
            </div>
            <p className="text-[10px] text-slate-500">* Les commissions sont variables et liées aux ventes réelles. Aucun gain n'est garanti.</p>
          </div>
        )}

        {/* Méthode paiement */}
        <div>
          <Label className="text-white text-sm mb-2 block">Méthode de paiement</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'wallet', label: 'Wallet', icon: Wallet },
              { key: 'mobile_money', label: 'Mobile Money', icon: CreditCard },
              { key: 'card', label: 'Carte', icon: CreditCard },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setPaymentMethod(key)}
                className="rounded-xl p-3 text-center transition-all"
                style={{
                  background: paymentMethod === key ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                  border: paymentMethod === key ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  color: paymentMethod === key ? '#f59e0b' : '#94a3b8',
                }}>
                <Icon className="w-4 h-4 mx-auto mb-1" />
                <p className="text-[10px] font-medium">{label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Validation */}
      {amountNum < MIN_INVEST && amountNum > 0 && (
        <p className="text-red-400 text-xs mb-3">Montant minimum: {MIN_INVEST.toLocaleString()} XOF</p>
      )}
      {amountNum > MAX_INVEST && (
        <p className="text-red-400 text-xs mb-3">Montant maximum pour votre niveau: {MAX_INVEST.toLocaleString()} XOF</p>
      )}

      <Button
        className="w-full rounded-xl h-12 text-base font-bold gap-2"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}
        onClick={() => activateMutation.mutate()}
        disabled={amountNum < MIN_INVEST || amountNum > MAX_INVEST || activateMutation.isPending}
      >
        {activateMutation.isPending ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Participation en cours...</>
        ) : (
          <><Calculator className="w-5 h-5" /> Confirmer la participation</>
        )}
      </Button>
    </div>
  );
}