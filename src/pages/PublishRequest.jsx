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

export default function PublishRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', budget_min: '', budget_max: '', urgency: 'medium', location_city: '' });

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceRequest.create({
      ...data,
      budget_min: data.budget_min ? parseFloat(data.budget_min) : undefined,
      budget_max: data.budget_max ? parseFloat(data.budget_max) : undefined,
      requester_email: user?.email,
      requester_name: user?.full_name,
      status: 'open',
    }),
    onSuccess: () => navigate('/ServiceRequests'),
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ServiceRequests"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-2xl font-bold text-slate-900">{t('publish_request')}</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div><Label>{t('title')} *</Label><Input value={form.title} onChange={(e) => update('title', e.target.value)} required className="rounded-xl mt-1" /></div>
        <div><Label>{t('description')}</Label><Textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="rounded-xl mt-1" rows={4} /></div>
        <div>
          <Label>{t('category')} *</Label>
          <Select value={form.category} onValueChange={(v) => update('category', v)}>
            <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder={t('category')} /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>{t('budget')} min</Label><Input type="number" value={form.budget_min} onChange={(e) => update('budget_min', e.target.value)} className="rounded-xl mt-1" /></div>
          <div><Label>{t('budget')} max</Label><Input type="number" value={form.budget_max} onChange={(e) => update('budget_max', e.target.value)} className="rounded-xl mt-1" /></div>
        </div>
        <div>
          <Label>{t('urgency')}</Label>
          <Select value={form.urgency} onValueChange={(v) => update('urgency', v)}>
            <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Basse</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>{t('city')}</Label><Input value={form.location_city} onChange={(e) => update('location_city', e.target.value)} className="rounded-xl mt-1" /></div>
        <Button type="submit" disabled={createMutation.isPending} className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl">
          {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {t('publish')}
        </Button>
      </form>
    </div>
  );
}