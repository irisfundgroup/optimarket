import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Crown, Check, Zap, Lock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';

const PLANS = [
  {
    id: 'single_action',
    name: '1 Action',
    price: 0.99,
    credits: 1,
    features: ['Voir 1 opportunité premium', 'Débloquer 1 contact', 'Publier 1 annonce premium'],
    color: 'from-slate-600 to-slate-700',
    popular: false,
  },
  {
    id: 'pack_10',
    name: 'Pack 10 Actions',
    price: 7.99,
    credits: 10,
    features: ['10 actions premium', 'Économisez 20%', 'Alertes prioritaires'],
    color: 'from-blue-600 to-blue-700',
    popular: true,
  },
  {
    id: 'pass_24h',
    name: 'Pass 24h',
    price: 4.99,
    credits: 999,
    features: ['Actions illimitées 24h', 'Toutes les opportunités', 'Tous les contacts'],
    color: 'from-orange-500 to-orange-600',
    popular: false,
  },
  {
    id: 'monthly',
    name: 'Mensuel',
    price: 19.99,
    credits: 999,
    features: ['Actions illimitées 30j', 'Alertes VIP', 'Support prioritaire', 'Ventes flash exclusives'],
    color: 'from-emerald-500 to-emerald-600',
    popular: false,
  },
];

export default function Subscription() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: currentSub } = useQuery({
    queryKey: ['mySubscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user?.email, status: 'active' }, '-created_date', 1).then(r => r[0]),
    enabled: !!user?.email,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (plan) => {
      // Create payment record
      await base44.entities.Payment.create({
        user_email: user.email,
        amount: plan.price,
        type: 'subscription',
        status: 'completed',
        description: `Achat: ${plan.name}`,
      });

      // Create/update subscription
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
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{t('select_plan')}</h1>
        <p className="text-slate-500 mt-2">Débloquez les fonctionnalités premium pour maximiser vos opportunités</p>
      </div>

      {currentSub && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 mb-8 text-white flex items-center justify-between">
          <div>
            <p className="font-semibold">Plan actuel : {currentSub.plan}</p>
            <p className="text-sm text-white/80">Crédits restants : {currentSub.credits_remaining}</p>
          </div>
          <Badge className="bg-white/20 text-white border-0">{t('active')}</Badge>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-xl ${
              plan.popular ? 'border-orange-500 shadow-lg' : 'border-slate-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-orange-500 text-white border-0 px-3">Populaire</Badge>
              </div>
            )}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold text-slate-900">{plan.price}€</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => subscribeMutation.mutate(plan)}
              disabled={subscribeMutation.isPending}
              className={`w-full rounded-xl bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`}
            >
              {t('subscribe')}
            </Button>
          </div>
        ))}
      </div>

      {/* What you can unlock */}
      <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-orange-500" /> Actions premium
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Voir les détails d\'une opportunité premium',
            'Publier un produit premium',
            'Publier une vente flash',
            'Débloquer les coordonnées d\'un prestataire',
            'Accéder aux alertes VIP',
            'Notifications en temps réel',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
              <Zap className="w-4 h-4 text-orange-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}