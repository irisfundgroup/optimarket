import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShoppingBag, Briefcase, TrendingUp, Globe, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LANGUAGES, setStoredLang, getStoredLang } from '@/lib/i18n';

const STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenue sur OptiMarket',
    subtitle: 'Votre marketplace intelligente propulsée par l\'IA',
    icon: Zap,
    gradient: 'from-orange-500 to-amber-500',
    features: [
      { icon: ShoppingBag, text: 'Achetez et vendez localement' },
      { icon: Briefcase, text: 'Trouvez des prestataires de services' },
      { icon: TrendingUp, text: 'Détectez les meilleures opportunités' },
      { icon: Zap, text: 'Ventes flash exclusives' },
    ],
  },
  {
    id: 'language',
    title: 'Choisissez votre langue',
    subtitle: 'Vous pourrez la changer à tout moment dans votre profil',
    icon: Globe,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    id: 'role',
    title: 'Quel est votre profil ?',
    subtitle: 'Personnalisez votre expérience selon votre usage',
    icon: Check,
    gradient: 'from-emerald-500 to-emerald-600',
    roles: [
      { id: 'buyer', label: 'Acheteur', desc: 'Je veux acheter des produits et services', emoji: '🛍️' },
      { id: 'seller', label: 'Vendeur', desc: 'Je veux vendre des produits', emoji: '💰' },
      { id: 'provider', label: 'Prestataire', desc: 'Je propose des services', emoji: '🔧' },
      { id: 'requester', label: 'Demandeur', desc: 'Je cherche des prestataires', emoji: '📋' },
    ],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedLang, setSelectedLang] = useState(getStoredLang());
  const [selectedRole, setSelectedRole] = useState('buyer');

  const current = STEPS[step];

  const handleNext = () => {
    if (step === 1) setStoredLang(selectedLang);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('onboarding_done', 'true');
      localStorage.setItem('user_role_pref', selectedRole);
      navigate('/Home');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 py-10">
      {/* Progress dots */}
      <div className="flex gap-2 mb-10">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-orange-500' : i < step ? 'w-4 bg-orange-300' : 'w-4 bg-slate-700'}`} />
        ))}
      </div>

      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${current.gradient} flex items-center justify-center mx-auto mb-8 shadow-2xl`}>
          <current.icon className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">{current.title}</h1>
        <p className="text-slate-400 text-center text-sm mb-8">{current.subtitle}</p>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="space-y-3">
            {current.features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-white text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Language */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  selectedLang === lang.code
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium">{lang.label}</span>
                {selectedLang === lang.code && <Check className="w-4 h-4 text-blue-400 ml-auto" />}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Role */}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-3">
            {current.roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center ${
                  selectedRole === role.id
                    ? 'border-emerald-500 bg-emerald-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <span className="text-3xl">{role.emoji}</span>
                <p className="font-semibold text-white text-sm">{role.label}</p>
                <p className="text-slate-400 text-xs">{role.desc}</p>
                {selectedRole === role.id && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            ))}
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={handleNext}
          className="w-full mt-8 h-14 text-base font-semibold rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white shadow-xl shadow-orange-500/30 gap-2"
        >
          {step === STEPS.length - 1 ? 'Commencer' : 'Continuer'}
          <ChevronRight className="w-5 h-5" />
        </Button>

        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="w-full mt-3 text-slate-500 text-sm hover:text-slate-300 transition-colors">
            Retour
          </button>
        )}
      </div>
    </div>
  );
}