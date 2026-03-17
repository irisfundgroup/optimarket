import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Briefcase, Zap, Bell, MessageCircle, User, TrendingUp, Menu, X } from 'lucide-react';
import { t, isRTL } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const NAV_ITEMS = [
  { path: '/Home', icon: Home, labelKey: 'home' },
  { path: '/Products', icon: ShoppingBag, labelKey: 'products' },
  { path: '/Services', icon: Briefcase, labelKey: 'services' },
  { path: '/Opportunities', icon: TrendingUp, labelKey: 'opportunities' },
  { path: '/FlashSales', icon: Zap, labelKey: 'flash_sales' },
];

const SECONDARY_NAV = [
  { path: '/Alerts', icon: Bell, labelKey: 'alerts' },
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
  });

  const allNav = [...NAV_ITEMS, ...SECONDARY_NAV];
  const isActive = (path) => location.pathname === path;

  return (
    <div className={`min-h-screen bg-slate-50 ${rtl ? 'rtl' : 'ltr'}`} dir={rtl ? 'rtl' : 'ltr'}>
      {/* Top Bar - Desktop */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900 border-b border-slate-800 items-center px-6">
        <Link to="/Home" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">OptiMarket</span>
        </Link>

        <nav className="flex items-center gap-1 ml-10">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(item.path)
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          {SECONDARY_NAV.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative p-2.5 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.labelKey === 'alerts' && unreadAlerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
                </span>
              )}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              to="/AdminDashboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/AdminDashboard')
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t('admin')}
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-slate-900 flex items-center justify-between px-4">
        <Link to="/Home" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">OptiMarket</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 p-4 space-y-1">
          {allNav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                isActive(item.path) ? 'bg-orange-500/20 text-orange-400' : 'text-slate-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {t(item.labelKey)}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/AdminDashboard" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300">
              {t('admin')}
            </Link>
          )}
        </div>
      )}

      {/* Main content */}
      <main className="pt-14 md:pt-16 pb-20 md:pb-6">
        <Outlet />
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2">
        {[...NAV_ITEMS.slice(0, 3), { path: '/FlashSales', icon: Zap, labelKey: 'flash_sales' }, { path: '/Profile', icon: User, labelKey: 'profile' }].map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-all ${
              isActive(item.path) ? 'text-orange-500' : 'text-slate-400'
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}