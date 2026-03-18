import React, { useState, useEffect } from 'react';
import { X, Zap, Gift, TrendingUp, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Messages de fallback si l'IA échoue
const FALLBACK_MESSAGES = [
  { headline: '💰 Gagnez +25% dès aujourd\'hui', subtitle: '+3,247 membres gagnent déjà. Vendre, acheter ou activer des campagnes sans risque.' },
  { headline: '🚀 Rejoignez +3K entrepreneurs', subtitle: 'Obtenez des commissions réelles sur vos ventes. Pas d\'engagement, retrait rapide garantis.' },
  { headline: '💎 Devenez partenaire commercial', subtitle: 'Financer une campagne = Générer des revenus. Jusqu\'à 25% de commissions en 14 jours.' },
  { headline: '⚡ Opportunité limitée ce mois', subtitle: 'Plus de 1000 activateurs font confiance. Commission garantie, frais transparents.' },
  { headline: '🎁 Bonus inscription : +1 crédit', subtitle: 'Nouveaux membres reçoivent des crédits gratuits. Commencez votre première vente dès maintenant.' },
];

export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [message, setMessage] = useState(FALLBACK_MESSAGES[0]);
  const [loading, setLoading] = useState(false);

  // Générer un nouveau message via IA toutes les 60 secondes
  useEffect(() => {
    const generateMessage = async () => {
      setLoading(true);
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Génère un MESSAGE MARKETING ultra persuasif et concis pour une bannière promotionnelle OptiMarket (plateforme de vente, achat et marketing d'affiliation). 
          
          Format STRICT - Répondre UNIQUEMENT en JSON valide:
          {
            "headline": "Emoji + ACCROCHE PRINCIPALE (court, max 60 caractères)",
            "subtitle": "Bénéfice principal + preuve sociale (max 100 caractères)"
          }
          
          Critères:
          - Urgence + bénéfice financier clair
          - Preuve sociale (nombre d'utilisateurs, gains, etc.)
          - Appel à l'action implicite
          - Ton direct, sans clichés
          
          Variation: ${Math.random()}`,
          response_json_schema: {
            type: 'object',
            properties: {
              headline: { type: 'string' },
              subtitle: { type: 'string' },
            },
            required: ['headline', 'subtitle'],
          },
        });

        if (response.data?.headline && response.data?.subtitle) {
          setMessage(response.data);
        }
      } catch (error) {
        // Fallback silencieux en cas d'erreur IA
        const randomMsg = FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
        setMessage(randomMsg);
      } finally {
        setLoading(false);
      }
    };

    // Premier appel immédiat
    generateMessage();

    // Puis chaque 60 secondes
    const interval = setInterval(generateMessage, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="w-full relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
      boxShadow: '0 8px 32px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.1)'
    }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent)' }} />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-3 relative z-10">
        {/* Contenu */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Icon animé */}
          <div className="flex-shrink-0">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full animate-spin" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.3), transparent)', animationDuration: '3s' }} />
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            {/* Headline avec transition */}
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-white font-black text-sm md:text-lg leading-tight transition-opacity duration-300" style={{ opacity: loading ? 0.6 : 1 }}>
                <strong>{message.headline}</strong>
              </p>
              <span className="hidden sm:inline-block text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>⏰ Mis à jour</span>
            </div>

            {/* Sous-titre avec transition */}
            <p className="text-white/95 text-xs md:text-sm font-medium transition-opacity duration-300" style={{ opacity: loading ? 0.6 : 1 }}>
              {message.subtitle}
            </p>

            {/* Stats rapides */}
            <div className="flex items-center gap-4 mt-1.5 text-[11px] md:text-xs text-white/85">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span><strong>1000+</strong> actifs</span>
              </div>
              <span>·</span>
              <span>✅ <strong>0%</strong> frais cachés</span>
              <span>·</span>
              <span>🚀 Retrait <strong>24-48h</strong></span>
            </div>
          </div>
        </div>

        {/* CTA ultra visible */}
        <a href="#explore" className="flex-shrink-0 px-5 py-2.5 rounded-xl text-white font-black text-xs md:text-sm transition-all transform hover:scale-105 whitespace-nowrap shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #ffffff, #f3f4f6)',
            color: '#d97706',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3), 0 0 0 3px rgba(255,255,255,0.2)'
          }}>
          REJOINDRE GRATUITEMENT →
        </a>

        {/* Fermer discret */}
        <button onClick={() => setIsVisible(false)} className="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-lg transition-all"
          title="Fermer cette bannière">
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Bottom shine effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
    </div>
  );
}