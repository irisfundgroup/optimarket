import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Check, X, Clock, TrendingUp, Wallet, AlertCircle, ChevronDown, ChevronUp, BarChart2, Users, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const STATUS_COLORS = {
  active:    { bg: 'bg-amber-100', text: 'text-amber-700', label: 'En cours' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Complétée' },
  failed:    { bg: 'bg-red-100', text: 'text-red-700', label: 'Échouée' },
  paused:    { bg: 'bg-slate-100', text: 'text-slate-700', label: 'En pause' },
};

const WITHDRAWAL_COLORS = {
  pending:    { bg: 'bg-amber-100', text: 'text-amber-700', label: 'En attente' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En cours' },
  completed:  { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Validé' },
  rejected:   { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejeté' },
};

// ─── Campaign Volume Section ───
function CampaignVolumes({ investments, opportunities }) {
  const [expanded, setExpanded] = useState(null);

  const byOpp = investments.reduce((acc, inv) => {
    const key = inv.opportunity_id;
    if (!acc[key]) acc[key] = {
      id: key,
      title: inv.opportunity_title || 'Campagne',
      totalPacks: 0,
      totalCommissions: 0,
      partners: new Set(),
      count: 0,
      statuses: {}
    };
    acc[key].totalPacks += inv.amount_invested || 0;
    acc[key].totalCommissions += inv.actual_profit || 0;
    acc[key].partners.add(inv.activator_email);
    acc[key].count += 1;
    acc[key].statuses[inv.status] = (acc[key].statuses[inv.status] || 0) + 1;
    return acc;
  }, {});

  const campaigns = Object.values(byOpp).sort((a, b) => b.totalPacks - a.totalPacks);

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        <BarChart2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
        Aucune campagne avec participations pour l'instant
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map(c => {
        const isOpen = expanded === c.id;
        const partnerInvs = investments.filter(i => i.opportunity_id === c.id);
        return (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
              onClick={() => setExpanded(isOpen ? null : c.id)}>
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">{c.title}</p>
                <p className="text-xs text-slate-500">{c.count} participation(s) · {c.partners.size} partenaire(s)</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-slate-900">{c.totalPacks.toLocaleString()} XOF</p>
                <p className="text-xs text-emerald-600">+{c.totalCommissions.toLocaleString()} XOF comm.</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
            </button>

            {isOpen && (
              <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-2">
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {Object.entries(c.statuses).map(([st, n]) => {
                    const cfg = STATUS_COLORS[st] || STATUS_COLORS.active;
                    return (
                      <div key={st} className={`rounded-xl p-2 text-center ${cfg.bg}`}>
                        <p className={`text-xs font-bold ${cfg.text}`}>{n}</p>
                        <p className={`text-[10px] ${cfg.text}`}>{cfg.label}</p>
                      </div>
                    );
                  })}
                </div>
                {partnerInvs.map(inv => (
                  <div key={inv.id} className="flex items-center gap-3 bg-white rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{inv.activator_email}</p>
                      <p className="text-[10px] text-slate-500">Pack: {(inv.amount_invested || 0).toLocaleString()} XOF · Comm: +{(inv.actual_profit || 0).toLocaleString()} XOF</p>
                    </div>
                    <Badge className={`border-0 text-[10px] ${(STATUS_COLORS[inv.status] || STATUS_COLORS.active).bg} ${(STATUS_COLORS[inv.status] || STATUS_COLORS.active).text}`}>
                      {(STATUS_COLORS[inv.status] || STATUS_COLORS.active).label}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Withdrawal Validation Section ───
function WithdrawalValidation({ withdrawals, investments }) {
  const queryClient = useQueryClient();

  const validateMutation = useMutation({
    mutationFn: async ({ withdrawal, action }) => {
      const newStatus = action === 'approve' ? 'completed' : 'rejected';
      await base44.entities.ActivatorWithdrawal.update(withdrawal.id, {
        status: newStatus,
        completed_date: action === 'approve' ? new Date().toISOString() : undefined,
        transaction_id: action === 'approve' ? `TXN-${Date.now()}` : undefined,
      });
      if (action === 'approve') {
        // Deduct from wallet
        const wallets = await base44.entities.ActivatorWallet.filter({ user_email: withdrawal.activator_email });
        if (wallets[0]) {
          const w = wallets[0];
          await base44.entities.ActivatorWallet.update(w.id, {
            balance_available: Math.max(0, (w.balance_available || 0) - withdrawal.amount),
            balance_pending_withdrawal: Math.max(0, (w.balance_pending_withdrawal || 0) - withdrawal.amount),
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWithdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['adminWallets'] });
    },
  });

  const pending = withdrawals.filter(w => w.status === 'pending');
  const processed = withdrawals.filter(w => w.status !== 'pending');

  // Commission check: sum completed profits for the activator
  const getTotalEarned = (email) =>
    investments.filter(i => i.activator_email === email && i.status === 'completed')
      .reduce((s, i) => s + (i.actual_profit || 0), 0);

  return (
    <div className="space-y-6">
      {/* Pending */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" /> En attente de validation ({pending.length})
        </h3>
        {pending.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-500 text-sm">
            <Check className="w-8 h-8 mx-auto mb-2 text-emerald-400" /> Aucun retrait en attente
          </div>
        )}
        <div className="space-y-3">
          {pending.map(w => {
            const earned = getTotalEarned(w.activator_email);
            const eligible = earned >= w.amount;
            return (
              <div key={w.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900">{w.activator_email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Méthode: {w.method} · Compte: {w.phone_or_account}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-lg font-black text-slate-900">{(w.amount || 0).toLocaleString()} XOF</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${eligible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {eligible ? `✓ Commissions vérifiées (${earned.toLocaleString()} XOF)` : `⚠ Commissions insuffisantes (${earned.toLocaleString()} XOF)`}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button size="sm" onClick={() => validateMutation.mutate({ withdrawal: w, action: 'approve' })}
                      disabled={validateMutation.isPending}
                      className="bg-emerald-500 hover:bg-emerald-600 rounded-xl h-8 px-3 text-xs gap-1">
                      <Check className="w-3.5 h-3.5" /> Valider
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => validateMutation.mutate({ withdrawal: w, action: 'reject' })}
                      disabled={validateMutation.isPending}
                      className="rounded-xl h-8 px-3 text-red-500 border-red-200 hover:bg-red-50 text-xs gap-1">
                      <X className="w-3.5 h-3.5" /> Rejeter
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Processed */}
      {processed.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> Traités ({processed.length})
          </h3>
          <div className="space-y-2">
            {processed.slice(0, 10).map(w => {
              const cfg = WITHDRAWAL_COLORS[w.status] || WITHDRAWAL_COLORS.pending;
              return (
                <div key={w.id} className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{w.activator_email}</p>
                    <p className="text-xs text-slate-500">{(w.amount || 0).toLocaleString()} XOF · {w.method}</p>
                  </div>
                  <Badge className={`border-0 text-xs ${cfg.bg} ${cfg.text}`}>{cfg.label}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Participation Status Manager ───
function ParticipationManager({ investments }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, actualProfit, investment }) => {
      const data = { status };
      if (actualProfit !== undefined) data.actual_profit = actualProfit;
      if (status === 'completed') {
        data.profit_received = true;
        // Send commission notification to activator
        await base44.functions.invoke('notifications', {
          action: 'notify_commission',
          activator_email: investment.activator_email,
          opportunity_title: investment.opportunity_title,
          commission_amount: actualProfit ?? investment.actual_profit ?? investment.expected_return_amount,
          investment_id: id,
        });
      }
      return base44.entities.ActivatorInvestment.update(id, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminInvestments'] }),
  });

  const [editProfit, setEditProfit] = useState({});

  const filtered = filter === 'all' ? investments : investments.filter(i => i.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-slate-500">Filtrer:</span>
        {['all', 'active', 'completed', 'failed', 'paused'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === s ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {s === 'all' ? 'Toutes' : (STATUS_COLORS[s]?.label || s)}
            <span className="ml-1 opacity-70">({investments.filter(i => s === 'all' || i.status === s).length})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          Aucune participation dans ce statut
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(inv => {
          const cfg = STATUS_COLORS[inv.status] || STATUS_COLORS.active;
          return (
            <div key={inv.id} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">{inv.opportunity_title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{inv.activator_email}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap text-xs">
                    <span className="text-slate-700">Pack: <strong>{(inv.amount_invested || 0).toLocaleString()} XOF</strong></span>
                    <span className="text-emerald-600">Commission: <strong>{(inv.actual_profit || 0).toLocaleString()} XOF</strong></span>
                    <span className="text-slate-500">Durée: {inv.duration_days || 0}j</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <Badge className={`border-0 text-xs ${cfg.bg} ${cfg.text}`}>{cfg.label}</Badge>

                  {/* Manual commission input */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="Comm. réelle XOF"
                      className="w-32 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-400"
                      value={editProfit[inv.id] ?? inv.actual_profit ?? ''}
                      onChange={e => setEditProfit(p => ({ ...p, [inv.id]: e.target.value }))}
                    />
                  </div>

                  {/* Status selector */}
                  <Select value={inv.status} onValueChange={status => {
                    const profit = editProfit[inv.id] !== undefined ? Number(editProfit[inv.id]) : undefined;
                    updateStatusMutation.mutate({ id: inv.id, status, actualProfit: profit, investment: inv });
                  }}>
                    <SelectTrigger className="w-36 h-8 text-xs rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">En cours</SelectItem>
                      <SelectItem value="completed">Commission reçue</SelectItem>
                      <SelectItem value="paused">En pause</SelectItem>
                      <SelectItem value="failed">Non aboutie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Notify New Campaign Button (used in CampaignVolumes header) ───
function NotifyCampaignButton({ opportunities }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleNotify = async () => {
    setSending(true);
    try {
      const highScore = opportunities.filter(o => o.score >= 70 && o.status === 'active');
      await base44.functions.invoke('notifications', {
        action: 'notify_all_activators_new_campaigns',
        campaigns: highScore.map(o => ({
          id: o.id,
          title: o.title,
          score: o.score,
          potential_margin: o.potential_margin,
        })),
      });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      onClick={handleNotify}
      disabled={sending || sent}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
      style={{
        background: sent ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.12)',
        color: sent ? '#10b981' : '#f59e0b',
        border: `1px solid ${sent ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.25)'}`,
      }}
    >
      <Bell className="w-3.5 h-3.5" />
      {sent ? '✓ Notifié !' : sending ? 'Envoi...' : 'Notifier les partenaires'}
    </button>
  );
}

// ─── Main Panel ───
export default function ActivatorAdminPanel() {
  const { data: investments = [] } = useQuery({
    queryKey: ['adminInvestments'],
    queryFn: () => base44.entities.ActivatorInvestment.list('-created_date', 200),
  });
  const { data: withdrawals = [] } = useQuery({
    queryKey: ['adminWithdrawals'],
    queryFn: () => base44.entities.ActivatorWithdrawal.list('-created_date', 100),
  });
  const { data: wallets = [] } = useQuery({
    queryKey: ['adminWallets'],
    queryFn: () => base44.entities.ActivatorWallet.list('-created_date', 100),
  });
  const { data: opportunities = [] } = useQuery({
    queryKey: ['adminOppsForActivator'],
    queryFn: () => base44.entities.Opportunity.list('-created_date', 50),
  });

  const totalPacks = investments.reduce((s, i) => s + (i.amount_invested || 0), 0);
  const totalCommissions = investments.reduce((s, i) => s + (i.actual_profit || 0), 0);
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
  const activeInvs = investments.filter(i => i.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total packs', value: `${(totalPacks / 1000).toFixed(0)}k XOF`, sub: `${investments.length} participations`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Commissions versées', value: `${(totalCommissions / 1000).toFixed(0)}k XOF`, sub: `${investments.filter(i => i.status === 'completed').length} complétées`, icon: BarChart2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Retraits en attente', value: pendingWithdrawals, sub: `${withdrawals.filter(w => w.status === 'completed').length} validés`, icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Partenaires actifs', value: new Set(investments.filter(i => i.status === 'active').map(i => i.activator_email)).size, sub: `${wallets.length} wallets`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-2xl font-black text-slate-900">{s.value}</p>
                {s.sub && <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>}
              </div>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="volumes" className="space-y-4">
        <TabsList className="bg-slate-100 rounded-xl p-1 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="volumes" className="rounded-lg text-xs">
            📊 Volumes par campagne
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="rounded-lg text-xs">
            💸 Retraits {pendingWithdrawals > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full inline-flex items-center justify-center">{pendingWithdrawals}</span>}
          </TabsTrigger>
          <TabsTrigger value="participations" className="rounded-lg text-xs">
            ⚙️ Gestion participations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="volumes">
          <div className="flex justify-end mb-3">
            <NotifyCampaignButton opportunities={opportunities} />
          </div>
          <CampaignVolumes investments={investments} opportunities={opportunities} />
        </TabsContent>
        <TabsContent value="withdrawals">
          <WithdrawalValidation withdrawals={withdrawals} investments={investments} />
        </TabsContent>
        <TabsContent value="participations">
          <ParticipationManager investments={investments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}