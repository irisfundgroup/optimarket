import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

const NICHES = [
  { value: 'electronics', label: '🔌 Électronique' },
  { value: 'auto', label: '🚗 Accessoires Auto' },
  { value: 'beauty', label: '💄 Beauté' },
  { value: 'home', label: '🏠 Maison' },
  { value: 'solar', label: '☀️ Solaire' },
  { value: 'viral_tiktok', label: '🎵 Viral TikTok' },
  { value: 'other', label: '📦 Autre' },
];

const SOURCES = [
  { value: 'aliexpress', label: 'AliExpress' },
  { value: 'alibaba', label: 'Alibaba' },
  { value: 'jumia', label: 'Jumia' },
  { value: 'local_supplier', label: 'Fournisseur local' },
  { value: 'other', label: 'Autre' },
];

const DEFAULT_FORM = {
  name: '', niche: 'home', source: 'aliexpress',
  buy_price: '', shipping_cost: '', sell_price_target: '',
  currency: 'XOF', country: 'Côte d\'Ivoire',
  demand_score: 5, competition_score: 5, logistics_risk: 3,
  availability: 'available',
};

export default function ProductSourceForm({ onSave, onClose }) {
  const [form, setForm] = useState(DEFAULT_FORM);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const totalCost = (parseFloat(form.buy_price) || 0) + (parseFloat(form.shipping_cost) || 0);
  const netMargin = (parseFloat(form.sell_price_target) || 0) - totalCost;
  const marginPct = form.sell_price_target > 0 ? ((netMargin / form.sell_price_target) * 100).toFixed(1) : 0;

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245,158,11,0.2)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold">Nouveau produit source</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <Label className="text-slate-400 text-xs">Nom du produit *</Label>
          <Input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Ex: Mini lampe solaire LED" className="mt-1 bg-white/5 border-white/10 text-white rounded-xl" />
        </div>

        <div>
          <Label className="text-slate-400 text-xs">Niche</Label>
          <Select value={form.niche} onValueChange={v => set('niche', v)}>
            <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{NICHES.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-slate-400 text-xs">Source fournisseur</Label>
          <Select value={form.source} onValueChange={v => set('source', v)}>
            <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-slate-400 text-xs">Prix d'achat ({form.currency})</Label>
          <Input type="number" value={form.buy_price} onChange={e => set('buy_price', e.target.value)}
            placeholder="7000" className="mt-1 bg-white/5 border-white/10 text-white rounded-xl" />
        </div>

        <div>
          <Label className="text-slate-400 text-xs">Frais livraison ({form.currency})</Label>
          <Input type="number" value={form.shipping_cost} onChange={e => set('shipping_cost', e.target.value)}
            placeholder="2000" className="mt-1 bg-white/5 border-white/10 text-white rounded-xl" />
        </div>

        <div>
          <Label className="text-slate-400 text-xs">Prix revente cible ({form.currency})</Label>
          <Input type="number" value={form.sell_price_target} onChange={e => set('sell_price_target', e.target.value)}
            placeholder="18000" className="mt-1 bg-white/5 border-white/10 text-white rounded-xl" />
        </div>

        <div>
          <Label className="text-slate-400 text-xs">Pays cible</Label>
          <Input value={form.country} onChange={e => set('country', e.target.value)}
            placeholder="Côte d'Ivoire" className="mt-1 bg-white/5 border-white/10 text-white rounded-xl" />
        </div>

        {/* Scores manuels */}
        {[
          { key: 'demand_score', label: 'Demande (0-10)', hint: '10 = très forte' },
          { key: 'competition_score', label: 'Concurrence (0-10)', hint: '10 = très concurrencé' },
          { key: 'logistics_risk', label: 'Risque logistique (0-10)', hint: '10 = très risqué' },
        ].map(({ key, label, hint }) => (
          <div key={key}>
            <Label className="text-slate-400 text-xs">{label}</Label>
            <Input type="number" min={0} max={10} value={form[key]} onChange={e => set(key, parseFloat(e.target.value))}
              className="mt-1 bg-white/5 border-white/10 text-white rounded-xl" />
            <p className="text-[10px] text-slate-600 mt-0.5">{hint}</p>
          </div>
        ))}
      </div>

      {/* Preview marge */}
      {totalCost > 0 && form.sell_price_target > 0 && (
        <div className="rounded-xl p-3 flex items-center justify-between"
          style={{ background: netMargin > 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${netMargin > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
          <span className="text-xs text-slate-400">Marge nette estimée</span>
          <span className={`font-bold text-sm ${netMargin > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netMargin.toLocaleString()} {form.currency} ({marginPct}%)
          </span>
        </div>
      )}

      <Button className="w-full rounded-xl font-bold" style={{ background: '#f59e0b', color: '#000' }}
        onClick={() => onSave(form)} disabled={!form.name || !form.buy_price || !form.sell_price_target}>
        <Plus className="w-4 h-4" /> Ajouter le produit
      </Button>
    </div>
  );
}