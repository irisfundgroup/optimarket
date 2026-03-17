# 📋 Cahier des Charges OptiMarket - Architecture Complète

**Version:** 1.0  
**Date:** 17 Mars 2026  
**Status:** En cours de développement

---

## 🎯 Vision Globale

OptiMarket est une plateforme qui crée une **symbiose entre deux acteurs** :
- **Activateur d'opportunités** : Investisseur qui finance les opportunités et reçoit des récompenses
- **Client final** : Acheteur qui génère le profit via ses achats

L'app **connecte automatiquement** ces deux acteurs pour créer un flux de profit.

---

## 📊 Schéma du Flux

```
Activateur
    ↓ (investit)
    ├─→ crédite une opportunité
    └─→ paie via la plateforme
         ↓
    [OptiMarket - Moteur de Profit]
         ↓
    Client Final
    ├─→ voit le produit disponible
    ├─→ achète (Mobile Money/Carte)
    └─→ paie
         ↓
    [Revenu généré]
         ↓
    Activateur reçoit sa récompense
    └─→ tokens + bonus
```

---

## 👤 PROFIL 1 : ACTIVATEUR D'OPPORTUNITÉS

### 🎯 Objectif Principal
**Investir peu, gagner régulièrement sans gérer d'affaire**

### 📋 Caractéristiques

| Aspect | Détail |
|--------|--------|
| **Rôle** | Investisseur / Financeur d'opportunités |
| **Motivation** | Générer du revenu passif |
| **Besoin** | Tableau de bord de gains, transparence |
| **Contrainte** | Budget limité au départ |

### ⚙️ Fonctionnalités Principales

#### 1️⃣ Tableau de Bord Personnel (Dashboard)
**Page:** `/ActivatorDashboard`

```
┌─────────────────────────────────────────┐
│  ACTIVATEUR DASHBOARD                   │
├─────────────────────────────────────────┤
│                                         │
│  📊 STATISTIQUES                       │
│  ├─ Solde Total:        1,250,000 XOF │
│  ├─ Gains ce mois:        125,000 XOF │
│  ├─ Opportunités actives:     5       │
│  ├─ Taux de rendement:      12% / mois│
│  └─ Niveau:           🥇 GOLD         │
│                                         │
│  🎯 ACTIONS RAPIDES                    │
│  ├─ [Voir mes opportunités]            │
│  ├─ [Retirer mon argent]               │
│  ├─ [Upgrader mon compte]              │
│  └─ [Inviter un ami] (+50 bonus)      │
│                                         │
│  📈 GRAPHIQUE GAINS (30j)              │
│  └─ [Courbe de revenus croissante]    │
│                                         │
│  🔥 OPPORTUNITÉS EN COURS              │
│  ├─ [Opp #1] - 50K XOF investi        │
│  │   Gains: 6,250 XOF (12.5%)         │
│  │   Statut: 🟢 Active                 │
│  ├─ [Opp #2] - 100K XOF investi       │
│  │   Gains: 15,000 XOF (15%)          │
│  │   Statut: 🟢 Active                 │
│  └─ [Opp #3] - 25K XOF investi        │
│      Gains: 2,500 XOF (10%)           │
│      Statut: 🟡 En attente            │
└─────────────────────────────────────────┘
```

**Données affichées:**
- Solde total en XOF / devise locale
- Gains du mois en cours
- Nombre d'opportunités actives
- Taux de rendement moyen
- Historique gains (graphique 30j)
- Liste des opportunités en cours avec % gains
- Boutons d'action (retrait, nouvelles opps)

---

#### 2️⃣ Catalogue d'Opportunités
**Page:** `/ActivatorOpportunities`

