
import { Fragment, useEffect, useState } from 'react'

// ───────────────────────────────────────────────────────────
// Données — Vision produit CocktailOS (Avril 2026)
// ───────────────────────────────────────────────────────────

const TAGS_PITCH = [
  { label: 'Travailleurs autonomes', bg: 'white', color: '#666' },
  { label: 'Petites businesses sans employés', bg: 'white', color: '#666' },
  { label: 'Québec / Canada', bg: 'white', color: '#666' },
  { label: '100% brandable', bg: 'white', color: '#666' },
  { label: 'Pas de paie', bg: '#fdecea', color: '#c0321a' },
  { label: 'Pas de DAS', bg: '#fdecea', color: '#c0321a' },
  { label: 'Pas de comptabilité complexe', bg: '#fdecea', color: '#c0321a' },
]

const STATS = [
  { value: '3', label: 'Forfaits distincts' },
  { value: '40$', label: 'Entrée / mois' },
  { value: '100$', label: 'Maximum / mois' },
  { value: 'Déc 26', label: 'Premières ventes' },
]

const FORFAITS_STRUCTURE = [
  { emoji: '🧾', titre: 'Base — 40$/mois', desc: 'CRM · Facturation · Projets · Mailing · Tables custom · Rappels auto', prix: '40$', borderColor: '#2ecc71' },
  { note: 'emboîte le Base' },
  { emoji: '📦', titre: 'Base+ — 75$/mois', desc: 'Tout le Base + Inventaire (produits finis, matières premières, recettes, fournisseurs)', prix: '75$', borderColor: '#3498db' },
  { note: 'emboîte le Base (direction immobilier)' },
  { emoji: '🏡', titre: 'Premium — 100$/mois', desc: 'Tout le Base orienté immobilier + mandats, prospects, commission, workflow notaire', prix: '100$', borderColor: '#e67e22' },
] as const

type Bloc = {
  id: string
  titre: string
  badge: string
  badgeBg: string
  badgeColor: string
  texte?: string
  items: string[]
  exemple?: { label: string; texte: string }
}

const FORFAIT_TABS = [
  { id: 'base', label: '🧾 Base — 40$/mois', color: '#2ecc71', bg: '#d4edda', text: '#155724' },
  { id: 'baseplus', label: '📦 Base+ — 75$/mois', color: '#3498db', bg: '#cce5ff', text: '#004085' },
  { id: 'premium', label: '🏡 Premium — 100$/mois', color: '#e67e22', bg: '#fff3cd', text: '#856404' },
] as const

const FORFAIT_INTRO: Record<string, { bg: string; color: string; gras: string; suite: string }> = {
  base: { bg: '#d4edda', color: '#155724', gras: 'Forfait de base — tout métier, tout travailleur autonome.', suite: ' CRM + Facturation + Projets + Communication.' },
  baseplus: { bg: '#cce5ff', color: '#004085', gras: 'Tout le forfait Base 40$ est inclus', suite: ' + module inventaire complet pour artisans, commerces et créateurs qui gèrent du stock.' },
  premium: { bg: '#fff3cd', color: '#856404', gras: 'Tout le forfait Base 40$ est inclus', suite: " — orienté spécifiquement vers le courtage immobilier. Mandats, workflow notaire, CRM prospects acheteurs." },
}

