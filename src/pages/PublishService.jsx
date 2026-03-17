import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { t } from '@/lib/i18n';

const CATEGORIES = ['plumbing', 'electrical', 'cleaning', 'moving', 'tutoring', 'design', 'development', 'marketing', 'consulting', 'other'];

export default function PublishService() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', price_type: 'fixed', location_city: '', location_country: '', phone: '', whatsapp: '' });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.Service.create({
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
        provider_email: user?.email,
        provider_name: user?.full_name,
        status: 'pending',
      }),
    onSuccess: () => navigate('/Services'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/Services"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-2xl font-bold text-slate-900">{t('publish_service')}</h1>
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
            <Label>{t('price')}</Label>
            <Input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Type tarif</Label>
            <Select value={form.price_type} onValueChange={(v) => update('price_type', v)}>
              <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixe</SelectItem>
                <SelectItem value="hourly">Horaire</SelectItem>
                <SelectItem value="quote">Sur devis</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>📞 Téléphone</Label>
            <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+225 07 00 00 00 00" className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>💬 WhatsApp</Label>
            <Input value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="+225 07 00 00 00 00" className="rounded-xl mt-1" />
          </div>
        </div>
        <Button type="submit" disabled={createMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
          {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {t('publish')}
        </Button>
      </form>
    </div>
  );
}