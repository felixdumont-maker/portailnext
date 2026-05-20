# Migration Status — Flask → Next.js

> Audit généré le 2026-04-17  
> Source : `/opt/cocktailmedia/portail/` (Flask)  
> Cible : `/opt/cocktailmedia/portail-next/` (Next.js)

## Résumé global

| Statut | Nb pages/features | % |
|---|---|---|
| ✅ Fait | ~25 | 40% |
| 🔄 Partiel | ~20 | 32% |
| ❌ Manquant | ~18 | 29% |

---

## Authentification

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Landing / Login | `GET /` + `GET /login` | `/` | ✅ Fait | — |
| Inscription | `GET /register` | `/register` | ✅ Fait | — |
| Mot de passe oublié | `GET /forgot-password` | `/forgot-password` | ✅ Fait | API `POST /api/v1/auth/forgot-password` créée |
| Réinitialisation MDP | `GET /reset-password/<token>` | `/reset-password` | ✅ Fait | Token URL, validation force MDP, toggle affichage |
| Confirmation email | `GET /confirm/<token>` | `/confirm-email` | 🔄 Partiel | Token non géré, message minimal |
| OAuth Google | `GET /login/google` | — | ❌ Manquant | Login Google entier manquant |
| Callback Google | `GET /google-callback` | — | ❌ Manquant | Route callback manquante |
| Acceptation invitation | `GET /invitation/<token>` | `/invitation/[token]` | ✅ Fait | APIs invitation-info + accept-invitation créées, auto-login, redirect /dashboard |

---

## Espace client

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Dashboard client | `GET /dashboard` | `/(portail)/dashboard` | ✅ Fait | — |
| Profil client | `GET /profile` | `/(portail)/profile` | ✅ Fait | — |
| Mise à jour profil | `POST /update-profile` | *(API)* | ✅ Fait | — |
| Changement MDP | `POST /update-password` | *(API)* | ✅ Fait | — |
| Détail projet (client) | `GET /projet/<id>` | `/(portail)/projet/[id]` | ✅ Fait | — |
| Identité visuelle (client) | `GET /projet/<id>/identite` | `/(portail)/projet/[id]/identite-visuelle` | ✅ Fait | — |
| Decision board (client) | `GET /projet/<id>/decision` | `/(portail)/projet/[id]/decision-board` | ✅ Fait | — |
| Toggle item checklist | `POST /item/toggle/<id>` | *(API)* | ✅ Fait | — |
| Upload fichier item | `POST /item/upload/<id>` | *(API)* | ✅ Fait | — |
| Marquer notif lue | `POST /notifications/<id>/read` | *(API)* | ✅ Fait | — |

---

## Admin — Dashboard

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Dashboard admin | `GET /admin` | `/admin` | ✅ Fait | — |

---

## Admin — Clients

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Liste clients | `GET /api/v1/admin/clients` | `/admin/clients` | ✅ Fait | — |
| Détail client | `GET /api/v1/admin/client/<id>` | `/admin/client/[id]` | ✅ Fait | — |
| Ajouter client | `POST /admin/add_client` | `/admin/clients/new` | ✅ Fait | API `POST /api/v1/admin/client/add` créée |
| Éditer client | `GET /admin/edit_client/<id>` | `/admin/client/[id]/edit` | ✅ Fait | Tous les champs + PUT API complété |
| Supprimer client | `GET /admin/delete_client/<id>` | *(via API)* | 🔄 Partiel | Confirmation UI absente |
| Notifier client facture | `POST /admin/client/<id>/notifier_facture` | `/admin/projet/[id]` | ✅ Fait | Bouton header + API `POST /api/v1/admin/client/<id>/notifier-facture` |

---

