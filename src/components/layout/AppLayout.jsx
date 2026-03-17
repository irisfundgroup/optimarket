import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Briefcase, Zap, Bell, MessageCircle, User, TrendingUp, Menu, X, Plus, LayoutDashboard } from 'lucide-react';
import { t, isRTL } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

const NAV_ITEMS = [
  { path: '/Home', icon: Home, labelKey: 'home' },
  { path: '/Products', icon: ShoppingBag, labelKey: 'products' },
  { path: '/Services', icon: Briefcase, labelKey: 'services' },
  { path: '/Opportunities', icon: TrendingUp, labelKey: 'opportunities' },
  { path: '/FlashSales', icon: Zap, labelKey: 'flash_sales' },
];

const SECONDARY_NAV = [
  { path: '/Alerts', icon: Bell, labelKey: 'alerts', badge: true },
  { path: '/Messages', icon: MessageCircle, labelKey: 'messages' },
  { path: '/Profile', icon: User, labelKey: 'profile' },
];

export default function AppLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const rtl = isRTL();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: unreadAlerts = [] } = useQuery({
    queryKey: ['unreadAlerts', user?.email],
    queryFn: () => base44.entities.Alert.filter({ user_email: user?.email, is_read: false }),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`min-h-screen bg-slate-50 ${rtl ? 'rtl' : 'ltr'}`} dir={rtl ? 'rtl' : 'ltr'}>
      {/* Desktop Top Bar */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 items-center px-6 shadow-xl shadow-black/10">
        <Link to="/Home" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">OptiMarket</span>
        </Link>

        <nav className="flex items-center gap-0.5 ml-8">
          {NAV_ITEMS.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path)
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              <item.icon className={`w-4 h-4 ${isActive(item.path) && item.path === '/FlashSales' ? 'text-orange-400' : ''}`} />
              {t(item.labelKey)}
              {isActive(item.path) && (
                <span className="w-1 h-1 rounded-full bg-orange-500" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 ml-auto">
          {/* Publish CTA */}
          <Link to="/PublishProduct">
            <button className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3.5 py-2 rounded-xl transition-all mr-2 shadow-lg shadow-orange-500/20">
              <Plus className="w-4 h-4" /> Publier
            </button>
          </Link>

          {SECONDARY_NAV.map(item => (
            <Link key={item.path} to={item.path}
              className={`relative p-2.5 rounded-xl transition-all ${
                isActive(item.path) ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              <item.icon className="w-5 h-5" />
              {item.badge && unreadAlerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-black border-2 border-slate-900">
                  {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
                </span>
              )}
            </Link>
          ))}

          {user?.role === 'admin' && (
            <Link to="/AdminDashboard"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ml-1 ${
                isActive('/AdminDashboard') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              <LayoutDashboard className="w-4 h-4" /> Admin
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4">
        <Link to="/Home" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-black text-white">OptiMarket</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link to="/Alerts" className="relative p-2 text-slate-400">
            <Bell className="w-5 h-5" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-black">{unreadAlerts.length}</span>
            )}
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-400 hover:text-white p-2 transition-colors">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-slate-900/98 backdrop-blur-xl border-b border-white/5">
          <div className="p-4 space-y-1">
            {[...NAV_ITEMS, ...SECONDARY_NAV].map(item => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.path) ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}>
                <item.icon className="w-5 h-5" />
                {t(item.labelKey)}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link to="/AdminDashboard" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white">
                <LayoutDashboard className="w-5 h-5" /> Admin
              </Link>
            )}
          </div>
          <div className="px-4 pb-4 border-t border-white/5 pt-3">
            <Link to="/PublishProduct" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 rounded-xl">
                <Plus className="w-4 h-4" /> Publier une annonce
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="pt-14 md:pt-16 pb-20 md:pb-6 min-h-screen">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-xl">
        <div className="flex items-center justify-around px-2 h-16">
          {[
            { path: '/Home', icon: Home, label: 'Accueil' },
            { path: '/Products', icon: ShoppingBag, label: 'Produits' },
            { path: '/FlashSales', icon: Zap, label: 'Flash', highlight: true },
            { path: '/Messages', icon: MessageCircle, label: 'Messages' },
            { path: '/Profile', icon: User, label: 'Profil' },
          ].map(item => (
            <Link key={item.path} to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive(item.path) ? 'text-orange-500' : 'text-slate-400'
              }`}>
              {item.highlight ? (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isActive(item.path) ? 'bg-orange-500' : 'bg-slate-900'
                }`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-orange-500' : 'text-slate-400'}`} />
              )}
              {!item.highlight && <span className="text-[10px] font-medium">{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}