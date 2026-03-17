import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Zap, Check, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  { id: 'single_action', name: '1 Action', price: '0,99€', credits: 1, color: 'border-slate-300 hover:border-slate-400', btnClass: 'bg-slate-800 hover:bg-slate-700' },
  { id: 'pack_10', name: 'Pack 10', price: '7,99€', credits: 10, color: 'border-orange-500 ring-2 ring-orange-500/30', btnClass: 'bg-orange-500 hover:bg-orange-600', badge: 'Populaire' },
  { id: 'pass_24h', name: 'Pass 24h', price: '4,99€', credits: 999, color: 'border-blue-500 hover:border-blue-400', btnClass: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'monthly', name: 'Mensuel', price: '19,99€', credits: 9999, color: 'border-emerald-500 hover:border-emerald-400', btnClass: 'bg-emerald-600 hover:bg-emerald-700', badge: 'Meilleure valeur' },
];

export default function PaywallModal({ open, onClose, onSuccess, actionLabel = 'cette action premium', requiredCredits = 1 }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: subscription } = useQuery({
    queryKey: ['mySubscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user?.email, status: 'active' }, '-created_date', 1).then(r => r[0] || null),
    enabled: !!user?.email,
  });

  const buyMutation = useMutation({
    mutationFn: async (plan) => {
      await base44.entities.Payment.create({
        user_email: user.email,
        amount: parseFloat(plan.price.replace(',', '.')),
        type: plan.id === 'monthly' ? 'subscription' : 'single_action',
        status: 'completed',
        description: `Achat: ${plan.name}`,
      });

      const expiresAt = plan.id === 'pass_24h'
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : plan.id === 'monthly'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null;

      const sub = await base44.entities.Subscription.create({
        user_email: user.email,
        plan: plan.id,
        credits_remaining: plan.credits,
        status: 'active',
        amount_paid: parseFloat(plan.price.replace(',', '.')),
        ...(expiresAt && { expires_at: expiresAt }),
      });
      return sub;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mySubscription'] });
      if (onSuccess) onSuccess();
      onClose();
    },
  });

  const useCredit = useMutation({
    mutationFn: async () => {
      await base44.entities.Subscription.update(subscription.id, {
        credits_remaining: subscription.credits_remaining - requiredCredits,
        total_credits_used: (subscription.total_credits_used || 0) + requiredCredits,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mySubscription'] });
      if (onSuccess) onSuccess();
      onClose();
    },
  });

  const hasCredits = subscription && subscription.credits_remaining >= requiredCredits;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl border-0">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Action Premium</h2>
              <p className="text-slate-400 text-sm">Pour {actionLabel}</p>
            </div>
          </div>

          {hasCredits && (
            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
              <span className="text-emerald-300 text-sm font-medium">Vous avez {subscription.credits_remaining} crédit(s)</span>
              <Button size="sm" onClick={() => useCredit.mutate()} disabled={useCredit.isPending}
                className="bg-emerald-500 hover:bg-emerald-600 rounded-lg gap-1 text-xs">
                <Zap className="w-3 h-3" /> Utiliser 1 crédit
              </Button>
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="p-5 bg-white space-y-3">
          <p className="text-slate-600 text-sm font-medium mb-4">Ou choisissez un plan :</p>
          {PLANS.map(plan => (
            <div key={plan.id} className={`relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${plan.color}`}
              onClick={() => buyMutation.mutate(plan)}>
              {plan.badge && (
                <span className="absolute -top-2.5 left-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{plan.badge}</span>
              )}
              <div>
                <p className="font-bold text-slate-900">{plan.name}</p>
                <p className="text-xs text-slate-500">{plan.credits >= 9999 ? 'Illimité' : `${plan.credits} crédit(s)`}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-slate-900">{plan.price}</span>
                <Button size="sm" className={`rounded-xl text-white ${plan.btnClass}`} disabled={buyMutation.isPending}>
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}