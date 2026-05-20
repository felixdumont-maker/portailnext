'use client'

import { useState, useEffect } from 'react'

const ICON_MAP: Record<string, string> = {
  'photo': 'photo_camera',
  'video': 'videocam',
  'graphisme': 'brush',
  'web': 'language',
  'immobilier': 'home',
  'info': 'info',
  'default': 'folder',
}

interface ChecklistItem {
  id: number
  nom_item: string
}

interface Service {
  id: number
  nom_service: string
  description: string
  icon: string
  nb_items: number
  items: ChecklistItem[]
}

interface DefaultItem {
  nom_item: string
  requires_file: number
  is_required: number
  item_type: string
  file_category: string
  field_type: string
}

interface DefaultService {
  slug: string
  nom_service: string
  description: string
  icon: string
  badge: string
  prix: number
  categorie: string
  localisation_requise: number
  documents_requis: number
  appel_exploratoire_requis: number
  decision_board_requis: number
  duree_seance_minutes: number
  duree_tournage_minutes: number
  duree_production_minutes: number
  duree_finalisation_minutes: number
  phases: string[]
  items: DefaultItem[]
}

const DEFAULT_SERVICES: DefaultService[] = [
  {
    slug: 'site-web-vitrine',
    nom_service: 'Site Web Vitrine',
    description: 'Création de site vitrine client (Next.js + Sanity + Vercel)',
    icon: 'web',
    badge: 'Template complet',
    prix: 500,
    categorie: 'Sites Web',
    localisation_requise: 0,
    documents_requis: 1,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 0,
    duree_production_minutes: 180,
    duree_finalisation_minutes: 120,
    phases: ['Identité', 'Coordonnées', 'Équipe', 'Mission/Vision', 'À propos', 'Photos'],
    items: [
      // Identité
      { nom_item: 'Nom du business', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Logo (SVG)', requires_file: 1, is_required: 1, item_type: 'document', file_category: 'vecteur', field_type: 'file' },
      { nom_item: 'Logo 2', requires_file: 1, is_required: 0, item_type: 'document', file_category: 'vecteur', field_type: 'file' },
      { nom_item: 'Logo 2-2', requires_file: 1, is_required: 0, item_type: 'document', file_category: 'vecteur', field_type: 'file' },
      // Description
      { nom_item: 'Description de l\'entreprise', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      // Coordonnées
      { nom_item: 'Adresse', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Téléphone', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Courriel professionnel', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      // Équipe
      { nom_item: 'Équipe', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'members' },
      // Mission / Vision / Valeurs
      { nom_item: 'Mission de l\'entreprise', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      { nom_item: 'Vision de l\'entreprise', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      { nom_item: 'Valeurs de l\'entreprise', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      // À propos
      { nom_item: 'Texte section À propos', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      // Visuels
      { nom_item: 'Photos du salon / environnement', requires_file: 1, is_required: 1, item_type: 'document', file_category: 'photo', field_type: 'file' },
    ],
  },
  {
    slug: 'site-web-shopify',
    nom_service: 'Design Shopify',
    description: 'Personnalisation de thème Shopify existant — client a déjà ses produits, on s\'occupe du visuel',
    icon: 'web',
    badge: 'Shopify',
    prix: 500,
    categorie: 'Sites Web',
    localisation_requise: 0,
    documents_requis: 1,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 0,
    duree_production_minutes: 240,
    duree_finalisation_minutes: 120,
    phases: ['Accès & Plateformes', 'Identité', 'Design', 'Contenu', 'Configuration'],
    items: [
      // Accès & Plateformes
      { nom_item: 'Accès collaborateur Shopify (URL boutique)', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Domaine personnalisé (ex: monsite.com)', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      // Identité
      { nom_item: 'Nom du business', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Logo (SVG)', requires_file: 1, is_required: 1, item_type: 'document', file_category: 'vecteur', field_type: 'file' },
      { nom_item: 'Logo secondaire', requires_file: 1, is_required: 0, item_type: 'document', file_category: 'vecteur', field_type: 'file' },
      { nom_item: 'Palette de couleurs', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'photo', field_type: 'color-palette' },
      { nom_item: 'Typographie principale', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Typographie secondaire', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      // Design
      { nom_item: 'Exemples de design / sites d\'inspiration', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      { nom_item: 'Pages à personnaliser (ex: Accueil, À propos, Contact…)', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      // Contenu
      { nom_item: 'Texte hero / page d\'accueil', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      { nom_item: 'Texte section À propos', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      { nom_item: 'Photos hero / bannière principale', requires_file: 1, is_required: 1, item_type: 'document', file_category: 'photo', field_type: 'file' },
      { nom_item: 'Photos ambiance / lifestyle', requires_file: 1, is_required: 0, item_type: 'document', file_category: 'photo', field_type: 'file' },
      { nom_item: 'Liens réseaux sociaux', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      { nom_item: 'Courriel de contact affiché sur le site', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      // Configuration
      { nom_item: 'Politique de livraison', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'document', field_type: 'file-or-textarea' },
      { nom_item: 'Politique de retour / remboursement', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'document', field_type: 'file-or-textarea' },
    ],
  },
  {
    slug: 'site-web-transactionnel',
    nom_service: 'Site Web Transactionnel',
    description: 'Boutique en ligne — vente de produits ou services (Next.js + Stripe + Sanity)',
    icon: 'web',
    badge: 'E-commerce complet',
    prix: 1000,
    categorie: 'Sites Web',
    localisation_requise: 0,
    documents_requis: 1,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 0,
    duree_production_minutes: 180,
    duree_finalisation_minutes: 120,
    phases: ['Identité', 'Coordonnées', 'Catalogue', 'Paiement', 'Légal', 'Photos'],
    items: [
      // Identité
      { nom_item: 'Nom du business', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Logo (SVG)', requires_file: 1, is_required: 1, item_type: 'document', file_category: 'vecteur', field_type: 'file' },
      // Description
      { nom_item: 'Description de l\'entreprise', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      // Coordonnées
      { nom_item: 'Adresse', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Téléphone', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Courriel professionnel', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      // Équipe
      { nom_item: 'Équipe', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'members' },
      // Catalogue
      { nom_item: 'Liste des produits / services', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      { nom_item: 'Descriptions détaillées des produits / services', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      { nom_item: 'Prix des produits / services', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      { nom_item: 'Photos des produits / services', requires_file: 1, is_required: 1, item_type: 'document', file_category: 'photo', field_type: 'file' },
      // Paiement
      { nom_item: 'Plateforme de paiement (ex: Stripe)', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Méthodes de paiement acceptées', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      // Livraison
      { nom_item: 'Zones de livraison', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      { nom_item: 'Tarifs de livraison', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      // Légal
      { nom_item: 'Politique de confidentialité', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'document', field_type: 'file-or-textarea' },
      { nom_item: 'Conditions générales de vente', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'document', field_type: 'file-or-textarea' },
      { nom_item: 'Politique de retour / remboursement', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'document', field_type: 'file-or-textarea' },
      // Visuels
      { nom_item: 'Photos ambiance / boutique', requires_file: 1, is_required: 1, item_type: 'document', file_category: 'photo', field_type: 'file' },
    ],
  },

  // ── Vidéo d'entreprise ────────────────────────────────────────
  {
    slug: 'video-corporatif',
    nom_service: 'Vidéo corporatif',
    description: 'Vidéo de présentation d\'entreprise — tournage sur place',
    icon: 'video',
    badge: '300 $',
    prix: 300,
    categorie: 'Vidéo d\'entreprise',
    localisation_requise: 1,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 180,
    duree_production_minutes: 180,
    duree_finalisation_minutes: 0,
    phases: ['3H tournage', '3H post-prod'],
    items: [],
  },
  {
    slug: 'couverture-evenements',
    nom_service: 'Couverture d\'évènements / 3H',
    description: 'Couverture vidéo d\'un événement — 3 heures sur place',
    icon: 'video',
    badge: '300 $',
    prix: 300,
    categorie: 'Vidéo d\'entreprise',
    localisation_requise: 1,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 240,
    duree_production_minutes: 240,
    duree_finalisation_minutes: 0,
    phases: ['4H tournage', '4H post-prod'],
    items: [],
  },
  {
    slug: 'video-immobilier',
    nom_service: 'Vidéos immobiliers',
    description: 'Vidéo de présentation d\'une propriété — tournage sur place',
    icon: 'video',
    badge: '200 $',
    prix: 200,
    categorie: 'Vidéo d\'entreprise',
    localisation_requise: 1,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 60,
    duree_production_minutes: 60,
    duree_finalisation_minutes: 0,
    phases: ['1H tournage', '1H post-prod'],
    items: [],
  },
  {
    slug: 'video-aerien',
    nom_service: 'Vidéos aériens',
    description: 'Prise de vue aérienne par drone — tournage sur place',
    icon: 'video',
    badge: '200 $',
    prix: 200,
    categorie: 'Vidéo d\'entreprise',
    localisation_requise: 1,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 30,
    duree_production_minutes: 45,
    duree_finalisation_minutes: 0,
    phases: ['30 min tournage', '45 min post-prod'],
    items: [],
  },
  {
    slug: 'forfait-short-reel',
    nom_service: 'Forfait Short/Reel',
    description: 'Création de contenu court format pour réseaux sociaux — tournage sur place',
    icon: 'video',
    badge: '330 $',
    prix: 330,
    categorie: 'Vidéo d\'entreprise',
    localisation_requise: 1,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 120,
    duree_production_minutes: 120,
    duree_finalisation_minutes: 0,
    phases: ['2H tournage', '2H post-prod'],
    items: [],
  },
  {
    slug: 'video-unite-short-reel',
    nom_service: 'Vidéo unité Short/Reel',
    description: 'Courte vidéo unitaire pour réseaux sociaux — tournage sur place',
    icon: 'video',
    badge: 'À définir',
    prix: 0,
    categorie: 'Vidéo d\'entreprise',
    localisation_requise: 1,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 30,
    duree_production_minutes: 20,
    duree_finalisation_minutes: 0,
    phases: ['30 min tournage', '20 min post-prod'],
    items: [],
  },

  // ── Photographie ──────────────────────────────────────────────
  {
    slug: 'photos-produits',
    nom_service: 'Photos de produits',
    description: 'Photographie de produits au bureau — 1001 rang St-Malo, Trois-Rivières',
    icon: 'photo',
    badge: '175 $',
    prix: 175,
    categorie: 'Photographie',
    localisation_requise: 1,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 60,
    duree_production_minutes: 60,
    duree_finalisation_minutes: 0,
    phases: ['1H prise de vue', '1H retouche'],
    items: [],
  },
  {
    slug: 'photos-en-action',
    nom_service: 'Photos en actions',
    description: 'Photographie en action — tournage à l\'adresse du client',
    icon: 'photo',
    badge: '250 $',
    prix: 250,
    categorie: 'Photographie',
    localisation_requise: 1,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 60,
    duree_production_minutes: 60,
    duree_finalisation_minutes: 0,
    phases: ['1H prise de vue', '1H retouche'],
    items: [],
  },
  {
    slug: 'couverture-evenement-photo',
    nom_service: 'Couverture d\'évènement / 3H',
    description: 'Couverture photo d\'un événement — adresse du client ou de l\'événement',
    icon: 'photo',
    badge: '250 $',
    prix: 250,
    categorie: 'Photographie',
    localisation_requise: 1,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 240,
    duree_production_minutes: 120,
    duree_finalisation_minutes: 0,
    phases: ['4H prise de vue', '2H retouche'],
    items: [],
  },
  {
    slug: 'portraits-pro',
    nom_service: 'Portraits professionnels / 3 personnes',
    description: 'Portraits pro au bureau — 1001 rang St-Malo, Trois-Rivières',
    icon: 'photo',
    badge: '100 $',
    prix: 100,
    categorie: 'Photographie',
    localisation_requise: 1,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 15,
    duree_production_minutes: 30,
    duree_finalisation_minutes: 0,
    phases: ['15 min prise de vue', '30 min retouche'],
    items: [],
  },
  {
    slug: 'retouches-photos',
    nom_service: 'Retouches de photos existantes',
    description: 'Retouche et post-production de photos fournies par le client',
    icon: 'photo',
    badge: '50 $',
    prix: 50,
    categorie: 'Photographie',
    localisation_requise: 0,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 0,
    duree_production_minutes: 30,
    duree_finalisation_minutes: 0,
    phases: ['30 min retouche'],
    items: [],
  },
  {
    slug: 'photo-immobiliere',
    nom_service: 'Photographies immobilières (drone incl.)',
    description: 'Photographie immobilière incluant prises de vue par drone — adresse du client',
    icon: 'photo',
    badge: '150 $',
    prix: 150,
    categorie: 'Photographie',
    localisation_requise: 1,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 45,
    duree_production_minutes: 25,
    duree_finalisation_minutes: 0,
    phases: ['45 min prise de vue', '25 min retouche'],
    items: [],
  },
  {
    slug: 'photo-drone',
    nom_service: 'Photographies par drone',
    description: 'Prise de vue aérienne par drone — adresse du client',
    icon: 'photo',
    badge: '200 $',
    prix: 200,
    categorie: 'Photographie',
    localisation_requise: 1,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 45,
    duree_production_minutes: 25,
    duree_finalisation_minutes: 0,
    phases: ['45 min prise de vue', '25 min retouche'],
    items: [],
  },

  // ── Graphisme ─────────────────────────────────────────────────
  {
    slug: 'creation-logo',
    nom_service: 'Création d\'un logo personnalisé',
    description: 'Création de logo sur mesure — rencontre créative Google Meet incluse',
    icon: 'graphisme',
    badge: '200 $',
    prix: 200,
    categorie: 'Graphisme',
    localisation_requise: 0,
    documents_requis: 1,
    appel_exploratoire_requis: 1,
    decision_board_requis: 1,
    duree_seance_minutes: 15,
    duree_tournage_minutes: 0,
    duree_production_minutes: 120,
    duree_finalisation_minutes: 60,
    phases: ['15 min rencontre', '2H travaux', 'Révision client', '1H finalisation'],
    items: [
      { nom_item: 'Nom de l\'entreprise', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Couleurs souhaitées', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Inspirations / références visuelles', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
    ],
  },
  {
    slug: 'refonte-identite-visuelle',
    nom_service: 'Refonte d\'identité visuelle',
    description: 'Refonte complète de l\'identité visuelle — rencontre créative Google Meet incluse',
    icon: 'graphisme',
    badge: '150 $',
    prix: 150,
    categorie: 'Graphisme',
    localisation_requise: 0,
    documents_requis: 1,
    appel_exploratoire_requis: 1,
    decision_board_requis: 1,
    duree_seance_minutes: 15,
    duree_tournage_minutes: 0,
    duree_production_minutes: 120,
    duree_finalisation_minutes: 60,
    phases: ['15 min rencontre', '2H travaux', 'Révision client', '1H finalisation'],
    items: [
      { nom_item: 'Nom de l\'entreprise', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Logo existant', requires_file: 1, is_required: 1, item_type: 'document', file_category: 'vecteur', field_type: 'file' },
      { nom_item: 'Couleurs existantes', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Polices utilisées', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Couleurs souhaitées', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Inspirations / références visuelles', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
    ],
  },
  {
    slug: 'support-imprimable-1',
    nom_service: 'Support imprimable — 1 visuel',
    description: 'Création d\'un support imprimable (carte, affiche, flyer…)',
    icon: 'graphisme',
    badge: '75 $',
    prix: 75,
    categorie: 'Graphisme',
    localisation_requise: 0,
    documents_requis: 1,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 0,
    duree_production_minutes: 30,
    duree_finalisation_minutes: 0,
    phases: ['30 min / visuel'],
    items: [
      { nom_item: 'Texte / contenu à intégrer', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      { nom_item: 'Couleurs / charte graphique', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Logo (SVG)', requires_file: 1, is_required: 1, item_type: 'document', file_category: 'vecteur', field_type: 'file' },
      { nom_item: 'Format ou dimensions souhaités', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Exemples de style / références', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
    ],
  },
  {
    slug: 'support-imprimable-4',
    nom_service: 'Support imprimable — 4 visuels',
    description: 'Création de 4 supports imprimables (cartes, affiches, flyers…)',
    icon: 'graphisme',
    badge: '200 $',
    prix: 200,
    categorie: 'Graphisme',
    localisation_requise: 0,
    documents_requis: 1,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 0,
    duree_production_minutes: 120,
    duree_finalisation_minutes: 0,
    phases: ['30 min × 4 visuels'],
    items: [
      { nom_item: 'Texte / contenu à intégrer', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      { nom_item: 'Couleurs / charte graphique', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Logo (SVG)', requires_file: 1, is_required: 1, item_type: 'document', file_category: 'vecteur', field_type: 'file' },
      { nom_item: 'Format ou dimensions souhaités', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Exemples de style / références', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
    ],
  },
  {
    slug: 'support-numerique-1',
    nom_service: 'Support numérique — 1 visuel',
    description: 'Création d\'un support numérique (bannière, publication, story…)',
    icon: 'graphisme',
    badge: '75 $',
    prix: 75,
    categorie: 'Graphisme',
    localisation_requise: 0,
    documents_requis: 1,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 0,
    duree_production_minutes: 30,
    duree_finalisation_minutes: 0,
    phases: ['30 min / visuel'],
    items: [
      { nom_item: 'Texte / contenu à intégrer', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      { nom_item: 'Couleurs / charte graphique', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Logo (SVG)', requires_file: 1, is_required: 1, item_type: 'document', file_category: 'vecteur', field_type: 'file' },
      { nom_item: 'Format ou dimensions souhaités', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Exemples de style / références', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
    ],
  },
  {
    slug: 'presentation-powerpoint',
    nom_service: 'Présentation PowerPoint',
    description: 'Création d\'une présentation PowerPoint professionnelle',
    icon: 'graphisme',
    badge: '100 $',
    prix: 100,
    categorie: 'Infographie d\'entreprise',
    localisation_requise: 0,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 0,
    duree_production_minutes: 60,
    duree_finalisation_minutes: 0,
    phases: ['1H production'],
    items: [],
  },
  {
    slug: 'plan-affaires',
    nom_service: 'Création de plan d\'affaires',
    description: 'Rédaction et mise en page d\'un plan d\'affaires complet',
    icon: 'graphisme',
    badge: '200 $',
    prix: 200,
    categorie: 'Infographie d\'entreprise',
    localisation_requise: 0,
    documents_requis: 0,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 0,
    duree_production_minutes: 60,
    duree_finalisation_minutes: 0,
    phases: ['1H production'],
    items: [],
  },
  {
    slug: 'support-numerique-4',
    nom_service: 'Support numérique — 4 visuels',
    description: 'Création de 4 supports numériques (bannières, publications, stories…)',
    icon: 'graphisme',
    badge: '200 $',
    prix: 200,
    categorie: 'Graphisme',
    localisation_requise: 0,
    documents_requis: 1,
    appel_exploratoire_requis: 0,
    decision_board_requis: 0,
    duree_seance_minutes: 0,
    duree_tournage_minutes: 0,
    duree_production_minutes: 120,
    duree_finalisation_minutes: 0,
    phases: ['30 min × 4 visuels'],
    items: [
      { nom_item: 'Texte / contenu à intégrer', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
      { nom_item: 'Couleurs / charte graphique', requires_file: 0, is_required: 1, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Logo (SVG)', requires_file: 1, is_required: 1, item_type: 'document', file_category: 'vecteur', field_type: 'file' },
      { nom_item: 'Format ou dimensions souhaités', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'text' },
      { nom_item: 'Exemples de style / références', requires_file: 0, is_required: 0, item_type: 'document', file_category: 'donnees', field_type: 'textarea' },
    ],
  },
]

export default function AdminServicesPage() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [newItemText, setNewItemText] = useState('')
  const [newItemRequired, setNewItemRequired] = useState(true)
  const [addingTo, setAddingTo] = useState<number | null>(null)
  const [savingItem, setSavingItem] = useState(false)
  const [showAddService, setShowAddService] = useState(false)
  const [newServiceNom, setNewServiceNom] = useState('')
  const [newServiceDesc, setNewServiceDesc] = useState('')
  const [savingService, setSavingService] = useState(false)
  const [activating, setActivating] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch('/api/v1/admin/services', { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setServices(data) })
      .catch(() => {})
  }, [])

  const toggleExpand = (id: number) => {
    setExpanded(prev => prev === id ? null : id)
  }

  const addItem = async (serviceId: number) => {
    if (!newItemText.trim()) return
    setSavingItem(true)
    try {
      const res = await fetch(`/api/v1/admin/services/${serviceId}/items`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom_item: newItemText.trim(), is_required: newItemRequired ? 1 : 0 }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Erreur', false); return }
      setServices(prev => prev.map(s =>
        s.id === serviceId
          ? { ...s, items: [...s.items, { id: data.id, nom_item: newItemText.trim() }], nb_items: s.nb_items + 1 }
          : s
      ))
      setNewItemText('')
      setNewItemRequired(true)
      setAddingTo(null)
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setSavingItem(false)
    }
  }

  const removeItem = async (serviceId: number, itemId: number) => {
    try {
      const res = await fetch(`/api/v1/admin/services/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) { showToast('Erreur suppression', false); return }
      setServices(prev => prev.map(s =>
        s.id === serviceId
          ? { ...s, items: s.items.filter(i => i.id !== itemId), nb_items: s.nb_items - 1 }
          : s
      ))
    } catch {
      showToast('Erreur de connexion', false)
    }
  }

  const deleteService = async (serviceId: number, nom: string) => {
    if (!confirm(`Supprimer le service "${nom}" et tous ses items ?`)) return
    try {
      const res = await fetch(`/api/v1/admin/services/${serviceId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) { showToast('Erreur suppression', false); return }
      setServices(prev => prev.filter(s => s.id !== serviceId))
      showToast(`Service "${nom}" supprimé.`)
    } catch {
      showToast('Erreur de connexion', false)
    }
  }

  const addService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newServiceNom.trim()) return
    setSavingService(true)
    try {
      const res = await fetch('/api/v1/admin/services', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom_service: newServiceNom.trim(), description: newServiceDesc }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Erreur', false); return }
      setServices(prev => [...prev, {
        id: data.id,
        nom_service: newServiceNom.trim(),
        description: newServiceDesc,
        icon: 'default',
        nb_items: 0,
        items: [],
      }])
      setNewServiceNom('')
      setNewServiceDesc('')
      setShowAddService(false)
      showToast('Service créé.')
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setSavingService(false)
    }
  }

  const activateDefault = async (def: DefaultService) => {
    setActivating(def.slug)
    try {
      const res = await fetch('/api/v1/admin/services/with-items', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: def.slug,
          categorie: def.categorie,
          nom_service: def.nom_service,
          description: def.description,
          icon: def.icon,
          prix: def.prix,
          localisation_requise: def.localisation_requise,
          documents_requis: def.documents_requis,
          appel_exploratoire_requis: def.appel_exploratoire_requis,
          decision_board_requis: def.decision_board_requis,
          duree_seance_minutes: def.duree_seance_minutes,
          duree_tournage_minutes: def.duree_tournage_minutes,
          duree_production_minutes: def.duree_production_minutes,
          duree_finalisation_minutes: def.duree_finalisation_minutes,
          items: def.items,
        }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Erreur', false); return }
      setServices(prev => [...prev, {
        id: data.id,
        nom_service: def.nom_service,
        description: def.description,
        icon: def.icon,
        nb_items: def.items.length,
        items: def.items.map((it, i) => ({ id: -(i + 1), nom_item: it.nom_item })),
      }])
      showToast(`"${def.nom_service}" activé avec ${def.items.length} checkpoints.`)
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setActivating(null)
    }
  }

  const isAlreadyActive = (def: DefaultService) =>
    services.some(s => s.nom_service.toLowerCase() === def.nom_service.toLowerCase())

  return (
    <div className="max-w-5xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-body text-sm font-bold flex items-center gap-3 ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            {toast.ok ? 'check_circle' : 'error'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="font-body text-[var(--color-brand)] font-bold uppercase tracking-widest text-xs">
            Gestion Administrative
          </p>
          <h1 className="font-display text-[var(--text-3xl)] text-[var(--color-dark-1)] tracking-tight leading-none uppercase">
            Catalogue Services
          </h1>
        </div>
        <button
          onClick={() => setShowAddService(v => !v)}
          className="flex items-center gap-3 bg-gradient-to-r from-[var(--color-brand-hover)] to-[var(--color-brand)] text-white px-8 py-4 rounded-full font-body font-bold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-lg">
          <span aria-hidden="true" className="material-symbols-outlined">add_circle</span>
          AJOUTER SERVICE
        </button>
      </header>

      {/* Formulaire ajouter service */}
      {showAddService && (
        <form onSubmit={addService} className="mb-8 bg-white rounded-3xl p-8 shadow-sm border-2 border-[var(--color-brand)]/20 space-y-4">
          <h3 className="font-display text-[var(--text-lg)] text-[var(--color-dark-1)]">NOUVEAU SERVICE</h3>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body">Nom</label>
            <input
              type="text"
              value={newServiceNom}
              onChange={e => setNewServiceNom(e.target.value)}
              placeholder="Nom du service"
              required
              className="bg-[var(--color-light-0)] rounded-xl px-4 py-3 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40 border-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] font-body">Description</label>
            <input
              type="text"
              value={newServiceDesc}
              onChange={e => setNewServiceDesc(e.target.value)}
              placeholder="Courte description (optionnel)"
              className="bg-[var(--color-light-0)] rounded-xl px-4 py-3 outline-none font-body text-sm focus:ring-2 focus:ring-[var(--color-brand)]/40 border-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={savingService}
              className="bg-[var(--color-brand)] text-white font-display text-lg px-8 py-3 rounded-full tracking-widest hover:bg-[var(--color-brand-hover)] transition-all disabled:opacity-60">
              {savingService ? 'CRÉATION...' : 'CRÉER'}
            </button>
            <button type="button" onClick={() => setShowAddService(false)}
              className="text-[var(--color-dark-text-2)] font-body font-bold text-sm px-6 py-3 rounded-full hover:bg-[var(--color-light-0)] transition-all">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Services prédéfinis */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)]">auto_awesome</span>
          <h2 className="font-display text-[var(--text-xl)] text-[var(--color-dark-1)]">BIBLIOTHÈQUE DE SERVICES</h2>
          <span className="text-[10px] font-body font-bold uppercase tracking-widest text-[var(--color-dark-text-2)] bg-[var(--color-light-0)] px-3 py-1 rounded-full">
            Prédéfinis
          </span>
        </div>
        {Array.from(new Set(DEFAULT_SERVICES.map(d => d.categorie))).map(cat => (
          <div key={cat} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-dark-text-2)]">{cat}</span>
              <div className="flex-1 h-px bg-[var(--color-light-border-2)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_SERVICES.filter(d => d.categorie === cat).map(def => {
            const active = isAlreadyActive(def)
            const loading = activating === def.slug
            return (
              <div key={def.slug}
                className={`relative bg-white rounded-2xl p-6 border-2 transition-all ${active ? 'border-emerald-200 opacity-70' : 'border-[var(--color-light-0)] hover:border-[var(--color-brand)]/30'}`}>
                {active && (
                  <span className="absolute top-4 right-4 flex items-center gap-1 text-emerald-600 text-xs font-body font-bold">
                    <span aria-hidden="true" className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Actif
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[var(--color-light-0)] rounded-xl flex items-center justify-center text-[var(--color-brand)] flex-shrink-0">
                    <span aria-hidden="true" className="material-symbols-outlined text-2xl">{ICON_MAP[def.icon] || ICON_MAP['default']}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display text-lg text-[var(--color-dark-1)]">{def.nom_service.toUpperCase()}</h3>
                      <span className="text-[9px] font-body font-bold uppercase tracking-widest bg-[var(--color-brand)]/10 text-[var(--color-brand)] px-2 py-0.5 rounded-full">
                        {def.badge}
                      </span>
                    </div>
                    <p className="text-xs font-body text-[var(--color-dark-text-2)] mb-3">{def.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {def.phases.map(phase => (
                        <span key={phase} className="text-[9px] font-body font-bold uppercase bg-[var(--color-light-0)] text-[var(--color-dark-text-2)] px-2 py-0.5 rounded-full">
                          {phase}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-body text-[var(--color-dark-text-2)]">
                        <span className="font-bold text-[var(--color-dark-1)]">{def.items.length}</span> checkpoints inclus
                      </p>
                      <button
                        onClick={() => !active && !loading && activateDefault(def)}
                        disabled={active || loading}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-body font-bold uppercase tracking-wide transition-all ${
                          active
                            ? 'bg-emerald-50 text-emerald-600 cursor-default'
                            : loading
                            ? 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)] cursor-wait'
                            : 'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] active:scale-95'
                        }`}>
                        {loading
                          ? <><span aria-hidden="true" className="material-symbols-outlined text-sm animate-spin">refresh</span>Activation...</>
                          : active
                          ? <><span aria-hidden="true" className="material-symbols-outlined text-sm">check</span>Activé</>
                          : <><span aria-hidden="true" className="material-symbols-outlined text-sm">add</span>Activer</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
            </div>
          </div>
        ))}
      </section>

      {/* Services list */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-display text-[var(--text-xl)] text-[var(--color-dark-1)]">SERVICES ACTIFS</h2>
        <span className="font-display text-[var(--text-xl)] text-[var(--color-dark-text-2)]">
          {String(services.length).padStart(2, '0')}
        </span>
      </div>

      <div className="space-y-6">
        {services.length === 0 && (
          <p className="text-sm font-body text-[var(--color-dark-text-2)] py-8 text-center">
            Aucun service actif — activez un service depuis la bibliothèque ou créez-en un manuellement.
          </p>
        )}
        {services.map(service => (
          <div key={service.id} className="bg-[var(--color-light-1)] rounded-3xl p-1 transition-all">

            {/* Header row */}
            <div
              onClick={() => toggleExpand(service.id)}
              className="bg-white rounded-[1.6rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:bg-[var(--color-light-0)] transition-colors group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-[var(--color-light-0)] rounded-2xl flex items-center justify-center text-[var(--color-brand)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-4xl">{ICON_MAP[service.icon] || ICON_MAP['default']}</span>
                </div>
                <div>
                  <h3 className="font-display text-[var(--text-lg)] text-[var(--color-dark-1)]">
                    {service.nom_service.toUpperCase()}
                  </h3>
                  <p className="text-[var(--color-dark-text-2)] text-sm font-body font-medium">
                    {service.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8 md:gap-12">
                <div className="text-center">
                  <p className="font-display text-[var(--text-xl)] text-[var(--color-dark-1)]">
                    {String(service.nb_items).padStart(2, '0')}
                  </p>
                  <p className="font-body text-[10px] text-[var(--color-dark-text-2)] uppercase font-bold tracking-tighter">
                    CHECKPOINTS
                  </p>
                </div>
                <div className="hidden md:block h-8 w-px bg-[var(--color-light-border-2)]" />
                <button
                  onClick={e => { e.stopPropagation(); deleteService(service.id, service.nom_service) }}
                  className="p-2 rounded-full text-[var(--color-dark-text-2)] hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Supprimer ce service">
                  <span aria-hidden="true" className="material-symbols-outlined text-lg">delete</span>
                </button>
                <div className="flex items-center gap-3 text-[var(--color-brand)] group-hover:translate-x-1 transition-transform">
                  <span className="font-body font-bold text-xs uppercase">Détails</span>
                  <span aria-hidden="true" className="material-symbols-outlined">
                    {expanded === service.id ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded checklist */}
            {expanded === service.id && (
              <div className="px-8 py-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {service.items.map(item => (
                    <div key={item.id}
                      className="flex items-start gap-3 p-4 bg-white/50 rounded-2xl group/item">
                      <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-brand)] text-xl flex-shrink-0"
                        style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                      <p className="text-sm font-body font-medium text-[var(--color-dark-1)] flex-1">
                        {item.nom_item}
                      </p>
                      <button
                        onClick={() => removeItem(service.id, item.id)}
                        className="opacity-0 group-hover/item:opacity-100 transition-opacity text-[var(--color-dark-text-2)] hover:text-[var(--color-brand)]"
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                  ))}

                  {/* Add item */}
                  {addingTo === service.id ? (
                    <div className="flex flex-col gap-2 p-3 bg-white rounded-2xl border-2 border-[var(--color-brand)]/40">
                      <input
                        type="text"
                        value={newItemText}
                        onChange={e => setNewItemText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addItem(service.id)}
                        placeholder="Nom du checkpoint..."
                        autoFocus
                        disabled={savingItem}
                        className="bg-transparent outline-none font-body text-sm px-1 disabled:opacity-60"
                      />
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setNewItemRequired(v => !v)}
                          className={`flex items-center gap-1 text-[10px] font-body font-bold uppercase tracking-wide px-2 py-1 rounded-full transition-colors ${
                            newItemRequired
                              ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
                              : 'bg-[var(--color-light-0)] text-[var(--color-dark-text-2)]'
                          }`}>
                          <span aria-hidden="true" className="material-symbols-outlined text-xs">
                            {newItemRequired ? 'toggle_on' : 'toggle_off'}
                          </span>
                          Obligatoire
                        </button>
                        <div className="flex gap-2">
                          <button onClick={() => { setAddingTo(null); setNewItemText(''); setNewItemRequired(true) }}
                            className="text-[var(--color-dark-text-2)] text-xs font-body px-2">
                            ✕
                          </button>
                          <button onClick={() => addItem(service.id)} disabled={savingItem}
                            className="text-[var(--color-brand)] font-bold text-xs font-body disabled:opacity-40 px-2">
                            {savingItem ? '...' : 'OK'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingTo(service.id)}
                      className="flex items-center justify-center border-2 border-dashed border-[var(--color-light-border-2)] rounded-2xl p-4 hover:bg-white/50 transition-colors group/add"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-dark-text-2)] group-hover/add:text-[var(--color-brand)] transition-colors">
                        add
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stats bottom */}
      <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-[var(--color-dark-text-2)] text-white rounded-3xl p-10 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-display text-[var(--text-xl)] mb-4">OPTIMISATION DES SERVICES</h2>
            <p className="text-white/70 max-w-md mb-8 font-body text-sm">
              Les modèles de checklist permettent une standardisation de la qualité sur tous vos projets.
            </p>
            <div className="flex gap-4">
              <div className="bg-[var(--color-brand)] px-6 py-4 rounded-2xl">
                <p className="font-display text-[var(--text-xl)]">{services.length}</p>
                <p className="font-body text-[10px] uppercase font-bold tracking-widest opacity-80">Services actifs</p>
              </div>
              <div className="bg-white/10 backdrop-blur px-6 py-4 rounded-2xl">
                <p className="font-display text-[var(--text-xl)]">
                  {services.reduce((s, sv) => s + sv.nb_items, 0)}
                </p>
                <p className="font-body text-[10px] uppercase font-bold tracking-widest opacity-80">Total Checkpoints</p>
              </div>
            </div>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined absolute -bottom-10 -right-10 text-[200px] text-white/5">
            inventory
          </span>
        </div>

        <div className="bg-[var(--color-light-0)] rounded-3xl p-8 flex flex-col justify-between border border-[var(--color-light-border-2)]/10">
          <div>
            <h4 className="font-display text-[var(--text-lg)] mb-2 text-[var(--color-dark-1)]">BIBLIOTHÈQUE</h4>
            <p className="text-xs font-body text-[var(--color-dark-text-2)] mb-4">Services prédéfinis disponibles</p>
            <ul className="space-y-3">
              {DEFAULT_SERVICES.map(def => (
                <li key={def.slug} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isAlreadyActive(def) ? 'bg-emerald-500' : 'bg-[var(--color-light-border-2)]'}`} />
                  <p className="text-xs font-body font-medium text-[var(--color-dark-text-2)]">{def.nom_service}</p>
                  <span className="text-[9px] font-body text-[var(--color-dark-text-2)] ml-auto">{def.items.length} items</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

    </div>
  )
}
