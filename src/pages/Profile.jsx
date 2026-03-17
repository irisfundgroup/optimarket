import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { User, ShoppingBag, Briefcase, Heart, History, CreditCard, Globe, LogOut, Crown, Bell, Settings, ChevronRight, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { t, LANGUAGES, getStoredLang, setStoredLang } from '@/lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Profile() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: subscription } = useQuery({
    queryKey: ['mySubscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user?.email, status: 'active' }, '-created_date', 1).then(r => r[0]),
    enabled: !!user?.email,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['myFavorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user?.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const { data: myProducts = [] } = useQuery({
    queryKey: ['myProducts', user?.email],
    queryFn: () => base44.entities.Product.filter({ seller_email: user?.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const { data: myServices = [] } = useQuery({
    queryKey: ['myServices', user?.email],
    queryFn: () => base44.entities.Service.filter({ provider_email: user?.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const handleLangChange = (lang) => {
    setStoredLang(lang);
    window.location.reload();
  };

  const menuItems = [
    { icon: ShoppingBag, label: `${t('my_listings')} (${myProducts.length})`, to: '/MyListings' },
    { icon: Briefcase, label: `${t('services')} (${myServices.length})`, to: '/MyServices' },
    { icon: Heart, label: `${t('favorites')} (${favorites.length})`, to: '/Favorites' },
    { icon: Bell, label: t('alerts'), to: '/Alerts' },
    { icon: MessageCircle, label: t('messages'), to: '/Messages' },
    { icon: CreditCard, label: t('subscription'), to: '/Subscription' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl font-bold">
            {user?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.full_name || 'Utilisateur'}</h1>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-white/10 text-white border-0 text-xs">{user?.role || 'user'}</Badge>
              {subscription && (
                <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs gap-1">
                  <Crown className="w-3 h-3" /> {subscription.plan}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {subscription && (
          <div className="mt-4 bg-white/5 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-slate-300">{t('credits')}</span>
            <span className="text-lg font-bold text-orange-400">{subscription.credits_remaining || 0}</span>
          </div>
        )}
      </div>

      {/* Language */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-sm">{t('language')}</span>
          </div>
          <Select value={getStoredLang()} onValueChange={handleLangChange}>
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => (
                <SelectItem key={l.code} value={l.code}>{l.flag} {l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4">
        {menuItems.map((item, i) => (
          <Link
            key={i}
            to={item.to}
            className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
          >
            <item.icon className="w-5 h-5 text-slate-500" />
            <span className="flex-1 text-sm font-medium text-slate-700">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        ))}
      </div>

      {/* Admin */}
      {user?.role === 'admin' && (
        <div className="space-y-2 mb-4">
          <Link to="/AdminDashboard">
            <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4 flex items-center gap-3 hover:bg-orange-100 transition-colors">
              <Settings className="w-5 h-5 text-orange-500" />
              <span className="flex-1 text-sm font-medium text-orange-700">{t('admin')} {t('dashboard')}</span>
              <ChevronRight className="w-4 h-4 text-orange-400" />
            </div>
          </Link>
          <Link to="/LiveScanner">
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 flex items-center gap-3 hover:bg-emerald-100 transition-colors">
              <span className="text-lg">🔴</span>
              <span className="flex-1 text-sm font-medium text-emerald-700">Détection Marché Non-Stop</span>
              <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
            </div>
          </Link>
          <Link to="/ApiDashboard">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center gap-3 hover:bg-slate-100 transition-colors">
              <span className="text-lg">🏗️</span>
              <span className="flex-1 text-sm font-medium text-slate-700">Architecture API</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </Link>
        </div>
      )}

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full rounded-xl text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        onClick={() => base44.auth.logout()}
      >
        <LogOut className="w-4 h-4 mr-2" />
        {t('logout')}
      </Button>
    </div>
  );
}