```
┌──────────────────────────────────────────────┐
│ 🔥 OPPORTUNITÉS DISPONIBLES                  │
├──────────────────────────────────────────────┤
│                                              │
│ 🔍 Filtres                                   │
│ ├─ Rendement: [5% - 20%]                    │
│ ├─ Durée: [7j, 15j, 30j, 60j]              │
│ ├─ Montant min: [0-500K XOF]                │
│ ├─ Statut: [Disponible, Presque plein]    │
│ └─ Tri: [Rendement, Popularité, Nouveau]  │
│                                              │
│ 📦 OPPORTUNITÉ #1                            │
│ ├─ Produit: iPhone 15 Pro Max                │
│ ├─ Prix achat: 500K XOF                     │
│ ├─ Prix vente estimé: 580K XOF             │
│ ├─ Rendement: 16% en 14 jours               │
│ ├─ Montant min à investir: 50K XOF         │
│ ├─ Montant min à investir: 100K XOF        │
│ ├─ Financé: 350K / 500K (70%)              │
│ ├─ Activateurs: 12 personnes                │
│ ├─ Risque: 🟢 FAIBLE                        │
│ ├─ Score IA: 9.2/10 ⭐                      │
│ └─ [ACTIVER] [Plus d'infos]                │
│                                              │
│ 📦 OPPORTUNITÉ #2                            │
│ ├─ Produit: Samsung Galaxy S25              │
│ ├─ Prix achat: 300K XOF                     │
│ ├─ Prix vente estimé: 360K XOF             │
│ ├─ Rendement: 20% en 21 jours               │
│ ├─ Montant min à investir: 25K XOF         │
│ ├─ Montant max à investir: 150K XOF        │
│ ├─ Financé: 250K / 300K (83%)              │
│ ├─ Activateurs: 18 personnes                │
│ ├─ Risque: 🟡 MOYEN                        │
│ ├─ Score IA: 8.7/10 ⭐                      │
│ └─ [ACTIVER] [Plus d'infos]                │
│                                              │
│ 📦 OPPORTUNITÉ #3                            │
│ ├─ Produit: Laptop HP ProBook                │
│ ├─ Prix achat: 800K XOF                     │
│ ├─ Prix vente estimé: 900K XOF             │
│ ├─ Rendement: 12.5% en 30 jours            │
│ ├─ Montant min à investir: 50K XOF         │
│ ├─ Montant max à investir: 300K XOF        │
│ ├─ Financé: 0K / 800K (0%)                  │
│ ├─ Activateurs: 0 personnes                 │
│ ├─ Risque: 🟢 FAIBLE                        │
│ ├─ Score IA: 9.5/10 ⭐                      │
│ └─ [ACTIVER] [Plus d'infos]                │
│                                              │
└──────────────────────────────────────────────┘
```

**Champs affichés par opportunité:**
- Image produit
- Nom produit
- Prix d'achat (coût réel)
- Prix de vente estimé
- Rendement % sur durée (ex: 16% en 14j)
- Durée de l'opportunité
- Montant minimum à investir
- Montant maximum à investir
- Barre de progression financement
- Nombre activateurs engagés
- Score IA de l'opportunité (0-10)
- Niveau de risque (FAIBLE/MOYEN/ÉLEVÉ)
- [ACTIVER] bouton principal

---

#### 3️⃣ Activation d'une Opportunité
**Page:** `/ActivatorActivate?opportunityId=XXX`

```
┌──────────────────────────────────────────────┐
│ ⚡ ACTIVER L'OPPORTUNITÉ                     │
├──────────────────────────────────────────────┤
│                                              │
│ 📦 iPhone 15 Pro Max                         │
│                                              │
│ 💰 CALCUL DES GAINS                         │
│ ├─ Montant à investir: [        500,000 XOF]│
│ │  (min 50K - max 100K)                     │
│ ├─ Rendement: 16%                           │
│ ├─ Gains estimés: 80,000 XOF               │
│ ├─ Durée: 14 jours                          │
│ ├─ Gain/jour: ~5,714 XOF                    │
│ └─ Montant final: 580,000 XOF              │
│                                              │
│ 💳 MÉTHODE DE PAIEMENT                      │
│ ├─ [○] Mobile Money (MTN / Orange)         │
│ ├─ [○] Carte Bancaire                       │
│ ├─ [○] Portefeuille (Solde actuel)         │
│ └─ [●] Solde Plateforme (1,250,000 XOF)   │
│                                              │
│ ✅ CONDITIONS                                │
│ ├─ [✓] J'accepte les conditions             │
│ ├─ [✓] Je comprends le risque               │
│ ├─ [✓] Durée: 14j (retrait possible)       │
│ └─ [✓] Frais: 2% (10,000 XOF)              │
│                                              │
│ [PAYER ET ACTIVER]  [Annuler]              │
│                                              │
│ 📊 DÉTAILS OPPORTUNITÉ                      │
│ ├─ Source: Amazon Côte d'Ivoire             │
│ ├─ Stock disponible: 50 unités              │
│ ├─ Fournisseur: Partenaire certifié         │
│ ├─ Score de confiance: 98%                  │
│ └─ [Voir l'analyse IA complète]            │
│                                              │
└──────────────────────────────────────────────┘
```

