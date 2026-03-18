import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Briefcase, Zap, Bell, MessageCircle, User, TrendingUp, Menu, X, Plus, LayoutDashboard, Activity, Wallet, History } from 'lucide-react';
import ActivatorNotificationBell from '@/components/activator/ActivatorNotificationBell';
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
  { path: '/Alerts', icon: Bell, labelKey: 'alerts', badge: true },
  { path: '/Messages', icon: MessageCircle, labelKey: 'messages' },
  { path: '/Profile', icon: User, labelKey: 'profile' },
];

const ACTIVATOR_NAV = [
  { path: '/Home', icon: Home, labelKey: 'home' },
  { path: '/ActivatorOpportunities', icon: TrendingUp, labelKey: 'opportunities' },
  { path: '/ActivatorWallet', icon: Wallet, label: 'Wallet' },
  { path: '/ActivatorHistory', icon: History, label: 'Gains' },
];

export default function AppLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const rtl = isRTL();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const isActivator = user?.role === 'activator';

  const { data: unreadAlerts = [] } = useQuery({
    queryKey: ['unreadAlerts', user?.email],
    queryFn: () => base44.entities.Alert.filter({ user_email: user?.email, is_read: false }),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`min-h-screen ${rtl ? 'rtl' : 'ltr'}`} style={{ background: '#ffffff' }} dir={rtl ? 'rtl' : 'ltr'}>

      {/* Desktop Top Bar */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center px-6"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>

        {/* Logo */}
        <Link to="/Home" className="flex items-center gap-2.5 flex-shrink-0 group">
          <img src="https://media.base44.com/images/public/69b89fb850f8b3d28e9e4bf6/6c0cb9dce_generated_image.png" alt="OptiMarket" className="h-9 w-auto" />
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 ml-8">
          {NAV_ITEMS.map(item => (
            <Link key={item.path} to={item.path}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all relative"
              style={{
                color: isActive(item.path) ? '#fbbf24' : '#64748b',
                background: isActive(item.path) ? 'rgba(245,158,11,0.1)' : 'transparent',
                border: isActive(item.path) ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive(item.path)) { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}}
              onMouseLeave={e => { if (!isActive(item.path)) { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}}
            >
              <item.icon className="w-4 h-4" />
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 ml-auto">
          {/* Activator notification bell */}
          {isActivator && <ActivatorNotificationBell user={user} />}

          {/* Publish CTA */}
          {!isActivator && (
            <Link to="/PublishProduct" className="mr-2">
              <button className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff',
                  boxShadow: '0 4px 15px rgba(245,158,11,0.3)'
                }}>
                <Plus className="w-4 h-4" /> Publier
              </button>
            </Link>
          )}

          {SECONDARY_NAV.map(item => (
            <Link key={item.path} to={item.path}
              className="relative p-2.5 rounded-xl transition-all"
              style={{
                color: isActive(item.path) ? '#fbbf24' : '#64748b',
                background: isActive(item.path) ? 'rgba(245,158,11,0.1)' : 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = isActive(item.path) ? '#fbbf24' : '#64748b'; e.currentTarget.style.background = isActive(item.path) ? 'rgba(245,158,11,0.1)' : 'transparent'; }}
            >
              <item.icon className="w-5 h-5" />
              {item.badge && unreadAlerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center font-black"
                  style={{ background: '#ef4444', border: '2px solid #060c18' }}>
                  {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
                </span>
              )}
            </Link>
          ))}

          {user?.role === 'admin' && (
            <Link to="/AdminDashboard"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ml-1"
              style={{ color: isActive('/AdminDashboard') ? '#fbbf24' : '#64748b' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = isActive('/AdminDashboard') ? '#fbbf24' : '#64748b'; e.currentTarget.style.background = 'transparent'; }}
            >
              <LayoutDashboard className="w-4 h-4" /> Admin
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4"
        style={{
          background: 'rgba(6, 12, 24, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.1)',
        }}>
        <Link to="/Home" className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/69b89fb850f8b3d28e9e4bf6/6c0cb9dce_generated_image.png" alt="OptiMarket" className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-1">
          {isActivator
            ? <ActivatorNotificationBell user={user} />
            : <Link to="/Alerts" className="relative p-2" style={{ color: '#64748b' }}>
                <Bell className="w-5 h-5" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 rounded-full text-[8px] text-white flex items-center justify-center font-black"
                    style={{ background: '#ef4444' }}>
                    {unreadAlerts.length}
                  </span>
                )}
              </Link>
          }
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 transition-colors" style={{ color: '#64748b' }}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-40"
          style={{
            background: 'rgba(6, 12, 24, 0.98)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.1)',
          }}>
          <div className="p-4 space-y-1">
            {[...NAV_ITEMS, ...SECONDARY_NAV].map(item => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  color: isActive(item.path) ? '#fbbf24' : '#64748b',
                  background: isActive(item.path) ? 'rgba(245,158,11,0.1)' : 'transparent',
                  border: isActive(item.path) ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
                }}>
                <item.icon className="w-5 h-5" />
                {t(item.labelKey)}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <>
                <Link to="/AdminDashboard" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ color: '#64748b' }}>
                  <LayoutDashboard className="w-5 h-5" /> Admin
                </Link>
                <Link to="/LiveScanner" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ color: '#10b981' }}>
                  <Activity className="w-5 h-5" /> Scanner Live
                </Link>
              </>
            )}
          </div>
          <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
            <Link to="/PublishProduct" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(6, 12, 24, 0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(245, 158, 11, 0.1)',
      }}>
      <div className="flex items-center justify-around px-2 h-16">
        {(isActivator ? [
          { path: '/Home', icon: Home, labelKey: 'home' },
          { path: '/ActivatorOpportunities', icon: TrendingUp, label: 'Opps', highlight: true },
          { path: '/ActivatorWallet', icon: Wallet, label: 'Wallet' },
          { path: '/ActivatorHistory', icon: History, label: 'Gains' },
          { path: '/Profile', icon: User, labelKey: 'profile' },
        ] : [
          { path: '/Home', icon: Home, labelKey: 'home' },
          { path: '/Products', icon: ShoppingBag, labelKey: 'products' },
          { path: '/FlashSales', icon: Zap, labelKey: 'flash_sales', highlight: true },
          { path: '/Messages', icon: MessageCircle, labelKey: 'messages' },
          { path: '/Profile', icon: User, labelKey: 'profile' },
        ]).map(item => (
            <Link key={item.path} to={item.path}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all">
              {item.highlight ? (
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: isActive(item.path)
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : 'rgba(245,158,11,0.15)',
                    boxShadow: isActive(item.path) ? '0 0 16px rgba(245,158,11,0.4)' : 'none',
                    border: '1px solid rgba(245,158,11,0.3)',
                  }}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <>
                  <item.icon className="w-5 h-5 transition-colors" style={{ color: isActive(item.path) ? '#fbbf24' : '#475569' }} />
                  <span className="text-[10px] font-medium transition-colors" style={{ color: isActive(item.path) ? '#fbbf24' : '#475569' }}>
                     {item.label || t(item.labelKey)}
                  </span>
                </>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}