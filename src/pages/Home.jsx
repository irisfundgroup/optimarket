import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, TrendingUp, ShoppingBag, Briefcase, Plus, ArrowRight } from 'lucide-react';
import HomeFooter from '@/components/home/HomeFooter';
import { t } from '@/lib/i18n';
import HeroSection from '@/components/home/HeroSection';
import SectionHeader from '@/components/home/SectionHeader';
import ProductCard from '@/components/cards/ProductCard';
import ServiceCard from '@/components/cards/ServiceCard';
import OpportunityCard from '@/components/cards/OpportunityCard';
import FlashSaleCard from '@/components/cards/FlashSaleCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ActivatorHome from '@/pages/ActivatorHome';

const SkeletonCards = ({ count = 3, type = 'product' }) => (
  <div className={`grid ${type === 'service' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3'} gap-4`}>
    {Array(count).fill(0).map((_, i) => (
      <div key={i} className="space-y-3 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Skeleton className="aspect-[4/3] rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <Skeleton className="h-4 w-3/4 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <Skeleton className="h-3 w-1/2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    ))}
  </div>
);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refBanner, setRefBanner] = useState(false);
  const navigate = useNavigate();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) {
      localStorage.setItem('pending_ref_code', ref);
      setRefBanner(true);
      window.history.replaceState({}, '', '/Home');
    }
  }, []);

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['homeProducts'],
    queryFn: () => base44.entities.Product.filter({ status: 'active' }, '-created_date', 6),
  });

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['homeServices'],
    queryFn: () => base44.entities.Service.filter({ status: 'active' }, '-created_date', 4),
  });

  const { data: opportunities = [], isLoading: loadingOpps } = useQuery({
    queryKey: ['homeOpportunities'],
    queryFn: () => base44.entities.Opportunity.filter({ status: 'active' }, '-score', 4),
  });

  const { data: flashSales = [], isLoading: loadingFlash } = useQuery({
    queryKey: ['homeFlashSales'],
    queryFn: () => base44.entities.FlashSale.filter({ status: 'active' }, '-created_date', 4),
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/Products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Si l'utilisateur est un activateur, afficher son interface dédiée
  if (user?.role === 'activator') {
    return <ActivatorHome />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#ffffff' }}>
      <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} />

      {refBanner && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
          <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/30 rounded-2xl p-4 text-orange-300">
            <span className="text-2xl">🎁</span>
            <div className="flex-1">
              <p className="font-bold text-sm">Vous avez été parrainé !</p>
              <p className="text-xs text-orange-400">Inscrivez-vous pour recevoir 1 crédit offert et profiter de la plateforme.</p>
            </div>
            <button onClick={() => setRefBanner(false)} className="text-orange-400 hover:text-orange-300 text-xs">✕</button>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-12">

        {/* AI Opportunities */}
        <section>
          <SectionHeader title={t('today_opportunities')} icon={TrendingUp} linkTo="/Opportunities" iconColor="text-emerald-500" />
          {loadingOpps ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {opportunities.map(opp => <OpportunityCard key={opp.id} opportunity={opp} />)}
              {opportunities.length === 0 && (
                <div className="col-span-full flex flex-col items-center gap-3 py-10" style={{ color: '#334155' }}>
                  <TrendingUp className="w-10 h-10 opacity-30" />
                  <p className="text-sm">{t('no_results')}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Flash Sales */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <SectionHeader title={t('flash_deals')} icon={Zap} iconColor="text-red-500" />
            <Link to="/FlashSales" className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium">
              {t('see_all')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loadingFlash ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flashSales.map(sale => <FlashSaleCard key={sale.id} sale={sale} />)}
              {flashSales.length === 0 && (
                <div className="col-span-full flex flex-col items-center gap-3 py-10" style={{ color: '#334155' }}>
                  <Zap className="w-10 h-10 opacity-30" />
                  <p className="text-sm">{t('no_results')}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Products */}
        <section>
          <SectionHeader title={t('products_near')} icon={ShoppingBag} linkTo="/Products" iconColor="text-blue-500" />
          {loadingProducts ? <SkeletonCards count={6} /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
              {products.length === 0 && <p className="col-span-full text-slate-500 text-sm text-center py-8">{t('no_results')}</p>}
            </div>
          )}
        </section>

        {/* Services */}
        <section>
          <SectionHeader title={t('services_near')} icon={Briefcase} linkTo="/Services" iconColor="text-purple-500" />
          {loadingServices ? <SkeletonCards count={4} type="service" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(s => <ServiceCard key={s.id} service={s} />)}
              {services.length === 0 && <p className="col-span-full text-slate-500 text-sm text-center py-8">{t('no_results')}</p>}
            </div>
          )}
        </section>

        {/* Publish CTA */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Publier un produit', to: '/PublishProduct', accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', icon: ShoppingBag },
            { label: 'Proposer un service', to: '/PublishService', accent: '#818cf8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', icon: Briefcase },
            { label: 'Demander un service', to: '/PublishRequest', accent: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.25)', icon: Plus },
          ].map((cta, i) => (
            <Link key={i} to={cta.to}>
              <div className="flex items-center gap-3 p-5 rounded-2xl transition-all"
                style={{ background: cta.bg, border: `1px solid ${cta.border}`, color: cta.accent }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.4), 0 0 20px ${cta.accent}20`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <cta.icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{cta.label}</span>
                <ArrowRight className="w-4 h-4 ml-auto opacity-60" />
              </div>
            </Link>
          ))}
        </section>
      </div>
      <HomeFooter />
    </div>
  );
}