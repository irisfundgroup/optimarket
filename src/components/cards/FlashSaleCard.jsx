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
      <div className="rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'linear-gradient(145deg, rgba(15,20,40,0.95), rgba(10,15,30,0.98))',
          border: '1px solid rgba(245,158,11,0.15)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.border = '1px solid rgba(245,158,11,0.4)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.6), 0 0 30px rgba(245,158,11,0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.border = '1px solid rgba(245,158,11,0.15)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
        }}>

        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden" style={{ background: '#080d1a' }}>
          <img
            src={sale.image_url || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80'}
            alt={sale.title}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
          />

          {/* Discount badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 text-sm font-black px-2.5 py-1 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(239,68,68,0.4)',
            }}>
            <Zap className="w-3.5 h-3.5" /> -{discount}%
          </div>

          {sale.is_auto_generated && (
            <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.4)', color: '#c084fc', backdropFilter: 'blur(8px)' }}>
              IA Auto
            </div>
          )}

          <div className="absolute bottom-3 right-3">
            <CountdownTimer endDate={sale.ends_at} />
          </div>

          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,12,24,0.9) 0%, transparent 60%)' }} />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-sm truncate mb-2.5" style={{ color: '#e2e8f0' }}>{sale.title}</h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-black text-2xl" style={{ color: '#fbbf24', textShadow: '0 0 20px rgba(245,158,11,0.3)' }}>
              {sale.flash_price?.toFixed(0)}
              <span className="text-sm font-medium ml-0.5" style={{ color: '#92400e' }}>€</span>
            </span>
            {sale.original_price && (
              <span className="text-sm line-through" style={{ color: '#475569' }}>{sale.original_price?.toFixed(0)}€</span>
            )}
          </div>

          {/* Stock bar */}
          {sale.quantity_total > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="flex items-center gap-1" style={{ color: '#475569' }}>
                  <Users className="w-3 h-3" /> {sale.quantity_sold || 0} achetés
                </span>
                <span className="font-semibold" style={{ color: remaining <= 5 ? '#f87171' : '#475569' }}>
                  {remaining} restant{remaining > 1 ? 's' : ''}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${soldPercent}%`,
                    background: soldPercent > 75
                      ? 'linear-gradient(90deg, #ef4444, #f87171)'
                      : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                    boxShadow: soldPercent > 75 ? '0 0 8px rgba(239,68,68,0.5)' : '0 0 8px rgba(245,158,11,0.4)',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}