import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { t } from '@/lib/i18n';
import ServiceCard from '@/components/cards/ServiceCard';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = ['all', 'plumbing', 'electrical', 'cleaning', 'moving', 'tutoring', 'design', 'development', 'marketing', 'consulting', 'other'];

export default function Services() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', category],
    queryFn: () => {
      const filter = { status: 'active' };
      if (category !== 'all') filter.category = category;
      return base44.entities.Service.filter(filter, '-created_date', 50);
    },
  });

  const filtered = searchQuery
    ? services.filter(s => s.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : services;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('services')}</h1>
        <Link to="/PublishService">
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl gap-2">
            <Plus className="w-4 h-4" /> {t('add_service')}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center bg-white rounded-xl border border-slate-200 px-4">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search')}
            className="flex-1 bg-transparent outline-none text-sm py-3 px-3"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>{c === 'all' ? t('all') : c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(s => <ServiceCard key={s.id} service={s} />)}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-slate-500 py-12">{t('no_results')}</p>
          )}
        </div>
      )}
    </div>
  );
}