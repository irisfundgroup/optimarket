import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Crown, Check, Zap, Lock, CreditCard, Flame, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';

const PLANS = [
  {
    id: 'single_action',
    name: '1 Action',
    price: 0.99,
    priceLabel: '0,99€',
    credits: 1,
    period: '',
    features: ['1 opportunité premium', '1 contact prestataire', '1 annonce boostée'],
    gradient: 'from-slate-600 to-slate-700',
    border: 'border-slate-200',
    btnClass: 'bg-slate-900 hover:bg-slate-800',
  },
  {
    id: 'pack_10',
    name: 'Pack 10 Actions',
    price: 7.99,
    priceLabel: '7,99€',
    credits: 10,
    period: '',
    features: ['10 actions premium', 'Économisez 20%', 'Alertes prioritaires', 'Score IA avancé'],
    gradient: 'from-orange-500 to-amber-500',
    border: 'border-orange-300',
    btnClass: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90',
    popular: true,
  },
  {
    id: 'pass_24h',
    name: 'Pass 24 heures',
    price: 4.99,
    priceLabel: '4,99€',
    credits: 999,
    period: '/24h',
    features: ['Actions illimitées 24h', 'Toutes les opportunités', 'Contacts illimités', 'Alertes VIP'],
    gradient: 'from-blue-600 to-blue-700',
    border: 'border-blue-200',
    btnClass: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    id: 'monthly',
    name: 'Abonnement Mensuel',
    price: 19.99,
    priceLabel: '19,99€',
    credits: 9999,
    period: '/mois',
    features: ['Actions illimitées 30j', 'Alertes VIP exclusives', 'Support prioritaire', 'Ventes flash avant tout le monde', 'Statistiques avancées'],
    gradient: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-200',
    btnClass: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90',
    badge: '⭐ Meilleure valeur',
  },
];

export default function Subscription() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: currentSub } = useQuery({
    queryKey: ['mySubscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user?.email, status: 'active' }, '-created_date', 1).then(r => r[0]),
    enabled: !!user?.email,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (plan) => {
      await base44.entities.Payment.create({
        user_email: user.email,
        amount: plan.price,
        type: plan.id === 'monthly' ? 'subscription' : 'single_action',
        status: 'completed',
        description: `Achat: ${plan.name}`,
      });
      const expiresAt = plan.id === 'pass_24h'
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : plan.id === 'monthly'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null;
      return base44.entities.Subscription.create({
        user_email: user.email,
        plan: plan.id,
        credits_remaining: plan.credits,
        status: 'active',
        amount_paid: plan.price,
        ...(expiresAt && { expires_at: expiresAt }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mySubscription'] }),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 mb-4">
          <Crown className="w-4 h-4 text-orange-500" />
          <span className="text-orange-700 text-sm font-semibold">Accès Premium</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-3">Choisissez votre plan</h1>
        <p className="text-slate-500 max-w-md mx-auto">Débloquez les opportunités premium, contactez les meilleurs prestataires et maximisez vos revenus</p>
      </div>

      {/* Current subscription */}
      {currentSub && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 mb-8 text-white flex items-center justify-between shadow-xl shadow-orange-200">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6" />
            <div>
              <p className="font-bold">Plan actuel : {currentSub.plan}</p>
              <p className="text-sm text-white/80">{currentSub.credits_remaining >= 999 ? 'Illimité' : `${currentSub.credits_remaining} crédit(s) restant(s)`}</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-0 text-sm">Actif ✓</Badge>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {PLANS.map(plan => (
          <div key={plan.id} className={`relative bg-white rounded-3xl border-2 p-6 flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 ${plan.border}`}>
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">🔥 Le plus populaire</span>
              </div>
            )}
            {plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">{plan.badge}</span>
              </div>
            )}

            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4 shadow-lg`}>
              <CreditCard className="w-6 h-6 text-white" />
            </div>

            <h3 className="font-black text-slate-900 text-lg mb-1">{plan.name}</h3>
            <div className="flex items-end gap-1 mb-5">
              <span className="text-4xl font-black text-slate-900">{plan.priceLabel}</span>
              <span className="text-slate-400 text-sm mb-1">{plan.period}</span>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <Button onClick={() => subscribeMutation.mutate(plan)} disabled={subscribeMutation.isPending}
              className={`w-full rounded-xl h-11 text-white font-semibold shadow-lg gap-2 ${plan.btnClass}`}>
              {t('subscribe')} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white">
        <h2 className="font-black text-xl mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-orange-400" /> Ce que vous débloquez
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: '🎯', text: 'Détails complets des opportunités premium' },
            { icon: '🚀', text: 'Publication d\'annonces boostées' },
            { icon: '⚡', text: 'Accès aux ventes flash en avant-première' },
            { icon: '📞', text: 'Coordonnées directes des prestataires' },
            { icon: '🔔', text: 'Alertes VIP personnalisées' },
            { icon: '📊', text: 'Score IA et statistiques avancées' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm text-slate-300">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}