**Processus:**
1. Afficher les détails de l'opportunité
2. Permettre de saisir le montant à investir (min-max)
3. Calculer automatiquement les gains estimés
4. Proposer les moyens de paiement
5. Afficher les frais (2%)
6. Bouton validation + conditions
7. Redirection paiement (GeniusPay)
8. Confirmation et activation

---

#### 4️⃣ Wallet & Solde
**Page:** `/ActivatorWallet`

```
┌──────────────────────────────────────────────┐
│ 💰 MON PORTEFEUILLE                          │
├──────────────────────────────────────────────┤
│                                              │
│ 💵 SOLDES                                    │
│ ├─ Solde disponible: 1,250,000 XOF         │
│ ├─ En opportunités: 175,000 XOF            │
│ ├─ En attente retrait: 50,000 XOF          │
│ └─ Solde total: 1,475,000 XOF              │
│                                              │
│ 🚀 ACTIONS                                   │
│ ├─ [Ajouter des fonds]  [Retirer l'argent] │
│ └─ [Échanger tokens]                        │
│                                              │
│ 📜 HISTORIQUE TRANSACTIONS                  │
│ ├─ 16 Mar 12:45 | +15,000 XOF | Gains Op #1│
│ ├─ 16 Mar 08:20 | -50,000 XOF  | Retrait  │
│ ├─ 15 Mar 14:30 | +8,500 XOF   | Gains Op #2│
│ ├─ 15 Mar 10:00 | -100,000 XOF | Activ Op #3│
│ ├─ 14 Mar 16:15 | +5,000 XOF   | Bonus ref │
│ └─ [Voir plus...]                           │
│                                              │
│ 🔐 SÉCURITÉ                                  │
│ ├─ Authentification 2FA: ✅                  │
│ ├─ Limite retrait/jour: 500K XOF           │
│ └─ Limite retrait/semaine: 2M XOF          │
│                                              │
└──────────────────────────────────────────────┘
```

**Fonctionnalités:**
- Afficher solde disponible, en opportunités, en attente retrait
- Historique complet des transactions
- Ajouter des fonds (Mobile Money, Carte)
- Retirer l'argent (avec délai de 24-48h)
- Limite de retrait par jour/semaine
- Sécurité 2FA pour retraits > 100K

---

#### 5️⃣ Suivi Historique des Gains
**Page:** `/ActivatorHistory`