const FORFAIT_BLOCS: Record<string, Bloc[]> = {
  base: [
    {
      id: 'b1', titre: 'CRM — Gestion clients', badge: 'Base', badgeBg: '#d4edda', badgeColor: '#155724',
      texte: "Fiche client complète pour chaque contact. Historique de tous les projets, factures et interactions au même endroit.",
      items: [
        'Fiche client — nom, email, téléphone, entreprise',
        'Tags libres pour segmenter ta clientèle',
        'Historique complet projets + factures par client',
        'Notes libres par client',
        'Dossier Google Drive auto-créé par client',
        'Espace client sécurisé (login + portail)',
      ],
    },
    {
      id: 'b2', titre: 'Notes et tables personnalisées par métier', badge: 'Nouveau', badgeBg: '#cce5ff', badgeColor: '#004085',
      texte: "Chaque utilisateur crée ses propres sections sur la fiche client — adaptées à son métier. Un salon d'esthétique ajoute Soins effectués, un coach ajoute Séances, un mécanicien ajoute Véhicules.",
      items: [
        'Création de tables custom par métier (nom libre)',
        'Colonnes configurables — texte, date, liste, nombre',
        'Ajout de rangées au fil du temps',
        'Visible sur la fiche client en tout temps',
        'Notes libres en complément des tables',
      ],
      exemple: { label: 'Exemples par métier :', texte: 'Salon → Soins effectués · Coach → Séances · Mécanicien → Véhicules · Photographe → Sessions · Tatoueur → Pièces' },
    },
    {
      id: 'b3', titre: 'Rappels automatiques', badge: 'Nouveau', badgeBg: '#cce5ff', badgeColor: '#004085',
      texte: "Emails automatiques envoyés au bon moment — factures impayées, suivi de soins, renouvellement. Configurables, envoyés depuis la plateforme sans app externe.",
      items: [
        'Rappels factures impayées — J+7, J+14, J+30 (configurable)',
        'Rappels soins / suivi client (délai configurable)',
        'Message personnalisable par type de rappel',
        'Historique des rappels envoyés par client',
        'Envoi via Flask-Mail — tout dans la plateforme',
      ],
      exemple: { label: 'Exemple salon :', texte: 'Soin enregistré le 1er mars → Délai 6 semaines → Email auto "Il est temps de revenir!"' },
    },
    {
      id: 'b4', titre: 'Mailing promotionnel', badge: 'Nouveau', badgeBg: '#cce5ff', badgeColor: '#004085',
      texte: "Envoyer des campagnes email à ta base de clients directement depuis le portail. Aucune app externe, aucun compte Mailchimp. Tu appuies sur envoyer — c'est parti.",
      items: [
        'Création de campagnes email depuis le portail',
        'Templates réutilisables — promotion, info, saisonnier',
        'Segmentation par tag client',
        'Envoi à toute la base ou à un segment',
        'Lien de désabonnement automatique — conformité CASL',
        'Historique des campagnes envoyées',
        'Envoi en batch via Flask-Mail — tout dans la plateforme',
      ],
      exemple: { label: 'Décision :', texte: "Pas de stats d'ouverture en phase 1 — évite tout service externe. Simplicité avant tout." },
    },
    {
      id: 'b5', titre: 'Projets et suivi de statuts', badge: 'Base', badgeBg: '#d4edda', badgeColor: '#155724',
      items: [
        'Création de projets par client',
        'Checklists de documents par projet',
        'Statuts automatiques selon progression',
        'Emails automatiques à chaque étape',
        'Blocs Google Calendar par projet',
        'Archivage des projets terminés',
      ],
    },
    {
      id: 'b6', titre: 'Facturation', badge: 'Base', badgeBg: '#d4edda', badgeColor: '#155724',
      items: [
        'Création de factures PDF',
        'Envoi par email depuis la plateforme',
        'Statuts : Brouillon → Envoyée → Payée → En retard',
        'Rappels automatiques impayés — J+7, J+14, J+30',
        'Archivage Drive par client',
        'Dashboard financier mensuel',
        'Export annuel pour comptable (CSV / PDF)',
      ],
    },
  ],
  baseplus: [
    {
      id: 'i1', titre: 'Inventaire produits finis', badge: 'Base', badgeBg: '#d4edda', badgeColor: '#155724',
      texte: "Ce que tu vends ou livres au client final. Chaque article a un SKU, un nom, une quantité en stock et un seuil d'alerte.",
      items: [
        'Catalogue produits finis avec SKU',
        'Quantité en stock en temps réel',
        "Seuil d'alerte configurable par produit",
        'Email automatique quand stock sous le seuil',
        'Historique des mouvements (entrées / sorties)',
        'Dashboard : ruptures, surplus, tendances',
        'Export CSV + rapport mensuel Drive',
      ],
      exemple: { label: 'Exemple :', texte: 'Bougie lavande 200ml · Stock 48 unités · Seuil 10 → Alerte à 9 unités' },
    },
    {
      id: 'i2', titre: 'Inventaire matières premières', badge: 'Base', badgeBg: '#d4edda', badgeColor: '#155724',
      texte: "Les composantes qui servent à fabriquer tes produits. Même logique que les produits finis — SKU, stock, seuil, alertes — dans une catégorie séparée.",
      items: [
        'Catalogue matières premières avec SKU',
        'Unités de mesure flexibles (g, ml, unité, m, etc.)',
        'Quantité en stock en temps réel',
        'Seuil d’alerte configurable par matière',
        'Historique des consommations',
      ],
      exemple: { label: 'Exemple :', texte: 'Cire de soja · Mèches coton · Huile essentielle lavande — chacune suivie séparément' },
    },
    {
      id: 'i3', titre: 'Recettes et assemblage', badge: 'Base', badgeBg: '#d4edda', badgeColor: '#155724',
      texte: "Tu définis une recette une seule fois. Quand tu enregistres une production, les matières sont déduites automatiquement et les produits finis entrent en stock.",
      items: [
        'Création de recettes par produit fini',
        'Association matières premières + quantités',
        "Enregistrement d'une production en X unités",
        'Déduction automatique des matières consommées',
        'Ajout automatique au stock produit fini',
        'Alerte si matières insuffisantes avant de produire',
      ],
      exemple: { label: 'Exemple :', texte: '180g cire + 1 mèche + 20ml huile lavande → 1 bougie en stock' },
    },
    {
      id: 'i4', titre: 'Réception fournisseur', badge: 'Base', badgeBg: '#d4edda', badgeColor: '#155724',
      texte: "Quand tu reçois une livraison, tu enregistres la réception en quelques secondes. Le stock se met à jour automatiquement. Simple — pas de bons de commande complexes.",
      items: [
        'Enregistrement rapide d’une réception (matière + quantité)',
        'Mise à jour automatique du stock',
        'Fiche fournisseur simple (nom, contact)',
        'Historique des réceptions par matière',
      ],
      exemple: { label: 'Exemple :', texte: 'Reçu 5kg cire de soja — Fournisseur Nature Wax Co. → Stock +5000g' },
    },
  ],
  premium: [
    {
      id: 'p1', titre: 'Gestion des mandats', badge: 'Base construite', badgeBg: '#d4edda', badgeColor: '#155724',
      items: [
        'Création d’un mandat par propriété',
        'Adresse complète de la propriété',
        'Type de mandat — vente ou achat',
        'Prix demandé / prix offert',
        'Client assigné au mandat',
        'Dossier Drive auto par propriété + sous-dossiers',
        'Archivage du mandat à la fermeture',
      ],
    },
    {
      id: 'p2', titre: 'Workflow de progression du mandat', badge: 'Base construite', badgeBg: '#d4edda', badgeColor: '#155724',
      items: [
        'Documents à fournir → email auto au client',
        'Documents reçus → statut automatique',
        'Propriété mise en marché → Calendar auto',
        'Offre reçue / en négociation → email client',
        'Offre acceptée — chez le notaire → checklist notaire',
        'Vendu — dossier fermé → archivage + facture auto',
      ],
    },
    {
      id: 'p3', titre: 'Checklist documents courtier et client', badge: 'Base construite', badgeBg: '#d4edda', badgeColor: '#155724',
      items: [
        'Modèle de checklist immobilier pré-rempli',
        'Chaque item indique : courtier ou client',
        'Client uploade ses documents dans son espace',
        'Courtier uploade les siens depuis son tableau de bord',
        'Fichiers vont automatiquement dans le bon sous-dossier Drive',
      ],
    },
    {
      id: 'p4', titre: 'Blocs Calendar automatiques', badge: 'Base construite', badgeBg: '#d4edda', badgeColor: '#155724',
      items: [
        'Séance photo — bloc Calendar mardi ou jeudi',
        'Visite de la propriété — bloc selon disponibilité',
        'Inspection — bloc avec délai 48h',
        'Date de livraison estimée calculée automatiquement',
        'Email au client avec la date estimée',
      ],
    },
    {
      id: 'p5', titre: 'CRM acheteurs prospects', badge: 'À construire', badgeBg: '#cce5ff', badgeColor: '#004085',
      items: [
        'Fiche prospect — nom, contact, budget, secteur',
        'Température : Chaud / Tiède / Froid',
        'Notes libres + tables custom',
        'Rappel automatique de suivi configurable',
        'Conversion prospect → client quand mandat créé',
        'Mailing ciblé aux prospects',
      ],
    },
    {
      id: 'p6', titre: 'Facturation de commission', badge: 'À adapter', badgeBg: '#cce5ff', badgeColor: '#004085',
      items: [
        'Facture de commission générée à la fermeture',
        'Prix de vente + % commission = montant calculé auto',
        'PDF au nom du courtier, envoyé par email',
        'Archivé dans le dossier Drive du mandat',
        'Historique des commissions — dashboard annuel',
      ],
      exemple: { label: 'Exemple :', texte: 'Vendu 385 000$ x 5% = 19 250$ → Facture PDF générée' },
    },
  ],
}

