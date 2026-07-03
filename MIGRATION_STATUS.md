# Migration Status — Flask → Next.js

> Audit généré le 2026-07-03
> Source : `/opt/cocktailmedia/portail/` (Flask — 307 routes uniques, dont ~210 sous `/api/v1`)
> Cible : `/opt/cocktailmedia/portail-next/` (Next.js 16 — 78 pages `page.tsx`)
>
> Méthode : routes Next.js relevées via `find app -name page.tsx` ; appels frontend via grep des `fetch(` vers `/api/v1/*` ; routes backend via grep `@app.route` dans `app.py`. Chaque statut ci-dessous a été confirmé en croisant page Next.js ↔ endpoint Flask correspondant.

## Résumé global

| Statut | Nb pages/features | % |
|---|---|---|
| ✅ Fait | 127 | 97% |
| 🔄 Partiel | 2 | 2% |
| ❌ Manquant | 2 | 2% |

> Évolution depuis l'audit du 2026-04-17 (25 ✅ / 20 🔄 / 18 ❌) : la quasi-totalité des chantiers « partiels » ont été câblés (identité visuelle, services, roadmaps, marketing, factures) et de nombreux modules entièrement nouveaux sont arrivés (espace pigiste, soumissions, sites, booking, guides, entraînement, ressources/médiathèque, notifications push). Seul l'OAuth Google reste non migré côté Next.js.

---

## Authentification

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Landing / Login | `GET /` + `GET /login` | `/` | ✅ Fait | — |
| Inscription | `GET /register` | `/register` | ✅ Fait | — |
| Mot de passe oublié | `GET /forgot-password` | `/forgot-password` | ✅ Fait | API `POST /api/v1/auth/forgot-password` |
| Réinitialisation MDP | `GET /reset-password/<token>` | `/reset-password` | ✅ Fait | Token URL, validation force MDP, toggle affichage |
| Confirmation email | `GET /confirm/<token>` | `/confirm/[token]` → `/confirm-email` | ✅ Fait | Token géré : `/confirm/[token]` redirige vers `/confirm-email?token=`, appel `GET /api/v1/auth/confirm-email/<token>` + renvoi (`resend-confirmation`) |
| OAuth Google | `GET /login/google` | — | ❌ Manquant | Routes Flask présentes (`/login/google`, `/google-callback`) mais **aucun bouton/flow Google côté Next.js** (login `app/page.tsx` sans OAuth) |
| Callback Google | `GET /google-callback` | — | ❌ Manquant | Idem — non exposé côté Next.js |
| Acceptation invitation | `GET /invitation/<token>` | `/invitation/[token]` | ✅ Fait | APIs invitation-info + accept-invitation, auto-login, redirect /dashboard |

---

## Espace client

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Dashboard client | `GET /dashboard` | `/(portail)/dashboard` | ✅ Fait | API `GET /api/v1/dashboard` |
| Profil client | `GET /profile` | `/(portail)/profile` | ✅ Fait | API `GET /api/v1/profile` |
| Mise à jour profil | `POST /update-profile` | *(API)* | ✅ Fait | `POST /api/v1/profile/update` |
| Changement MDP | `POST /update-password` | *(API)* | ✅ Fait | `POST /api/v1/auth/change-password` |
| Détail projet (client) | `GET /projet/<id>` | `/(portail)/projet/[id]` | ✅ Fait | `GET /api/v1/projet/<id>` |
| Identité visuelle (client) | `GET /projet/<id>/identite` | `/(portail)/projet/[id]/identite-visuelle` | ✅ Fait | `GET /api/v1/projet/<id>/identite` |
| Decision board (client) | `GET /projet/<id>/decision` | `/(portail)/projet/[id]/decision-board` | ✅ Fait | — |
| Toggle item checklist | `POST /item/toggle/<id>` | *(API)* | ✅ Fait | `POST /api/v1/item/toggle/<id>` |
| Upload fichier item | `POST /item/upload/<id>` | *(API)* | ✅ Fait | `POST /api/v1/item/upload/<id>` (+ `item/text`, `ajouter_upload`) |
| Marquer notif lue | `POST /notifications/<id>/read` | *(API)* | ✅ Fait | Via cloche notifications |

---

## Admin — Dashboard

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Dashboard admin | `GET /admin` | `/admin` | ✅ Fait | `GET /api/v1/admin/dashboard` |

---

