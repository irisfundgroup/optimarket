import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { t } from '@/lib/i18n';

export default function SectionHeader({ title, icon: Icon, linkTo, iconColor }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        {Icon &&
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Icon className="w-4 h-4" style={{ color: '#f59e0b' }} />
          </div>
        }
        <h2 className="text-gray-800 text-lg font-bold md:text-xl" style={{ color: '#e2e8f0' }}>{title}</h2>
      </div>
      {linkTo &&
      <Link to={linkTo} className="flex items-center gap-1 text-sm font-semibold transition-colors"
      style={{ color: '#f59e0b' }}
      onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'}
      onMouseLeave={(e) => e.currentTarget.style.color = '#f59e0b'}>
          {t('see_all')} <ChevronRight className="w-4 h-4" />
        </Link>
      }
    </div>);

}