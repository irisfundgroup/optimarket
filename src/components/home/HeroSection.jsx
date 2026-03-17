import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Zap, TrendingUp, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

export default function HeroSection({ onSearch, searchQuery, setSearchQuery }) {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[128px]" />
      </div>
      <div className="relative px-4 md:px-8 py-10 md:py-16 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            {t('welcome')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">OptiMarket</span>
          </h1>
          <p className="text-slate-400 mt-3 text-sm md:text-lg max-w-xl mx-auto">{t('tagline')}</p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 p-2">
            <Search className="w-5 h-5 text-slate-400 mx-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder={t('search')}
              className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-sm py-2"
            />
            <Button onClick={onSearch} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6">
              {t('search').replace('...', '')}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/Products">
            <Button variant="outline" className="rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white gap-2">
              <ShoppingBag className="w-4 h-4" /> {t('products')}
            </Button>
          </Link>
          <Link to="/FlashSales">
            <Button variant="outline" className="rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white gap-2">
              <Zap className="w-4 h-4 text-orange-400" /> {t('flash_sales')}
            </Button>
          </Link>
          <Link to="/Opportunities">
            <Button variant="outline" className="rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> {t('opportunities')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}