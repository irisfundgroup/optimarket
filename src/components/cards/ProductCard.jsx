import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Eye, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';

export default function ProductCard({ product }) {
  const img = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';

  return (
    <Link to={`/ProductDetail?id=${product.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={img} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {product.is_premium && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 gap-1">
                <Crown className="w-3 h-3" /> {t('premium')}
              </Badge>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-20" />
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <span className="text-white font-bold text-lg">{product.price?.toFixed(0)} {product.currency || 'EUR'}</span>
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{product.views || 0}</span>
              <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" />{product.favorites_count || 0}</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 text-sm truncate">{product.title}</h3>
          {product.location_city && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {product.location_city}
            </p>
          )}
          <Badge variant="secondary" className="mt-2 text-xs capitalize">{product.category?.replace(/_/g, ' ')}</Badge>
        </div>
      </div>
    </Link>
  );
}