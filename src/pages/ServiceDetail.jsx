import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, MessageCircle, Heart, Phone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/useCurrency';
import { convertPrice, CURRENCY_SYMBOLS } from '@/lib/currency';

export default function ServiceDetail() {
  const { currency } = useCurrency();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const navigate = useNavigate();
  const [contactSent, setContactSent] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: service, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: () => base44.entities.Service.filter({ id }).then(r => r[0]),
    enabled: !!id,
  });

  const contactMutation = useMutation({
    mutationFn: () => base44.entities.ChatMessage.create({
      sender_email: user?.email,
      sender_name: user?.full_name,
      receiver_email: service.provider_email,
      message: `Bonjour, je suis intéressé(e) par votre service : "${service.title}"`,
      related_type: 'service',
      related_id: service.id,
      conversation_id: [user?.email, service.provider_email].sort().join('_') + '_' + service.id,
    }),
    onSuccess: () => { setContactSent(true); setTimeout(() => navigate('/Messages'), 800); },
  });

  const favMutation = useMutation({
    mutationFn: () => base44.entities.Favorite.create({
      user_email: user?.email,
      item_type: 'service',
      item_id: service.id,
      item_title: service.title,
    }),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!service) return <div className="text-center py-20 text-slate-500">{t('no_results')}</div>;

  const availColors = { available: 'bg-emerald-100 text-emerald-700', busy: 'bg-amber-100 text-amber-700', offline: 'bg-slate-100 text-slate-500' };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/Services"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-lg font-bold text-slate-900 truncate">{service.title}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        {/* Provider Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
            {service.provider_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{service.title}</h2>
            <p className="text-sm text-slate-500">{service.provider_name || 'Prestataire'}</p>
            <div className="flex items-center gap-3 mt-1">
              <Badge className={`${availColors[service.availability]} border-0 text-xs`}>
                {t(service.availability)}
              </Badge>
              {service.rating > 0 && (
                <span className="flex items-center gap-0.5 text-sm text-amber-500 font-medium">
                  <Star className="w-4 h-4 fill-amber-500" /> {service.rating?.toFixed(1)} ({service.reviews_count})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{t('price')}</p>
            <p className="text-2xl font-bold text-slate-900">
              {service.price ? `${convertPrice(service.price, 'EUR', currency).toFixed(0)}${CURRENCY_SYMBOLS[currency]}` : 'Sur devis'}
              {service.price_type === 'hourly' && <span className="text-sm font-normal text-slate-500">/h</span>}
            </p>
          </div>
          <Badge variant="secondary" className="capitalize">{service.category?.replace(/_/g, ' ')}</Badge>
        </div>

        {/* Location */}
        {service.location_city && (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="w-4 h-4" /> {service.location_city}, {service.location_country}
          </p>
        )}

        {/* Description */}
        {service.description && (
          <div>
            <h3 className="font-semibold text-sm text-slate-700 mb-2">{t('description')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 flex-wrap">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl gap-2 min-w-[140px]"
            onClick={() => contactMutation.mutate()}
            disabled={contactMutation.isPending || contactSent}
          >
            <MessageCircle className="w-4 h-4" />
            {contactSent ? 'Message envoyé ✓' : contactMutation.isPending ? 'Envoi...' : t('contact')}
          </Button>

          {service.phone ? (
            <a href={`tel:${service.phone}`} className="flex-1 min-w-[120px]">
              <Button variant="outline" className="w-full rounded-xl gap-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50">
                <Phone className="w-4 h-4" /> Appeler
              </Button>
            </a>
          ) : (
            <Button variant="outline" className="flex-1 min-w-[120px] rounded-xl gap-2 text-slate-400 border-slate-200" disabled>
              <Lock className="w-4 h-4" /> Numéro non renseigné
            </Button>
          )}

          {service.whatsapp && (
            <a href={`https://wa.me/${service.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-xl gap-2 text-green-600 border-green-300 hover:bg-green-50">
                <span className="text-base">💬</span> WhatsApp
              </Button>
            </a>
          )}

          <Button variant="outline" className="rounded-xl" onClick={() => favMutation.mutate()}>
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}