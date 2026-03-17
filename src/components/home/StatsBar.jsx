import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, Briefcase, TrendingUp, Zap } from 'lucide-react';

export default function StatsBar() {
  const { data: products = [] } = useQuery({ queryKey: ['statsProducts'], queryFn: () => base44.entities.Product.filter({ status: 'active' }) });
  const { data: services = [] } = useQuery({ queryKey: ['statsServices'], queryFn: () => base44.entities.Service.filter({ status: 'active' }) });
  const { data: opps = [] } = useQuery({ queryKey: ['statsOpps'], queryFn: () => base44.entities.Opportunity.filter({ status: 'active' }) });
  const { data: flash = [] } = useQuery({ queryKey: ['statsFlash'], queryFn: () => base44.entities.FlashSale.filter({ status: 'active' }) });

  const stats = [
    { icon: ShoppingBag, value: products.length, label: 'Produits', color: 'text-blue-400' },
    { icon: Briefcase, value: services.length, label: 'Services', color: 'text-purple-400' },
    { icon: TrendingUp, value: opps.length, label: 'Opportunités', color: 'text-emerald-400' },
    { icon: Zap, value: flash.length, label: 'Ventes Flash', color: 'text-orange-400' },
  ];

  return (
    <div className="grid grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
      {stats.map((s, i) => (
        <div key={i} className="bg-white/5 backdrop-blur px-3 py-3 text-center">
          <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
          <p className="text-white font-bold text-lg leading-none">{s.value}</p>
          <p className="text-slate-400 text-[10px] mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}