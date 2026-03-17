import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { t } from '@/lib/i18n';
import OpportunityCard from '@/components/cards/OpportunityCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Opportunities() {
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['opportunities', typeFilter],
    queryFn: () => {
      const filter = { status: 'active' };
      if (typeFilter !== 'all') filter.type = typeFilter;
      return base44.entities.Opportunity.filter(filter, '-score', 50);
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-500" />
          <h1 className="text-2xl font-bold text-slate-900">{t('opportunities')}</h1>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48 rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all')}</SelectItem>
            <SelectItem value="product_deal">Deal Produit</SelectItem>
            <SelectItem value="service_demand">Demande Service</SelectItem>
            <SelectItem value="trending">Tendance</SelectItem>
            <SelectItem value="price_drop">Baisse Prix</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map(opp => <OpportunityCard key={opp.id} opportunity={opp} />)}
          {opportunities.length === 0 && (
            <p className="col-span-full text-center text-slate-500 py-12">{t('no_results')}</p>
          )}
        </div>
      )}
    </div>
  );
}