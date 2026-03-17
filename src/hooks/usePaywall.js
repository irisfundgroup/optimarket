import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function usePaywall() {
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionLabel, setActionLabel] = useState('cette action premium');

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: subscription } = useQuery({
    queryKey: ['mySubscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user?.email, status: 'active' }, '-created_date', 1).then(r => r[0]),
    enabled: !!user?.email,
  });

  const hasCredits = subscription && subscription.credits_remaining > 0;

  const requirePremium = (action, label = 'cette action premium') => {
    if (hasCredits) {
      action();
      return;
    }
    setPendingAction(() => action);
    setActionLabel(label);
    setPaywallOpen(true);
  };

  const handlePaywallSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  return {
    paywallOpen,
    setPaywallOpen,
    actionLabel,
    handlePaywallSuccess,
    requirePremium,
    hasCredits,
    subscription,
  };
}