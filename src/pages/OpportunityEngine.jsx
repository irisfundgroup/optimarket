import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Zap, Plus, BarChart2, TrendingUp, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import ProductSourceForm from '@/components/engine/ProductSourceForm';
import ProductSourceCard from '@/components/engine/ProductSourceCard';

const NICHE_FILTERS = [
  { value: 'all', label: '🌍 Tous' },
  { value: 'electronics', label: '🔌 Électronique' },
  { value: 'auto', label: '🚗 Auto' },
  { value: 'beauty', label: '💄 Beauté' },
  { value: 'home', label: '🏠 Maison' },
  { value: 'solar', label: '☀️ Solaire' },
  { value: 'viral_tiktok', label: '🎵 TikTok' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'scored', label: 'Scorés' },
  { value: 'published', label: 'Publiés' },
];

export default function OpportunityEngine() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = USA(false);
  const [nicheFilter, setNicheFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoringAll, setScoringAll] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['productSources'],
    queryFn: () => base44.entities.ProductSource.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProductSource.create({ ...data, status: 'draft' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productSources'] });
      setShowForm(false);
      toast({ title: 'Produit ajouté', description: 'Prêt à être scoré par le moteur IA.' });
    },
  });

  const handleScoreOne = async (productId) => {
    const res = await base44.functions.invoke('opportunityEngine', { action: 'score_one', product_id: productId });
    queryClient.invalidateQueries({ queryKey: ['productSources'] });
    if (res.data?.score !== undefined) {
      toast({ title: `Score calculé : ${res.data.score}/100`, description: res.data.ai?.summary || 'Analyse terminée.' });
    }
  };

  const handlePublish = async (productId) => {
    const res = await base44.functions.invoke('opportunityEngine', { action: 'publish', product_id: productId });
    queryClient.invalidateQueries({ queryKey: ['productSources'] });
    if (res.data?.success) {
      toast({ title: '✅ Opportunité publiée !', description: 'Visible sur le marketplace Activateur.' });
    }
  };

  const handleScoreAll = async () => {
    setScoringAll(true);
    const res = await base44.functions.invoke('opportunityEngine', { action: 'score_all' });
    queryClient.invalidateQueries({ queryKey: ['productSources'] });
    setScoringAll(false);
    toast({ title: `${res.data?.processed || 0} produits scorés`, description: 'Moteur IA terminé.' });
  };

  // Filtres
  const filtered = products.filter(p => {
    const nicheOk = nicheFilter === 'all' || p.niche === nicheFilter;
    const statusOk = statusFilter === 'all' || p.status === statusFilter;
    return nicheOk && statusOk;
  }).sort((a, b) => (b.opportunity_score || 0) - (a.opportunity_score || 0));

  // KPIs
  const drafts = products.filter(p => p.status === 'draft').length;
  const scored = products.filter(p => p.status === 'scored').length;
  const published = products.filter(p => p.status === 'published').length;
  const avgScore = scored > 0
    ? Math.round(products.filter(p => p.opportunity_score > 0).reduce((s, p) => s + p.opportunity_score, 0) / scored)
    : 0;

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Accès réservé aux administrateurs</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-400" /> Moteur d'Opportunités
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Analyse produits · Score IA · Publication automatique</p>
        </div>
        <div className="flex gap-2">
          {drafts > 0 && (
            <Button size="sm" className="rounded-xl gap-1.5 text-sm" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
              onClick={handleScoreAll} disabled={scoringAll}>
              {scoringAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {scoringAll ? 'Scoring...' : `Scorer tous (${drafts})`}
            </Button>
          )}
          <Button size="sm" className="rounded-xl gap-1.5 text-sm font-bold" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' }}
            onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" /> Ajouter produit
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total produits', value: products.length, icon: BarChart2, color: '#f59e0b' },
          { label: 'À scorer', value: drafts, icon: Zap, color: '#94a3b8' },
          { label: 'Scorés (moy. ' + avgScore + ')', value: scored, icon: TrendingUp, color: '#f59e0b' },
          { label: 'Publiés', value: published, icon: CheckCircle2, color: '#10b981' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Icon className="w-4 h-4 mb-2" style={{ color }} />
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <ProductSourceForm
          onSave={(data) => createMutation.mutate(data)}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          {NICHE_FILTERS.map(f => (
            <button key={f.value} onClick={() => setNicheFilter(f.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: nicheFilter === f.value ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                color: nicheFilter === f.value ? '#f59e0b' : '#64748b',
                border: nicheFilter === f.value ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(255,255,255,0.06)',
              }}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: statusFilter === f.value ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: statusFilter === f.value ? '#e2e8f0' : '#475569',
                border: statusFilter === f.value ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-20 text-orange-400" />
          <p className="text-slate-400 mb-2">Aucun produit source</p>
          <p className="text-slate-600 text-sm">Ajoutez votre premier produit pour lancer le moteur</p>
          <Button className="mt-4 rounded-xl" style={{ background: '#f59e0b', color: '#000' }} onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Ajouter un produit
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(product => (
            <ProductSourceCard
              key={product.id}
              product={product}
              onScore={handleScoreOne}
              onPublish={handlePublish}
            />
          ))}
        </div>
      )}
    </div>
  );
}