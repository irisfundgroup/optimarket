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
    { icon: ShoppingBag, value: products.length, label: 'Produits', color: '#818cf8' },
    { icon: Briefcase, value: services.length, label: 'Services', color: '#c084fc' },
    { icon: TrendingUp, value: opps.length, label: 'Opportunités', color: '#34d399' },
    { icon: Zap, value: flash.length, label: 'Flash', color: '#fbbf24' },
  ];

  return (
    <div className="grid grid-cols-4 rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(245,158,11,0.12)',
      }}>
      {stats.map((s, i) => (
        <div key={i} className="px-3 py-3.5 text-center" style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
          <s.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: s.color }} />
          <p className="font-black text-lg leading-none text-white">{s.value}</p>
          <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}