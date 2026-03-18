import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, FileText, Scale, Lock, AlertTriangle, CheckCircle, Banknote, RefreshCw, Info, ArrowRight } from 'lucide-react';

// ─── CGU SECTIONS ───────────────────────────────────────────────────────────
const CGU_SECTIONS = [
  {
    icon: FileText,
    title: "1. Objet et champ d'application",
    content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme OptiMarket, exploitée par la société IRISFUNDGROUP, accessible via notre application mobile et web. En vous inscrivant ou en utilisant nos services, vous acceptez sans réserve les présentes CGU. OptiMarket est une marketplace opérée par IRISFUNDGROUP qui met en relation des acheteurs, vendeurs et prestataires de services, ainsi qu'un programme de marketing participatif permettant à des partenaires ("Activateurs") de soutenir des campagnes commerciales en échange de commissions variables.`
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
    icon: AlertTriangle,
    title: "4. Programme Activateur — Fonctionnement",
    content: `Le programme Activateur est un système de marketing participatif basé sur les ventes réelles. Fonctionnement : l'Activateur (partenaire) achète un pack de participation pour soutenir une campagne commerciale. OptiMarket utilise ces fonds pour promouvoir et distribuer des produits auprès des acheteurs finaux (clients classiques). Les commissions perçues par l'Activateur proviennent EXCLUSIVEMENT de la marge générée par les ventes aux acheteurs finaux — jamais de l'argent d'autres Activateurs. Aucun gain fixe ou garanti n'est promis. La durée d'une campagne est indicative.`
  },
  {
    icon: Scale,
    title: "5. Règles des gains et commissions",
    content: `Les gains des Activateurs sont calculés comme suit : (Montant du pack - Frais de plateforme) × Taux de commission de la campagne. Le taux de commission est indicatif et peut varier en fonction des ventes réelles. Les niveaux (Bronze, Silver, Gold, Platinum, Elite) déterminent les frais de plateforme (de 2% à 0,5%) et les limites de participation. Les commissions ne sont versées qu'après validation par l'équipe OptiMarket et uniquement si la campagne a généré des ventes effectives. Les récompenses sont attribuées à titre commercial et ne constituent ni un investissement ni une garantie de gain.`
  },
  {
    icon: AlertTriangle,
    title: "6. Limites et restrictions",
    content: `Les montants minimum et maximum de participation sont définis par niveau d'Activateur. Les retraits sont soumis à un délai de traitement de 24 à 48 heures ouvrables. OptiMarket se réserve le droit de suspendre un retrait en cas de suspicion de fraude. Les fonds engagés dans une campagne active ne sont pas disponibles au retrait avant la clôture de la campagne. OptiMarket peut modifier les conditions du programme Activateur avec un préavis de 15 jours.`
  },
  {
    icon: Lock,
    title: "7. Protection des données personnelles",
    content: `OptiMarket collecte et traite vos données personnelles conformément au RGPD et aux législations locales applicables. Nous collectons uniquement les données nécessaires au fonctionnement du service : nom, email, localisation, historique d'activité. Vos données ne sont jamais vendues à des tiers. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données en nous contactant via le support.`
  },
  {
    icon: Shield,
    title: "8. Responsabilités et garanties",
    content: `OptiMarket agit en tant qu'intermédiaire entre les utilisateurs. Nous ne garantissons pas la qualité, la légalité ou la disponibilité des produits et services proposés. OptiMarket décline toute responsabilité en cas de litige entre utilisateurs, de perte ou dommage résultant de l'utilisation de la plateforme, ou d'indisponibilité temporaire du service pour des raisons de maintenance.`
  },
  {
    icon: FileText,
    title: "9. Modifications des CGU",
    content: `OptiMarket se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email ou notification in-app. La poursuite de l'utilisation de la plateforme après modification vaut acceptation des nouvelles CGU. En cas de désaccord, vous pouvez supprimer votre compte à tout moment.`
  },
  {
    icon: Scale,
    title: "10. Droit applicable et litiges",
    content: `Les présentes CGU sont soumises au droit applicable dans le pays d'établissement d'OptiMarket. En cas de litige, une solution amiable sera privilégiée. À défaut, les tribunaux compétents seront saisis. Pour toute question relative aux présentes CGU, contactez-nous à legal@optimarket.app.`
  },
];

