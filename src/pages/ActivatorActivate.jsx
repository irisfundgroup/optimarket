import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calculator, CreditCard, Wallet, Loader2, CheckCircle2,
  Shield, AlertTriangle, Zap, Lock, Truck, ArrowRight, Info, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LEVELS, getLevelFromEarnings } from '@/components/activator/LevelBadge';

// ── Méthodes de paiement ───────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    key: 'platform_now',
    label: 'Payer maintenant',
    sublabel: 'Wave · Orange · MTN · Carte',
    icon: CreditCard,
    color: '#f59e0b',
    description: 'Commission plateforme payée immédiatement via GeniusPay. Campagne activée instantanément.',
    risk: null,
  },
  {
    key: 'delivery',
    label: 'À la livraison',
    sublabel: 'Garantie bloquée en wallet',
    icon: Truck,
    color: '#38bdf8',
    description: 'Une garantie est prélevée et bloquée dans votre wallet. Elle est libérée après livraison confirmée.',
    risk: 'Une garantie de 20% du pack est requise.',
  },
];

// ── Étapes du processus ────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = [
    { n: 1, label: 'Campagne' },
    { n: 2, label: 'Montant' },
    { n: 3, label: 'Paiement' },
    { n: 4, label: 'Confirmation' },
  ];
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-all"
              style={{
                background: step >= s.n ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                color: step >= s.n ? '#000' : '#475569',
              }}>
              {step > s.n ? '✓' : s.n}
            </div>
            <span className="text-[10px] font-medium hidden sm:block" style={{ color: step >= s.n ? '#fbbf24' : '#475569' }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-px" style={{ background: step > s.n ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.06)' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Résumé financier ───────────────────────────────────────────────────────────
function FinancialSummary({ amountNum, fees, gains, returnPercent, durationDays, paymentMethod, guarantee }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Calculator className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-xs font-bold text-white">Récapitulatif financier</span>
      </div>
      <div className="p-4 space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Pack d'activation</span>
          <span className="text-white font-medium">{amountNum.toLocaleString()} XOF</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-slate-400 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Commission plateforme
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
              Payée en premier
            </span>
          </span>
          <span className="text-red-400 font-bold">-{fees.toFixed(0)} XOF</span>
        </div>
        {paymentMethod === 'delivery' && (
          <div className="flex justify-between text-sm">
            <span className="text-blue-300 flex items-center gap-1"><Shield className="w-3 h-3" /> Garantie bloquée (20%)</span>
            <span className="text-blue-300 font-bold">-{guarantee.toFixed(0)} XOF</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Commission estimée (+{returnPercent}%)*</span>
          <span className="text-emerald-400 font-bold">+{gains.toFixed(0)} XOF</span>
        </div>
        <div className="border-t border-white/8 pt-2.5 flex justify-between">
          <span className="text-slate-300 font-semibold text-sm">Retour estimé après {durationDays}j</span>
          <span className="text-white font-black text-base">{(amountNum + gains).toFixed(0)} XOF</span>
        </div>
        <p className="text-[10px] text-slate-500 pt-1">* Commissions variables, liées aux ventes réelles. Aucun gain garanti.</p>
      </div>
    </div>
  );
}

export default function ActivatorActivate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const opportunityId = urlParams.get('opportunityId');
  const paymentStatus = urlParams.get('payment_status');
  const paymentRef = urlParams.get('ref');

  const [activationMode, setActivationMode] = useState(null); // 'own' ou 'resell'
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('platform_now');
  const [confirmed, setConfirmed] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [resellGenerating, setResellGenerating] = useState(false);

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
  const fees = amountNum * feeRate;              // Commission plateforme
  const guarantee = amountNum * 0.20;            // Garantie livraison (20%)
  const gains = (amountNum - fees) * (returnPercent / 100);

  const MIN_ACTIVATE = 10000;
  const MAX_ACTIVATE = lvlConfig.maxInvest;

  // ── Vérification retour GeniusPay ─────────────────────────────────────────
  useEffect(() => {
    if (paymentStatus === 'success' && paymentRef && opportunityId) {
      setVerifying(true);
      window.history.replaceState({}, '', `/ActivatorActivate?opportunityId=${opportunityId}`);
      // Après paiement GeniusPay confirmé → enregistrer la participation
      (async () => {
        try {
          const now = new Date();
          const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
          const storedAmount = parseFloat(localStorage.getItem('_act_amount') || '0');
          const storedMethod = localStorage.getItem('_act_method') || 'platform_now';
          const storedFees = parseFloat(localStorage.getItem('_act_fees') || '0');
          const storedGains = parseFloat(localStorage.getItem('_act_gains') || '0');
          const storedGuarantee = parseFloat(localStorage.getItem('_act_guarantee') || '0');
          const opp = await base44.entities.Opportunity.filter({ id: opportunityId }).then(r => r[0]);

          if (storedAmount > 0 && opp) {
            await base44.entities.ActivatorInvestment.create({
              activator_email: user?.email || '',
              opportunity_id: opp.id,
              opportunity_title: opp.title,
              amount_invested: storedAmount,
              currency: 'XOF',
              expected_return_percent: opp.potential_margin || 15,
              expected_return_amount: storedGains,
              duration_days: durationDays,
              start_date: now.toISOString(),
              end_date: endDate.toISOString(),
              status: 'active',
              payment_method: storedMethod,
              fees_paid: storedFees,
            });

            // Mise à jour wallet
            const w = await base44.entities.ActivatorWallet.filter({ user_email: user?.email }, '-created_date', 1).then(r => r[0]);
            if (w) {
              await base44.entities.ActivatorWallet.update(w.id, {
                balance_in_opportunities: (w.balance_in_opportunities || 0) + storedAmount,
                balance_available: Math.max(0, (w.balance_available || 0) - (storedMethod === 'delivery' ? storedGuarantee : 0)),
                lifetime_investments: (w.lifetime_investments || 0) + 1,
              });
            } else {
              await base44.entities.ActivatorWallet.create({
                user_email: user?.email,
                balance_in_opportunities: storedAmount,
                balance_available: 0,
                lifetime_investments: 1,
              });
            }

            await base44.entities.Opportunity.update(opp.id, { claims_count: (opp.claims_count || 0) + 1 });
            localStorage.removeItem('_act_amount');
            localStorage.removeItem('_act_method');
            localStorage.removeItem('_act_fees');
            localStorage.removeItem('_act_gains');
            localStorage.removeItem('_act_guarantee');
          }
          setConfirmed(true);
        } catch (e) {
          console.error(e);
        } finally {
          setVerifying(false);
          queryClient.invalidateQueries({ queryKey: ['myWallet'] });
          queryClient.invalidateQueries({ queryKey: ['myInvestments'] });
        }
      })();
    } else if (paymentStatus === 'cancelled') {
      window.history.replaceState({}, '', `/ActivatorActivate?opportunityId=${opportunityId}`);
    }
  }, [paymentStatus]);

  // ── Lancer le paiement GeniusPay (commission plateforme) ──────────────────
  const handleConfirm = async () => {
    if (!opportunity || !user) return;

    // Sauvegarder les données pour après le retour GeniusPay
    localStorage.setItem('_act_amount', String(amountNum));
    localStorage.setItem('_act_method', paymentMethod);
    localStorage.setItem('_act_fees', String(fees));
    localStorage.setItem('_act_gains', String(gains));
    localStorage.setItem('_act_guarantee', String(guarantee));

    const origin = window.location.origin;
    const successUrl = `${origin}/ActivatorActivate?opportunityId=${opportunityId}&payment_status=success&ref=genius`;
    const errorUrl   = `${origin}/ActivatorActivate?opportunityId=${opportunityId}&payment_status=cancelled`;

    // Montant à payer maintenant :
    // - platform_now → commission plateforme uniquement (fees)
    // - delivery → garantie bloquée (guarantee), commission sera déduite à la livraison
    const amountToPay = paymentMethod === 'delivery' ? guarantee : fees;
    const description = paymentMethod === 'delivery'
      ? `Garantie activation campagne: ${opportunity.title}`
      : `Commission plateforme: ${opportunity.title}`;

    const res = await base44.functions.invoke('payment', {
      action: 'buy_item',
      item_type: 'activation',
      item_id: opportunity.id,
      item_title: description,
      amount: Math.max(200, Math.round(amountToPay)), // minimum GeniusPay = 200 XOF
      currency: 'XOF',
      success_url_override: successUrl,
      error_url_override: errorUrl,
    });

    if (res.data?.payment_url) {
      window.location.href = res.data.payment_url;
    }
  };

  // ── Écran de vérification ──────────────────────────────────────────────────
  if (verifying) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Loader2 className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
        <p className="text-white font-bold">Vérification du paiement...</p>
        <p className="text-slate-400 text-sm mt-2">Activation de votre participation en cours</p>
      </div>
    );
  }

  // ── Écran succès ───────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981' }}>
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Participation confirmée !</h2>
        <p className="text-slate-400 mb-1">Pack activé: <span className="text-white font-bold">{parseFloat(localStorage.getItem('_act_amount') || amountNum) .toLocaleString()} XOF</span></p>
        <p className="text-slate-400 mb-2">Récompense estimée dans {durationDays}j: <span className="text-emerald-400 font-bold">+{gains.toFixed(0)} XOF</span></p>
        <p className="text-xs text-slate-500 mb-8">Commission plateforme déjà réglée ✓ · Campagne active</p>
        <div className="flex gap-3 justify-center">
          <Link to="/ActivatorDashboard">
            <Button className="rounded-xl" style={{ background: '#f59e0b', color: '#000' }}>Mon Dashboard</Button>
          </Link>
          <Link to="/ActivatorOpportunities">
            <Button variant="outline" className="rounded-xl text-white border-white/20">Autres campagnes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isValidAmount = amountNum >= MIN_ACTIVATE && amountNum <= MAX_ACTIVATE;

  return (
    <div className="max-w-lg mx-auto px-4 md:px-8 py-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ActivatorOpportunities">
          <Button variant="ghost" size="icon" className="rounded-xl text-white"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white">Rejoindre la campagne</h1>
          <p className="text-xs text-slate-500">Activation commerciale · Récompense sur ventes réelles</p>
        </div>
      </div>

      {/* ── Sélecteur de mode d'activation ── */}
      {!activationMode && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Comment voulez-vous monétiser cette opportunité ?</h2>
            <p className="text-slate-400 text-sm">Choisissez votre stratégie de revenu</p>
          </div>

          <button onClick={() => setActivationMode('own')}
            className="w-full rounded-2xl p-5 text-left transition-all"
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '2px solid rgba(99,102,241,0.3)',
            }}
            onMouseEnter={(e) => {e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; e.currentTarget.style.transform = 'translateY(-2px)'}}
            onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'translateY(0)'}}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                <TrendingUp className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-base mb-1">📊 Revendre manuellement</p>
                <p className="text-slate-400 text-xs">Vous gardez la main sur la distribution. Revenu maximum, mais nécessite plus d'efforts.</p>
                <p className="text-indigo-300 font-semibold text-xs mt-2">Commissions jusqu'à +30%</p>
              </div>
            </div>
          </button>

          <button onClick={() => setActivationMode('resell')}
            className="w-full rounded-2xl p-5 text-left transition-all"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '2px solid rgba(16,185,129,0.3)',
            }}
            onMouseEnter={(e) => {e.currentTarget.style.borderColor = 'rgba(16,185,129,0.6)'; e.currentTarget.style.transform = 'translateY(-2px)'}}
            onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; e.currentTarget.style.transform = 'translateY(0)'}}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-base mb-1">⚡ Mode automatisé (IA)</p>
                <p className="text-slate-400 text-xs">L'IA génère automatiquement annonces, prix et stratégie. Revenu passif avec efforts minimes.</p>
                <p className="text-emerald-300 font-semibold text-xs mt-2">Commissions +18%, revenus garantis</p>
              </div>
            </div>
          </button>

          <button onClick={() => setActivationMode(false)}
            variant="outline"
            className="w-full py-2.5 text-slate-400 rounded-xl border border-white/15 hover:text-white transition-all">
            Annuler
          </button>
        </div>
      )}

      {activationMode && <StepIndicator step={step} />}

      {/* ── Étape 1 : Info campagne ── */}
      {activationMode && step === 1 && (
        <div className="space-y-4">
          {opportunity && (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <h2 className="text-white font-bold mb-3">{opportunity.title}</h2>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="rounded-xl p-2" style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <p className="text-emerald-400 font-black text-lg">+{returnPercent}%</p>
                  <p className="text-slate-500 text-[10px]">Commission</p>
                </div>
                <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-white font-bold">{durationDays}j</p>
                  <p className="text-slate-500 text-[10px]">Durée</p>
                </div>
                <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-white font-bold">{opportunity.score}/100</p>
                  <p className="text-slate-500 text-[10px]">Score IA</p>
                </div>
              </div>
              {opportunity.description && (
                <p className="text-slate-400 text-xs">{opportunity.description}</p>
              )}
            </div>
          )}

          {/* Règles de sécurité */}
          <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <p className="text-indigo-300 font-bold text-xs flex items-center gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5" /> Comment ça fonctionne
            </p>
            {[
              { icon: '1️⃣', text: 'Vous choisissez un pack d\'activation et un mode de paiement.' },
              { icon: '2️⃣', text: 'La commission plateforme est réglée en premier (garantie de bonne foi).' },
              { icon: '3️⃣', text: 'Vous participez activement à la revente du produit.' },
              { icon: '4️⃣', text: 'Vos récompenses commerciales sont créditées après ventes confirmées.' },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">{r.icon}</span>
                <p className="text-xs text-slate-400">{r.text}</p>
              </div>
            ))}
          </div>

          <Button className="w-full rounded-xl h-11 font-bold gap-2"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}
            onClick={() => setStep(2)}>
            Choisir mon pack <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* ── Étape 2 : Montant ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label className="text-white text-sm mb-2 block">Montant du pack d'activation (XOF)</Label>
            <Input
              type="number"
              placeholder={`Min ${MIN_ACTIVATE.toLocaleString()} XOF`}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="rounded-xl text-white bg-white/5 border-white/15 text-lg font-bold"
            />
            <p className="text-xs text-slate-500 mt-1">
              Niveau {level.toUpperCase()} · Max {MAX_ACTIVATE.toLocaleString()} XOF · Commission plateforme: {lvlConfig.fees}%
            </p>
          </div>

          {amountNum > 0 && amountNum < MIN_ACTIVATE && (
            <p className="text-red-400 text-xs flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Minimum: {MIN_ACTIVATE.toLocaleString()} XOF</p>
          )}
          {amountNum > MAX_ACTIVATE && (
            <p className="text-red-400 text-xs flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Maximum pour votre niveau: {MAX_ACTIVATE.toLocaleString()} XOF</p>
          )}

          {isValidAmount && (
            <FinancialSummary
              amountNum={amountNum}
              fees={fees}
              gains={gains}
              returnPercent={returnPercent}
              durationDays={durationDays}
              paymentMethod={paymentMethod}
              guarantee={guarantee}
            />
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl border-white/15 text-white" onClick={() => setStep(1)}>Retour</Button>
            <Button className="flex-1 rounded-xl font-bold gap-2"
              style={{ background: isValidAmount ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)', color: isValidAmount ? '#000' : '#475569' }}
              disabled={!isValidAmount}
              onClick={() => setStep(3)}>
              Continuer <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Étape 3 : Méthode de paiement ── */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <p className="text-white font-bold text-sm mb-3">Mode de paiement de la commission</p>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(m => {
                const Icon = m.icon;
                const selected = paymentMethod === m.key;
                return (
                  <button key={m.key} onClick={() => setPaymentMethod(m.key)}
                    className="w-full rounded-2xl p-4 text-left transition-all"
                    style={{
                      background: selected ? `${m.color}12` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selected ? m.color + '50' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${m.color}18` }}>
                        <Icon className="w-4 h-4" style={{ color: m.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{m.label}</p>
                        <p className="text-[10px] text-slate-400">{m.sublabel}</p>
                      </div>
                      <div className="ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                        style={{ borderColor: selected ? m.color : '#475569' }}>
                        {selected && <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 ml-11">{m.description}</p>
                    {m.risk && selected && (
                      <div className="mt-2 ml-11 flex items-center gap-1.5 text-[10px] text-blue-300">
                        <Info className="w-3 h-3 flex-shrink-0" />
                        {m.risk} → <strong>{guarantee.toFixed(0)} XOF bloqués</strong>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Montant à payer maintenant */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-orange-400" />
              <p className="text-sm font-bold text-white">À payer maintenant via GeniusPay</p>
            </div>
            <p className="text-3xl font-black text-orange-300">
              {(paymentMethod === 'delivery' ? guarantee : fees).toFixed(0)} XOF
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {paymentMethod === 'delivery'
                ? 'Garantie de bonne foi (libérée après livraison confirmée)'
                : 'Commission plateforme (non remboursable après activation)'}
            </p>
          </div>

          {/* CGU acceptation */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-orange-400" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Je comprends que mes <strong className="text-white">récompenses commerciales</strong> dépendent des ventes réelles.
              Aucun gain n'est garanti. La commission plateforme est due avant toute activation.
              Je m'engage à participer activement à la campagne.
            </p>
          </label>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl border-white/15 text-white" onClick={() => setStep(2)}>Retour</Button>
            <Button
              className="flex-1 rounded-xl font-bold gap-2 h-11"
              style={{
                background: termsAccepted ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)',
                color: termsAccepted ? '#000' : '#475569'
              }}
              disabled={!termsAccepted}
              onClick={() => setStep(4)}>
              <Shield className="w-4 h-4" /> Passer au paiement
            </Button>
          </div>
        </div>
      )}

      {/* ── Étape 4 : Confirmation finale ── */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white font-bold text-center mb-4">Récapitulatif final</p>

            {[
              { label: 'Campagne', value: opportunity?.title || '—' },
              { label: 'Pack d\'activation', value: `${amountNum.toLocaleString()} XOF` },
              { label: 'Mode', value: paymentMethod === 'delivery' ? 'Paiement à la livraison' : 'Paiement immédiat' },
              { label: 'À régler maintenant', value: `${(paymentMethod === 'delivery' ? guarantee : fees).toFixed(0)} XOF`, highlight: true },
              { label: 'Commission estimée', value: `+${gains.toFixed(0)} XOF (variable)`, green: true },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2" style={{ borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span className="text-slate-400 text-sm">{row.label}</span>
                <span className="font-bold text-sm" style={{ color: row.highlight ? '#fbbf24' : row.green ? '#10b981' : '#fff' }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-3 flex items-start gap-2" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">
              Vous allez être redirigé vers <strong>GeniusPay</strong> pour régler la commission/garantie.
              La participation n'est activée qu'après confirmation du paiement.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl border-white/15 text-white" onClick={() => setStep(3)}>Retour</Button>
            <Button
              className="flex-1 rounded-xl font-bold gap-2 h-11"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}
              onClick={handleConfirm}>
              <Zap className="w-4 h-4" /> Payer via GeniusPay
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}