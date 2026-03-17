import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, Crown, TrendingUp, ShoppingBag, Zap, Briefcase, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import { format } from 'date-fns';

const typeIcons = {
  new_product: ShoppingBag,
  new_service: Briefcase,
  opportunity: TrendingUp,
  flash_sale: Zap,
  price_drop: TrendingUp,
  vip: Crown,
};

const typeColors = {
  new_product: 'bg-blue-100 text-blue-700',
  new_service: 'bg-purple-100 text-purple-700',
  opportunity: 'bg-emerald-100 text-emerald-700',
  flash_sale: 'bg-red-100 text-red-700',
  price_drop: 'bg-cyan-100 text-cyan-700',
  vip: 'bg-orange-100 text-orange-700',
};

export default function Alerts() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts', user?.email],
    queryFn: () => base44.entities.Alert.filter({ user_email: user?.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Alert.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-6 h-6 text-orange-500" />
        <h1 className="text-2xl font-bold text-slate-900">{t('my_alerts')}</h1>
      </div>

      <div className="space-y-3">
        {alerts.map(alert => {
          const Icon = typeIcons[alert.type] || Bell;
          return (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl p-4 border transition-all ${
                alert.is_read ? 'border-slate-100' : 'border-orange-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[alert.type] || 'bg-slate-100 text-slate-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm">{alert.title}</h3>
                    {alert.is_vip && <Badge className="bg-orange-500 text-white border-0 text-[10px]">VIP</Badge>}
                    {!alert.is_read && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{alert.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{format(new Date(alert.created_date), 'dd/MM/yyyy HH:mm')}</p>
                </div>
                {!alert.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => markReadMutation.mutate(alert.id)} className="text-xs">
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {!isLoading && alerts.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t('no_results')}</p>
          </div>
        )}
      </div>
    </div>
  );
}