// ─── POLITIQUE FINANCIÈRE SECTIONS ──────────────────────────────────────────
const FINANCE_SECTIONS = [
  {
    icon: AlertTriangle,
    title: "1. Ce n'est PAS un investissement financier",
    content: `IMPORTANT : La participation au programme Activateur d'OptiMarket N'EST PAS un investissement financier au sens des réglementations bancaires et financières. OptiMarket n'est pas une banque, un fonds d'investissement ni une plateforme de trading. Le fonctionnement est simple : l'Activateur achète un pack pour financer le stock ou la mise en avant d'une campagne commerciale réelle. Les acheteurs finaux achètent les produits. Les commissions de l'Activateur proviennent EXCLUSIVEMENT du chiffre d'affaires généré par ces ventes réelles — jamais de l'argent de nouveaux entrants.`,
    highlight: true,
  },
  {
    icon: AlertTriangle,
    title: "2. Gains non garantis — Risque de perte",
    content: `Les taux de commission affichés sont des ESTIMATIONS basées sur les projections de vente de la campagne. Ils ne constituent en aucun cas une garantie de gain. Si les acheteurs finaux n'achètent pas suffisamment, la commission réelle sera inférieure au taux indiqué, voire nulle. En cas d'annulation de campagne, de force majeure ou de défaillance du partenaire commercial, le pack peut ne pas être récupérable en intégralité. Participez uniquement avec des fonds que vous êtes prêt à perdre.`,
    highlight: true,
  },
  {
    icon: Info,
    title: "3. Comment circule l'argent",
    content: `Schéma de circulation : (1) L'Activateur dépose un pack de participation → (2) OptiMarket utilise ces fonds pour financer/promouvoir une campagne commerciale → (3) Les acheteurs finaux achètent les produits → (4) Les revenus des ventes génèrent une marge commerciale → (5) Cette marge est redistribuée sous forme de commission à l'Activateur, déduction faite des frais de plateforme. L'argent provient toujours des ventes réelles, jamais des packs des nouveaux Activateurs.`
  },
  {
    icon: Banknote,
    title: "4. Frais de plateforme",
    content: `OptiMarket perçoit des frais de service sur chaque pack de participation. Ces frais varient selon le niveau de l'Activateur : Bronze : 2,0% · Silver : 1,75% · Gold : 1,5% · Platinum : 1,0% · Elite : 0,5%. Ces frais couvrent les coûts opérationnels, logistiques et marketing de la plateforme. Ils sont prélevés au moment de la participation et ne sont pas remboursables.`
  },
  {
    icon: Scale,
    title: "5. Processus de versement des commissions",
    content: `Les commissions sont calculées et validées par l'équipe OptiMarket à la clôture de chaque campagne, sur la base des ventes réellement constatées. Le versement est effectué sur le wallet OptiMarket de l'Activateur dans un délai de 3 à 7 jours ouvrables après validation. OptiMarket se réserve le droit de retenir un versement en cas de suspicion de fraude ou de litige en cours.`
  },
  {
    icon: Lock,
    title: "6. Conformité réglementaire",
    content: `OptiMarket respecte les législations applicables en matière de commerce électronique et de protection des consommateurs. Le programme Activateur est structuré comme un accord de commission marketing (modèle affiliation/co-financement commercial) et non comme un produit financier réglementé. Il est fondamentalement différent d'un système pyramidal car les gains ne dépendent pas du recrutement de nouveaux membres mais des ventes aux acheteurs finaux. Toute utilisation à des fins illicites entraîne la suspension immédiate du compte.`
  },
];