## Admin — Clients

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Liste clients | `GET /api/v1/admin/clients` | `/admin/clients` | ✅ Fait | — |
| Détail client | `GET /api/v1/admin/client/<id>` | `/admin/client/[id]` | ✅ Fait | Notes, statut-relation, projets, resend-invitation, set-temp-password, agenda |
| Ajouter client | `POST /admin/add_client` | `/admin/clients/new` | ✅ Fait | `POST /api/v1/admin/client/add` |
| Éditer client | `GET /admin/edit_client/<id>` | `/admin/client/[id]/edit` | ✅ Fait | Tous les champs + PUT API |
| Supprimer client | `GET /admin/delete_client/<id>` | *(via API)* | ✅ Fait | Confirmation `confirm()` native (« Supprimer le client … et tous ses projets ? ») |
| Notifier client facture | `POST /admin/client/<id>/notifier_facture` | `/admin/projet/[id]` | ✅ Fait | Bouton header + `POST /api/v1/admin/projet/<id>/notifier-facture` |

---

## Admin — Projets

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Liste projets | `GET /api/v1/admin/projets` | `/admin/projets` | ✅ Fait | — |
| Détail projet (admin) | `GET /admin/edit_project/<id>` | `/admin/projet/[id]` | ✅ Fait | Start, révision, compléter, forcer statut, notifier, archive, items, rename, recreate-drive |
| Ajouter projet | `POST /admin/add_project` | `/admin/projets/new` | ✅ Fait | `POST /api/v1/admin/projets/new` |
| Éditer projet | `GET /admin/edit_project/<id>` | `/admin/projet/[id]/edit` | ✅ Fait | Tous les champs + PUT API |
| Supprimer projet | `GET /admin/delete_project/<id>` | *(via API)* | ✅ Fait | Confirmation `confirm()` native (« Supprimer le projet … ? ») |
| Démarrer projet | `POST /admin/projet/<id>/start` | `/admin/projet/[id]` | ✅ Fait | `POST /api/v1/admin/projet/<id>/start` |
| Révision projet | `POST /admin/projet/<id>/revision` | `/admin/projet/[id]` | ✅ Fait | Panel avec items dynamiques |
| Notifier révision | `POST /admin/projet/<id>/notifier_revision` | `/admin/projet/[id]` | ✅ Fait | `POST /api/v1/admin/projet/<id>/notifier-revision` |
| Compléter projet | `POST /admin/projet/<id>/complete` | `/admin/projet/[id]` | ✅ Fait | `POST /api/v1/admin/projet/<id>/complete` |
| Archiver / Désarchiver | `POST /admin/projet/<id>/archive` | `/admin/projet/[id]` | ✅ Fait | APIs archive/unarchive |
| Forcer statut | `POST /admin/projet/<id>/force_status` | `/admin/projet/[id]` | ✅ Fait | Dropdown statuts + `POST /api/v1/admin/projet/<id>/force-status` |
| Éditer items checklist | `POST /admin/projet/<id>/edit_items` | `/admin/projet/[id]` | ✅ Fait | Panel inline + `PUT /api/v1/admin/projet/<id>/checklist` |

---

## Admin — Identité visuelle

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Gérer IV (admin) | `GET /admin/projet/<id>/identite` | `/admin/projet/[id]/identite-visuelle` | ✅ Fait | `GET /api/v1/admin/projet/<id>/identite` |
| Upload déclinaison | `POST …/identite/upload_declinaison` | *(via page IV)* | ✅ Fait | `POST /api/v1/admin/projet/<id>/identite/declinaison` |
| Supprimer déclinaison | `POST …/identite/delete_declinaison/<id>` | *(via page IV)* | ✅ Fait | `DELETE …/identite/declinaison/<id>` |
| Upload mockup | `POST …/identite/upload_mockup` | *(via page IV)* | ✅ Fait | `POST …/identite/mockup` |
| Supprimer mockup | `POST …/identite/delete_mockup/<id>` | *(via page IV)* | ✅ Fait | `DELETE …/identite/mockup/<id>` |
| Sauvegarder palette | `POST …/identite/save_palette` | *(via page IV)* | ✅ Fait | `POST …/identite/palette` + `…/identite/publier` |
| Upload logo / fonts | `POST …/identite/upload_logo` | *(via page IV)* | ✅ Fait | `…/identite/logo` + `…/identite/fonts` |

---

