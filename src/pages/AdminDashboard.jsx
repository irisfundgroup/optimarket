import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart3, Users, ShoppingBag, Briefcase, CreditCard, Check, X, Zap, TrendingUp, Shield, AlertTriangle, Activity, Settings, Bot, Cpu, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ActivatorAdminPanel from '@/components/admin/ActivatorAdminPanel';
import UnderevaluedProductsPanel from '@/components/admin/UnderevaluedProductsPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { t } from '@/lib/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

const COLORS = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EC4899', '#EAB308'];

const StatCard = ({ icon: Icon, label, value, sub, color, bg }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [flashMode, setFlashMode] = useState('semi_auto');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: allUsers = [] } = useQuery({ queryKey: ['adminUsers'], queryFn: () => base44.entities.User.list('-created_date', 100) });
  const { data: pendingProducts = [] } = useQuery({ queryKey: ['pendingProducts'], queryFn: () => base44.entities.Product.filter({ status: 'pending' }, '-created_date', 50) });
  const { data: pendingServices = [] } = useQuery({ queryKey: ['pendingServices'], queryFn: () => base44.entities.Service.filter({ status: 'pending' }, '-created_date', 50) });
  const { data: allProducts = [] } = useQuery({ queryKey: ['adminAllProducts'], queryFn: () => base44.entities.Product.list('-created_date', 200) });
  const { data: allServices = [] } = useQuery({ queryKey: ['adminAllServices'], queryFn: () => base44.entities.Service.list('-created_date', 200) });
  const { data: allOpps = [] } = useQuery({ queryKey: ['adminOpps'], queryFn: () => base44.entities.Opportunity.list('-created_date', 50) });
  const { data: payments = [] } = useQuery({ queryKey: ['adminPayments'], queryFn: () => base44.entities.Payment.filter({ status: 'completed' }, '-created_date', 100) });
  const { data: flashSales = [] } = useQuery({ queryKey: ['adminFlashSales'], queryFn: () => base44.entities.FlashSale.list('-created_date', 50) });
  const { data: subs = [] } = useQuery({ queryKey: ['adminSubs'], queryFn: () => base44.entities.Subscription.filter({ status: 'active' }, '-created_date', 100) });

  const approveMutation = useMutation({
    mutationFn: ({ type, id }) => type === 'product'
      ? base44.entities.Product.update(id, { status: 'active' })
      : base44.entities.Service.update(id, { status: 'active' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProducts'] });
      queryClient.invalidateQueries({ queryKey: ['pendingServices'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ type, id }) => type === 'product'
      ? base44.entities.Product.update(id, { status: 'rejected' })
      : base44.entities.Service.update(id, { status: 'rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProducts'] });
      queryClient.invalidateQueries({ queryKey: ['pendingServices'] });
    },
  });

  const generateOpportunityMutation = useMutation({
    mutationFn: async () => {
      // AI: analyze products to find opportunities
      const prompt = `Tu es un moteur IA de détection d'opportunités commerciales. Voici ${allProducts.length} produits et ${allServices.length} services sur une marketplace. 
      Génère 3 opportunités commerciales réalistes avec: title, description, type (product_deal/service_demand/trending/price_drop), score (0-100), potential_margin (%), location_city.
      Retourne UNIQUEMENT un JSON valide.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            opportunities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  type: { type: 'string' },
                  score: { type: 'number' },
                  potential_margin: { type: 'number' },
                  location_city: { type: 'string' },
                }
              }
            }
          }
        }
      });

      for (const opp of (result.opportunities || [])) {
        await base44.entities.Opportunity.create({ ...opp, status: 'active', is_premium: opp.score > 80 });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminOpps'] }),
  });

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = pendingProducts.length + pendingServices.length;

  // Chart data
  const catData = {};
  allProducts.forEach(p => { catData[p.category] = (catData[p.category] || 0) + 1; });
  const categoryData = Object.entries(catData).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  const revenueData = payments.slice(0, 7).reverse().map((p, i) => ({ name: `J-${6 - i}`, amount: p.amount }));

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Accès Restreint</h2>
          <p className="text-slate-500 mt-2">Réservé aux administrateurs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-orange-500" /> Dashboard Admin
          </h1>
          <p className="text-slate-500 text-sm mt-1">Vue d'ensemble de la plateforme OptiMarket</p>
        </div>
        {totalPending > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-orange-700 text-sm font-semibold">{totalPending} annonce(s) en attente</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Utilisateurs" value={allUsers.length} sub={`${subs.length} abonnés`} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={ShoppingBag} label="Produits" value={allProducts.length} sub={`${pendingProducts.length} en attente`} color="text-orange-600" bg="bg-orange-50" />
        <StatCard icon={Briefcase} label="Services" value={allServices.length} sub={`${pendingServices.length} en attente`} color="text-purple-600" bg="bg-purple-50" />
        <StatCard icon={CreditCard} label="Revenus" value={`${totalRevenue.toFixed(0)}€`} sub={`${payments.length} paiements`} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Moteur d'Opportunités CTA */}
      <div className="mb-6">
        <Link to="/OpportunityEngine">
          <div className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(16,185,129,0.08))', border: '1px solid rgba(245,158,11,0.3)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.2)' }}>
              <Cpu className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-bold">Moteur d'Opportunités IA</p>
              <p className="text-slate-400 text-xs">Ajouter des produits sources · Calculer les scores · Publier automatiquement</p>
            </div>
            <Zap className="w-5 h-5 text-orange-400 ml-auto" />
          </div>
        </Link>
        <Link to="/OllamaStudio" className="mt-2 block">
          <div className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.06))', border: '1px solid rgba(99,102,241,0.25)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.2)' }}>
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-white font-bold">Ollama Studio</p>
              <p className="text-slate-400 text-xs">IA locale gratuite · Fiches produits · Marketing · Arbitrage · Réponses clients</p>
            </div>
            <ChevronRight className="w-5 h-5 text-indigo-400 ml-auto" />
          </div>
        </Link>
      </div>

      <Tabs defaultValue="validation" className="space-y-6">
        <TabsList className="bg-slate-100 rounded-xl p-1 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="validation" className="rounded-lg text-xs">
            Validation {totalPending > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{totalPending}</span>}
          </TabsTrigger>
          <TabsTrigger value="stats" className="rounded-lg text-xs">Statistiques</TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg text-xs">IA & Flash</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg text-xs">Paiements</TabsTrigger>
          <TabsTrigger value="undervalued" className="rounded-lg text-xs">📊 Produits sous-évalués</TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg text-xs">Utilisateurs</TabsTrigger>
          <TabsTrigger value="activators" className="rounded-lg text-xs">🧑‍💼 Activateurs</TabsTrigger>
        </TabsList>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-3">
          {[...pendingProducts.map(p => ({ ...p, _type: 'product' })), ...pendingServices.map(s => ({ ...s, _type: 'service' }))].map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <Badge className={`flex-shrink-0 border-0 text-xs ${item._type === 'product' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                {item._type === 'product' ? 'Produit' : 'Service'}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item._type === 'product' ? `${item.seller_email} • ${item.price}€` : `${item.provider_email} • ${item.category}`}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" onClick={() => approveMutation.mutate({ type: item._type, id: item.id })}
                  className="bg-emerald-500 hover:bg-emerald-600 rounded-xl h-8 px-3 gap-1 text-xs">
                  <Check className="w-3.5 h-3.5" /> Valider
                </Button>
                <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate({ type: item._type, id: item.id })}
                  className="rounded-xl h-8 px-3 text-red-500 border-red-200 hover:bg-red-50 text-xs">
                  <X className="w-3.5 h-3.5" /> Rejeter
                </Button>
              </div>
            </div>
          ))}
          {totalPending === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <Check className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
              <p className="text-slate-500 font-medium">Tout est validé !</p>
            </div>
          )}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-orange-500" /> Produits par catégorie
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" /> Revenus récents
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area dataKey="amount" stroke="#F97316" fill="url(#revenueGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* AI & Flash Tab */}
        <TabsContent value="ai" className="space-y-6">
          {/* Flash Mode */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" /> Mode Ventes Flash
            </h3>
            <div className="flex gap-3 mb-4">
              {['manual', 'semi_auto', 'auto'].map(mode => (
                <button key={mode} onClick={() => setFlashMode(mode)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${flashMode === mode ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {mode === 'manual' ? '✋ Manuel' : mode === 'semi_auto' ? '⚡ Semi-Auto' : '🤖 Auto'}
                </button>
              ))}
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600">
              {flashMode === 'manual' && '✋ Vous créez manuellement toutes les ventes flash.'}
              {flashMode === 'semi_auto' && '⚡ L\'IA suggère des ventes flash, vous les validez avant publication.'}
              {flashMode === 'auto' && '🤖 L\'IA crée et publie automatiquement les ventes flash optimales.'}
            </div>
          </div>

          {/* AI Opportunities Generator */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" /> Moteur IA — Opportunités
              </h3>
              <Button onClick={() => generateOpportunityMutation.mutate()} disabled={generateOpportunityMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 rounded-xl gap-2 text-sm">
                {generateOpportunityMutation.isPending ? (
                  <><Activity className="w-4 h-4 animate-pulse" /> Analyse en cours...</>
                ) : (
                  <><Bot className="w-4 h-4" /> Générer des opportunités</>
                )}
              </Button>
            </div>
            <div className="space-y-2">
              {allOpps.slice(0, 5).map(opp => (
                <div key={opp.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-black text-white">{opp.score}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{opp.title}</p>
                    <p className="text-xs text-slate-500">{opp.type?.replace(/_/g, ' ')} · {opp.location_city}</p>
                  </div>
                  <Badge className={`border-0 text-xs ${opp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {opp.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Flash Sales list */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" /> Ventes Flash actives
            </h3>
            <div className="space-y-2">
              {flashSales.map(sale => (
                <div key={sale.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Zap className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sale.title}</p>
                    <p className="text-xs text-slate-500">{sale.flash_price}€ · {sale.quantity_sold || 0}/{sale.quantity_total || '∞'} vendus</p>
                  </div>
                  <Badge className={`border-0 text-xs ${sale.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {sale.status}
                  </Badge>
                  {sale.is_auto_generated && <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">IA</Badge>}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Historique des paiements</h3>
            </div>
            {payments.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{p.user_email}</p>
                  <p className="text-xs text-slate-500">{p.description || p.type}</p>
                </div>
                <span className="font-bold text-emerald-600">+{p.amount?.toFixed(2)}€</span>
              </div>
            ))}
            {payments.length === 0 && <p className="text-center text-slate-500 py-8 text-sm">Aucun paiement</p>}
          </div>
        </TabsContent>

        {/* Undervalued Products Tab */}
        <TabsContent value="undervalued">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Produits sous-évalués (Accès Admin)
            </h3>
            <p className="text-sm text-slate-600 mb-4">Tableau complet des niches, marges et coordonnées fournisseurs pour les meilleures opportunités d'achat.</p>
            <UnderevaluedProductsPanel />
          </div>
        </TabsContent>

        {/* Activators Tab */}
        <TabsContent value="activators">
          <ActivatorAdminPanel />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {allUsers.map(u => (
              <div key={u.id} className="flex items-center gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {u.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900">{u.full_name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <Badge variant="secondary" className={`text-xs ${u.role === 'admin' ? 'bg-orange-100 text-orange-700' : ''}`}>
                  {u.role || 'user'}
                </Badge>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}