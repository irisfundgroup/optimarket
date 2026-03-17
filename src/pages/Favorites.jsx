import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart, Trash2, ShoppingBag, Briefcase, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { Link } from 'react-router-dom';

const typeIcons = { product: ShoppingBag, service: Briefcase, opportunity: TrendingUp, flash_sale: Zap };
const typeColors = { product: 'bg-orange-100 text-orange-700', service: 'bg-blue-100 text-blue-700', opportunity: 'bg-emerald-100 text-emerald-700', flash_sale: 'bg-red-100 text-red-700' };
const typeLinks = { product: '/ProductDetail', service: '/ServiceDetail', opportunity: '/OpportunityDetail', flash_sale: '/FlashSaleDetail' };

export default function Favorites() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Favorite.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-red-500" />
        <h1 className="text-2xl font-bold text-slate-900">{t('favorites')}</h1>
      </div>
      <div className="space-y-3">
        {favorites.map(fav => {
          const Icon = typeIcons[fav.item_type] || Heart;
          return (
            <div key={fav.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[fav.item_type] || 'bg-slate-100'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <Link to={`${typeLinks[fav.item_type]}?id=${fav.item_id}`} className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 truncate">{fav.item_title || 'Item'}</p>
                <Badge variant="secondary" className="text-xs capitalize mt-1">{fav.item_type?.replace(/_/g, ' ')}</Badge>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(fav.id)} className="text-red-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
        {favorites.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t('no_results')}</p>
          </div>
        )}
      </div>
    </div>
  );
}