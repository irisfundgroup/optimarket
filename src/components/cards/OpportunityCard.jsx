import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Lock, MapPin, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';

const typeColors = {
  product_deal: 'from-blue-500 to-blue-600',
  service_demand: 'from-purple-500 to-purple-600',
  flash_sale: 'from-orange-500 to-red-500',
  trending: 'from-emerald-500 to-emerald-600',
  price_drop: 'from-cyan-500 to-cyan-600',
};

const typeLabels = {
  product_deal: 'Deal Produit',
  service_demand: 'Demande Service',
  flash_sale: 'Vente Flash',
  trending: 'Tendance',
  price_drop: 'Baisse Prix',
};

export default function OpportunityCard({ opportunity }) {
  return (
    <Link to={`/OpportunityDetail?id=${opportunity.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
        <div className={`h-2 bg-gradient-to-r ${typeColors[opportunity.type] || typeColors.trending}`} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Badge className={`bg-gradient-to-r ${typeColors[opportunity.type] || typeColors.trending} text-white border-0 text-[10px] mb-2`}>
                {typeLabels[opportunity.type] || opportunity.type}
              </Badge>
              <h3 className="font-semibold text-slate-900 text-sm">{opportunity.title}</h3>
              {opportunity.location_city && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {opportunity.location_city}
                </p>
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-xl bg-slate-900 flex flex-col items-center justify-center">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-white font-bold text-sm">{opportunity.score}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">{t('ai_score')}</span>
            </div>
          </div>
          {opportunity.potential_margin && (
            <div className="mt-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600">+{opportunity.potential_margin}% {t('margin')}</span>
            </div>
          )}
          {opportunity.is_premium && (
            <div className="mt-3 flex items-center gap-2 text-orange-500 text-xs font-medium">
              <Lock className="w-3 h-3" />
              {t('unlock_details')}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}