// ─── POLITIQUE DE REMBOURSEMENT ──────────────────────────────────────────────
const REFUND_SECTIONS = [
  {
    icon: RefreshCw,
    title: "1. Packs de participation Activateur",
    content: `Les packs de participation sont engagés pour la durée de la campagne concernée. Une fois la participation confirmée et la campagne démarrée, le pack n'est pas remboursable. En cas d'annulation d'une campagne par OptiMarket avant son démarrage, le montant intégral du pack (hors frais de plateforme déjà prélevés) est recrédité sur le wallet de l'Activateur sous 5 jours ouvrables.`
  },
  {
    icon: AlertTriangle,
    title: "2. Frais de plateforme non remboursables",
    content: `Les frais de plateforme (entre 0,5% et 2% selon le niveau) prélevés au moment de la participation ne sont en aucun cas remboursables, quelle que soit la situation. Ces frais couvrent les coûts opérationnels de la plateforme.`
  },
  {
    icon: CheckCircle,
    title: "3. Retraits de wallet",
    content: `Les demandes de retrait validées et traitées ne peuvent pas être annulées. En cas d'erreur de saisie du numéro de compte ou de téléphone Mobile Money, contactez immédiatement le support à support@optimarket.app. OptiMarket ne peut garantir la récupération des fonds en cas d'erreur de l'utilisateur.`
  },
  {
    icon: FileText,
    title: "4. Achats de crédits et abonnements",
    content: `Les achats de crédits d'accès (plans de souscription) sont remboursables dans un délai de 48h après l'achat, si aucun crédit n'a été utilisé. Passé ce délai, ou si des crédits ont été consommés, aucun remboursement ne sera effectué. Pour toute demande de remboursement, contactez support@optimarket.app avec votre numéro de transaction.`
  },
  {
    icon: Scale,
    title: "5. Produits et services du marketplace",
    content: `Les litiges concernant les produits ou services achetés via le marketplace OptiMarket doivent être résolus directement entre l'acheteur et le vendeur. OptiMarket agit uniquement en tant qu'intermédiaire et n'est pas partie aux transactions commerciales. En cas d'impossibilité de résolution amiable, OptiMarket peut intervenir en médiation sur demande.`
  },
];

// ─── MENTIONS LÉGALES ────────────────────────────────────────────────────────
const LEGAL_SECTIONS = [
  {
    icon: Info,
    title: "1. Éditeur de la plateforme",
    content: `OptiMarket est exploité par la société IRISFUNDGROUP. RCCM : CI-ABJ-03-2023-B12-02849. OptiMarket est une marque commerciale et une plateforme marketplace opérée par IRISFUNDGROUP. Contact : legal@optimarket.app`
  },
  {
    icon: Shield,
    title: "2. Hébergement",
    content: `La plateforme OptiMarket est hébergée par Base44, infrastructure cloud sécurisée. Les données sont stockées dans des datacenters conformes aux normes ISO 27001 et SOC 2. En cas de question relative à l'hébergement, contactez support@optimarket.app.`
  },
  {
    icon: Lock,
    title: "3. Propriété intellectuelle",
    content: `L'ensemble du contenu d'OptiMarket — logo, design, code source, textes, algorithmes d'analyse IA — est la propriété exclusive d'OptiMarket et est protégé par les lois sur la propriété intellectuelle. Toute reproduction, distribution ou exploitation commerciale sans autorisation écrite préalable est formellement interdite et constitue une contrefaçon.`
  },
  {
    icon: FileText,
    title: "4. Cookies et traceurs",
    content: `OptiMarket utilise des cookies techniques nécessaires au fonctionnement de la plateforme (authentification, préférences) ainsi que des cookies analytiques anonymisés pour améliorer l'expérience utilisateur. Aucun cookie publicitaire tiers n'est utilisé. Vous pouvez gérer vos préférences cookies via les paramètres de votre navigateur.`
  },
  {
    icon: Scale,
    title: "5. Limitation de responsabilité",
    content: `OptiMarket met tout en œuvre pour assurer la disponibilité et la sécurité de la plateforme, mais ne peut garantir une disponibilité continue à 100%. OptiMarket ne saurait être tenu responsable des pertes de données, des interruptions de service, ou des dommages indirects résultant de l'utilisation de la plateforme. La responsabilité maximale d'OptiMarket est limitée aux sommes effectivement versées par l'utilisateur au cours des 3 derniers mois.`
  },
  {
    icon: Info,
    title: "6. Droit applicable et juridiction compétente",
    content: `Les présentes mentions légales sont régies par le droit applicable dans le pays d'immatriculation d'OptiMarket. Tout litige relatif à l'utilisation de la plateforme sera soumis à la juridiction compétente du lieu du siège social d'OptiMarket, sauf disposition légale contraire. OptiMarket s'engage à rechercher une solution amiable avant tout recours judiciaire.`
  },
];

// ─── TABS CONFIG ─────────────────────────────────────────────────────────────
const TABS = [
  { key: 'cgu',     label: 'CGU',             icon: FileText,    sections: CGU_SECTIONS,    color: '#f59e0b' },
  { key: 'finance', label: 'Politique financière', icon: Banknote,  sections: FINANCE_SECTIONS, color: '#ef4444' },
  { key: 'refund',  label: 'Remboursements',   icon: RefreshCw,   sections: REFUND_SECTIONS,  color: '#10b981' },
  { key: 'legal',   label: 'Mentions légales', icon: Scale,       sections: LEGAL_SECTIONS,   color: '#38bdf8' },
];

