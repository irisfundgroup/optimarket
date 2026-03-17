import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Loader2, Crown, Zap } from 'lucide-react';
import { t } from '@/lib/i18n';
import PaywallModal from '@/components/paywall/PaywallModal';

const CATEGORIES = ['electronics', 'fashion', 'home', 'food', 'beauty', 'sports', 'auto', 'other'];

export default function PublishProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', currency: 'EUR', location_city: '', location_country: '', is_premium: false });
  const [imageFile, setImageFile] = useState(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: subscription } = useQuery({
    queryKey: ['mySubscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user?.email, status: 'active' }, '-created_date', 1).then(r => r[0] || null),
    enabled: !!user?.email,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let images = [];
      if (imageFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
        images = [file_url];
      }
      return base44.entities.Product.create({
        ...data,
        price: parseFloat(data.price),
        images,
        seller_email: user?.email,
        seller_name: user?.full_name,
        status: 'pending',
      });
    },
    onSuccess: () => navigate('/Products'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.is_premium && !(subscription?.credits_remaining > 0)) {
      setPaywallOpen(true);
      return;
    }
    createMutation.mutate(form);
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/Products"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-2xl font-bold text-slate-900">{t('publish_product')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
        <div>
          <Label className="font-semibold text-slate-700">{t('title')} *</Label>
          <Input value={form.title} onChange={(e) => update('title', e.target.value)} required className="rounded-xl mt-1.5" placeholder="Ex: iPhone 15 Pro Max 256Go" />
        </div>
        <div>
          <Label className="font-semibold text-slate-700">{t('description')}</Label>
          <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="rounded-xl mt-1.5" rows={4} placeholder="Décrivez votre produit..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold text-slate-700">{t('price')} *</Label>
            <Input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} required className="rounded-xl mt-1.5" placeholder="0.00" />
          </div>
          <div>
            <Label className="font-semibold text-slate-700">{t('category')} *</Label>
            <Select value={form.category} onValueChange={(v) => update('category', v)}>
              <SelectTrigger className="rounded-xl mt-1.5"><SelectValue placeholder={t('category')} /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold text-slate-700">{t('city')}</Label>
            <Input value={form.location_city} onChange={(e) => update('location_city', e.target.value)} className="rounded-xl mt-1.5" placeholder="Paris" />
          </div>
          <div>
            <Label className="font-semibold text-slate-700">{t('country')}</Label>
            <Input value={form.location_country} onChange={(e) => update('location_country', e.target.value)} className="rounded-xl mt-1.5" placeholder="France" />
          </div>
        </div>

        {/* Image upload */}
        <div>
          <Label className="font-semibold text-slate-700">Image</Label>
          <div className="mt-1.5 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all"
            onClick={() => document.getElementById('imgInput').click()}>
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">{imageFile ? imageFile.name : 'Cliquez pour ajouter une image'}</p>
          </div>
          <input id="imgInput" type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>

        {/* Premium boost */}
        <div className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${form.is_premium ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-orange-300'}`}
          onClick={() => update('is_premium', !form.is_premium)}>
          <div className="flex items-center gap-3">
            <Crown className={`w-5 h-5 ${form.is_premium ? 'text-orange-500' : 'text-slate-400'}`} />
            <div>
              <p className={`font-semibold text-sm ${form.is_premium ? 'text-orange-700' : 'text-slate-700'}`}>Annonce Premium</p>
              <p className="text-xs text-slate-500">Mise en avant, badge premium, plus de visibilité — 1 crédit</p>
            </div>
            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.is_premium ? 'bg-orange-500 border-orange-500' : 'border-slate-300'}`}>
              {form.is_premium && <span className="text-white text-xs">✓</span>}
            </div>
          </div>
        </div>

        <Button type="submit" disabled={createMutation.isPending}
          className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white rounded-xl font-semibold shadow-lg shadow-orange-200 gap-2">
          {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          <Zap className="w-4 h-4" /> {t('publish')}
        </Button>
      </form>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onSuccess={() => createMutation.mutate(form)}
        actionLabel="publier une annonce premium"
      />
    </div>
  );
}