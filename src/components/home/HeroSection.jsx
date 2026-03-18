import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Zap, TrendingUp, ShoppingBag, MapPin, Sparkles } from 'lucide-react';
import StatsBar from './StatsBar';

export default function HeroSection({ onSearch, searchQuery, setSearchQuery }) {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #060c18 0%, #0a1628 50%, #060c18 100%)' }}>
      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/3 w-96 h-96 rounded-full animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute -bottom-20 left-0 w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-100" />

      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)' }} />

      <div className="text-[#c47a31] mx-auto px-4 py-14 relative md:px-8 md:py-24 max-w-6xl">
        <div className="text-center mb-10">
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-4">
            <span className="text-white">Le Marché</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #fcd34d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Intelligent
            </span>
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
            Opportunités IA · Ventes Flash · Marketplace · Géolocalisation
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center rounded-2xl p-1.5 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(245,158,11,0.2)',
            boxShadow: '0 0 40px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            <Search className="w-5 h-5 mx-3 flex-shrink-0" style={{ color: '#475569' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="Rechercher produits, services, opportunités..."
              className="flex-1 bg-transparent outline-none text-sm py-3"
              style={{ color: '#e2e8f0', caretColor: '#f59e0b' }} />
            
            <div className="flex items-center gap-2 px-2">
              <button className="flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded-lg"
              style={{ color: '#475569' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#f59e0b'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}>
                <MapPin className="w-3.5 h-3.5" /> Localiser
              </button>
              <button onClick={onSearch}
              className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 4px 15px rgba(245,158,11,0.35)'
              }}>
                Rechercher
              </button>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {[
          { to: '/Products', icon: ShoppingBag, label: 'Produits', color: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', text: '#a5b4fc' },
          { to: '/FlashSales', icon: Zap, label: 'Ventes Flash', color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24', glow: true },
          { to: '/Opportunities', icon: TrendingUp, label: 'Opportunités IA', color: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7' }].
          map((item, i) =>
          <Link key={i} to={item.to}>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: item.color,
              border: `1px solid ${item.border}`,
              color: item.text,
              boxShadow: item.glow ? '0 0 20px rgba(245,158,11,0.15)' : 'none'
            }}
            onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-2px)';e.currentTarget.style.boxShadow = `0 8px 25px ${item.color}`;}}
            onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)';e.currentTarget.style.boxShadow = item.glow ? '0 0 20px rgba(245,158,11,0.15)' : 'none';}}>
              
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="max-w-lg mx-auto">
          <StatsBar />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16"
      style={{ background: 'linear-gradient(to bottom, transparent, #060c18)' }} />
    </section>);

}