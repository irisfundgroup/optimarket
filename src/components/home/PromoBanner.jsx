import React, { useState } from 'react';
import { X, Zap, Gift, TrendingUp } from 'lucide-react';

export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full" style={{
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      boxShadow: '0 4px 20px rgba(245,158,11,0.25)'
    }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        {/* Contenu */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Zap className="w-5 h-5 text-white animate-pulse" />
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-black text-sm md:text-base leading-tight">
              🎉 <strong>Rejoignez OptiMarket !</strong>
            </p>
            <p className="text-white/90 text-xs md:text-sm">
              Vendre, Acheter, ou Activer des campagnes commerciales — <strong>Gagnez jusqu'à +25% !</strong>
            </p>
          </div>
        </div>

        {/* Bouton CTA */}
        <a href="#explore" className="flex-shrink-0 px-4 py-2 rounded-lg bg-white text-orange-600 font-bold text-xs md:text-sm transition-all hover:shadow-lg whitespace-nowrap">
          Découvrir
        </a>

        {/* Fermer */}
        <button onClick={() => setIsVisible(false)} className="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-lg transition-all">
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}