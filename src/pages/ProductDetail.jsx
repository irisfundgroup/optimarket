import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Heart, Eye, Crown, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => base44.entities.Product.filter({ id }).then(r => r[0]),
    enabled: !!id,
  });

  const favMutation = useMutation({
    mutationFn: () => base44.entities.Favorite.create({
      user_email: user?.email,
      item_type: 'product',
      item_id: product.id,
      item_title: product.title,
    }),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="aspect-video rounded-2xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!product) return <div className="text-center py-20 text-slate-500">{t('no_results')}</div>;

  const img = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/Products"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-lg font-bold text-slate-900 truncate">{product.title}</h1>
      </div>

      <div className="rounded-2xl overflow-hidden mb-6">
        <img src={img} alt={product.title} className="w-full aspect-video object-cover" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{product.title}</h2>
            <div className="flex items-center gap-3 mt-2">
              {product.is_premium && (
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 gap-1">
                  <Crown className="w-3 h-3" /> {t('premium')}
                </Badge>
              )}
              <Badge variant="secondary" className="capitalize">{product.category?.replace(/_/g, ' ')}</Badge>
              {product.location_city && (
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="w-3.5 h-3.5" /> {product.location_city}
                </span>
              )}
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-500">{product.price?.toFixed(0)}<span className="text-base font-normal text-slate-400 ml-1">{product.currency || 'EUR'}</span></p>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {product.views || 0} {t('views')}</span>
          <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {product.favorites_count || 0}</span>
        </div>

        {product.description && (
          <div>
            <h3 className="font-semibold text-sm text-slate-700 mb-2">{t('description')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4">
          <h3 className="font-semibold text-sm text-slate-700 mb-2">{t('seller')}</h3>
          <p className="text-sm text-slate-600">{product.seller_name || product.seller_email}</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button className="flex-1 bg-orange-500 hover:bg-orange-600 rounded-xl gap-2">
            <MessageCircle className="w-4 h-4" /> {t('contact')}
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => favMutation.mutate()}>
            <Heart className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="rounded-xl">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}