const PRINCIPES = [
  { titre: '1 — Zéro jargon technique', jamais: 'Segment · CRM · Template ID · Webhook · SMTP · Entité', toujours: 'Mes clientes · Ma facture · Envoyer un email · Mon rendez-vous' },
  { titre: '2 — Un bouton = une action', jamais: 'Paramètres → Campagnes → Nouveau → Configurer → Aperçu → Confirmer', toujours: 'Bouton "Envoyer une promo" → 2 champs → Envoyer' },
  { titre: '3 — Les erreurs s’expliquent en français simple', jamais: 'Error 500 · SMTP connection refused · Invalid token', toujours: "L'email n'a pas pu être envoyé. Vérifiez votre connexion et réessayez." },
  { titre: '4 — Defaults intelligents — elle ne configure rien', jamais: 'Configurer les délais de rappel avant de commencer', toujours: 'Rappel à J+7 par défaut — elle peut changer si elle veut' },
  { titre: '5 — Mobile d’abord', jamais: 'Interface desktop adaptée au mobile en dernier', toujours: 'Conçu mobile → adapté desktop. Gros boutons, texte lisible' },
]

type Phase = {
  id: number
  titre: string
  periode: string
  dotColor: string
  badge: string
  badgeBg: string
  badgeColor: string
  todos: { texte: string; done: boolean }[]
  editable: boolean
}