## Admin — Decision Board

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Gérer decision board | `GET /admin/projet/<id>/decision` | `/admin/projet/[id]/decision` | ✅ Fait | API GET + page complète |
| Sauvegarder questions | `POST /admin/projet/<id>/decision` | `/admin/projet/[id]/decision` | ✅ Fait | API POST multipart avec upload Drive |

---

## Admin — Services & Checklists

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Liste services | `GET /admin/services` | `/admin/services` | ✅ Fait | `GET /api/v1/admin/services` (+ `with-items`) |
| Ajouter service | `POST /admin/add_service` | *(via page services)* | ✅ Fait | `POST /api/v1/admin/services` |
| Supprimer service | `GET /admin/delete_service/<id>` | *(via page services)* | ✅ Fait | `DELETE /api/v1/admin/services/<id>` |
| Éditer service | `POST /admin/edit_service/<id>` | *(via page services)* | ✅ Fait | `PUT /api/v1/admin/services/<id>` |
| Ajouter item checklist | `POST /admin/add_checklist_item/<id>` | *(via page services)* | ✅ Fait | `POST /api/v1/admin/services/<id>/items` |
| Supprimer item checklist | `GET /admin/delete_checklist_item/<id>` | *(via page services)* | ✅ Fait | `DELETE /api/v1/admin/services/items/<id>` |

---

## Admin — Marketing

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Calendrier marketing | `GET /admin/marketing` | `/admin/marketing` | ✅ Fait | `GET /api/v1/admin/marketing?mois=` |
| Nouveau post | `GET /admin/marketing/nouveau` | `/admin/marketing/nouveau` | 🔄 Partiel | Formulaire simple (titre / description / date) — ⚠️ à vérifier si tous les champs métier du post sont couverts |
| Supprimer post | `POST /admin/marketing/<id>/supprimer` | *(via API)* | ✅ Fait | `DELETE /api/v1/admin/marketing/<id>` |
| Toggle todo post | `POST /admin/marketing/post/<id>/todo-toggle` | *(via API)* | ✅ Fait | `POST /api/v1/admin/marketing/<id>/todo-toggle` |
| Publier / Déposer post | `POST /admin/marketing/<id>/deposer` | *(via API)* | ✅ Fait | Renommé `POST /api/v1/admin/marketing/<id>/publier` |
| Notifier Félix | `POST /admin/marketing/notifier-felix/<mois>` | `/admin/marketing` | ✅ Fait | `POST /api/v1/admin/marketing/notifier-felix/<mois>` |
| Notifier Marie | `POST /admin/marketing/notifier-marie/<mois>` | `/admin/marketing` | ✅ Fait | `POST /api/v1/admin/marketing/notifier-marie/<mois>` |

---

## Admin — Roadmaps

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Liste roadmaps | `GET /admin/roadmaps` | `/admin/roadmaps` | ✅ Fait | — |
| Créer roadmap | `GET /admin/roadmaps/new` | `/admin/roadmaps/new` | ✅ Fait | `POST /api/v1/admin/roadmaps/new` |
| Détail roadmap | `GET /admin/roadmaps/<id>` | `/admin/roadmaps/[id]` | ✅ Fait | Phases / todos / notes affichés + actions câblées |
| Ajouter phase | `POST /admin/roadmaps/<id>/add_phase` | *(via page détail)* | ✅ Fait | `POST …/roadmaps/<id>/add_phase` |
| Éditer phase | `POST /admin/roadmaps/phase/<id>/edit` | *(via page détail)* | 🔄 Partiel | Pas d'action d'édition de phase dédiée côté Next.js (aucun appel `phase/<id>/edit`) — seule l'édition de la roadmap (`roadmaps/<id>/edit`) existe |
| Supprimer phase | `POST /admin/roadmaps/phase/<id>/delete` | *(via page détail)* | ✅ Fait | `POST …/roadmaps/phase/<id>/delete` |
| Ajouter todo | `POST /admin/roadmaps/phase/<id>/add_todo` | *(via page détail)* | ✅ Fait | `POST …/roadmaps/phase/<id>/add_todo` |
| Toggle todo | `POST /admin/roadmaps/todo/<id>/toggle` | *(via page détail)* | ✅ Fait | `POST …/roadmaps/todo/<id>/toggle` |
| Supprimer todo | `POST /admin/roadmaps/todo/<id>/delete` | *(via page détail)* | ✅ Fait | `POST …/roadmaps/todo/<id>/delete` |
| Ajouter note | `POST /admin/roadmaps/phase/<id>/note/add` | *(via page détail)* | ✅ Fait | `POST …/roadmaps/phase/<id>/note/add` |
| Supprimer note | `POST /admin/roadmaps/note/<id>/delete` | *(via page détail)* | ✅ Fait | `POST …/roadmaps/note/<id>/delete` |
| Archiver roadmap | `POST /admin/roadmaps/<id>/archive` | *(via page liste)* | ✅ Fait | `POST …/roadmaps/<id>/archive` (+ unarchive) |