```
┌────────────────────────────────────────────────────┐
│ 📈 HISTORIQUE & STATISTIQUES                       │
├────────────────────────────────────────────────────┤
│                                                    │
│ 📊 STATISTIQUES GLOBALES                           │
│ ├─ Gains totaux historiques: 287,500 XOF         │
│ ├─ Nombre opportunités réussies: 24              │
│ ├─ Nombre opportunités échouées: 1               │
│ ├─ Taux de succès: 96%                           │
│ ├─ Rendement moyen: 13.5%                        │
│ └─ Rendement annualisé: ~162%                    │
│                                                    │
│ 📅 OPPORTUNITÉS COMPLÉTÉES                        │
│ ├─ [Opp #024] iPhone 15 - 16% en 14j            │
│ │  ├─ Investissement: 100K XOF                   │
│ │  ├─ Gains: 16,000 XOF                          │
│ │  ├─ Date: 15-29 Mar 2026                      │
│ │  └─ Statut: ✅ Complétée                       │
│ ├─ [Opp #023] Samsung S25 - 20% en 21j          │
│ │  ├─ Investissement: 75K XOF                    │
│ │  ├─ Gains: 15,000 XOF                          │
│ │  ├─ Date: 01-22 Mar 2026                      │
│ │  └─ Statut: ✅ Complétée                       │
│ ├─ [Opp #022] Laptop HP - 12% en 30j (ÉCHEC)   │
│ │  ├─ Investissement: 50K XOF                    │
│ │  ├─ Perte: -5,000 XOF                          │
│ │  ├─ Date: 01-31 Jan 2026                      │
│ │  └─ Statut: ❌ Perte (remboursement 95%)      │
│ │                                                │
│ └─ [Voir les 20 autres...]                       │
│                                                    │
│ 📈 GRAPHIQUES                                      │
│ ├─ Gains par mois (90 jours)                     │
│ ├─ Composition portefeuille                      │
│ ├─ Opportunités par catégorie                    │
│ └─ Évolution du solde total                      │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

#### 6️⃣ Système de Niveaux & Récompenses
**Page:** `/ActivatorLevel`

```
┌──────────────────────────────────────────────┐
│ 🏆 MON NIVEAU & RÉCOMPENSES                  │
├──────────────────────────────────────────────┤
│                                              │
│ 🥇 NIVEAU ACTUEL: GOLD                      │
│ ├─ Gains réalisés: 287,500 XOF             │
│ ├─ Progression vers PLATINUM:                │
│ │  [████████░░] 80%                          │
│ │  (besoin 100K XOF supplémentaires)        │
│ └─ Avantages actuels:                        │
│    ├─ Frais réduits: 2% → 1.5%             │
│    ├─ Opportunités VIP: 12h avant autres    │
│    ├─ Limite retrait: 500K → 1M XOF/jour   │
│    ├─ Cashback: 0.5% sur chaque activation │
│    └─ Support prioritaire                   │
│                                              │
│ 📊 STRUCTURE DES NIVEAUX                    │
│ ├─ 🥉 BRONZE (0 - 50K XOF)                 │
│ │  └─ Avantages: Frais 2%, limite 200K/j  │
│ ├─ 🥈 SILVER (50K - 150K XOF)              │
│ │  └─ Avantages: Frais 1.75%, limite 350K │
│ ├─ 🥇 GOLD (150K - 400K XOF)    [VOUS]    │
│ │  └─ Avantages: Frais 1.5%, limite 500K  │
│ ├─ 💎 PLATINUM (400K+ XOF)                 │
│ │  └─ Avantages: Frais 1%, limite 1M, VIP│
│ └─ 👑 ELITE (1M+ XOF)                      │
│    └─ Avantages: Frais 0.5%, limite 2M    │
│                                              │
│ 🎁 BONUS SPÉCIAUX                            │
│ ├─ Parrainage: +50K XOF par ami actif      │
│ ├─ Fidélité: +10K XOF tous les 3 mois      │
│ ├─ Challenges mensuels: jusqu'à +50K       │
│ └─ Référral bonus: +5% sur gains d'amis   │
│                                              │
│ 💳 RÉCOMPENSES DÉBLOQUÉES                   │
│ ├─ [✓] Parrain 3 amis                       │
│ ├─ [✓] 10 opportunités réussies             │
│ ├─ [✓] Gains > 200K XOF                     │
│ ├─ [ ] 50 opportunités réussies             │
│ ├─ [ ] Gains > 1M XOF                       │
│ └─ [ ] Inviter 10 amis                      │
│                                              │
└──────────────────────────────────────────────┘
```

---

### 💳 Tableau de Bord Détail

| Page | Fonction | Données clés |
|------|----------|--------------|
| `/ActivatorDashboard` | Accueil | Solde, gains, opps actives, stats |
| `/ActivatorOpportunities` | Catalogue | Liste filtrée d'opps, détails, score IA |
| `/ActivatorActivate` | Activation | Calcul gains, paiement, confirmation |
| `/ActivatorWallet` | Portefeuille | Soldes, retraits, historique |
| `/ActivatorHistory` | Historique | Stats, graphiques, opps complétées |
| `/ActivatorLevel` | Niveaux | Progression, récompenses, bonus |

---

## 👥 PROFIL 2 : CLIENT FINAL (ACHETEUR)

### 🎯 Objectif Principal
**Acheter des produits au bon prix, sans savoir qu'il y a un système derrière**

### 📋 Caractéristiques

| Aspect | Détail |
|--------|--------|
| **Rôle** | Acheteur de produits / Consommateur |
| **Motivation** | Bonnes affaires, livraison rapide |
| **Besoin** | Interface simple, confiable, paiement facile |
| **Contrainte** | Ne voit PAS les tokens, le système |

### ⚙️ Fonctionnalités (EXISTANTES, À MAINTENIR)

#### 1️⃣ Catalogue Produits
**Page:** `/Products` (existant)

```
Le client final voit juste:
├─ Liste produits
├─ Images
├─ Prix
├─ Détails
└─ [ACHETER]
```

**CE QU'IL NE VOIT PAS:**
- ❌ Les activateurs derrière
- ❌ Les investissements
- ❌ Le système de tokens
- ❌ Les opportunités

---

#### 2️⃣ Détail Produit & Panier
**Pages:** `/ProductDetail`, `/Checkout` (existant)

```
└─ C'est un e-commerce normal:
   ├─ Image produit
   ├─ Description
   ├─ Avis (if any)
   ├─ Prix
   ├─ [AJOUTER AU PANIER]
   └─ [PASSER COMMANDE]