const PHASES_INIT: Phase[] = [
  {
    id: 0, titre: 'Phase 0 — Fondation', periode: 'Octobre 2025 → Fin mars 2026',
    dotColor: '#2ecc71', badge: 'Complétée', badgeBg: '#d4edda', badgeColor: '#155724', editable: false,
    todos: [
      'Infrastructure CocktailOS — Docker, Gunicorn, Nginx, SSL Let’s Encrypt',
      'Base de données SQLite — schéma complet, WAL mode',
      'Authentification — login email/password + Google OAuth',
      'Confirmation email + reset mot de passe',
      'Gestion clients — inscription, profil, fuzzy match entreprise (rapidfuzz 85%)',
      'Gestion projets — création, statuts automatiques, archivage',
      'Checklists — modèles par service, items, upload fichiers clients',
      'Google Drive — Service Account, Shared Drive, dossiers auto par client/projet',
      'Google Calendar — blocs de production automatiques par service',
      'Emails automatiques — 11 templates HTML brandés Cocktail Media',
      'Dashboard admin complet — gestion clients, projets, services, checklists',
      'Dashboard client — liste projets, statuts, progress bar checklist',
      'Déploiement production — portail.cocktailmedia.ca',
    ].map(texte => ({ texte, done: true })),
  },
  { id: 1, titre: 'Phase 1 — Tests et lancement', periode: 'Fin mars → Début avril 2026', dotColor: '#f39c12', badge: 'En cours', badgeBg: '#fff3cd', badgeColor: '#856404', editable: true, todos: [] },
  { id: 2, titre: 'Phase 2 — UX Polish', periode: 'Reste avril → Première de mai 2026', dotColor: '#f39c12', badge: 'En cours', badgeBg: '#fff3cd', badgeColor: '#856404', editable: true, todos: [] },
  { id: 3, titre: 'Phase 3 — Base 40$ + Premium 100$', periode: 'Mi-mai → Juin 2026', dotColor: '#3498db', badge: 'Planifiée', badgeBg: '#cce5ff', badgeColor: '#004085', editable: true, todos: [] },
  { id: 4, titre: 'Phase 4 — Base+ 75$/mois', periode: 'Juillet → Août 2026', dotColor: '#3498db', badge: 'Planifiée', badgeBg: '#cce5ff', badgeColor: '#004085', editable: true, todos: [] },
  { id: 5, titre: 'Phase 5 — Bêta et Lancement', periode: 'Septembre → Décembre 2026', dotColor: '#c0321a', badge: 'Objectif $', badgeBg: '#fdecea', badgeColor: '#c0321a', editable: true, todos: [] },
]

const TIMELINE = [
  {
    periode: 'Avril', annee: '2026', dotColor: '#2ecc71', borderColor: '#e0d9d3', badge: 'En production', badgeBg: '#d4edda', badgeColor: '#155724',
    titre: 'Portail Client Cocktail Media',
    desc: 'Modules de base fonctionnels. UX polish et corrections mineures en cours.',
    tags: ['Projets', 'Drive', 'Calendar', 'Facturation', 'CRM', 'UX polish en cours'],
  },
  {
    periode: 'Mi-mai — Juin', annee: '2026', dotColor: '#f39c12', borderColor: '#f39c12', badge: 'Prochain', badgeBg: '#fff3cd', badgeColor: '#856404',
    titre: 'Forfait Base 40$ + Premium 100$',
    desc: 'Finalisation UX. Modules manquants du Base. Adaptation immobilier Premium. Multi-tenancy + Stripe.',
    tags: ['Tables custom', 'Mailing', 'Rappels auto', '@cocktailos.ca', 'Mandats', 'Stripe', 'Multi-tenant'],
  },
  {
    periode: 'Juil — Août', annee: '2026', dotColor: '#3498db', borderColor: '#e0d9d3', badge: 'Planifié', badgeBg: '#cce5ff', badgeColor: '#004085',
    titre: 'Forfait Base+ 75$/mois',
    desc: 'Module inventaire complet — produits finis, matières premières, recettes et assemblage, réception fournisseur.',
    tags: ['SKU / Catalogue', 'Recettes MP-fini', 'Alertes stock', 'Export CSV'],
  },
  {
    periode: 'Sept — Oct', annee: '2026', dotColor: '#3498db', borderColor: '#e0d9d3', badge: 'Planifié', badgeBg: '#cce5ff', badgeColor: '#004085',
    titre: 'Bêta fermée — Tests clients',
    desc: '5 à 10 clients dont Nathalie Cartier. Feedback UX, stabilisation, ajustements.',
    tags: ['Bêta fermée', 'Nathalie Cartier', 'Feedback UX'],
  },
  {
    periode: 'Nov — Déc', annee: '2026', dotColor: '#c0321a', borderColor: '#c0321a', badge: 'Objectif $', badgeBg: '#fdecea', badgeColor: '#c0321a',
    titre: 'Premières ventes + Recherche de financement',
    desc: 'Premiers abonnements Stripe. Croissance organique. En parallèle : approcher accélérateurs et investisseurs avec un MRR démontrable.',
    tags: ['Premiers abonnés', 'MRR démontrable', 'Accélérateurs QC', 'BDC / CDPQ', 'Angels'],
  },
]

