import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Eye, Crown, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';

const CATEGORY_COLORS = {
  electronics: 'bg-blue-100 text-blue-700',
  fashion: 'bg-pink-100 text-pink-700',
  home: 'bg-amber-100 text-amber-700',
  food: 'bg-green-100 text-green-700',
  beauty: 'bg-rose-100 text-rose-700',
  sports: 'bg-cyan-100 text-cyan-700',
  auto: 'bg-slate-100 text-slate-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function ProductCard({ product }) {
  const img = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
  const catColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.other;

  return (
    <Link to={`/ProductDetail?id=${product.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-orange-200 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img src={img} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

          {/* Premium badge */}
          {product.is_premium && (
            <div className="absolute top-2.5 left-2.5">
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                <Crown className="w-2.5 h-2.5" /> Premium
              </div>
            </div>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pt-8 pb-2.5 px-3">
            <span className="text-white font-bold text-lg drop-shadow-lg">
              {product.price?.toLocaleString('fr-FR')} <span className="text-sm font-medium opacity-90">{product.currency || 'EUR'}</span>
            </span>
          </div>

          {/* Stats */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
            {product.views > 0 && (
              <div className="flex items-center gap-0.5 bg-black/40 backdrop-blur text-white text-[10px] px-1.5 py-0.5 rounded-full">
                <Eye className="w-2.5 h-2.5" /> {product.views}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5">
          <h3 className="font-semibold text-slate-900 text-sm truncate mb-2">{product.title}</h3>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${catColor}`}>
              {product.category?.replace(/_/g, ' ')}
            </span>
            {product.location_city && (
              <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                <MapPin className="w-2.5 h-2.5" /> {product.location_city}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}