---

## Admin — Factures

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Liste factures | *(via admin dashboard)* | `/admin/factures` | ✅ Fait | — |
| Détail facture | `GET /admin/facture/<id>` | `/admin/factures/[id]` | ✅ Fait | API GET + page complète |
| Ajouter ligne | `POST /admin/facture/<id>/ajouter_ligne` | `/admin/factures/[id]` | ✅ Fait | Via API v1 |
| Modifier ligne | `POST /admin/ligne/<id>/modifier` | `/admin/factures/[id]` | ✅ Fait | Édition inline via API v1 |
| Supprimer ligne | `POST /admin/ligne/<id>/supprimer` | `/admin/factures/[id]` | ✅ Fait | Via API v1 |
| Clôturer facture | `POST /admin/facture/<id>/fermer` | `/admin/factures/[id]` | ✅ Fait | Via API v1 |
| Marquer payée | `POST /admin/facture/<id>/payee` | `/admin/factures/[id]` | ✅ Fait | Via API v1 |
| Supprimer facture | `POST /admin/facture/<id>/supprimer` | `/admin/factures/[id]` | ✅ Fait | Via API v1 |
| Télécharger PDF | `GET /admin/facture/<id>/download` | `/admin/factures/[id]` | ✅ Fait | Génération PDF côté Flask |

---

## Espace pigiste *(nouveau — absent de l'audit 2026-04)*

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Accueil pigiste | *(API)* | `/pigiste` | ✅ Fait | `GET /api/v1/pigiste/me` |
| Dashboard pigiste | *(API)* | `/pigiste/dashboard` | ✅ Fait | `GET /api/v1/pigiste/dashboard` |
| Liste factures pigiste | *(API)* | `/pigiste/factures` | ✅ Fait | `GET /api/v1/pigiste/factures` |
| Nouvelle facture pigiste | *(API)* | `/pigiste/factures/new` | ✅ Fait | `POST /api/v1/pigiste/factures` (+ lignes) |
| Détail facture pigiste | *(API)* | `/pigiste/factures/[id]` | ✅ Fait | Lignes, PDF, soumettre |
| Liste mandats pigiste | *(API)* | `/pigiste/mandats` | ✅ Fait | `GET /api/v1/pigiste/mandats` |
| Détail mandat pigiste | *(API)* | `/pigiste/mandats/[id]` | ✅ Fait | `…/mandats/<id>/remettre` |
| Outils pigiste | *(API)* | `/pigiste/outils` | ✅ Fait | `GET /api/v1/tools/*` |
| Médiathèque pigiste | *(API)* | `/pigiste/outils/mediatheque` | ✅ Fait | `tools/assets`, `tools/gabarits` |

---

## Admin — Pigistes *(nouveau)*

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Liste pigistes | `GET /api/v1/admin/pigistes` | `/admin/pigistes` | ✅ Fait | — |
| Ajouter pigiste | *(API)* | `/admin/pigistes/new` | ✅ Fait | `POST /api/v1/admin/pigistes` |
| Détail pigiste | `GET /api/v1/admin/pigistes/<id>` | `/admin/pigistes/[id]` | ✅ Fait | `…/pigistes/<id>/tools`, `tarifs-pigiste` |
| Éditer pigiste | *(API)* | `/admin/pigistes/[id]/edit` | ✅ Fait | `PUT /api/v1/admin/pigistes/<id>` |

---

## Admin — Factures pigistes *(nouveau)*

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Liste factures pigistes | `GET /api/v1/admin/factures-pigistes` | `/admin/factures-pigistes` | ✅ Fait | — |
| Détail facture pigiste | `GET /api/v1/admin/factures-pigistes/<id>` | `/admin/factures-pigistes/[id]` | ✅ Fait | approuver / payer / PDF |

---