const DECISIONS = [
  { emoji: '✉️', titre: 'Mailing — Flask-Mail, tout dans la plateforme', texte: 'Pas de Mailchimp. Envoi en batch. Pas de stats ouverture phase 1.' },
  { emoji: '📮', titre: 'Adresse brandée @cocktailos.ca + Reply-To client', texte: 'Alias From personnalisé. Reply-To vers vrai email du client. Zéro configuration pour Nathalie.' },
  { emoji: '🎨', titre: '100% brandable — fichier thème JSON', texte: 'Couleurs, logo, nom, signature — tout change depuis un seul fichier.' },
  { emoji: '👩', titre: 'Simplicité absolue — test Nathalie', texte: "Zéro jargon. Un bouton = une action. Si Nathalie comprend pas en 10 secondes, on simplifie." },
  { emoji: '🔒', titre: 'Hors scope permanent — paie, DAS, comptabilité complexe', texte: 'CocktailOS ne remplacera jamais QuickBooks. Ce n’est pas le marché visé.' },
]

const COMPARISON_GROUPS = [
  {
    titre: 'CRM et Clients',
    rows: [
      { label: 'Fiche client + historique', vals: [true, true, true] },
      { label: 'Tags + segmentation', vals: [true, true, true] },
      { label: 'Notes et tables custom par métier', vals: [true, true, true] },
      { label: 'CRM prospects acheteurs', vals: [false, false, true] },
    ],
  },
  {
    titre: 'Communication',
    rows: [
      { label: 'Rappels automatiques configurables', vals: [true, true, true] },
      { label: 'Mailing promo base clients', vals: [true, true, true] },
      { label: 'Adresse @cocktailos.ca brandée', vals: [true, true, true] },
      { label: 'Emails auto par étape de projet', vals: [true, true, true] },
    ],
  },
  {
    titre: 'Facturation',
    rows: [
      { label: 'Factures PDF + envoi email', vals: [true, true, true] },
      { label: 'Rappels impayés automatiques', vals: [true, true, true] },
      { label: 'Export annuel pour comptable', vals: [true, true, true] },
      { label: 'Facturation de commission immo', vals: [false, false, true] },
    ],
  },
  {
    titre: 'Projets et Automatisations',
    rows: [
      { label: 'Projets + checklists + statuts auto', vals: [true, true, true] },
      { label: 'Drive auto par client', vals: [true, true, true] },
      { label: 'Google Calendar auto', vals: [true, true, true] },
    ],
  },
  {
    titre: 'Module Inventaire — Base+ seulement',
    rows: [
      { label: 'Produits finis (SKU, stock, alertes)', vals: [false, true, false] },
      { label: 'Matières premières', vals: [false, true, false] },
      { label: 'Recettes et assemblage MP vers fini', vals: [false, true, false] },
      { label: 'Réception fournisseur simple', vals: [false, true, false] },
    ],
  },
  {
    titre: 'Module Immobilier — Premium seulement',
    rows: [
      { label: 'Gestion mandats vente et achat', vals: [false, false, true] },
      { label: 'Workflow mandat complet', vals: [false, false, true] },
      { label: 'Checklist courtier et client', vals: [false, false, true] },
      { label: 'CRM prospects acheteurs', vals: [false, false, true] },
    ],
  },
  {
    titre: 'Hors scope — tous les forfaits',
    rows: [
      { label: 'Gestion de la paie / DAS', vals: [false, false, false] },
      { label: 'Comptabilité complexe / taxes', vals: [false, false, false] },
    ],
  },
]

// ───────────────────────────────────────────────────────────
// Petits composants utilitaires
// ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', margin: '2rem 0 10px' }}>
      {children}
    </p>
  )
}

function Check({ ok }: { ok: boolean }) {
  return ok
    ? <span style={{ color: '#2ecc71', fontSize: '15px' }}>✓</span>
    : <span style={{ color: '#ccc' }}>—</span>
}

// ───────────────────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────────────────