// ─── ACCORDION SECTION ───────────────────────────────────────────────────────
function Section({ section, isOpen, onToggle, accentColor }) {
  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: section.highlight ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isOpen ? accentColor + '40' : section.highlight ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.07)'}`,
      }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: isOpen ? accentColor + '20' : 'rgba(255,255,255,0.05)', border: `1px solid ${accentColor}30` }}>
            <section.icon className="w-4 h-4" style={{ color: isOpen ? accentColor : section.highlight ? '#ef4444' : '#64748b' }} />
          </div>
          <span className="font-semibold text-sm md:text-base" style={{ color: isOpen ? '#fbbf24' : section.highlight ? '#fca5a5' : '#e2e8f0' }}>
            {section.title}
          </span>
        </div>
        {isOpen
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#64748b' }} />
        }
      </button>
      {isOpen && (
        <div className="px-5 pb-5 ml-11">
          <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{section.content}</p>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function CGU() {
  const [activeTab, setActiveTab] = useState('cgu');
  const [openIndex, setOpenIndex] = useState(null);

  const tab = TABS.find(t => t.key === activeTab);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setOpenIndex(null);
  };

  return (
    <div className="min-h-screen" style={{ background: '#060c18' }}>
      {/* Header */}
      <div className="relative overflow-hidden py-10 px-4"
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(6,12,24,0) 60%)', borderBottom: '1px solid rgba(245,158,11,0.1)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
            <Shield className="w-3.5 h-3.5" /> Documents légaux
          </div>
          <h1 className="text-2xl md:text-4xl font-black mb-2" style={{ color: '#e2e8f0' }}>
            Transparence &amp; <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Conformité</span>
          </h1>
          <p className="text-sm" style={{ color: '#64748b' }}>Exploité par <strong style={{ color: '#f59e0b' }}>IRISFUNDGROUP</strong> · Dernière mise à jour : Mars 2026 · Version 2.0</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button key={t.key} onClick={() => handleTabChange(t.key)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl text-xs font-semibold transition-all"
                style={{
                  background: isActive ? t.color + '18' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? t.color + '50' : 'rgba(255,255,255,0.07)'}`,
                  color: isActive ? t.color : '#64748b',
                }}>
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Finance tab extras */}
      {activeTab === 'finance' && (
        <div className="max-w-3xl mx-auto px-4 mt-4 space-y-3">
          {/* Warning */}
          <div className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300 leading-relaxed">
              <strong>Avertissement important :</strong> Les gains proviennent des ventes réelles aux acheteurs finaux, jamais de l'argent de nouveaux Activateurs. Ils sont variables et non garantis.
            </p>
          </div>
          {/* Flow diagram */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-slate-500 uppercase font-bold mb-4 tracking-widest">Circuit de l'argent</p>
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {[
                { emoji: '🧑‍💼', label: 'Activateur', sub: 'achète un pack' },
                { emoji: '🏪', label: 'OptiMarket', sub: 'finance la campagne' },
                { emoji: '🛍️', label: 'Acheteur final', sub: 'achète les produits' },
                { emoji: '💰', label: 'Commission', sub: 'versée à l\'Activateur' },
              ].map((step, i, arr) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center text-center gap-1">
                    <div className="text-2xl">{step.emoji}</div>
                    <p className="text-white text-xs font-bold">{step.label}</p>
                    <p className="text-slate-500 text-[10px]">{step.sub}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0 rotate-90 md:rotate-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-[10px] text-center text-slate-600 mt-4">L'argent provient des ventes aux acheteurs finaux — jamais des packs des nouveaux Activateurs</p>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {tab.sections.map((section, i) => (
          <Section
            key={i}
            section={section}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            accentColor={tab.color}
          />
        ))}

        {/* Footer */}
        <div className="rounded-2xl p-5 mt-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <p className="text-xs text-center" style={{ color: '#64748b' }}>
            Pour toute question, contactez-nous à <span style={{ color: '#f59e0b' }}>legal@optimarket.app</span>
            <span className="mx-2">·</span>
            Support : <span style={{ color: '#f59e0b' }}>support@optimarket.app</span>
          </p>
        </div>
      </div>
    </div>
  );
}