## Admin — Mandats pigistes *(nouveau)*

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Liste mandats pigistes | `GET /api/v1/admin/mandats-pigistes` | `/admin/mandats-pigistes` | ✅ Fait | — |
| Créer mandat pigiste | *(API)* | `/admin/mandats-pigistes/new` | ✅ Fait | `POST /api/v1/admin/mandats-pigistes` |
| Détail mandat pigiste | `GET /api/v1/admin/mandats-pigistes/<id>` | `/admin/mandats-pigistes/[id]` | ✅ Fait | assigner / approuver / corrections |

---

## Admin — Soumissions *(nouveau)*

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Liste soumissions | `GET /api/v1/admin/soumissions` | `/admin/soumissions` | ✅ Fait | — |
| Nouvelle soumission | `POST /api/v1/admin/soumission/creer` | `/admin/soumissions/nouvelle` | ✅ Fait | — |
| Détail soumission | `GET /api/v1/admin/soumission/<id>` | `/admin/soumissions/[id]` | ✅ Fait | `…/soumission/<id>/renvoyer` |
| Liste templates | `GET /api/v1/admin/soumissions/templates` | `/admin/soumissions/templates` | ✅ Fait | — |
| Détail / éditer template | `…/templates/<id>` | `/admin/soumissions/templates/[id]` | ✅ Fait | Options (`…/options`, appliquer) |

---

## Espace client — Soumissions *(nouveau)*

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Liste soumissions client | `GET /api/v1/client/soumissions` | `/(portail)/soumissions` | ✅ Fait | — |
| Détail soumission client | `GET /api/v1/soumission/<id>` | `/(portail)/soumission/[id]` | ✅ Fait | accepter (`…/accepter`) + PDF |

---

## Admin — Sites *(nouveau)*

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Liste sites | `GET /api/v1/admin/sites` | `/admin/sites` | ✅ Fait | — |
| Nouveau site | `POST /api/v1/admin/sites/create` | `/admin/sites/nouveau` | ✅ Fait | Pré-remplissage via `projet/<id>/site-prefill` |
| Gestion site | `GET /api/v1/admin/sites/<id>` | `/admin/sites/[id]` | ✅ Fait | assets / commit / deploy / status |

---

## Admin — Ressources & Outils *(nouveau)*

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Gestion ressources | `GET /api/v1/admin/ressources` | `/admin/ressources` | ✅ Fait | CRUD + sections + images + bundles |
| Outils admin | `GET /api/v1/tools/*` | `/admin/outils` | ✅ Fait | `tools/config`, `tools/assets`, `tools/gabarits` |
| Médiathèque admin | *(API tools)* | `/admin/outils/mediatheque` | ✅ Fait | upload / delete assets |

---

## Booking / Prise de rendez-vous *(nouveau)*

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Localisation booking | `…/booking/confirm-service` | `/booking/localisation` | ✅ Fait | slots (`client/rendez-vous/slots`) |
| Confirmation booking | `POST …/booking/confirm-service/finaliser` | `/booking/confirme` | ✅ Fait | ICS (`rendez-vous/<id>/ics`) |

---

## Espace client — Entraînement *(nouveau)*

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Espace entraînement | `GET /api/v1/entrainement/me` | `/(portail)/entrainement` | ✅ Fait | `entrainement/me` + `entrainement/progress` |

---

## Espace client — Outils

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Outils client | `GET /api/v1/tools/*` | `/(portail)/outils` | ✅ Fait | — |
| Médiathèque client | *(API tools)* | `/(portail)/outils/mediatheque` | ✅ Fait | — |

---

## Guides *(nouveau — contenu statique, pas de backend)*

| Page | URL Next.js | Statut | Manquant |
|---|---|---|---|
| À quoi sert votre site web | `/guides/a-quoi-sert-votre-site-web` | ✅ Fait | — |
| Bonnes pratiques réseaux sociaux | `/guides/bonnes-pratiques-reseaux-sociaux` | ✅ Fait | — |
| Formats de logo | `/guides/formats-de-logo` | ✅ Fait | — |
| Google Ads | `/guides/google-ads` | ✅ Fait | — |
| Meta Ads | `/guides/meta-ads` | ✅ Fait | — |
| Modifier un site Shopify | `/guides/modifier-site-shopify` | ✅ Fait | — |
| Réseaux sociaux Meta | `/guides/reseaux-sociaux-meta` | ✅ Fait | — |
| SEO de base | `/guides/seo-de-base` | ✅ Fait | — |

---

