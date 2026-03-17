import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Gift, Copy, Check, Users, TrendingUp, Zap, Share2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function generateCode(email) {
  const base = email?.split('@')[0]?.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6) || 'USER';
  const suffix = Math.abs(email?.split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 0) % 9000 + 1000;
  return `${base}${suffix}`;
}

export default function Referral() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const myCode = user ? generateCode(user.email) : '';
  const referralLink = user ? `${window.location.origin}/Home?ref=${myCode}` : '';

  const { data: referrals = [] } = useQuery({
    queryKey: ['myReferrals', user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const totalCredits = referrals.reduce((sum, r) => sum + (r.reward_credits || 0), 0);
  const totalCommission = referrals.reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  const converted = referrals.filter(r => r.status === 'converted').length;
  const registered = referrals.filter(r => r.status === 'registered' || r.status === 'converted').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'OptiMarket - Rejoins-moi !',
        text: `Rejoins OptiMarket avec mon code parrain et gagne des crédits gratuits ! 🎁`,
        url: referralLink,
      });
    } else {
      handleCopy();
    }
  };

  const statusLabel = {
    pending: { label: 'Lien cliqué', color: 'bg-slate-100 text-slate-600' },
    registered: { label: 'Inscrit ✓', color: 'bg-blue-100 text-blue-700' },
    converted: { label: 'Achat effectué 🎉', color: 'bg-emerald-100 text-emerald-700' },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-200">
          <Gift className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Parrainage & Affiliation</h1>
        <p className="text-slate-500 text-sm mt-1">Invitez vos amis, gagnez des crédits et des commissions</p>
      </div>

      {/* Rewards info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
          <Zap className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-xl font-black text-orange-600">+3 crédits</p>
          <p className="text-xs text-orange-500">Par filleul inscrit</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-black text-emerald-600">10% commission</p>
          <p className="text-xs text-emerald-500">Sur chaque achat filleul</p>
        </div>
      </div>

      {/* My referral link */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-slate-300">Votre lien de parrainage</span>
        </div>
        <div className="bg-white/10 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-400 mb-1">Code : <span className="text-orange-400 font-bold">{myCode}</span></p>
          <p className="text-sm text-slate-200 break-all font-mono">{referralLink}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCopy} variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-xl gap-2">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copié !' : 'Copier'}
          </Button>
          <Button onClick={handleShare} className="flex-1 bg-orange-500 hover:bg-orange-600 rounded-xl gap-2">
            <Share2 className="w-4 h-4" /> Partager
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
          <p className="text-2xl font-black text-slate-900">{registered}</p>
          <p className="text-xs text-slate-500 mt-1">Inscrits</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
          <p className="text-2xl font-black text-orange-500">{totalCredits}</p>
          <p className="text-xs text-slate-500 mt-1">Crédits gagnés</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
          <p className="text-2xl font-black text-emerald-600">{totalCommission.toFixed(0)}</p>
          <p className="text-xs text-slate-500 mt-1">XOF commissions</p>
        </div>
      </div>

      {/* Referrals list */}
      <div>
        <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Mes filleuls ({referrals.length})
        </h2>
        {referrals.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <Gift className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Aucun filleul pour l'instant.</p>
            <p className="text-slate-400 text-xs mt-1">Partagez votre lien pour commencer à gagner !</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-slate-800">{r.referred_name || r.referred_email || 'Anonyme'}</p>
                  <p className="text-xs text-slate-400">{r.referred_email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {r.reward_credits > 0 && (
                    <span className="text-xs text-orange-500 font-bold">+{r.reward_credits} crédits</span>
                  )}
                  {r.commission_amount > 0 && (
                    <span className="text-xs text-emerald-600 font-bold">+{r.commission_amount} XOF</span>
                  )}
                  <Badge className={`text-xs border-0 ${statusLabel[r.status]?.color}`}>
                    {statusLabel[r.status]?.label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-blue-900 text-sm">Comment ça marche ?</h3>
        {[
          { step: '1', text: 'Copiez votre lien unique et partagez-le à vos amis' },
          { step: '2', text: 'Votre ami s\'inscrit → vous gagnez 3 crédits offerts' },
          { step: '3', text: 'Il fait un achat → vous recevez 10% de commission en XOF' },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{step}</div>
            <p className="text-sm text-blue-800">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}