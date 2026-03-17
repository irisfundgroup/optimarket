import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { t } from '@/lib/i18n';
import ProductCard from '@/components/cards/ProductCard';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = ['all', 'electronics', 'fashion', 'home', 'food', 'beauty', 'sports', 'auto', 'other'];

export default function Products() {
  const urlParams = new URLSearchParams(window.location.search);
  const [searchQuery, setSearchQuery] = useState(urlParams.get('search') || '');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', category, sortBy],
    queryFn: () => {
      const filter = { status: 'active' };
      if (category !== 'all') filter.category = category;
      return base44.entities.Product.filter(filter, sortBy, 50);
    },
  });

  const filtered = searchQuery
    ? products.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('products')}</h1>
        <Link to="/PublishProduct">
          <Button className="bg-orange-500 hover:bg-orange-600 rounded-xl gap-2">
            <Plus className="w-4 h-4" /> {t('add_product')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
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
          <SelectTrigger className="w-full sm:w-40 rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>{c === 'all' ? t('all') : c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_date">Plus récent</SelectItem>
            <SelectItem value="price">Prix croissant</SelectItem>
            <SelectItem value="-price">Prix décroissant</SelectItem>
            <SelectItem value="-views">Plus vus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-slate-500 py-12">{t('no_results')}</p>
          )}
        </div>
      )}
    </div>
  );
}