## Notifications & divers *(nouveau)*

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Cloche notifications admin | `GET /api/v1/admin/notifications` | *(transversal)* | ✅ Fait | read / read-all |
| Push notifications (web push) | `…/admin/push/*` | *(transversal)* | ✅ Fait | subscribe / unsubscribe / vapid-public-key |
| Changelog admin | `GET /api/v1/admin/changelog` | `/admin/changelog` | ✅ Fait | — |
| Conditions (admin) | *(statique)* | `/admin/conditions` | ✅ Fait | — |
| Conditions (client) | *(statique)* | `/(portail)/conditions` | ✅ Fait | — |

---

## Pages système

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Page 404 | `404.html` | `app/not-found.tsx` | ✅ Fait | Page présente et stylée (tokens design) |
| Page 500 | `500.html` | `app/error.tsx` | ✅ Fait | Page présente et stylée (tokens design) |

---

## Priorités de migration

> ⚠️ Section historique conservée. Au 2026-07-03, l'essentiel est livré ; ne restent que l'OAuth Google (❌) et deux points partiels (formulaire « nouveau post » marketing, édition de phase de roadmap).

### 🔴 Priorité haute (bloquent la mise en production)

1. ~~**Créer page "Ajouter projet"** — `/admin/projets/new` — Fonctionnalité core admin~~ ✅ Fait (2026-04-17)
2. ~~**Créer page "Ajouter client"** — `/admin/clients/new` — Fonctionnalité core admin~~ ✅ Fait (2026-04-18)
3. ~~**Compléter "Éditer projet"** — `/admin/projet/[id]/edit` — Champs et validations~~ ✅ Fait (2026-04-18)
4. ~~**Compléter "Éditer client"** — `/admin/client/[id]/edit` — Champs et validations~~ ✅ Fait (2026-04-18)
5. ~~**Détail facture complet** — `/admin/factures/[id]` — Lignes, clôture, PDF, statuts~~ ✅ Fait (2026-04-18)
6. ~~**Admin decision board** — `/admin/projet/[id]/decision` — Gestion des questions/options~~ ✅ Fait (2026-04-18)
7. ~~**Forgot/Reset password** — Formulaires complets avec appel API~~ ✅ Fait (2026-04-18)

### 🟡 Priorité moyenne

8. **OAuth Google** — Login avec Google entier *(toujours non migré côté Next.js au 2026-07-03)*
9. ~~**Page d'invitation** — `/invitation/[token]` — Accepter invitation client~~ ✅ Fait (2026-04-18)
10. ~~**Actions notifications email** — Notifier révision, notifier facture, notifier marketing~~ ✅ Fait (2026-04-18)
11. ~~**Forcer statut projet** — `/admin/projet/[id]`~~ ✅ Fait (2026-04-18)
12. ~~**Éditer items checklist par projet** — Dans `/admin/projet/[id]`~~ ✅ Fait (2026-04-18)
13. ~~**Roadmap détail** — Vérifier et compléter toutes les actions (phases, todos, notes)~~ ✅ Fait (2026-07-03) — *reste seulement l'édition d'une phase existante*

### 🟢 Priorité basse

14. ~~**Services & checklists** — Vérifier formulaires d'ajout/édition/suppression~~ ✅ Fait (2026-07-03)
15. **Marketing** — Compléter formulaire nouveau post *(formulaire simple en place ; champs métier avancés à confirmer)*
16. ~~**Pages 404/500** — Styliser aux couleurs du nouveau design~~ ✅ Fait (2026-07-03)
17. ~~**Confirmation email** — Gérer token dans l'URL~~ ✅ Fait (2026-07-03)

---

## Notes techniques

- **Architecture API :** Next.js appelle l'API Flask existante (`/api/v1/*`) — bon découplage. Aucune route `route.ts` (API Next.js) : frontend pur.
- **Auth :** Cookies de session (`credentials: 'include'` dans les fetch)
- **Design :** Redesign complet (deux atmosphères : admin sombre / portail client crème clair). Voir `.impeccable.md`.
- **État client :** `useState` + `useEffect` — pas de state manager global
- **Routes Flask :** 307 routes uniques identifiées dans `app.py` (~210 sous `/api/v1`)
- **Pages Next.js :** 78 fichiers `page.tsx` identifiés dans `/app/`
- **Modules ajoutés depuis 2026-04 :** espace pigiste (dashboard, factures, mandats, outils), admin pigistes/factures-pigistes/mandats-pigistes, soumissions (admin + client), sites (build/deploy), ressources & médiathèque, booking/RDV, entraînement, guides, notifications push (VAPID).