## Admin — Projets

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Liste projets | `GET /api/v1/admin/projets` | `/admin/projets` | ✅ Fait | — |
| Détail projet (admin) | `GET /admin/edit_project/<id>` | `/admin/projet/[id]` | ✅ Fait | Start, révision, compléter, forcer statut, notifier, archive, modifier items |
| Ajouter projet | `POST /admin/add_project` | `/admin/projets/new` | ✅ Fait | API `POST /api/v1/admin/projets/new` créée |
| Éditer projet | `GET /admin/edit_project/<id>` | `/admin/projet/[id]/edit` | ✅ Fait | Tous les champs + PUT API complété |
| Supprimer projet | `GET /admin/delete_project/<id>` | *(via API)* | 🔄 Partiel | Confirmation UI absente |
| Démarrer projet | `POST /admin/projet/<id>/start` | `/admin/projet/[id]` | ✅ Fait | API `POST /api/v1/admin/projet/<id>/start` créée |
| Révision projet | `POST /admin/projet/<id>/revision` | `/admin/projet/[id]` | ✅ Fait | Panel avec items dynamiques |
| Notifier révision | `POST /admin/projet/<id>/notifier_revision` | `/admin/projet/[id]` | ✅ Fait | API `POST /api/v1/admin/projet/<id>/notifier-revision` créée |
| Compléter projet | `POST /admin/projet/<id>/complete` | `/admin/projet/[id]` | ✅ Fait | API `POST /api/v1/admin/projet/<id>/complete` créée |
| Archiver / Désarchiver | `POST /admin/projet/<id>/archive` | `/admin/projet/[id]` | ✅ Fait | APIs archive/unarchive créées |
| Forcer statut | `POST /admin/projet/<id>/force_status` | `/admin/projet/[id]` | ✅ Fait | Dropdown 6 statuts + API créée |
| Éditer items checklist | `POST /admin/projet/<id>/edit_items` | `/admin/projet/[id]` | ✅ Fait | Panel inline + PUT API créée |

---

## Admin — Identité visuelle

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Gérer IV (admin) | `GET /admin/projet/<id>/identite` | `/admin/projet/[id]/identite-visuelle` | ✅ Fait | — |
| Upload déclinaison | `POST /admin/projet/<id>/identite/upload_declinaison` | *(via page IV)* | 🔄 Partiel | À confirmer fonctionnel |
| Supprimer déclinaison | `POST /admin/projet/<id>/identite/delete_declinaison/<id>` | *(via page IV)* | 🔄 Partiel | À confirmer fonctionnel |
| Upload mockup | `POST /admin/projet/<id>/identite/upload_mockup` | *(via page IV)* | 🔄 Partiel | À confirmer fonctionnel |
| Supprimer mockup | `POST /admin/projet/<id>/identite/delete_mockup/<id>` | *(via page IV)* | 🔄 Partiel | À confirmer fonctionnel |
| Sauvegarder palette | `POST /admin/projet/<id>/identite/save_palette` | *(via page IV)* | 🔄 Partiel | À confirmer fonctionnel |
| Upload SVG | `POST /admin/projet/<id>/identite/upload_svg` | *(via page IV)* | 🔄 Partiel | À confirmer fonctionnel |

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
| Liste services | `GET /admin/services` | `/admin/services` | ✅ Fait | — |
| Ajouter service | `POST /admin/add_service` | *(via page services)* | 🔄 Partiel | Formulaire à confirmer |
| Supprimer service | `GET /admin/delete_service/<id>` | *(via page services)* | 🔄 Partiel | Confirmation UI à vérifier |
| Éditer service | `POST /admin/edit_service/<id>` | *(via page services)* | 🔄 Partiel | Formulaire à confirmer |
| Ajouter item checklist | `POST /admin/add_checklist_item/<id>` | *(via page services)* | 🔄 Partiel | Formulaire à confirmer |
| Supprimer item checklist | `GET /admin/delete_checklist_item/<id>` | *(via page services)* | 🔄 Partiel | Confirmation UI à vérifier |

---

## Admin — Marketing

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Calendrier marketing | `GET /admin/marketing` | `/admin/marketing` | ✅ Fait | — |
| Nouveau post | `GET /admin/marketing/nouveau` | `/admin/marketing/nouveau` | 🔄 Partiel | Formulaire minimal, champs manquants |
| Supprimer post | `POST /admin/marketing/<id>/supprimer` | *(via API)* | 🔄 Partiel | Confirmation UI à vérifier |
| Toggle todo post | `POST /admin/marketing/post/<id>/todo-toggle` | *(via API)* | 🔄 Partiel | À confirmer fonctionnel |
| Déposer post | `POST /admin/marketing/<id>/deposer` | *(via API)* | 🔄 Partiel | Action à confirmer |
| Notifier Félix | `POST /admin/marketing/notifier-felix/<mois>` | `/admin/marketing` | ✅ Fait | Bouton header + API `POST /api/v1/admin/marketing/notifier-felix/<mois>` |
| Notifier Marie | `POST /admin/marketing/notifier-marie/<mois>` | `/admin/marketing` | ✅ Fait | Bouton header + API `POST /api/v1/admin/marketing/notifier-marie/<mois>` |

---

