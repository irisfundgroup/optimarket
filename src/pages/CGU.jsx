import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, FileText, Scale, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

const SECTIONS = [
  {
    icon: FileText,
    title: "1. Objet et champ d'application",
    content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme OptiMarket, accessible via notre application mobile et web. En vous inscrivant ou en utilisant nos services, vous acceptez sans réserve les présentes CGU. OptiMarket est une marketplace qui met en relation des acheteurs, vendeurs et prestataires de services dans différentes régions du monde.`
  },
  {
    icon: CheckCircle,
    title: "2. Inscription et compte utilisateur",
    content: `Pour accéder aux fonctionnalités complètes d'OptiMarket, vous devez créer un compte en fournissant des informations exactes et complètes. Vous êtes responsable de la confidentialité de vos identifiants. Toute activité réalisée depuis votre compte vous est imputable. OptiMarket se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU ou d'activité frauduleuse.`
  },
  {
    icon: Scale,
    title: "3. Utilisation de la plateforme",
    content: `Vous vous engagez à utiliser OptiMarket de manière légale et conforme aux présentes CGU. Il est strictement interdit de publier des annonces fausses ou trompeuses, d'utiliser la plateforme à des fins illicites, de tenter de contourner les systèmes de sécurité, de harceler d'autres utilisateurs, ou de reproduire le contenu de la plateforme sans autorisation. Tout manquement peut entraîner la suspension immédiate de votre compte.`
  },
  {
    icon: Lock,
    title: "4. Protection des données personnelles",
    content: `OptiMarket collecte et traite vos données personnelles conformément au RGPD et aux législations locales applicables. Nous collectons uniquement les données nécessaires au fonctionnement du service : nom, email, localisation, historique d'activité. Vos données ne sont jamais vendues à des tiers. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données en nous contactant via le support.`
  },
  {
    icon: Shield,
    title: "5. Responsabilités et garanties",
    content: `OptiMarket agit en tant qu'intermédiaire entre les utilisateurs. Nous ne garantissons pas la qualité, la légalité ou la disponibilité des produits et services proposés. OptiMarket décline toute responsabilité en cas de litige entre utilisateurs, de perte ou dommage résultant de l'utilisation de la plateforme, ou d'indisponibilité temporaire du service pour des raisons de maintenance.`
  },
  {
    icon: AlertTriangle,
    title: "6. Propriété intellectuelle",
    content: `L'ensemble du contenu d'OptiMarket (logo, design, code, textes) est protégé par le droit de la propriété intellectuelle. Toute reproduction, distribution ou exploitation sans autorisation préalable est interdite. En publiant du contenu sur la plateforme, vous accordez à OptiMarket une licence non exclusive d'utilisation à des fins de promotion du service.`
  },
  {
    icon: FileText,
    title: "7. Modifications des CGU",
    content: `OptiMarket se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email ou notification in-app. La poursuite de l'utilisation de la plateforme après modification vaut acceptation des nouvelles CGU. En cas de désaccord, vous pouvez supprimer votre compte à tout moment.`
  },
  {
    icon: Scale,
    title: "8. Droit applicable et litiges",
    content: `Les présentes CGU sont soumises au droit applicable dans le pays d'établissement d'OptiMarket. En cas de litige, une solution amiable sera privilégiée. À défaut, les tribunaux compétents seront saisis. Pour toute question relative aux présentes CGU, contactez-nous à legal@optimarket.app.`
  },
];

function Section({ section, isOpen, onToggle }) {
  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isOpen ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.07)'}` }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: isOpen ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <section.icon className="w-4 h-4" style={{ color: isOpen ? '#f59e0b' : '#64748b' }} />
          </div>
          <span className="font-semibold text-sm md:text-base" style={{ color: isOpen ? '#fbbf24' : '#e2e8f0' }}>{section.title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b' }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#64748b' }} />}
      </button>
      {isOpen && (
        <div className="px-5 pb-5">
          <div className="ml-11">
            <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{section.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CGU() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen" style={{ background: '#060c18' }}>
      {/* Header */}
      <div className="relative overflow-hidden py-12 px-4"
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(6,12,24,0) 60%)', borderBottom: '1px solid rgba(245,158,11,0.1)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
            <Shield className="w-3.5 h-3.5" /> Document légal
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#e2e8f0' }}>
            Conditions Générales<br />
            <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>d'Utilisation</span>
          </h1>
          <p className="text-sm" style={{ color: '#64748b' }}>Dernière mise à jour : Mars 2026 · Version 1.0</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-3">
        {SECTIONS.map((section, i) => (
          <Section key={i} section={section} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
        ))}

        {/* Footer note */}
        <div className="rounded-2xl p-5 mt-6" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <p className="text-xs text-center" style={{ color: '#64748b' }}>
            Pour toute question, contactez-nous à <span style={{ color: '#f59e0b' }}>support@optimarket.app</span>
          </p>
        </div>
      </div>
    </div>
  );
}