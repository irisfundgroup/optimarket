import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Search, Plus, AlertTriangle, Clock, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';

const urgencyConfig = {
  low: { label: 'Basse', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Moyenne', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Haute', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

const statusConfig = {
  open: { label: 'Ouvert', color: 'bg-emerald-100 text-emerald-700' },
  in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Terminé', color: 'bg-slate-100 text-slate-500' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-600' },
};

export default function ServiceRequests() {
  const [search, setSearch] = useState('');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['serviceRequests'],
    queryFn: () => base44.entities.ServiceRequest.filter({ status: 'open' }, '-created_date', 50),
  });

  const filtered = search ? requests.filter(r => r.title?.toLowerCase().includes(search.toLowerCase())) : requests;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('service_requests')}</h1>
        <Link to="/PublishRequest">
          <Button className="bg-purple-600 hover:bg-purple-700 rounded-xl gap-2">
            <Plus className="w-4 h-4" /> {t('publish_request')}
          </Button>
        </Link>
      </div>

      <div className="flex items-center bg-white rounded-xl border border-slate-200 px-4 mb-6">
        <Search className="w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('search')} className="flex-1 bg-transparent outline-none text-sm py-3 px-3" />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{req.title}</h3>
                  {req.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{req.description}</p>}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={`${urgencyConfig[req.urgency]?.color} border-0 text-xs`}>
                      {urgencyConfig[req.urgency]?.label || req.urgency}
                    </Badge>
                    <Badge className={`${statusConfig[req.status]?.color} border-0 text-xs`}>
                      {statusConfig[req.status]?.label || req.status}
                    </Badge>
                    <Badge variant="secondary" className="text-xs capitalize">{req.category?.replace(/_/g, ' ')}</Badge>
                    {req.location_city && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" /> {req.location_city}
                      </span>
                    )}
                  </div>
                </div>
                {(req.budget_min || req.budget_max) && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-slate-500">{t('budget')}</p>
                    <p className="font-bold text-slate-900">
                      {req.budget_min && `${req.budget_min}€`}
                      {req.budget_min && req.budget_max && ' - '}
                      {req.budget_max && `${req.budget_max}€`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-slate-500 py-12">{t('no_results')}</p>}
        </div>
      )}
    </div>
  );
}