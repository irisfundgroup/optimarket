import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap } from 'lucide-react';
import { t } from '@/lib/i18n';
import FlashSaleCard from '@/components/cards/FlashSaleCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function FlashSales() {
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['flashSales'],
    queryFn: () => base44.entities.FlashSale.filter({ status: 'active' }, '-created_date', 50),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-6 h-6 text-red-500" />
        <h1 className="text-2xl font-bold text-slate-900">{t('flash_sales')}</h1>
      </div>

      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-200 rounded-2xl p-4 mb-6">
        <p className="text-sm text-red-700 font-medium flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Les ventes flash sont limitées en temps et en quantité. Agissez vite !
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[16/14] rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sales.map(sale => <FlashSaleCard key={sale.id} sale={sale} />)}
          {sales.length === 0 && (
            <p className="col-span-full text-center text-slate-500 py-12">{t('no_results')}</p>
          )}
        </div>
      )}
    </div>
  );
}