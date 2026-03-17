import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const availabilityColors = {
  available: 'bg-emerald-500',
  busy: 'bg-amber-500',
  offline: 'bg-slate-400',
};

export default function ServiceCard({ service }) {
  return (
    <Link to={`/ServiceDetail?id=${service.id}`} className="group block">
      <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm truncate">{service.title}</h3>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${availabilityColors[service.availability] || availabilityColors.offline}`} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{service.provider_name || 'Prestataire'}</p>
            <div className="flex items-center gap-3 mt-2">
              {service.rating > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                  <Star className="w-3 h-3 fill-amber-500" /> {service.rating?.toFixed(1)}
                </span>
              )}
              {service.location_city && (
                <span className="flex items-center gap-0.5 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" /> {service.location_city}
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-slate-900">
              {service.price ? `${service.price}€` : 'Devis'}
            </p>
            <Badge variant="secondary" className="text-[10px] capitalize">{service.category?.replace(/_/g, ' ')}</Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}