import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Zap, TrendingUp, ShoppingBag, Wifi, WifiOff, Play, RefreshCw,
  Clock, Bell, Target, Flame, ChevronRight, Activity, AlertCircle
} from 'lucide-react';

const SOURCE_CONFIG = {
  tiktok: { label: 'TikTok', color: 'bg-black text-white', dot: 'bg-pink-500' },
  aliexpress: { label: 'AliExpress', color: 'bg-orange-500 text-white', dot: 'bg-orange-400' },
  amazon: { label: 'Amazon', color: 'bg-amber-500 text-white', dot: 'bg-amber-400' },
};

function PulseDot({ color = 'bg-emerald-500' }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  );
}

function ScanLog({ log }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="mt-0.5">
        {log.type === 'opportunity' && <Target className="w-4 h-4 text-purple-500" />}
        {log.type === 'flash' && <Flame className="w-4 h-4 text-orange-500" />}
        {log.type === 'alert' && <Bell className="w-4 h-4 text-blue-500" />}
        {log.type === 'scan' && <Activity className="w-4 h-4 text-emerald-500" />}
        {log.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 font-medium leading-snug">{log.message}</p>
        <p className="text-xs text-slate-400 mt-0.5">{log.time}</p>
      </div>
      {log.badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${SOURCE_CONFIG[log.badge]?.color || 'bg-slate-100 text-slate-600'}`}>
          {SOURCE_CONFIG[log.badge]?.label || log.badge}
        </span>
      )}
    </div>
  );
}

export default function LiveScanner() {
  const queryClient = useQueryClient();
  const [logs, setLogs] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [nextScanIn, setNextScanIn] = useState(null);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: recentOpportunities } = useQuery({
    queryKey: ['recentOpps'],
    queryFn: () => base44.entities.Opportunity.list('-created_date', 10),
    refetchInterval: isLive ? 30000 : false
  });
  const { data: recentAlerts } = useQuery({
    queryKey: ['recentAlerts'],
    queryFn: () => base44.entities.Alert.filter({ user_email: user?.email }, '-created_date', 5),
    enabled: !!user?.email,
    refetchInterval: isLive ? 15000 : false
  });

  const scanMutation = useMutation({
    mutationFn: () => base44.functions.invoke('marketScanner', { action: 'full_scan' }),
    onMutate: () => {
      addLog('scan', '🔍 Scan en cours — TikTok CI + AliExpress + Amazon FR...', null);
    },
    onSuccess: (res) => {
      const d = res.data;
      addLog('scan', `✅ Scan terminé — ${d.signals_fetched || 0} signaux analysés`, null);
      if (d.opportunities_created > 0)
        addLog('opportunity', `🎯 ${d.opportunities_created} opportunité(s) créée(s) par l'IA`, null);
      if (d.flash_sales_created > 0)
        addLog('flash', `🔥 ${d.flash_sales_created} vente(s) flash générée(s) automatiquement`, null);
      if (d.alerts_sent > 0)
        addLog('alert', `🔔 ${d.alerts_sent} alertes envoyées aux utilisateurs`, null);
      queryClient.invalidateQueries({ queryKey: ['recentOpps'] });
      queryClient.invalidateQueries({ queryKey: ['recentAlerts'] });
    },
    onError: (err) => {
      addLog('error', `❌ Erreur: ${err.message}`, null);
    }
  });

  const addLog = (type, message, badge) => {
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ type, message, badge, time, id: Date.now() }, ...prev].slice(0, 50));
  };

  const startLive = () => {
    setIsLive(true);
    addLog('scan', '🟢 Mode NON-STOP activé — scan toutes les 30 minutes', null);
    scanMutation.mutate(); // immediate first scan
    setNextScanIn(1800);

    intervalRef.current = setInterval(() => {
      scanMutation.mutate();
      setNextScanIn(1800);
    }, 30 * 60 * 1000);

    countdownRef.current = setInterval(() => {
      setNextScanIn(prev => (prev > 0 ? prev - 1 : 1800));
    }, 1000);
  };

  const stopLive = () => {
    setIsLive(false);
    setNextScanIn(null);
    clearInterval(intervalRef.current);
    clearInterval(countdownRef.current);
    addLog('scan', '🔴 Mode NON-STOP arrêté', null);
  };

  useEffect(() => () => {
    clearInterval(intervalRef.current);
    clearInterval(countdownRef.current);
  }, []);

  const formatCountdown = (s) => {
    if (!s) return '';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-slate-500">Accès réservé aux administrateurs.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500" />
            Détection Marché Non-Stop
          </h1>
          <p className="text-slate-500 text-sm mt-1">TikTok Côte d'Ivoire · AliExpress · Amazon — analyse IA en temps réel</p>
        </div>
        <div className="flex items-center gap-3">
          {isLive && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              <PulseDot />
              <span className="text-xs font-semibold text-emerald-700">
                Prochain scan: {formatCountdown(nextScanIn)}
              </span>
            </div>
          )}
          {!isLive ? (
            <Button onClick={startLive} className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl gap-2 shadow-lg shadow-emerald-200">
              <Play className="w-4 h-4" /> Démarrer Non-Stop
            </Button>
          ) : (
            <Button onClick={stopLive} variant="outline" className="rounded-xl gap-2 border-red-200 text-red-600 hover:bg-red-50">
              <WifiOff className="w-4 h-4" /> Arrêter
            </Button>
          )}
          <Button onClick={() => scanMutation.mutate()} variant="outline" className="rounded-xl gap-2"
            disabled={scanMutation.isPending}>
            <RefreshCw className={`w-4 h-4 ${scanMutation.isPending ? 'animate-spin' : ''}`} />
            Scan manuel
          </Button>
        </div>
      </div>

      {/* Sources Status */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { source: 'tiktok', label: 'TikTok Trends CI', icon: '🎵', desc: 'Tendances Côte d\'Ivoire' },
          { source: 'aliexpress', label: 'AliExpress Hot', icon: '🛒', desc: 'Bestsellers mondialx' },
          { source: 'amazon', label: 'Amazon Movers', icon: '📦', desc: 'Movers & Shakers FR' },
        ].map(s => (
          <div key={s.source} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm">{s.label}</p>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </div>
            <PulseDot color={isLive ? 'bg-emerald-500' : 'bg-slate-300'} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Log */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Journal en direct
            </h2>
            {isLive && <PulseDot />}
          </div>
          <div className="p-4 max-h-80 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">
                Appuyez sur "Démarrer Non-Stop" pour lancer la détection
              </p>
            ) : (
              logs.map(log => <ScanLog key={log.id} log={log} />)
            )}
          </div>
        </div>

        {/* Recent Opportunities */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" /> Dernières opportunités créées
            </h2>
            <Link to="/Opportunities" className="text-xs text-orange-500 font-semibold flex items-center gap-0.5">
              Voir tout <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
            {(recentOpportunities || []).length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Aucune opportunité encore — lancez un scan</p>
            ) : (
              (recentOpportunities || []).map(opp => (
                <Link key={opp.id} to={`/OpportunityDetail?id=${opp.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-700">{opp.score}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{opp.title}</p>
                    <p className="text-xs text-slate-500">{opp.type?.replace('_', ' ')} · +{opp.potential_margin}% marge</p>
                  </div>
                  {opp.is_premium && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">VIP</span>}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Opportunités actives', value: (recentOpportunities || []).length, icon: Target, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Alertes récentes', value: (recentAlerts || []).length, icon: Bell, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Scans effectués', value: logs.filter(l => l.type === 'scan' && l.message.includes('✅')).length, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}