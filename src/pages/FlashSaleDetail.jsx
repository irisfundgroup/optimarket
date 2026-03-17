import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { Skeleton } from '@/components/ui/skeleton';

export default function FlashSaleDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  const { data: sale, isLoading } = useQuery({
    queryKey: ['flashSale', id],
    queryFn: () => base44.entities.FlashSale.filter({ id }).then(r => r[0]),
    enabled: !!id,
  });

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-6"><Skeleton className="h-80 rounded-2xl" /></div>;
  if (!sale) return <div className="text-center py-20 text-slate-500">{t('no_results')}</div>;

  const discountPercent = sale.discount_percent || (sale.original_price ? Math.round((1 - sale.flash_price / sale.original_price) * 100) : 0);
  const remaining = (sale.quantity_total || 0) - (sale.quantity_sold || 0);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/FlashSales"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-lg font-bold text-slate-900 truncate">{sale.title}</h1>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden">
        <div className="relative">
          <img
            src={sale.image_url || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80'}
            alt={sale.title}
            className="w-full aspect-video object-cover opacity-90"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-red-500 text-white border-0 text-lg font-bold gap-1 px-4 py-1">
              <Zap className="w-4 h-4" /> -{discountPercent}%
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{sale.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl font-bold text-orange-400">{sale.flash_price?.toFixed(0)} {sale.currency || 'EUR'}</span>
                {sale.original_price && (
                  <span className="text-lg text-slate-500 line-through">{sale.original_price?.toFixed(0)}</span>
                )}
              </div>
            </div>
            <CountdownTimer endDate={sale.ends_at} />
          </div>

          {sale.description && (
            <p className="text-sm text-slate-400">{sale.description}</p>
          )}

          {sale.quantity_total > 0 && (
            <div>
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>{sale.quantity_sold || 0} vendus</span>
                <span>{remaining} restants</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  style={{ width: `${sale.quantity_total ? ((sale.quantity_sold || 0) / sale.quantity_total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          <Button className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl text-lg h-12 gap-2" disabled={remaining <= 0}>
            <ShoppingCart className="w-5 h-5" /> {remaining > 0 ? t('buy') : 'Épuisé'}
          </Button>
        </div>
      </div>
    </div>
  );
}