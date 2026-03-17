import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Lock, MapPin, Flame, Crown, Zap, Eye, Users, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';
import PaywallModal from '@/components/paywall/PaywallModal';

const TYPE_CONFIG = {
  product_deal: { label: 'Deal Produit', gradient: 'from-blue-500 to-blue-600' },
  service_demand: { label: 'Demande Service', gradient: 'from-purple-500 to-purple-600' },
  flash_sale: { label: 'Vente Flash', gradient: 'from-orange-500 to-red-500' },
  trending: { label: 'Tendance', gradient: 'from-emerald-500 to-teal-500' },
  price_drop: { label: 'Baisse Prix', gradient: 'from-cyan-500 to-blue-500' },
};

export default function OpportunityDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const [unlocked, setUnlocked] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: opportunity, isLoading } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => base44.entities.Opportunity.filter({ id }).then(r => r[0]),
    enabled: !!id,
  });
  const { data: subscription } = useQuery({
    queryKey: ['mySubscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user?.email, status: 'active' }, '-created_date', 1).then(r => r[0] || null),
    enabled: !!user?.email,
  });

  const useCredit = useMutation({
    mutationFn: async () => {
      if (subscription?.credits_remaining > 0) {
        await base44.entities.Subscription.update(subscription.id, {
          credits_remaining: subscription.credits_remaining - 1,
          total_credits_used: (subscription.total_credits_used || 0) + 1,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySubscription'] });
      setUnlocked(true);
    },
  });

  const handleUnlock = () => {
    if (subscription?.credits_remaining > 0) {
      useCredit.mutate();
    } else {
      setPaywallOpen(true);
    }
  };

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-6 space-y-4"><Skeleton className="h-60 rounded-2xl" /><Skeleton className="h-40 rounded-2xl" /></div>;
  if (!opportunity) return <div className="text-center py-20 text-slate-500">{t('no_results')}</div>;

  const cfg = TYPE_CONFIG[opportunity.type] || TYPE_CONFIG.trending;
  const needsUnlock = opportunity.is_premium && !unlocked;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-5">
        <Link to="/Opportunities"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t('opportunities')}</span>
      </div>

      {/* Hero card */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 mb-5">
        <div className={`bg-gradient-to-r ${cfg.gradient} p-6`}>
          <div className="flex items-start justify-between">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-3 text-xs">{cfg.label}</Badge>
              <h1 className="text-2xl font-black text-white leading-tight">{opportunity.title}</h1>
              {opportunity.location_city && (
                <p className="text-white/70 text-sm mt-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {opportunity.location_city}, {opportunity.location_country}
                </p>
              )}
            </div>
            {/* AI Score */}
            <div className="text-center bg-white/15 backdrop-blur rounded-2xl p-3 flex-shrink-0">
              <Flame className="w-5 h-5 text-orange-300 mx-auto" />
              <p className="text-3xl font-black text-white">{opportunity.score}</p>
              <p className="text-white/60 text-[10px] uppercase tracking-wide">Score IA</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {opportunity.potential_margin && (
              <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-xl font-black text-emerald-600">+{opportunity.potential_margin}%</p>
                <p className="text-xs text-emerald-500">Marge</p>
              </div>
            )}
            <div className="bg-blue-50 rounded-2xl p-4 text-center">
              <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-black text-blue-600">{opportunity.views || 0}</p>
              <p className="text-xs text-blue-500">Vues</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 text-center">
              <Users className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-xl font-black text-purple-600">{opportunity.claims_count || 0}</p>
              <p className="text-xs text-purple-500">Réclamés</p>
            </div>
          </div>

          {/* Content */}
          {needsUnlock ? (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="font-bold text-lg text-orange-900 mb-2">Contenu Premium</h3>
              <p className="text-orange-600 text-sm mb-5">Débloquez les détails complets de cette opportunité pour la saisir</p>
              <Button onClick={handleUnlock} disabled={useCredit.isPending}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white rounded-xl px-8 gap-2 shadow-lg shadow-orange-200">
                <Zap className="w-4 h-4" />
                {subscription?.credits_remaining > 0 ? `Débloquer (1 crédit)` : 'Obtenir des crédits'}
              </Button>
              {subscription?.credits_remaining > 0 && (
                <p className="text-xs text-orange-400 mt-2">{subscription.credits_remaining} crédit(s) disponible(s)</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-700 mb-2 text-sm uppercase tracking-wide">{t('description')}</h3>
                <p className="text-slate-600 leading-relaxed">{opportunity.description || 'Détails complets de cette opportunité commerciale.'}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-emerald-700 font-semibold text-sm">✅ Opportunité débloquée — Agissez maintenant !</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="rounded-xl gap-2 flex-1">
              <Share2 className="w-4 h-4" /> Partager
            </Button>
            {!needsUnlock && (
              <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white gap-2 flex-1"
                onClick={() => {
                  if (opportunity.related_product_id) navigate(`/ProductDetail?id=${opportunity.related_product_id}`);
                  else if (opportunity.related_service_id) navigate(`/ServiceDetail?id=${opportunity.related_service_id}`);
                  else if (opportunity.type === 'flash_sale') navigate('/FlashSales');
                  else if (opportunity.type === 'service_demand') navigate('/ServiceRequests');
                  else navigate('/Products');
                }}>
                <TrendingUp className="w-4 h-4" /> Saisir l'opportunité
              </Button>
            )}
          </div>
        </div>
      </div>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onSuccess={() => setUnlocked(true)}
        actionLabel="débloquer cette opportunité premium"
      />
    </div>
  );
}