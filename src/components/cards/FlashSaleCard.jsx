import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Users } from 'lucide-react';
import CountdownTimer from '@/components/ui/CountdownTimer';

export default function FlashSaleCard({ sale }) {
  const discount = sale.discount_percent || (sale.original_price ? Math.round((1 - sale.flash_price / sale.original_price) * 100) : 0);
  const soldPercent = sale.quantity_total ? Math.min(((sale.quantity_sold || 0) / sale.quantity_total) * 100, 100) : 0;
  const remaining = (sale.quantity_total || 0) - (sale.quantity_sold || 0);

  return (
    <Link to={`/FlashSaleDetail?id=${sale.id}`} className="group block">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-700/50 hover:border-orange-500/40 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={sale.image_url || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80'}
            alt={sale.title}
            className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity group-hover:scale-105 transition-transform duration-500"
          />
          {/* Discount */}
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1 bg-red-500 text-white text-sm font-black px-2.5 py-1 rounded-xl shadow-lg">
              <Zap className="w-3.5 h-3.5" /> -{discount}%
            </div>
          </div>
          {/* Auto badge */}
          {sale.is_auto_generated && (
            <div className="absolute top-3 right-3 bg-purple-500/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              IA Auto
            </div>
          )}
          {/* Countdown */}
          <div className="absolute bottom-3 right-3">
            <CountdownTimer endDate={sale.ends_at} />
          </div>
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-white font-bold text-sm truncate mb-2">{sale.title}</h3>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-400 font-black text-xl">{sale.flash_price?.toFixed(0)}<span className="text-sm font-medium">€</span></span>
            {sale.original_price && (
              <span className="text-slate-500 line-through text-sm">{sale.original_price?.toFixed(0)}€</span>
            )}
          </div>

          {/* Progress */}
          {sale.quantity_total > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="flex items-center gap-1 text-slate-400">
                  <Users className="w-3 h-3" /> {sale.quantity_sold || 0} achetés
                </span>
                <span className={`font-semibold ${remaining <= 5 ? 'text-red-400' : 'text-slate-400'}`}>
                  {remaining} restant{remaining > 1 ? 's' : ''}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${soldPercent > 75 ? 'bg-red-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
                  style={{ width: `${soldPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}