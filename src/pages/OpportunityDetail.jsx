import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Lock, MapPin, Flame, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';

export default function OpportunityDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const [unlocked, setUnlocked] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: opportunity, isLoading } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => base44.entities.Opportunity.filter({ id }).then(r => r[0]),
    enabled: !!id,
  });

  const { data: subscription } = useQuery({
    queryKey: ['mySubscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user?.email, status: 'active' }, '-created_date', 1).then(r => r[0]),
    enabled: !!user?.email,
  });

  const unlockMutation = useMutation({
    mutationFn: async () => {
      if (subscription && subscription.credits_remaining > 0) {
        await base44.entities.Subscription.update(subscription.id, {
          credits_remaining: subscription.credits_remaining - 1,
          total_credits_used: (subscription.total_credits_used || 0) + 1,
        });
        setUnlocked(true);
      }
    },
  });

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-6"><Skeleton className="h-60 rounded-2xl" /></div>;
  if (!opportunity) return <div className="text-center py-20 text-slate-500">{t('no_results')}</div>;

  const canUnlock = subscription && subscription.credits_remaining > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/Opportunities"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-lg font-bold text-slate-900 truncate">{opportunity.title}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Score Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex items-center justify-between">
          <div>
            <Badge className="bg-white/10 text-white border-0 mb-2">{opportunity.type?.replace(/_/g, ' ')}</Badge>
            <h2 className="text-xl font-bold text-white">{opportunity.title}</h2>
            {opportunity.location_city && (
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {opportunity.location_city}
              </p>
            )}
          </div>
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex flex-col items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
              <span className="text-2xl font-bold text-white">{opportunity.score}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{t('ai_score')}</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {opportunity.potential_margin && (
            <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="text-sm text-emerald-700 font-semibold">{t('potential_margin')}</p>
                <p className="text-2xl font-bold text-emerald-600">+{opportunity.potential_margin}%</p>
              </div>
            </div>
          )}

          {opportunity.is_premium && !unlocked ? (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
              <Lock className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold text-orange-800 mb-2">Contenu Premium</h3>
              <p className="text-sm text-orange-600 mb-4">Débloquez cette opportunité pour voir tous les détails</p>
              {canUnlock ? (
                <Button onClick={() => unlockMutation.mutate()} disabled={unlockMutation.isPending} className="bg-orange-500 hover:bg-orange-600 rounded-xl gap-2">
                  <Zap className="w-4 h-4" /> {t('unlock')} (1 crédit)
                </Button>
              ) : (
                <Link to="/Subscription">
                  <Button className="bg-orange-500 hover:bg-orange-600 rounded-xl gap-2">
                    <Crown className="w-4 h-4" /> {t('subscribe')}
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-sm text-slate-700 mb-2">{t('description')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{opportunity.description || 'Détails de l\'opportunité disponibles.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}