```

---

#### 3️⃣ Paiement
**Page:** `/Payment` (existant)

```
└─ Paiement classique:
   ├─ Mobile Money
   ├─ Carte bancaire
   ├─ Porte-monnaie
   └─ Confirmation
```

---

#### 4️⃣ Suivi de Commande
**Page:** `/OrderTracking` (futur)

```
└─ Suivi simple:
   ├─ Numéro commande
   ├─ Statut: En préparation / En livraison / Livrée
   ├─ Estimation livraison
   └─ Historique commandes
```

---

## 🔗 FLUX D'INTERACTION ENTRE LES DEUX PROFILS

### Scénario Complet

```
JOUR 1:
┌─────────────────────────────────────────────┐
│ ACTIVATEUR                                  │
│ ├─ Voit opportunité: iPhone 15 (500K XOF)  │
│ ├─ Investit: 100K XOF                       │
│ └─ Attend les gains                          │
└─────────────────────────────────────────────┘
         ↓ [OptiMarket traite l'investissement]
┌─────────────────────────────────────────────┐
│ PLATEFORME                                  │
│ ├─ Achète 50 iPhones à 500K XOF            │
│ ├─ Met en vente à prix normal               │
│ ├─ Liste sur /Products                      │
│ └─ Stock visible pour clients               │
└─────────────────────────────────────────────┘
         ↓ [Client voit opportunité normale]
┌─────────────────────────────────────────────┐
│ CLIENT FINAL (Jours 1-14)                   │
│ ├─ Visite /Products                         │
│ ├─ Voit iPhone 15 à prix "normal" (580K)  │
│ ├─ Achète 5 iPhones                         │
│ ├─ Paie 2,900K XOF                         │
│ └─ Reçoit livraison en 7j                   │
└─────────────────────────────────────────────┘
         ↓ [Revenu généré]
┌─────────────────────────────────────────────┐
│ PLATEFORME (Jour 14)                        │
│ ├─ Revenu clients: 2,900K XOF              │
│ ├─ Coût stock: 2,500K XOF                  │
│ ├─ Profit brut: 400K XOF                   │
│ ├─ Frais plateforme 5%: 145K XOF           │
│ └─ Profit net: 255K XOF                    │
└─────────────────────────────────────────────┘
         ↓ [Récompense activateur]
┌─────────────────────────────────────────────┐
│ ACTIVATEUR (Jour 14)                        │
│ ├─ Gains reçus: 16,000 XOF (16% sur 100K)│
│ ├─ Transaction réussie ✅                   │
│ ├─ Solde: +16,000 XOF                      │
│ └─ Prêt pour nouvelle opportunité           │
└─────────────────────────────────────────────┘
```

---

## 🗄️ ENTITÉS BASE DE DONNÉES

### Entités Existantes (À Conserver)
- `Product` ✅
- `User` (role: 'user', 'admin')
- `Subscription`
- `ChatMessage`
- `Favorite`
- `Review`
- `Payment`

### Nouvelles Entités Requises

#### 1. `Opportunity` (Existante mais À Clarifier)
```json
{
  "name": "Opportunity",
  "type": "object",
  "properties": {
    "title": "string",
    "description": "string",
    "type": "enum: [product_deal, service_demand, flash_sale, trending, price_drop]",
    "score": "number (0-100) - score IA",
    "potential_margin": "number",
    "category": "string",
    "location_city": "string",
    "location_country": "string",
    "is_premium": "boolean",
    "related_product_id": "string (lien Product)",
    "expires_at": "date-time",
    "status": "enum: [active, expired, claimed]",
    "views": "number",
    "claims_count": "number"
  }
}
```

#### 2. `ActivatorInvestment` (NOUVEAU)
```json
{
  "name": "ActivatorInvestment",
  "type": "object",
  "properties": {
    "activator_email": "string (lien User)",
    "opportunity_id": "string (lien Opportunity)",
    "amount_invested": "number (XOF)",
    "currency": "string (XOF, EUR, USD, MAD)",
    "expected_return_percent": "number (12-20%)",
    "expected_return_amount": "number (calculé)",
    "duration_days": "number (7, 14, 21, 30, 60)",
    "start_date": "date-time",
    "end_date": "date-time (calculé)",
    "actual_profit": "number",
    "status": "enum: [active, completed, failed, paused]",
    "profit_received": "boolean",
    "payment_method": "enum: [wallet, mobile_money, card]",
    "fees_paid": "number (2%)",
    "notes": "string"
  }
}
```

#### 3. `ActivatorWallet` (NOUVEAU)
```json
{
  "name": "ActivatorWallet",
  "type": "object",
  "properties": {
    "user_email": "string (lien User)",
    "balance_available": "number",
    "balance_in_opportunities": "number",
    "balance_pending_withdrawal": "number",
    "total_balance": "number (calculé)",
    "total_earned": "number (historique)",
    "level": "enum: [bronze, silver, gold, platinum, elite]",
    "lifetime_investments": "number",
    "success_rate": "number (%)",
    "last_updated": "date-time"
  }
}
```

#### 4. `ActivatorReward` (NOUVEAU)
```json
{
  "name": "ActivatorReward",
  "type": "object",
  "properties": {
    "activator_email": "string",
    "type": "enum: [investment_profit, referral_bonus, level_bonus, challenge_reward]",
    "amount": "number",
    "related_investment_id": "string",
    "description": "string",
    "status": "enum: [earned, claimed, pending]",
    "earned_date": "date-time",
    "claimed_date": "date-time"
  }
}
```

#### 5. `ActivatorWithdrawal` (NOUVEAU)
```json
{
  "name": "ActivatorWithdrawal",
  "type": "object",
  "properties": {
    "activator_email": "string",
    "amount": "number",
    "currency": "string",
    "method": "enum: [mobile_money, bank_transfer, card]",
    "phone_or_account": "string",
    "status": "enum: [pending, processing, completed, rejected]",
    "requested_date": "date-time",
    "completed_date": "date-time",
    "transaction_id": "string",
    "notes": "string"
  }
}
```

---

## 👥 RÔLES UTILISATEURS

### 1. User Type: "user" (Client Final)
**Peut:**
- ✅ Voir produits
- ✅ Acheter
- ✅ Laisser avis
- ✅ Voir commandes
- ❌ Voir opportunités
- ❌ Investir
- ❌ Voir gains

**Pages:**
- /Home
- /Products
- /ProductDetail
- /Checkout
- /OrderTracking
- /Favorites

---

### 2. User Type: "activator" (Activateur d'Opportunités)
**Peut:**
- ✅ Voir opportunités
- ✅ Investir
- ✅ Suivre gains
- ✅ Retirer argent
- ✅ Voir dashboard
- ❌ Acheter produits (sauf comme client normal)
- ❌ Voir opérations de vente

**Pages:**
- /ActivatorDashboard
- /ActivatorOpportunities
- /ActivatorActivate
- /ActivatorWallet
- /ActivatorHistory
- /ActivatorLevel
- /Profile (onglet activateur)

---

### 3. User Type: "admin"
**Peut:**
- ✅ Valider opportunités
- ✅ Voir statistiques globales
- ✅ Gérer utilisateurs
- ✅ Voir transactions
- ✅ Générer rapports
- ✅ Contrôler flux finances

**Pages:**
- /AdminDashboard (nouveau onglet: Activators)
- /AdminDashboard (onglet: Withdrawals)
- /AdminDashboard (onglet: Opportunities)

---

## 📊 ARCHITECTURE TECHNIQUE

### Tech Stack
```
Frontend: React + Tailwind CSS
Backend: Deno Functions
Database: Base44 Entity Store
Payment: GeniusPay API
```

### Flux de Données

```
┌─────────────────────────────────────────┐
│        ACTIVATOR JOURNEY                │
├─────────────────────────────────────────┤
│ 1. S'enregistre (role: "activator")     │
│ 2. Voir /ActivatorDashboard             │
│ 3. Parcourir /ActivatorOpportunities   │
│ 4. Investir via /ActivatorActivate     │
│ 5. Transaction GeniusPay                │
│ 6. ActivatorInvestment créée            │
│ 7. Gains calculés & crédités           │
│ 8. Voir gains dans /ActivatorWallet     │
│ 9. Retirer via /ActivatorWithdrawal    │
│ 10. Passage à niveau supérieur          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│       CLIENT FINAL JOURNEY              │
├─────────────────────────────────────────┤
│ 1. Visite /Products                     │
│ 2. Parcourt produits (financés par Opp) │
│ 3. Paie via /Checkout                   │
│ 4. Transaction GeniusPay                │
│ 5. Revenu généré                        │
│ 6. Profit réparti à activateur          │
│ 7. Reçoit livraison                     │
│ 8. Peut laisser avis                    │
└─────────────────────────────────────────┘
```

---

## 🔄 RÈGLES MÉTIER CLÉS

### Règles d'Investissement

| Règle | Détail |
|-------|--------|
| **Min. investissement** | 25,000 XOF |
| **Max. investissement** | Selon niveau (BRONZE: 100K, GOLD: 500K, PLATINUM: 1M) |
| **Durée d'opportunité** | 7, 14, 21, 30, 60 jours |
| **Rendement** | 10-25% selon risque |
| **Frais** | 2% pour BRONZE, 1.75% SILVER, 1.5% GOLD, 1% PLATINUM |
| **Profit minimum** | Garanti si stock vendu |
| **Assurance** | Remboursement 95% si échec |

### Système de Niveaux

| Niveau | Min. Gains | Frais | Limite retrait | Bonus |
|--------|-----------|-------|---------------|----- |
| 🥉 BRONZE | 0 | 2.0% | 200K/j | Base |
| 🥈 SILVER | 50K | 1.75% | 350K/j | Cashback 0.25% |
| 🥇 GOLD | 150K | 1.5% | 500K/j | Cashback 0.5% + OPP VIP 12h avant |
| 💎 PLATINUM | 400K | 1.0% | 1M/j | Cashback 1% + VIP complet |
| 👑 ELITE | 1M | 0.5% | 2M/j | Cashback 2% + Private Manager |

---

## 🔐 Sécurité & Conformité

```
Authentification:
├─ Email/Password
├─ OTP pour paiements > 100K
├─ 2FA optionnel
└─ KYC pour retraits > 500K

Limits:
├─ Retrait/jour: selon niveau
├─ Retrait/semaine: 3x limite quotidienne
└─ Investissement max: selon niveau

Protection:
├─ Chiffrement données sensibles
├─ SSL/TLS pour paiements
├─ Audit logs de toutes transactions
└─ Assurance investissements (95% remboursement)
```

---

## 📱 Plan de Déploiement (Phase 1)

### Sprint 1 (Semaines 1-2): Fondations
- [ ] Créer entités ActivatorInvestment, ActivatorWallet
- [ ] Backend: fonction d'activation d'opportunité
- [ ] Backend: calcul des gains
- [ ] UI: /ActivatorDashboard basique

### Sprint 2 (Semaines 3-4): Core Features
- [ ] /ActivatorOpportunities avec filtres
- [ ] /ActivatorActivate avec paiement
- [ ] /ActivatorWallet avec historique
- [ ] Backend: retraits (GeniusPay)

### Sprint 3 (Semaines 5-6): Polish
- [ ] /ActivatorHistory avec graphiques
- [ ] Système de niveaux
- [ ] Notifications gains
- [ ] Tests + QA

### Sprint 4 (Semaine 7): Live
- [ ] Déploiement prod
- [ ] Support utilisateurs
- [ ] Monitoring

---

## 🎯 Métriques de Succès

```
Pour l'Activateur:
├─ Nombre d'activateurs: > 100
├─ Capital investi: > 50M XOF
├─ Taux de rétention: > 80%
├─ Rendement moyen: 12-15%
└─ Temps withdrawal: < 24h

Pour le Client Final:
├─ Nombre clients: > 1000
├─ Transactions/mois: > 500
├─ Satisfaction: > 4.5/5
├─ Taux retour: > 30%
└─ Coût acquisition: < 2%

Pour la Plateforme:
├─ Marge brute: > 20%
├─ GMV mensuel: > 100M XOF
├─ Churn activateurs: < 5%
└─ Uptime: > 99.9%
```

---

## ✅ Prochaines Étapes

1. **Valider ce cahier** avec les stakeholders
2. **Créer les wireframes** pour chaque page
3. **Implémenter les entités** dans Base44
4. **Développer les fonctions** backend
5. **Tester le flux** complet
6. **Lancer beta** avec premiers activateurs

---

**Document Version:** 1.0  
**Dernière mise à jour:** 17 Mars 2026  
**Status:** 🟡 En révision