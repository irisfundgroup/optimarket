import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart3, Users, ShoppingBag, Briefcase, CreditCard, Check, X, AlertTriangle, Zap, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EC4899'];

export default function AdminDashboard() {
  const [flashMode, setFlashMode] = useState('semi_auto');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: allUsers = [] } = useQuery({ queryKey: ['adminUsers'], queryFn: () => base44.entities.User.list('-created_date', 100) });
  const { data: pendingProducts = [] } = useQuery({ queryKey: ['pendingProducts'], queryFn: () => base44.entities.Product.filter({ status: 'pending' }, '-created_date', 50) });
  const { data: pendingServices = [] } = useQuery({ queryKey: ['pendingServices'], queryFn: () => base44.entities.Service.filter({ status: 'pending' }, '-created_date', 50) });
  const { data: allProducts = [] } = useQuery({ queryKey: ['adminAllProducts'], queryFn: () => base44.entities.Product.list('-created_date', 100) });
  const { data: allServices = [] } = useQuery({ queryKey: ['adminAllServices'], queryFn: () => base44.entities.Service.list('-created_date', 100) });
  const { data: payments = [] } = useQuery({ queryKey: ['adminPayments'], queryFn: () => base44.entities.Payment.filter({ status: 'completed' }, '-created_date', 100) });
  const { data: flashSales = [] } = useQuery({ queryKey: ['adminFlashSales'], queryFn: () => base44.entities.FlashSale.list('-created_date', 50) });

  const approveMutation = useMutation({
    mutationFn: ({ type, id }) => {
      if (type === 'product') return base44.entities.Product.update(id, { status: 'active' });
      return base44.entities.Service.update(id, { status: 'active' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProducts'] });
      queryClient.invalidateQueries({ queryKey: ['pendingServices'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ type, id }) => {
      if (type === 'product') return base44.entities.Product.update(id, { status: 'rejected' });
      return base44.entities.Service.update(id, { status: 'rejected' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProducts'] });
      queryClient.invalidateQueries({ queryKey: ['pendingServices'] });
    },
  });

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Category chart data
  const catCount = {};
  allProducts.forEach(p => { catCount[p.category] = (catCount[p.category] || 0) + 1; });
  const categoryData = Object.entries(catCount).map(([name, value]) => ({ name, value }));

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Accès réservé aux administrateurs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-orange-500" /> {t('admin')} {t('dashboard')}
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: t('total_users'), value: allUsers.length, color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: ShoppingBag, label: t('total_products'), value: allProducts.length, color: 'text-orange-500', bg: 'bg-orange-50' },
          { icon: Briefcase, label: t('total_services'), value: allServices.length, color: 'text-purple-500', bg: 'bg-purple-50' },
          { icon: CreditCard, label: t('total_revenue'), value: `${totalRevenue.toFixed(0)}€`, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl border-slate-200">
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="validation" className="space-y-6">
        <TabsList className="bg-slate-100 rounded-xl p-1">
          <TabsTrigger value="validation" className="rounded-lg">{t('validation')} ({pendingProducts.length + pendingServices.length})</TabsTrigger>
          <TabsTrigger value="stats" className="rounded-lg">{t('statistics')}</TabsTrigger>
          <TabsTrigger value="flash" className="rounded-lg">{t('flash_sales')}</TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg">{t('users')}</TabsTrigger>
        </TabsList>

        {/* Validation */}
        <TabsContent value="validation">
          <div className="space-y-3">
            {pendingProducts.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
                <Badge className="bg-orange-100 text-orange-700 border-0">Produit</Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.seller_email} • {p.price}€</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveMutation.mutate({ type: 'product', id: p.id })} className="bg-emerald-500 hover:bg-emerald-600 rounded-lg">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate({ type: 'product', id: p.id })} className="rounded-lg text-red-500 border-red-200">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {pendingServices.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
                <Badge className="bg-blue-100 text-blue-700 border-0">Service</Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.provider_email}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveMutation.mutate({ type: 'service', id: s.id })} className="bg-emerald-500 hover:bg-emerald-600 rounded-lg">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate({ type: 'service', id: s.id })} className="rounded-lg text-red-500 border-red-200">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {pendingProducts.length === 0 && pendingServices.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Check className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                <p>Aucune annonce en attente</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Statistics */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl">
              <CardHeader><CardTitle className="text-base">Produits par catégorie</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader><CardTitle className="text-base">Revenus récents</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={payments.slice(0, 10).map(p => ({ name: p.description?.slice(0, 15) || 'Paiement', amount: p.amount }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#F97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Flash Sales */}
        <TabsContent value="flash">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" /> {t('flash_mode')}
            </h3>
            <div className="flex gap-3">
              {['manual', 'semi_auto', 'auto'].map(mode => (
                <Button
                  key={mode}
                  variant={flashMode === mode ? 'default' : 'outline'}
                  onClick={() => setFlashMode(mode)}
                  className={`rounded-xl ${flashMode === mode ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                >
                  {t(mode)}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {flashSales.map(sale => (
              <div key={sale.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
                <Zap className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{sale.title}</p>
                  <p className="text-xs text-slate-500">{sale.flash_price}€ • {sale.quantity_sold || 0}/{sale.quantity_total || '∞'} vendus</p>
                </div>
                <Badge className={sale.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-0' : 'bg-slate-100 text-slate-600 border-0'}>
                  {sale.status}
                </Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <div className="space-y-3">
            {allUsers.map(u => (
              <div key={u.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {u.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{u.full_name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{u.role || 'user'}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}