## Admin — Roadmaps

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Liste roadmaps | `GET /admin/roadmaps` | `/admin/roadmaps` | ✅ Fait | — |
| Créer roadmap | `GET /admin/roadmaps/new` | `/admin/roadmaps/new` | 🔄 Partiel | Formulaire minimal |
| Détail roadmap | `GET /admin/roadmaps/<id>` | `/admin/roadmaps/[id]` | 🔄 Partiel | Phases/todos affichés, actions à vérifier |
| Ajouter phase | `POST /admin/roadmaps/<id>/add_phase` | *(via page détail)* | 🔄 Partiel | UI à confirmer |
| Éditer phase | `POST /admin/roadmaps/phase/<id>/edit` | *(via page détail)* | 🔄 Partiel | UI à confirmer |
| Supprimer phase | `POST /admin/roadmaps/phase/<id>/delete` | *(via page détail)* | 🔄 Partiel | UI à confirmer |
| Ajouter todo | `POST /admin/roadmaps/phase/<id>/add_todo` | *(via page détail)* | 🔄 Partiel | UI à confirmer |
| Toggle todo | `POST /admin/roadmaps/todo/<id>/toggle` | *(via page détail)* | 🔄 Partiel | UI à confirmer |
| Supprimer todo | `POST /admin/roadmaps/todo/<id>/delete` | *(via page détail)* | 🔄 Partiel | UI à confirmer |
| Ajouter note | `POST /admin/roadmaps/phase/<id>/note/add` | *(via page détail)* | 🔄 Partiel | UI à confirmer |
| Supprimer note | `POST /admin/roadmaps/note/<id>/delete` | *(via page détail)* | 🔄 Partiel | UI à confirmer |
| Archiver roadmap | `POST /admin/roadmaps/<id>/archive` | *(via page liste)* | 🔄 Partiel | UI à confirmer |

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
| Télécharger PDF | `GET /admin/facture/<id>/download` | `/admin/factures/[id]` | ✅ Fait | Lien direct route Flask existante |

---

## Pages système

| Page | URL Flask | URL Next.js | Statut | Manquant |
|---|---|---|---|---|
| Page 404 | `404.html` | `not-found.tsx` (probablement) | 🔄 Partiel | Style à vérifier |
| Page 500 | `500.html` | `error.tsx` (probablement) | 🔄 Partiel | Style à vérifier |

---

## Priorités de migration

### 🔴 Priorité haute (bloquent la mise en production)

1. ~~**Créer page "Ajouter projet"** — `/admin/projets/new` — Fonctionnalité core admin~~ ✅ Fait (2026-04-17)
2. ~~**Créer page "Ajouter client"** — `/admin/clients/new` — Fonctionnalité core admin~~ ✅ Fait (2026-04-18)
3. ~~**Compléter "Éditer projet"** — `/admin/projet/[id]/edit` — Champs et validations~~ ✅ Fait (2026-04-18)
4. ~~**Compléter "Éditer client"** — `/admin/client/[id]/edit` — Champs et validations~~ ✅ Fait (2026-04-18)
5. ~~**Détail facture complet** — `/admin/factures/[id]` — Lignes, clôture, PDF, statuts~~ ✅ Fait (2026-04-18)
6. ~~**Admin decision board** — `/admin/projet/[id]/decision` — Gestion des questions/options~~ ✅ Fait (2026-04-18)
7. ~~**Forgot/Reset password** — Formulaires complets avec appel API~~ ✅ Fait (2026-04-18)

### 🟡 Priorité moyenne

8. **OAuth Google** — Login avec Google entier
9. ~~**Page d'invitation** — `/invitation/[token]` — Accepter invitation client~~ ✅ Fait (2026-04-18)
10. ~~**Actions notifications email** — Notifier révision, notifier facture, notifier marketing~~ ✅ Fait (2026-04-18)
11. ~~**Forcer statut projet** — `/admin/projet/[id]`~~ ✅ Fait (2026-04-18)
12. ~~**Éditer items checklist par projet** — Dans `/admin/projet/[id]`~~ ✅ Fait (2026-04-18)
13. **Roadmap détail** — Vérifier et compléter toutes les actions (phases, todos, notes)

### 🟢 Priorité basse

14. **Services & checklists** — Vérifier formulaires d'ajout/édition/suppression
15. **Marketing** — Compléter formulaire nouveau post + actions
16. **Pages 404/500** — Styliser aux couleurs du nouveau design
17. **Confirmation email** — Gérer token dans l'URL

---

## Notes techniques

- **Architecture API :** Next.js appelle l'API Flask existante (`/api/v1/*`) — bon découplage
- **Auth :** Cookies de session (`credentials: 'include'` dans les fetch)
- **Design :** Redesign complet (glassmorphism, dark theme, orange gradient) vs Flask classique
- **État client :** `useState` + `useEffect` — pas de state manager global visible
- **Templates Flask :** 27 templates Jinja2 identifiés
- **Routes Flask :** 122 routes identifiées (pages + API)
- **Pages Next.js :** 25 pages identifiées dans `/app/`