export default function CocktailOSVision() {
  const [activeForfait, setActiveForfait] = useState<typeof FORFAIT_TABS[number]['id']>('base')
  const [openBlocs, setOpenBlocs] = useState<Record<string, boolean>>({})
  const [openPhases, setOpenPhases] = useState<Record<number, boolean>>({})
  const [phases, setPhases] = useState<Phase[]>(PHASES_INIT)
  const [newTodoText, setNewTodoText] = useState<Record<number, string>>({})

  // Charger les todos sauvegardés (phases éditables) depuis localStorage
  useEffect(() => {
    setPhases(prev => prev.map(phase => {
      if (!phase.editable) return phase
      try {
        const raw = localStorage.getItem(`cocktailos_todos_phase_${phase.id}`)
        if (raw) return { ...phase, todos: JSON.parse(raw) }
      } catch { /* ignore */ }
      return phase
    }))
  }, [])

  function persistTodos(phaseId: number, todos: { texte: string; done: boolean }[]) {
    try { localStorage.setItem(`cocktailos_todos_phase_${phaseId}`, JSON.stringify(todos)) } catch { /* ignore */ }
  }

  function toggleBloc(id: string) {
    setOpenBlocs(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function togglePhase(id: number) {
    setOpenPhases(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleTodo(phaseId: number, idx: number) {
    setPhases(prev => prev.map(phase => {
      if (phase.id !== phaseId) return phase
      const todos = phase.todos.map((t, i) => i === idx ? { ...t, done: !t.done } : t)
      persistTodos(phaseId, todos)
      return { ...phase, todos }
    }))
  }

  function deleteTodo(phaseId: number, idx: number) {
    setPhases(prev => prev.map(phase => {
      if (phase.id !== phaseId) return phase
      const todos = phase.todos.filter((_, i) => i !== idx)
      persistTodos(phaseId, todos)
      return { ...phase, todos }
    }))
  }

  function addTodo(phaseId: number) {
    const texte = (newTodoText[phaseId] || '').trim()
    if (!texte) return
    setPhases(prev => prev.map(phase => {
      if (phase.id !== phaseId) return phase
      const todos = [...phase.todos, { texte, done: false }]
      persistTodos(phaseId, todos)
      return { ...phase, todos }
    }))
    setNewTodoText(prev => ({ ...prev, [phaseId]: '' }))
  }

  function phaseStatus(phase: Phase) {
    const total = phase.todos.length
    const done = phase.todos.filter(t => t.done).length
    if (total === 0) return { badge: phase.badge, badgeBg: phase.badgeBg, badgeColor: phase.badgeColor, dot: phase.dotColor, progress: '' }
    if (done === total) return { badge: 'Complétée', badgeBg: '#d4edda', badgeColor: '#155724', dot: '#2ecc71', progress: `${done}/${total}` }
    if (done > 0) return { badge: 'En cours', badgeBg: '#fff3cd', badgeColor: '#856404', dot: '#f39c12', progress: `${done}/${total}` }
    return { badge: phase.badge, badgeBg: phase.badgeBg, badgeColor: phase.badgeColor, dot: phase.dotColor, progress: `${done}/${total}` }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '80px' }}>

      <h1 style={{ fontFamily: "'Bebas Neue', var(--font-display)", fontSize: '2.2rem', color: '#2b2b2b', margin: '0 0 0.25rem', letterSpacing: '0.02em' }}>
        Roadmap CocktailOS
      </h1>
      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem' }}>Vision produit — Avril 2026</p>

      {/* Pitch */}
      <div style={{ background: '#fff4e9', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: 500, color: '#2b2b2b', lineHeight: 1.7, margin: '0 0 0.75rem' }}>
          Un seul outil pour gérer toute ton activité. Pas un logiciel d&apos;entreprise mal adapté. Conçu pour Nathalie — et pour tous ceux qui lui ressemblent.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {TAGS_PITCH.map(tag => (
            <span key={tag.label} style={{ fontSize: '11px', background: tag.bg, border: tag.bg === 'white' ? '1px solid #e0d9d3' : 'none', borderRadius: '4px', padding: '3px 9px', color: tag.color }}>
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Persona */}
      <div style={{ background: 'white', border: '1px solid #e0d9d3', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#e8ecff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>N</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#2b2b2b' }}>Nathalie Cartier — Persona de référence</div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>58 ans · Travailleuse autonome · Si elle comprend pas en 10 secondes, c&apos;est trop complexe. QuickBooks existe pour le reste.</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '1.5rem' }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: '#fff4e9', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 500, color: '#2b2b2b' }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: '#888', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Structure des forfaits */}
      <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', marginBottom: '10px' }}>Structure des forfaits — 1 client = 1 forfait</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '1.5rem' }}>
        {FORFAITS_STRUCTURE.map((item, i) =>
          'note' in item ? (
            <div key={i} style={{ textAlign: 'center', fontSize: '11px', color: '#aaa', padding: '2px 0' }}>{item.note}</div>
          ) : (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'white', border: '1px solid #e0d9d3', borderLeft: `3px solid ${item.borderColor}`, borderRadius: '8px' }}>
              <span style={{ fontSize: '18px' }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#2b2b2b' }}>{item.titre}</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{item.desc}</div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 500, color: '#2b2b2b' }}>{item.prix}</div>
            </div>
          )
        )}
      </div>

      {/* Détail des forfaits — onglets */}
      <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', margin: '1.5rem 0 10px' }}>Détail des forfaits</p>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        {FORFAIT_TABS.map(tab => {
          const active = activeForfait === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveForfait(tab.id)}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '13px',
                border: active ? `2px solid ${tab.color}` : '1px solid #e0d9d3',
                background: active ? tab.bg : 'white',
                color: active ? tab.text : '#2b2b2b',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div style={{ background: FORFAIT_INTRO[activeForfait].bg, borderRadius: '8px', padding: '10px 14px', marginBottom: '10px', fontSize: '12px', color: FORFAIT_INTRO[activeForfait].color }}>
        <strong>{FORFAIT_INTRO[activeForfait].gras}</strong>{FORFAIT_INTRO[activeForfait].suite}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
        {FORFAIT_BLOCS[activeForfait].map((bloc, idx) => {
          const isOpen = !!openBlocs[bloc.id]
          return (
            <div key={bloc.id} style={{ background: 'white', border: '1px solid #e0d9d3', borderRadius: '10px', overflow: 'hidden' }}>
              <div onClick={() => toggleBloc(bloc.id)} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff4e9', border: '1px solid #e0d9d3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 500, color: '#888', flexShrink: 0 }}>{idx + 1}</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#2b2b2b', flex: 1 }}>{bloc.titre}</span>
                <span style={{ fontSize: '10px', background: bloc.badgeBg, color: bloc.badgeColor, padding: '2px 8px', borderRadius: '4px' }}>{bloc.badge}</span>
                <span style={{ fontSize: '11px', color: '#aaa', display: 'inline-block', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
              </div>
              {isOpen && (
                <div style={{ padding: '0 14px 13px', borderTop: '1px solid #f0ebe5' }}>
                  {bloc.texte && <p style={{ fontSize: '12px', color: '#666', margin: '10px 0 8px', lineHeight: 1.6 }}>{bloc.texte}</p>}
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.9 }}>
                    {bloc.items.map(item => <div key={item}>· {item}</div>)}
                  </div>
                  {bloc.exemple && (
                    <div style={{ background: '#fff4e9', borderRadius: '6px', padding: '8px 12px', marginTop: '10px', fontSize: '11px', color: '#888' }}>
                      <strong style={{ color: '#2b2b2b' }}>{bloc.exemple.label}</strong> {bloc.exemple.texte}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Principes de conception */}
      <SectionLabel>Principes de conception</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
        {PRINCIPES.map(p => (
          <div key={p.titre} style={{ background: 'white', border: '1px solid #e0d9d3', borderRadius: '10px', padding: '13px 14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#2b2b2b', marginBottom: '6px' }}>{p.titre}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: '#fdecea', borderRadius: '6px', padding: '8px 10px' }}>
                <div style={{ fontSize: '10px', color: '#c0321a', fontWeight: 500, marginBottom: '3px' }}>JAMAIS</div>
                <div style={{ fontSize: '11px', color: '#2b2b2b' }}>{p.jamais}</div>
              </div>
              <div style={{ background: '#d4edda', borderRadius: '6px', padding: '8px 10px' }}>
                <div style={{ fontSize: '10px', color: '#155724', fontWeight: 500, marginBottom: '3px' }}>TOUJOURS</div>
                <div style={{ fontSize: '11px', color: '#2b2b2b' }}>{p.toujours}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phases de production */}
      <SectionLabel>Phases de production</SectionLabel>
      <div>
        {phases.map(phase => {
          const status = phaseStatus(phase)
          const isOpen = !!openPhases[phase.id]
          return (
            <div key={phase.id}>
              <div onClick={() => togglePhase(phase.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'white', border: '1px solid #e0d9d3', borderRadius: '12px', cursor: 'pointer', marginBottom: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: status.dot, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#2b2b2b' }}>{phase.titre}</div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{phase.periode}</div>
                </div>
                <div style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: status.badgeBg, color: status.badgeColor, fontWeight: 500 }}>{status.badge}</div>
                <div style={{ fontSize: '11px', color: '#aaa', minWidth: '40px', textAlign: 'right' }}>{status.progress}</div>
                <span style={{ fontSize: '11px', color: '#aaa', display: 'inline-block', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
              </div>
              {isOpen && (
                <div style={{ background: 'white', border: '1px solid #e0d9d3', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '12px 16px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: phase.editable ? '12px' : 0 }}>
                    {phase.todos.length === 0 && phase.editable && (
                      <div style={{ fontSize: '12px', color: '#aaa', padding: '8px 10px', fontStyle: 'italic' }}>Aucune tâche pour le moment — ajoutez-en ci-dessous.</div>
                    )}
                    {phase.todos.map((todo, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '7px 10px', borderRadius: '8px', background: todo.done ? '#f0faf4' : '#f9f6f2' }}>
                        <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(phase.id, idx)} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: todo.done ? '#aaa' : '#2b2b2b', lineHeight: 1.5, flex: 1, textDecoration: todo.done ? 'line-through' : 'none' }}>{todo.texte}</span>
                        {phase.editable && (
                          <span onClick={(e) => { e.preventDefault(); deleteTodo(phase.id, idx) }} style={{ fontSize: '11px', color: '#ccc', cursor: 'pointer', padding: '0 4px', flexShrink: 0 }} title="Supprimer">✕</span>
                        )}
                      </label>
                    ))}
                  </div>
                  {phase.editable && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Ajouter une tâche..."
                        value={newTodoText[phase.id] || ''}
                        onChange={e => setNewTodoText(prev => ({ ...prev, [phase.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') addTodo(phase.id) }}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #e0d9d3', borderRadius: '8px', fontSize: '12px', color: '#2b2b2b', background: 'white', outline: 'none' }}
                      />
                      <button onClick={() => addTodo(phase.id)} style={{ padding: '8px 14px', background: '#2b2b2b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>+ Ajouter</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Roadmap 2026 — chronologie */}
      <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', marginBottom: '10px', marginTop: '1.5rem' }}>Roadmap 2026</p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {TIMELINE.map((step, i) => (
          <div key={step.titre} style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{ width: '110px', flexShrink: 0, padding: '14px 10px 14px 0', textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#2b2b2b' }}>{step.periode}</div>
              <div style={{ fontSize: '10px', color: '#aaa' }}>{step.annee}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px', flexShrink: 0 }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: step.dotColor, marginTop: '18px', flexShrink: 0 }} />
              {i < TIMELINE.length - 1 && <div style={{ width: '1px', background: '#e0d9d3', flex: 1 }} />}
            </div>
            <div style={{ flex: 1, background: 'white', border: `${step.borderColor === '#e0d9d3' ? '1px' : '2px'} solid ${step.borderColor}`, borderRadius: '12px', padding: '11px 14px', margin: '8px 0 8px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '5px' }}>
                <span style={{ fontSize: '11px', padding: '2px 9px', borderRadius: '20px', fontWeight: 500, background: step.badgeBg, color: step.badgeColor }}>{step.badge}</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#2b2b2b' }}>{step.titre}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.55, marginBottom: '7px' }}>{step.desc}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {step.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '10px', background: '#fff4e9', color: '#888', padding: '2px 7px', borderRadius: '4px' }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Décisions techniques arrêtées */}
      <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', margin: '1.5rem 0 10px' }}>Décisions techniques arrêtées</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
        {DECISIONS.map(d => (
          <div key={d.titre} style={{ background: 'white', border: '1px solid #e0d9d3', borderRadius: '8px', padding: '10px 14px', display: 'flex', gap: '10px' }}>
            <span style={{ flexShrink: 0 }}>{d.emoji}</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#2b2b2b', marginBottom: '2px' }}>{d.titre}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>{d.texte}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparaison des forfaits */}
      <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', marginBottom: '10px' }}>Comparaison des 3 forfaits</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #e0d9d3', width: '40%' }} />
              <th style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid #e0d9d3' }}>
                <div>🧾 Base</div>
                <div style={{ fontSize: '15px', fontWeight: 500, marginTop: '3px' }}>40$/mois</div>
              </th>
              <th style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid #e0d9d3' }}>
                <div>📦 Base+</div>
                <div style={{ fontSize: '15px', fontWeight: 500, marginTop: '3px' }}>75$/mois</div>
              </th>
              <th style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid #e0d9d3' }}>
                <div>🏡 Premium</div>
                <div style={{ fontSize: '15px', fontWeight: 500, marginTop: '3px' }}>100$/mois</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_GROUPS.map(group => (
              <Fragment key={group.titre}>
                <tr>
                  <td colSpan={4} style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#aaa', background: '#fff4e9', padding: '5px 10px' }}>{group.titre}</td>
                </tr>
                {group.rows.map(row => (
                  <tr key={row.label}>
                    <td style={{ padding: '7px 10px', borderBottom: '1px solid #f0ebe5', color: '#666' }}>{row.label}</td>
                    {row.vals.map((v, i) => (
                      <td key={i} style={{ textAlign: 'center', borderBottom: '1px solid #f0ebe5' }}><Check ok={v} /></td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
