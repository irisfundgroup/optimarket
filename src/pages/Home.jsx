import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, TrendingUp, ShoppingBag, Briefcase } from 'lucide-react';
import { t } from '@/lib/i18n';
import HeroSection from '@/components/home/HeroSection';
import SectionHeader from '@/components/home/SectionHeader';
import ProductCard from '@/components/cards/ProductCard';
import ServiceCard from '@/components/cards/ServiceCard';
import OpportunityCard from '@/components/cards/OpportunityCard';
import FlashSaleCard from '@/components/cards/FlashSaleCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['homeProducts'],
    queryFn: () => base44.entities.Product.filter({ status: 'active' }, '-created_date', 6),
  });

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['homeServices'],
    queryFn: () => base44.entities.Service.filter({ status: 'active' }, '-created_date', 6),
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

  const SkeletonCards = ({ count = 3 }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[4/3] rounded-2xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-10">
        {/* Opportunities */}
        <section>
          <SectionHeader title={t('today_opportunities')} icon={TrendingUp} linkTo="/Opportunities" iconColor="text-emerald-500" />
          {loadingOpps ? <SkeletonCards count={4} /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {opportunities.map(opp => <OpportunityCard key={opp.id} opportunity={opp} />)}
              {opportunities.length === 0 && <p className="text-slate-500 text-sm col-span-full">{t('no_results')}</p>}
            </div>
          )}
        </section>

        {/* Flash Sales */}
        <section>
          <SectionHeader title={t('flash_deals')} icon={Zap} linkTo="/FlashSales" iconColor="text-red-500" />
          {loadingFlash ? <SkeletonCards count={4} /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flashSales.map(sale => <FlashSaleCard key={sale.id} sale={sale} />)}
              {flashSales.length === 0 && <p className="text-slate-500 text-sm col-span-full">{t('no_results')}</p>}
            </div>
          )}
        </section>

        {/* Products Near Me */}
        <section>
          <SectionHeader title={t('products_near')} icon={ShoppingBag} linkTo="/Products" iconColor="text-blue-500" />
          {loadingProducts ? <SkeletonCards count={6} /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
              {products.length === 0 && <p className="text-slate-500 text-sm col-span-full">{t('no_results')}</p>}
            </div>
          )}
        </section>

        {/* Services Near Me */}
        <section>
          <SectionHeader title={t('services_near')} icon={Briefcase} linkTo="/Services" iconColor="text-purple-500" />
          {loadingServices ? <SkeletonCards count={4} /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(s => <ServiceCard key={s.id} service={s} />)}
              {services.length === 0 && <p className="text-slate-500 text-sm col-span-full">{t('no_results')}</p>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}