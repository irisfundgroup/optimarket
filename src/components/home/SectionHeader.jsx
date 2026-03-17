import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { t } from '@/lib/i18n';

export default function SectionHeader({ title, icon: Icon, linkTo, iconColor = 'text-orange-500' }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
        <h2 className="text-lg md:text-xl font-bold text-slate-900">{title}</h2>
      </div>
      {linkTo && (
        <Link to={linkTo} className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
          {t('see_all')} <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}