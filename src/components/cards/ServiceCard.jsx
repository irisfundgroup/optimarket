import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AVAIL = {
  available: { dot: 'bg-emerald-500', label: 'Disponible', text: 'text-emerald-600' },
  busy: { dot: 'bg-amber-500', label: 'Occupé', text: 'text-amber-600' },
  offline: { dot: 'bg-slate-400', label: 'Hors ligne', text: 'text-slate-500' },
};

const CAT_ICONS = {
  plumbing: '🔧', electrical: '⚡', cleaning: '🧹', moving: '📦',
  tutoring: '📚', design: '🎨', development: '💻', marketing: '📢',
  consulting: '💼', other: '✨',
};

export default function ServiceCard({ service }) {
  const avail = AVAIL[service.availability] || AVAIL.offline;
  const catIcon = CAT_ICONS[service.category] || '✨';

  return (
    <Link to={`/ServiceDetail?id=${service.id}`} className="group block">
      <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 hover:-translate-y-0.5">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center text-xl">
              {catIcon}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${avail.dot}`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate">{service.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{service.provider_name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-slate-900 text-base">
                  {service.price ? `${service.price}€` : <span className="text-xs text-slate-400">Devis</span>}
                </p>
                {service.price_type === 'hourly' && <span className="text-[10px] text-slate-400">/heure</span>}
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mt-2">
              {service.rating > 0 && (
                <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                  <Star className="w-3 h-3 fill-amber-500" /> {service.rating?.toFixed(1)}
                  <span className="text-slate-400 font-normal ml-0.5">({service.reviews_count})</span>
                </span>
              )}
              {service.location_city && (
                <span className="flex items-center gap-0.5 text-xs text-slate-400">
                  <MapPin className="w-3 h-3" /> {service.location_city}
                </span>
              )}
              <span className={`flex items-center gap-0.5 text-xs font-medium ${avail.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${avail.dot}`} /> {avail.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}