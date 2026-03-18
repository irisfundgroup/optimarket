import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Mail, Phone, MessageCircle, TrendingUp, AlertCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function UnderevaluedProductsPanel() {
  const [filterNiche, setFilterNiche] = useState('all');
  const [sortBy, setSortBy] = useState('opportunity_score');

  const { data: products = [] } = useQuery({
    queryKey: ['underevaluedProducts'],
    queryFn: async () => {
      const allProducts = await base44.asServiceRole.entities.ProductSource.list('-opportunity_score', 100);
      // Filtrer produits sous-évalués (opportunity_score > 70 = bon potentiel mais prix bas)
      return allProducts.filter(p => p.opportunity_score > 70 && p.status !== 'published');
    },
  });

  const filtered = filterNiche === 'all'
    ? products
    : products.filter(p => p.niche === filterNiche);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'opportunity_score') return (b.opportunity_score || 0) - (a.opportunity_score || 0);
    if (sortBy === 'margin') {
      const marginA = ((a.sell_price_target - a.buy_price - (a.shipping_cost || 0)) / a.sell_price_target) * 100;
      const marginB = ((b.sell_price_target - b.buy_price - (b.shipping_cost || 0)) / b.sell_price_target) * 100;
      return marginB - marginA;
    }
    return 0;
  });

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié`);
  };

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={filterNiche} onChange={e => setFilterNiche(e.target.value)}
          className="rounded-lg px-3 py-2 bg-white/5 border border-white/15 text-white text-sm">
          <option value="all">Toutes les niches</option>
          {['electronics', 'auto', 'beauty', 'home', 'solar', 'viral_tiktok'].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="rounded-lg px-3 py-2 bg-white/5 border border-white/15 text-white text-sm">
          <option value="opportunity_score">Score IA (↓)</option>
          <option value="margin">Marge (↓)</option>
        </select>

        <div className="text-sm text-slate-400 ml-auto">
          {sorted.length} produit{sorted.length > 1 ? 's' : ''} sous-évalué{sorted.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Tableau */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th className="px-4 py-3 text-left font-semibold text-slate-300">Produit</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300">Niche</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-300">Score IA</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-300">Prix achat</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-300">Prix vente</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-300">Marge</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300">Fournisseur</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-300">Contacts</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((product, i) => {
                const margin = ((product.sell_price_target - product.buy_price - (product.shipping_cost || 0)) / product.sell_price_target) * 100;
                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.source}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>
                        {product.niche}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        <span className="font-bold text-white">{product.opportunity_score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white font-semibold">
                      {product.buy_price.toLocaleString()} {product.currency}
                    </td>
                    <td className="px-4 py-3 text-right text-white font-semibold">
                      {product.sell_price_target.toLocaleString()} {product.currency}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold" style={{ color: margin > 40 ? '#10b981' : margin > 20 ? '#fbbf24' : '#ef4444' }}>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white text-xs">{product.supplier_name || '—'}</p>
                        {product.supplier_email && (
                          <p className="text-[10px] text-slate-500 truncate">{product.supplier_email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-center flex-wrap">
                        {product.supplier_email && (
                          <button
                            onClick={() => copyToClipboard(product.supplier_email, 'Email')}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                            title={product.supplier_email}>
                            <Mail className="w-3.5 h-3.5 text-slate-400 hover:text-blue-400" />
                          </button>
                        )}
                        {product.supplier_phone && (
                          <button
                            onClick={() => copyToClipboard(product.supplier_phone, 'Téléphone')}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                            title={product.supplier_phone}>
                            <Phone className="w-3.5 h-3.5 text-slate-400 hover:text-green-400" />
                          </button>
                        )}
                        {product.supplier_whatsapp && (
                          <a
                            href={`https://wa.me/${product.supplier_whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
                            <MessageCircle className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-400" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Aucun produit sous-évalué trouvé</p>
        </div>
      )}
    </div>
  );
}