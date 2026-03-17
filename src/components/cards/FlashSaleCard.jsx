import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { t } from '@/lib/i18n';

export default function FlashSaleCard({ sale }) {
  const discountPercent = sale.discount_percent || (sale.original_price ? Math.round((1 - sale.flash_price / sale.original_price) * 100) : 0);
  const progress = sale.quantity_total ? ((sale.quantity_sold || 0) / sale.quantity_total) * 100 : 0;

  return (
    <Link to={`/FlashSaleDetail?id=${sale.id}`} className="group block">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-700">
        <div className="relative">
          <img
            src={sale.image_url || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80'}
            alt={sale.title}
            className="w-full aspect-[16/10] object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-500 text-white border-0 text-sm font-bold gap-1 animate-pulse">
              <Zap className="w-3.5 h-3.5" /> -{discountPercent}%
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
            <CountdownTimer endDate={sale.ends_at} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold text-sm truncate">{sale.title}</h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-orange-400 font-bold text-lg">{sale.flash_price?.toFixed(0)} {sale.currency || 'EUR'}</span>
            {sale.original_price && (
              <span className="text-slate-500 line-through text-sm">{sale.original_price?.toFixed(0)}</span>
            )}
          </div>
          {sale.quantity_total > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{sale.quantity_sold || 0} {t('sold')}</span>
                <span>{t('remaining')}: {sale.quantity_total - (sale.quantity_sold || 0)}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}