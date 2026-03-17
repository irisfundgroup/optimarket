import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Zap, TrendingUp, ShoppingBag, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import StatsBar from './StatsBar';

export default function HeroSection({ onSearch, searchQuery, setSearchQuery }) {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 left-1/4 w-80 h-80 bg-orange-500 rounded-full blur-[120px] opacity-15 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[140px] opacity-10" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative px-4 md:px-8 py-12 md:py-20 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 rounded-full px-4 py-1.5 mb-5">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-orange-300 text-xs font-semibold tracking-wide uppercase">Propulsé par l'IA</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
            {t('welcome')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
              OptiMarket
            </span>
          </h1>
          <p className="text-slate-400 mt-4 text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t('tagline')} — Marketplace · IA · Ventes Flash · Géolocalisation
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-2 shadow-2xl shadow-black/20">
            <Search className="w-5 h-5 text-slate-400 mx-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder={t('search')}
              className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-sm py-3"
            />
            <div className="flex items-center gap-2 px-2">
              <button className="flex items-center gap-1.5 text-slate-400 hover:text-orange-400 text-xs transition-colors px-2">
                <MapPin className="w-4 h-4" /> Localiser
              </button>
              <Button onClick={onSearch} size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white rounded-xl px-5 h-9 font-semibold">
                Rechercher
              </Button>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { to: '/Products', icon: ShoppingBag, label: t('products'), color: 'hover:border-blue-500/50' },
            { to: '/FlashSales', icon: Zap, label: t('flash_sales'), color: 'hover:border-orange-500/50', highlight: true },
            { to: '/Opportunities', icon: TrendingUp, label: t('opportunities'), color: 'hover:border-emerald-500/50' },
          ].map((item, i) => (
            <Link key={i} to={item.to}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium transition-all hover:bg-white/10 ${item.color} ${item.highlight ? 'border-orange-500/30 bg-orange-500/10' : ''}`}>
                <item.icon className={`w-4 h-4 ${item.highlight ? 'text-orange-400' : 'text-slate-400'}`} />
                {item.label}
              </div>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="max-w-lg mx-auto">
          <StatsBar />
        </div>
      </div>
    </section>
  );
}