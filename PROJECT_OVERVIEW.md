# Portail Cocktail Média — Vue d'ensemble du projet Next.js

> Généré le 2026-07-08. Frontend du portail CocktailOS — CRM/facturation/gestion de projets pour Cocktail Média (agence créative, Trois-Rivières).

## Stack technique

- **Next.js 16.2.2** (App Router, pas de Pages Router)
- **React 19.2.4**
- **TypeScript 5**
- **Tailwind CSS 4** (`@tailwindcss/postcss`)
- Dépendances notables : `@sentry/nextjs` (monitoring erreurs), `lucide-react` + Material Symbols Outlined (icônes), `radix-ui` + `shadcn` (primitives UI), `lottie-react` (animations), `tailwind-merge`
- **ESLint 9** (`eslint-config-next`)

## Architecture — frontend pur, aucune logique métier côté Next.js

- **Backend** : API Flask externe (`/opt/cocktailmedia/portail/app.py`, ~16 000 lignes), tournant dans le conteneur Docker `cocktailmedia-portail-1`, exposé sur `127.0.0.1:18000`.
- **Proxy** : `next.config.ts` redirige `/api/:path*` → `http://127.0.0.1:18000/api/:path*`. **Aucune route `route.ts`** côté Next — tout appel API passe par `fetch('/api/v1/...', { credentials: 'include' })` vers Flask.
- **Auth** : cookies de session Flask (pas de NextAuth/JWT). `credentials: 'include'` obligatoire sur chaque fetch.
- **État** : `useState` + `useEffect` uniquement — pas de state manager global (Redux/Zustand/etc.).
- **307 routes Flask uniques** (~210 sous `/api/v1`), **~130 pages `page.tsx`** côté Next.js. Migration Flask→Next.js à ~97% complète (voir `MIGRATION_STATUS.md` pour le détail route par route — seul l'OAuth Google reste non migré).

## Déploiement

- **Jamais `npm start` manuellement.** Le service tourne en systemd : `portail-next.service` sur le port **3001**.
- Cycle de déploiement : `npm run build && sudo systemctl restart portail-next.service`
- Le backend Flask se déploie séparément (conteneur Docker, `docker compose up -d --force-recreate portail` depuis `/opt/cocktailmedia/`) — voir le piège du second conteneur `portail` (image `cocktailos`/`mon-portail:latest`) qui peut voler le port 18000 si on ne vérifie pas avant/après.

## Design system — deux atmosphères distinctes

Décrit en détail dans `.impeccable.md`. Pas un simple toggle clair/sombre : les deux côtés du produit ont une identité visuelle volontairement différente.

### Admin (`/admin/*`) — sombre, chaleureux, outil de travail
- Police titres : **Bricolage Grotesque** (`font-display`, nécessite `fontWeight: 800` explicite)
- Police corps : **Atkinson Hyperlegible** (`font-body`)
- Accent marque : `--color-brand` = `oklch(52% 0.21 32)` (≈ `#E83B14`)
- Cartes standard : `bg-[var(--color-light-2)] border border-[var(--color-light-border)] rounded-[18px]`
- Champs standard : `bg-[var(--color-light-0)] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-brand)]/40`
- Badges de statut : `bg-[var(--color-{success|warning|error|info}-bg)] text-[var(--color-{...}-text)]`

### Portail client (`/(portail)/*`, `/pigiste/*`) — clair, crème, rassurant
- Styles principalement en `style={{}}` inline avec vars CSS (`var(--font-display)`, `var(--color-brand)`, `var(--space-*)`, `var(--radius-*)`)
- Navbar flottante sombre en pilule (desktop), tabs en bas (mobile)
- Cartes : `background: 'var(--color-light-2)'`, `borderRadius: 'var(--radius-md)'`

### Icônes
Material Symbols Outlined partout (`<span className="material-symbols-outlined">nom_icone</span>`), jamais de bibliothèque d'icônes SVG custom pour l'UI courante.

---

## Structure des routes — par domaine

### Authentification (`/`, `/register`, `/forgot-password`, `/reset-password`, `/confirm/[token]`, `/confirm-email`, `/invitation/[token]`)
Login, inscription, mot de passe oublié/reset, confirmation email, acceptation d'invitation client. **OAuth Google non migré** (routes Flask existent, aucun bouton côté Next.js).

### Espace client (`/(portail)/*`)
- `dashboard`, `profile` — tableau de bord et profil client
- `projet/[id]`, `projet/[id]/identite-visuelle`, `projet/[id]/decision-board` — suivi de projet, identité visuelle, choix client
- `soumissions`, `soumission/[id]` — consultation et acceptation de soumissions
- `mon-site` *(nouveau, 2026-07-07)* — édition autonome du contenu Sanity du site du client (Accueil/À propos/Contact/Coordonnées), sans passer par Félix ni Sanity Studio
- `entrainement` — espace d'entraînement personnel (plans, streak, Lottie)
- `outils`, `outils/mediatheque` — outils assignés (Social Kit, générateur PDF) + banque d'images
- `conditions`

### Espace pigiste (`/pigiste/*`)
`page.tsx` (accueil), `dashboard`, `mandats`, `mandats/[id]`, `factures`, `factures/[id]`, `factures/new`, `outils`, `outils/mediatheque` — auto-gestion des mandats et de la facturation par les pigistes eux-mêmes.

### Admin — CRM (`/admin/clients*`, `/admin/projet*`, `/admin/services`, `/admin/ressources`)
- `clients`, `clients/new`, `client/[id]`, `client/[id]/edit` — pipeline CRM (statut_relation : prospect/contacté/devis envoyé/actif/inactif), notes, dossier Drive
- `projets`, `projets/new`, `projet/[id]`, `projet/[id]/edit`, `projet/[id]/identite-visuelle`, `projet/[id]/decision` — fiche projet complète (checklist, facturation, identité visuelle, decision board)
- `services` — catalogue de services + checklists associées
- `ressources` — ressources clients (CRUD + sections + images + bundles)

### Admin — Comptabilité & Facturation (`/admin/comptabilite/*`, `/admin/factures*`, `/admin/parametres/facturation`)
- `comptabilite/a-valider`, `revenus`, `depenses`, `bilan`, `taxes` — grand livre unifié, T2125/TP-80
- `factures` (liste réelle), `factures/[id]` (détail : lignes, statuts, PDF, adresse/nom/courriel du client modifiables **peu importe le statut**), `factures/nouvelle` *(nouveau, 2026-07-08)* — création manuelle **sans passer par un projet**, avec option **« Nouveau contact »** pour facturer quelqu'un sans compte portail (statut `prospect`, aucun accès créé)
- `parametres/facturation`

### Admin — Équipe / Pigistes (`/admin/pigistes*`, `/admin/mandats-pigistes*`, `/admin/factures-pigistes*`)
Gestion des pigistes (fiche, outils assignés — Social Kit/PDF via `tools_config`), mandats, factures pigistes (approbation, paiement, PDF).

### Admin — Sites clients (`/admin/sites*`)
- `sites` (liste), `sites/nouveau` (création — template `reservation` ou `vitrine` + **5 gabarits visuels nommés** pour `vitrine` : `1a` Éditorial chaleureux, `1b` Bold moderne sombre, `2a` Prestige sombre doré, `2b` Doux ludique pastel, `2c` Corporate tech épuré — tous livrés au 2026-07-07), `sites/[id]` (assets, déploiement Vercel, statut)
- Pipeline complet : création repo GitHub privé → push template thémé → projet Sanity + invitation client → déploiement Vercel (voir le repo séparé `Site_web-cocktailmedia`)

### Admin — Marketing & Roadmaps (`/admin/marketing*`, `/admin/roadmaps*`)
Calendrier de contenu marketing, roadmaps produit (phases/todos/notes).

### Admin — Soumissions (`/admin/soumissions*`)
Création, envoi, templates de soumissions/devis avec options tarifaires.

### Booking (`/booking/localisation`, `/booking/confirme`)
Prise de rendez-vous (Acuity), confirmation avec export ICS.

### Guides (`/guides/*`)
8 pages de contenu statique (SEO de base, Meta Ads, Google Ads, formats de logo, etc.) — pas de backend.

### Système
`app/not-found.tsx` (404), `app/error.tsx` (500), `app/admin/changelog` (changelog produit).

---

## Conventions établies

- **Vérification avant tout déploiement** : `npx tsc --noEmit` + `npx eslint <fichiers touchés>` (jamais `npm run lint` sans scope — remonte des centaines de préexistants sans rapport) + `npm run build`.
- **Ne jamais deviner/compléter du code tronqué** venant de l'utilisateur — toujours redemander.
- **Restyle ≠ refonte** : quand une page V1 existe déjà et fonctionne, on ne touche qu'aux styles/tokens, jamais à la logique métier, sauf demande explicite.
- **Toujours vérifier l'ordre des routes Flask** par rapport à la boucle d'exemption CSRF (`for _rule in app.url_map.iter_rules()`) avant d'ajouter une route API.
- **Fichiers `.py` bind-montés en lecture seule** dans le conteneur Docker : éditer sur l'hôte ne suffit pas, il faut `--force-recreate` pour que le conteneur voie le nouveau contenu (vérifier par `sha256sum` hôte vs conteneur).
