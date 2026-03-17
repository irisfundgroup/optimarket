import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Eye, Crown } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { convertPrice, CURRENCY_SYMBOLS } from '@/lib/currency';

const CATEGORY_COLORS = {
  electronics: { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc' },
  fashion: { bg: 'rgba(236,72,153,0.15)', text: '#f9a8d4' },
  home: { bg: 'rgba(245,158,11,0.15)', text: '#fcd34d' },
  food: { bg: 'rgba(16,185,129,0.15)', text: '#6ee7b7' },
  beauty: { bg: 'rgba(244,63,94,0.15)', text: '#fda4af' },
  sports: { bg: 'rgba(6,182,212,0.15)', text: '#67e8f9' },
  auto: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
  other: { bg: 'rgba(100,116,139,0.12)', text: '#94a3b8' },
};

export default function ProductCard({ product }) {
  const { currency } = useCurrency();
  const img = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
  const cat = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.other;
  const convertedPrice = convertPrice(product.price, product.currency || 'EUR', currency);

  return (
    <Link to={`/ProductDetail?id=${product.id}`} className="group block">
      <div className="rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(10, 18, 38, 0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.border = '1px solid rgba(245,158,11,0.25)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        }}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden" style={{ background: '#0a1628' }}>
          <img src={img} alt={product.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500" />

          {product.is_premium && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', boxShadow: '0 0 10px rgba(245,158,11,0.4)' }}>
              <Crown className="w-2.5 h-2.5" /> Premium
            </div>
          )}

          {product.views > 0 && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#94a3b8' }}>
              <Eye className="w-2.5 h-2.5" /> {product.views}
            </div>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-0 left-0 right-0 pt-8 pb-2.5 px-3"
            style={{ background: 'linear-gradient(to top, rgba(6,12,24,0.9), transparent)' }}>
            <span className="font-black text-lg" style={{ color: '#fbbf24' }}>
              {convertedPrice.toLocaleString('fr-FR')} <span className="text-xs font-medium opacity-70">{CURRENCY_SYMBOLS[currency]}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5">
          <h3 className="font-semibold text-sm truncate mb-2" style={{ color: '#e2e8f0' }}>{product.title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
              style={{ background: cat.bg, color: cat.text }}>
              {product.category?.replace(/_/g, ' ')}
            </span>
            {product.location_city && (
              <span className="flex items-center gap-0.5 text-[10px]" style={{ color: '#475569' }}>
                <MapPin className="w-2.5 h-2.5" /> {product.location_city}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}