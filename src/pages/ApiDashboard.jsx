import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, MapPin, Brain, ShoppingBag, Bell, MessageSquare, 
  Shield, BarChart2, Zap, CheckCircle2, AlertCircle, Loader2,
  RefreshCw, Play
} from 'lucide-react';

const API_INTEGRATIONS = [
  {
    id: 'payment', icon: CreditCard, label: 'Paiement', color: 'text-emerald-500', bg: 'bg-emerald-50',
    provider: 'GeniusPay CI', status: 'active', secret: 'GENIUSPAY_API_KEY',
    features: ['Paywall à l\'action', 'Abonnements', 'Pack crédits', 'Pass 24h'],
    function: 'payment'
  },
  {
    id: 'geo', icon: MapPin, label: 'Géolocalisation', color: 'text-blue-500', bg: 'bg-blue-50',
    provider: 'Google Maps API', status: 'active', secret: 'GOOGLE_MAPS_API_KEY',
    features: ['Géocodage villes', 'GPS reverse', 'Filtre proximité', 'Calcul distance'],
    function: 'geolocate'
  },
  {
    id: 'ai', icon: Brain, label: 'Intelligence Artificielle', color: 'text-purple-500', bg: 'bg-purple-50',
    provider: 'OpenAI GPT-4o', status: 'pending', secret: 'OPENAI_API_KEY',
    features: ['Analyse opportunités', 'Génération descriptions', 'Détection viral', 'Scoring automatique'],
    function: 'aiAnalyze'
  },
  {
    id: 'notifications', icon: Bell, label: 'Notifications', color: 'text-orange-500', bg: 'bg-orange-50',
    provider: 'Base44 Native', status: 'active', secret: null,
    features: ['Alertes produits', 'Ventes flash', 'Match prestataires', 'VIP alerts'],
    function: 'notifications'
  },
  {
    id: 'analytics', icon: BarChart2, label: 'Analytics', color: 'text-cyan-500', bg: 'bg-cyan-50',
    provider: 'Base44 Native', status: 'active', secret: null,
    features: ['Revenus par plan', 'Produits par catégorie', 'Revenus journaliers', 'Engagement alerts'],
    function: 'analytics'
  },
  {
    id: 'kyc', icon: Shield, label: 'KYC & Vérification', color: 'text-red-500', bg: 'bg-red-50',
    provider: 'OpenAI Vision', status: 'pending', secret: 'OPENAI_API_KEY',
    features: ['Vérification documents', 'Validation vendeurs', 'Analyse CNI/Passeport', 'Score confiance'],
    function: 'kyc'
  },
  {
    id: 'automations', icon: Zap, label: 'Automatisations', color: 'text-amber-500', bg: 'bg-amber-50',
    provider: 'Base44 Automations', status: 'active', secret: null,
    features: ['Nouveau produit → Opportunité IA', 'Demande service → Match prestataire', 'Flash sales auto (daily 9h)', 'Alertes broadcast'],
    function: 'automations'
  },
  {
    id: 'messaging', icon: MessageSquare, label: 'Messagerie', color: 'text-indigo-500', bg: 'bg-indigo-50',
    provider: 'Base44 Entities', status: 'active', secret: null,
    features: ['Chat acheteur/vendeur', 'Chat prestataire/client', 'Threads par produit', 'Notifications unread'],
    function: null
  },
];

const AUTOMATIONS_INFO = [
  { name: 'Nouveau produit → IA + Alert', trigger: 'Entité Product (create)', status: 'active' },
  { name: 'Demande service → Match prestataires', trigger: 'Entité ServiceRequest (create)', status: 'active' },
  { name: 'Génération flash sales auto', trigger: 'Planifié — chaque jour à 9h', status: 'active' },
];

export default function ApiDashboard() {
  const [testResult, setTestResult] = useState(null);
  const [testingId, setTestingId] = useState(null);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const testMutation = useMutation({
    mutationFn: async ({ fnName, payload }) => {
      const res = await base44.functions.invoke(fnName, payload);
      return res.data;
    },
    onSuccess: (data, vars) => {
      setTestResult({ id: vars.fnName, data });
      setTestingId(null);
    },
    onError: (err, vars) => {
      setTestResult({ id: vars.fnName, error: err.message });
      setTestingId(null);
    }
  });

  const handleTest = (api) => {
    if (!api.function) return;
    setTestingId(api.id);
    setTestResult(null);
    const payloads = {
      payment: { action: 'get_plans' },
      geolocate: { action: 'geocode_city', city: 'Abidjan, Côte d\'Ivoire' },
      aiAnalyze: { action: 'generate_description', data: { title: 'iPhone 15 Pro', category: 'electronics', price: 1200, currency: 'EUR' } },
      notifications: { action: 'mark_all_read' },
      analytics: { period_days: 30 },
    };
    testMutation.mutate({ fnName: api.function, payload: payloads[api.id] || {} });
  };

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-slate-500">Accès réservé aux administrateurs.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">🏗️ Architecture API</h1>
        <p className="text-slate-500 text-sm mt-1">Vue d'ensemble des APIs et automatisations intégrées à OptiMarket</p>
      </div>

      {/* API Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {API_INTEGRATIONS.map((api) => {
          const Icon = api.icon;
          const isActive = api.status === 'active';
          const isTesting = testingId === api.id;
          const result = testResult?.id === api.function ? testResult : null;

          return (
            <div key={api.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${api.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${api.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{api.label}</h3>
                    <p className="text-xs text-slate-500">{api.provider}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Actif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3" /> Clé manquante
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {api.features.map((f, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>

              {api.secret && !isActive && (
                <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Configurer <code className="bg-amber-50 px-1 rounded">{api.secret}</code> dans les secrets
                </p>
              )}

              {api.function && (
                <Button
                  size="sm" variant="outline"
                  className="w-full text-xs rounded-xl gap-1.5 mt-1"
                  onClick={() => handleTest(api)}
                  disabled={isTesting}
                >
                  {isTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  Tester la fonction
                </Button>
              )}

              {result && (
                <div className={`mt-2 p-2 rounded-lg text-xs font-mono overflow-auto max-h-24 ${result.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {result.error ? `❌ ${result.error}` : `✅ ${JSON.stringify(result.data, null, 2).slice(0, 200)}...`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Automations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" /> Automatisations actives
        </h2>
        <div className="space-y-3">
          {AUTOMATIONS_INFO.map((auto, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-slate-800">{auto.name}</p>
                <p className="text-xs text-slate-500">{auto.trigger}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> En ligne
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}