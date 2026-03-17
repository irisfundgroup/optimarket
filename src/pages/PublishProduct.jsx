import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { t } from '@/lib/i18n';
import { Link } from 'react-router-dom';

const CATEGORIES = ['electronics', 'fashion', 'home', 'food', 'beauty', 'sports', 'auto', 'other'];

export default function PublishProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', location_city: '', location_country: '' });
  const [imageFile, setImageFile] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
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
    createMutation.mutate(form);
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/Products">
          <Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{t('publish_product')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div>
          <Label>{t('title')} *</Label>
          <Input value={form.title} onChange={(e) => update('title', e.target.value)} required className="rounded-xl mt-1" />
        </div>
        <div>
          <Label>{t('description')}</Label>
          <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="rounded-xl mt-1" rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t('price')} *</Label>
            <Input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} required className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>{t('category')} *</Label>
            <Select value={form.category} onValueChange={(v) => update('category', v)}>
              <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder={t('category')} /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t('city')}</Label>
            <Input value={form.location_city} onChange={(e) => update('location_city', e.target.value)} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>{t('country')}</Label>
            <Input value={form.location_country} onChange={(e) => update('location_country', e.target.value)} className="rounded-xl mt-1" />
          </div>
        </div>
        <div>
          <Label>Image</Label>
          <div className="mt-1 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-300 transition-colors"
            onClick={() => document.getElementById('imgInput').click()}>
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">{imageFile ? imageFile.name : 'Cliquez pour ajouter une image'}</p>
          </div>
          <input id="imgInput" type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>
        <Button type="submit" disabled={createMutation.isPending} className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl">
          {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {t('publish')}
        </Button>
      </form>
    </div>
  );
}