import React, { useState } from 'react';
import { HelpCircle, MessageCircle, Mail, ChevronDown, ChevronUp, Search, Zap, ShoppingBag, CreditCard, Shield, User, Star } from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    icon: User,
    label: 'Compte',
    color: '#818cf8',
    items: [
      { q: "Comment créer un compte sur OptiMarket ?", a: "Téléchargez l'application et cliquez sur 'S'inscrire'. Renseignez votre email, choisissez un mot de passe et validez votre adresse email via le lien reçu." },
      { q: "J'ai oublié mon mot de passe, que faire ?", a: "Cliquez sur 'Mot de passe oublié' sur l'écran de connexion. Vous recevrez un email avec un lien de réinitialisation valable 24h." },
      { q: "Comment modifier mes informations personnelles ?", a: "Rendez-vous dans 'Profil' puis 'Paramètres'. Vous pouvez y modifier votre nom, photo, ville et préférences de notification." },
    ]
  },
  {
    icon: ShoppingBag,
    label: 'Annonces',
    color: '#f59e0b',
    items: [
      { q: "Comment publier une annonce ?", a: "Cliquez sur le bouton '+' ou 'Publier' en haut de l'écran. Remplissez le titre, la description, le prix, ajoutez des photos et choisissez la catégorie appropriée." },
      { q: "Combien d'annonces puis-je publier gratuitement ?", a: "Avec le plan gratuit, vous pouvez publier jusqu'à 3 annonces actives. Pour plus d'annonces, souscrivez à un plan Premium." },
      { q: "Comment supprimer ou modifier mon annonce ?", a: "Dans votre profil, section 'Mes annonces', cliquez sur l'annonce puis sur 'Modifier' ou 'Supprimer'." },
      { q: "Mon annonce est en attente de validation, c'est normal ?", a: "Oui, toutes les nouvelles annonces sont vérifiées par notre équipe sous 24h pour garantir la qualité de la plateforme." },
    ]
  },
  {
    icon: CreditCard,
    label: 'Paiements & Crédits',
    color: '#10b981',
    items: [
      { q: "Quels moyens de paiement sont acceptés ?", a: "Nous acceptons les cartes bancaires (Visa, Mastercard), Mobile Money (Orange Money, MTN, Wave) et les virements bancaires selon votre pays." },
      { q: "Qu'est-ce qu'un crédit OptiMarket ?", a: "Les crédits permettent d'accéder aux opportunités premium, de booster vos annonces et d'utiliser les fonctionnalités avancées de l'IA." },
      { q: "Comment obtenir un remboursement ?", a: "Les demandes de remboursement sont traitées sous 5 jours ouvrés. Contactez notre support avec votre numéro de transaction." },
    ]
  },
  {
    icon: Zap,
    label: 'Flash Sales & Opportunités',
    color: '#ef4444',
    items: [
      { q: "Comment fonctionnent les ventes flash ?", a: "Les ventes flash sont des offres à durée limitée avec des remises importantes. Elles sont visibles dans la section 'Flash Sales' et disparaissent une fois le stock épuisé ou le temps expiré." },
      { q: "Comment accéder aux opportunités IA ?", a: "Les opportunités sont détectées automatiquement par notre IA. Les opportunités basiques sont gratuites. Les opportunités premium (score élevé) nécessitent des crédits." },
    ]
  },
  {
    icon: Shield,
    label: 'Sécurité & Confiance',
    color: '#60a5fa',
    items: [
      { q: "Comment signaler un utilisateur ou une annonce suspecte ?", a: "Sur chaque annonce ou profil, cliquez sur les 3 points '...' puis 'Signaler'. Notre équipe examinera le signalement sous 48h." },
      { q: "OptiMarket garantit-il les transactions ?", a: "OptiMarket est une plateforme de mise en relation. Nous recommandons d'utiliser nos outils de messagerie intégrée et de procéder aux échanges dans des lieux publics pour votre sécurité." },
      { q: "Comment mes données sont-elles protégées ?", a: "Vos données sont chiffrées et stockées de manière sécurisée. Nous respectons le RGPD et ne partageons jamais vos informations avec des tiers sans votre consentement." },
    ]
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b last:border-b-0 transition-all" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <button onClick={onToggle} className="w-full flex items-start justify-between py-4 text-left gap-4">
        <span className="text-sm font-medium leading-snug" style={{ color: isOpen ? '#fbbf24' : '#cbd5e1' }}>{item.q}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#475569' }} />}
      </button>
      {isOpen && (
        <p className="text-sm pb-4 leading-relaxed" style={{ color: '#64748b' }}>{item.a}</p>
      )}
    </div>
  );
}

export default function Assistance() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openItem, setOpenItem] = useState(null);
  const [search, setSearch] = useState('');

  const currentCat = FAQ_CATEGORIES[activeCategory];
  const filteredItems = search.trim()
    ? FAQ_CATEGORIES.flatMap(c => c.items).filter(i => i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase()))
    : currentCat.items;

  return (
    <div className="min-h-screen" style={{ background: '#060c18' }}>
      {/* Header */}
      <div className="relative overflow-hidden py-12 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,12,24,0) 60%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
          <HelpCircle className="w-3.5 h-3.5" /> Centre d'aide
        </div>
        <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: '#e2e8f0' }}>
          Comment pouvons-nous<br />
          <span style={{ background: 'linear-gradient(135deg, #818cf8, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>vous aider ?</span>
        </h1>
        <p className="text-sm mb-6" style={{ color: '#64748b' }}>Trouvez rapidement une réponse à vos questions</p>

        {/* Search */}
        <div className="max-w-lg mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
          <input
            type="text"
            placeholder="Rechercher dans l'aide..."
            value={search}
            onChange={e => { setSearch(e.target.value); setOpenItem(null); }}
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Categories */}
        {!search.trim() && (
          <div className="flex gap-2 flex-wrap mb-6">
            {FAQ_CATEGORIES.map((cat, i) => (
              <button key={i} onClick={() => { setActiveCategory(i); setOpenItem(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: activeCategory === i ? `${cat.color}20` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeCategory === i ? cat.color + '50' : 'rgba(255,255,255,0.08)'}`,
                  color: activeCategory === i ? cat.color : '#64748b',
                }}>
                <cat.icon className="w-3.5 h-3.5" /> {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* FAQ list */}
        <div className="rounded-2xl px-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {filteredItems.length === 0 ? (
            <p className="py-8 text-center text-sm" style={{ color: '#475569' }}>Aucun résultat trouvé.</p>
          ) : (
            filteredItems.map((item, i) => (
              <FaqItem key={i} item={item} isOpen={openItem === i} onToggle={() => setOpenItem(openItem === i ? null : i)} />
            ))
          )}
        </div>

        {/* Contact */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="mailto:support@optimarket.app" className="flex items-center gap-4 p-5 rounded-2xl transition-all"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.15)'}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
              <Mail className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>Email Support</p>
              <p className="text-xs" style={{ color: '#64748b' }}>support@optimarket.app</p>
            </div>
          </a>

          <a href="/Messages" className="flex items-center gap-4 p-5 rounded-2xl transition-all"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
              <MessageCircle className="w-5 h-5" style={{ color: '#818cf8' }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>Chat en direct</p>
              <p className="text-xs" style={{ color: '#64748b' }}>Réponse sous 2h</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}